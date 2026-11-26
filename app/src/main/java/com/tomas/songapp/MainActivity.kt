package com.tomas.songapp

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File

class MainActivity : AppCompatActivity() {

    companion object {
        @Volatile
        private var sharedServer: LocalAppServer? = null
    }

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingInstallAfterPermission = false

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val callback = filePathCallback
        filePathCallback = null
        if (callback == null) return@registerForActivityResult
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val data = result.data!!
            val uris = mutableListOf<Uri>()
            data.clipData?.let { clip ->
                for (i in 0 until clip.itemCount) {
                    clip.getItemAt(i).uri?.let { uris.add(it) }
                }
            }
            if (uris.isEmpty()) {
                data.data?.let { uris.add(it) }
            }
            callback.onReceiveValue(if (uris.isNotEmpty()) uris.toTypedArray() else null)
        } else {
            callback.onReceiveValue(null)
        }
    }

    private val notifPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ -> }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestNotificationPermissionIfNeeded()

        val server = sharedServer ?: LocalAppServer(applicationContext).also {
            it.start()
            sharedServer = it
        }
        val port = server.port

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#09090E"))
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
            }
            addJavascriptInterface(AndroidBridge(), "AndroidApp")
            webViewClient = object : WebViewClient() {}
            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    view: WebView?,
                    filePathCb: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    filePathCallback?.onReceiveValue(null)
                    filePathCallback = filePathCb
                    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        val accept = fileChooserParams?.acceptTypes?.firstOrNull()?.trim().orEmpty()
                        type = when {
                            accept.startsWith("audio") -> "audio/*"
                            accept.startsWith("image") -> "image/*"
                            else -> "*/*"
                        }
                    }
                    return try {
                        fileChooserLauncher.launch(Intent.createChooser(intent, "Vyber soubor"))
                        true
                    } catch (_: Exception) {
                        filePathCallback = null
                        false
                    }
                }
            }
        }

        setContentView(webView)
        webView.loadUrl("http://127.0.0.1:$port/")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    "(function(){ return window.handleAndroidBack ? window.handleAndroidBack() : false; })()"
                ) { res ->
                    if (res != "true") {
                        moveTaskToBack(true)
                    }
                }
            }
        })
    }

    override fun onResume() {
        super.onResume()
        if (pendingInstallAfterPermission) {
            pendingInstallAfterPermission = false
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || packageManager.canRequestPackageInstalls()) {
                launchApkInstaller()
            }
        }
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                notifPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun launchApkInstaller(): Boolean {
        val apkFile = File(File(cacheDir, "updates"), "SongApp-Update.apk")
        if (!apkFile.exists() || apkFile.length() == 0L) return false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !packageManager.canRequestPackageInstalls()) {
            pendingInstallAfterPermission = true
            val permIntent = Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:$packageName")
            ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
            try { startActivity(permIntent) } catch (_: Exception) {}
            return false
        }

        val apkUri = FileProvider.getUriForFile(this, "${packageName}.fileprovider", apkFile)
        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return try {
            startActivity(installIntent)
            true
        } catch (_: Exception) {
            false
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun isNative(): Boolean = true

        @JavascriptInterface
        fun installDownloadedUpdate(): Boolean {
            var launched = false
            runOnUiThread {
                launched = launchApkInstaller()
            }
            return launched
        }

        @JavascriptInterface
        fun updatePlaybackNotification(title: String, artist: String, playing: Boolean) {
            runOnUiThread {
                val intent = Intent(this@MainActivity, MusicForegroundService::class.java).apply {
                    action = MusicForegroundService.ACTION_UPDATE
                    putExtra(MusicForegroundService.EXTRA_TITLE, title)
                    putExtra(MusicForegroundService.EXTRA_ARTIST, artist)
                    putExtra(MusicForegroundService.EXTRA_PLAYING, playing)
                }
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        ContextCompat.startForegroundService(this@MainActivity, intent)
                    } else {
                        startService(intent)
                    }
                } catch (_: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun stopPlaybackNotification() {
            runOnUiThread {
                val intent = Intent(this@MainActivity, MusicForegroundService::class.java).apply {
                    action = MusicForegroundService.ACTION_STOP
                }
                try {
                    startService(intent)
                } catch (_: Exception) {
                }
            }
        }
    }
}
