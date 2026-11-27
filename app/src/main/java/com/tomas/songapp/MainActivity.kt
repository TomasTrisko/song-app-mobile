package com.tomas.songapp

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
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
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

class MainActivity : AppCompatActivity() {

    companion object {
        @Volatile
        private var sharedServer: LocalAppServer? = null
    }

    private class BackgroundWebView(context: Context) : WebView(context) {
        override fun onWindowVisibilityChanged(visibility: Int) {
            // Keep WebView audio, Web Audio FX (Reverb/Pitch), and song-end auto-advance alive in background
            super.onWindowVisibilityChanged(View.VISIBLE)
        }
    }

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingInstallAfterPermission = false
    private var insetTopDp = 0
    private var insetBottomDp = 0
    private var webReady = false
    private var isActivityVisible = false

    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_OFF -> notifyBackgroundState(true)
                Intent.ACTION_SCREEN_ON -> if (!isFinishing && isActivityVisible) notifyBackgroundState(false)
            }
        }
    }

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

        // True edge-to-edge layout for POCO F9 Ultra & modern tall punch-hole displays
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT

        requestNotificationPermissionIfNeeded()

        val screenFilter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(screenReceiver, screenFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(screenReceiver, screenFilter)
        }

        val server = sharedServer ?: LocalAppServer(applicationContext).also {
            it.start()
            sharedServer = it
        }
        val port = server.port

        webView = BackgroundWebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0B0D12"))
            overScrollMode = View.OVER_SCROLL_NEVER
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
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    webReady = true
                    pushSafeInsetsToWeb()
                }
            }
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

        // Inject real system bar + display cutout insets (fixes punch-hole & gesture bar on POCO F9 Ultra)
        ViewCompat.setOnApplyWindowInsetsListener(webView) { _, insets ->
            val sys = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            )
            val density = resources.displayMetrics.density.coerceAtLeast(1f)
            insetTopDp = Math.ceil((sys.top / density).toDouble()).toInt()
            insetBottomDp = Math.ceil((sys.bottom / density).toDouble()).toInt()
            pushSafeInsetsToWeb()
            insets
        }

        webView.loadUrl("http://127.0.0.1:$port/")

        MusicForegroundService.onMediaAction = { act ->
            runOnUiThread {
                webView.evaluateJavascript(
                    "window.handleAndroidMediaAction && window.handleAndroidMediaAction('$act');",
                    null
                )
            }
        }
        MusicForegroundService.onMediaSeek = { posMs ->
            runOnUiThread {
                webView.evaluateJavascript(
                    "window.handleAndroidMediaSeek && window.handleAndroidMediaSeek($posMs);",
                    null
                )
            }
        }

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

    private fun pushSafeInsetsToWeb() {
        if (!webReady || !::webView.isInitialized) return
        val js = "document.documentElement.style.setProperty('--safe-top','${insetTopDp}px');" +
            "document.documentElement.style.setProperty('--safe-bottom','${insetBottomDp}px');"
        webView.evaluateJavascript(js, null)
    }

    private fun notifyBackgroundState(isBg: Boolean) {
        if (!webReady || !::webView.isInitialized) return
        runOnUiThread {
            webView.evaluateJavascript(
                "window.handleAndroidBackgroundState && window.handleAndroidBackgroundState($isBg);",
                null
            )
        }
    }

    override fun onStart() {
        super.onStart()
        isActivityVisible = true
        notifyBackgroundState(false)
    }

    override fun onStop() {
        super.onStop()
        isActivityVisible = false
        notifyBackgroundState(true)
    }

    override fun onPause() {
        super.onPause()
        if (::webView.isInitialized) webView.resumeTimers()
    }

    override fun onResume() {
        super.onResume()
        if (::webView.isInitialized) webView.resumeTimers()
        notifyBackgroundState(false)
        if (pendingInstallAfterPermission) {
            pendingInstallAfterPermission = false
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || packageManager.canRequestPackageInstalls()) {
                launchApkInstaller()
            }
        }
    }

    override fun onDestroy() {
        try { unregisterReceiver(screenReceiver) } catch (_: Exception) {}
        super.onDestroy()
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
        fun setKeepScreenOn(keepOn: Boolean) {
            runOnUiThread {
                if (keepOn) {
                    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                } else {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
            }
        }

        @JavascriptInterface
        fun setSystemBarColor(r: Int, g: Int, b: Int) {
            runOnUiThread {
                try {
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                        val c = Color.rgb(r.coerceIn(0, 255), g.coerceIn(0, 255), b.coerceIn(0, 255))
                        window.navigationBarColor = c
                    }
                } catch (_: Exception) {}
            }
        }

        @JavascriptInterface
        fun installDownloadedUpdate(): Boolean {
            var launched = false
            runOnUiThread {
                launched = launchApkInstaller()
            }
            return launched
        }

        @JavascriptInterface
        fun updatePlaybackMedia(
            title: String,
            artist: String,
            album: String,
            coverPath: String,
            playing: Boolean,
            positionMs: Long,
            durationMs: Long,
            speed: Float
        ) {
            runOnUiThread {
                val intent = Intent(this@MainActivity, MusicForegroundService::class.java).apply {
                    action = MusicForegroundService.ACTION_UPDATE
                    putExtra(MusicForegroundService.EXTRA_TITLE, title)
                    putExtra(MusicForegroundService.EXTRA_ARTIST, artist)
                    putExtra(MusicForegroundService.EXTRA_ALBUM, album)
                    putExtra(MusicForegroundService.EXTRA_COVER, coverPath)
                    putExtra(MusicForegroundService.EXTRA_PLAYING, playing)
                    putExtra(MusicForegroundService.EXTRA_POSITION, positionMs)
                    putExtra(MusicForegroundService.EXTRA_DURATION, durationMs)
                    putExtra(MusicForegroundService.EXTRA_SPEED, speed)
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
        fun updatePlaybackNotification(title: String, artist: String, playing: Boolean) {
            updatePlaybackMedia(title, artist, "Song App", "", playing, 0L, 0L, 1.0f)
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
