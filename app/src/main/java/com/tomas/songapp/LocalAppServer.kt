package com.tomas.songapp

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest
import org.json.JSONArray
import org.json.JSONObject
import java.io.*
import java.net.*
import java.nio.charset.StandardCharsets
import java.util.UUID
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.zip.GZIPInputStream

class LocalAppServer(private val appContext: Context) {

    private val dataDir = File(appContext.filesDir, "data")
    private val stagingRoot = File(dataDir, "_staging")
    private val songsJsonFile = File(dataDir, "songs.json")
    private val playlistsJsonFile = File(dataDir, "playlists.json")
    private val settingsJsonFile = File(dataDir, "settings.json")
    private val prefs = appContext.getSharedPreferences("songapp_persistent_prefs", Context.MODE_PRIVATE)
    private val jsonLock = Any()
    private val ytdlLock = Any()
    @Volatile
    private var ytdlInitialized = false
    @Volatile
    private var ffmpegReady = false
    @Volatile
    private var ytdlUpdatedThisSession = false

    private var serverSocket: ServerSocket? = null
    private var executor: ExecutorService? = null
    @Volatile
    private var running = false

    @Volatile private var updateState = "idle" // idle | downloading | ready | error
    @Volatile private var updateProgress = 0
    @Volatile private var updateDownloadedMb = 0.0
    @Volatile private var updateTotalMb = 0.0
    @Volatile private var updateError = ""

    @Volatile private var plImportState = "idle" // idle | running | done | error
    @Volatile private var plImportName = ""
    @Volatile private var plImportCurrent = 0
    @Volatile private var plImportTotal = 0
    @Volatile private var plImportCurrentTitle = ""
    @Volatile private var plImportDownloaded = 0
    @Volatile private var plImportSkipped = 0
    @Volatile private var plImportFailed = 0
    @Volatile private var plImportError = ""

    var port: Int = 0
        private set

    fun start(): Int {
        if (running && port > 0) return port
        initSeedMetadata()
        // Bind to fixed deterministic port 18085..18099 first so WebView origin & localStorage persist across restarts/updates
        val addr = InetAddress.getByName("127.0.0.1")
        var ss: ServerSocket? = null
        for (tryPort in 18085..18099) {
            try {
                ss = ServerSocket(tryPort, 50, addr)
                break
            } catch (_: Exception) {}
        }
        if (ss == null) ss = ServerSocket(0, 50, addr)
        serverSocket = ss
        port = ss.localPort
        running = true
        val pool = Executors.newCachedThreadPool()
        executor = pool
        pool.execute {
            try {
                ensureYoutubeDlInit()
                updateYoutubeDlOnce()
            } catch (_: Exception) {}
        }
        pool.execute {
            while (running) {
                try {
                    val client = ss.accept()
                    pool.execute { handleClient(client) }
                } catch (_: Exception) {
                    if (!running) break
                }
            }
        }
        return port
    }

    fun stop() {
        running = false
        try { serverSocket?.close() } catch (_: Exception) {}
        try { executor?.shutdownNow() } catch (_: Exception) {}
        serverSocket = null
        executor = null
    }

    private fun initSeedMetadata() {
        if (!dataDir.exists()) dataDir.mkdirs()
        if (stagingRoot.exists()) stagingRoot.deleteRecursively()
        copySeedJsonIfMissing("songs.json", songsJsonFile, "[]")
        copySeedJsonIfMissing("playlists.json", playlistsJsonFile, "[]")
        copySeedJsonIfMissing("settings.json", settingsJsonFile, "{}")
    }

    private fun ensureYoutubeDlInit() {
        if (ytdlInitialized) return
        synchronized(ytdlLock) {
            if (!ytdlInitialized) {
                YoutubeDL.getInstance().init(appContext)
                ffmpegReady = initFfmpegIfPresent()
                ytdlInitialized = true
            }
        }
    }

    private fun initFfmpegIfPresent(): Boolean {
        val candidates = listOf(
            "com.yausername.ffmpeg.FFmpeg",
            "com.yausername.youtubedl_android.FFmpeg"
        )
        for (clsName in candidates) {
            try {
                val cls = Class.forName(clsName)
                val inst = cls.getMethod("getInstance").invoke(null)
                cls.getMethod("init", Context::class.java).invoke(inst, appContext)
                return true
            } catch (_: Exception) {
            }
        }
        return false
    }

    private fun cropImageToSquareJpeg(srcFile: File, destFile: File, maxSize: Int = 640): Boolean {
        return try {
            val orig = BitmapFactory.decodeFile(srcFile.absolutePath) ?: return false
            val side = minOf(orig.width, orig.height)
            if (side <= 0) {
                orig.recycle()
                return false
            }
            val x = (orig.width - side) / 2
            val y = (orig.height - side) / 2
            val cropped = Bitmap.createBitmap(orig, x, y, side, side)
            if (cropped !== orig) orig.recycle()
            val finalBmp = if (side > maxSize) {
                val scaled = Bitmap.createScaledBitmap(cropped, maxSize, maxSize, true)
                if (scaled !== cropped) cropped.recycle()
                scaled
            } else cropped

            val tmp = File(destFile.parentFile, destFile.name + ".tmp")
            tmp.outputStream().use { out ->
                finalBmp.compress(Bitmap.CompressFormat.JPEG, 92, out)
            }
            finalBmp.recycle()
            if (srcFile.absolutePath != destFile.absolutePath) srcFile.delete()
            if (destFile.exists()) destFile.delete()
            if (!tmp.renameTo(destFile)) {
                tmp.copyTo(destFile, overwrite = true)
                tmp.delete()
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun updateYoutubeDlOnce() {
        if (ytdlUpdatedThisSession) return
        synchronized(ytdlLock) {
            if (!ytdlUpdatedThisSession) {
                try {
                    YoutubeDL.getInstance().updateYoutubeDL(appContext, YoutubeDL.UpdateChannel.NIGHTLY)
                } catch (_: Exception) {
                    try {
                        YoutubeDL.getInstance().updateYoutubeDL(appContext, YoutubeDL.UpdateChannel.STABLE)
                    } catch (_: Exception) {}
                }
                ytdlUpdatedThisSession = true
            }
        }
    }

    private fun copySeedJsonIfMissing(assetName: String, dest: File, fallback: String) {
        if (dest.exists() && dest.length() > 0) return
        try {
            appContext.assets.open("seed_data/$assetName").use { inp ->
                dest.outputStream().use { out -> inp.copyTo(out) }
            }
        } catch (_: Exception) {
            dest.writeText(fallback, StandardCharsets.UTF_8)
        }
    }

    private data class HttpRequest(
        val method: String,
        val path: String,
        val headers: Map<String, String>,
        val body: ByteArray
    )

    private fun readRequest(input: InputStream): HttpRequest? {
        val headerBuf = ByteArrayOutputStream()
        val chunk = ByteArray(4096)
        var headerEnd = -1
        while (headerEnd < 0) {
            val n = input.read(chunk)
            if (n <= 0) return null
            headerBuf.write(chunk, 0, n)
            val arr = headerBuf.toByteArray()
            val startCheck = maxOf(0, arr.size - n - 3)
            for (i in startCheck..(arr.size - 4)) {
                if (arr[i] == 13.toByte() && arr[i + 1] == 10.toByte() &&
                    arr[i + 2] == 13.toByte() && arr[i + 3] == 10.toByte()
                ) {
                    headerEnd = i
                    break
                }
            }
            if (arr.size > 65536 && headerEnd < 0) return null
        }

        val all = headerBuf.toByteArray()
        val headerStr = String(all, 0, headerEnd, StandardCharsets.ISO_8859_1)
        val lines = headerStr.split("\r\n")
        if (lines.isEmpty()) return null
        val parts = lines[0].split(" ")
        if (parts.size < 2) return null

        val method = parts[0].uppercase()
        val rawTarget = parts[1]
        val qIdx = rawTarget.indexOf('?')
        val path = if (qIdx >= 0) rawTarget.substring(0, qIdx) else rawTarget

        val headers = HashMap<String, String>()
        for (i in 1 until lines.size) {
            val colon = lines[i].indexOf(':')
            if (colon > 0) {
                headers[lines[i].substring(0, colon).trim().lowercase()] = lines[i].substring(colon + 1).trim()
            }
        }

        val contentLen = headers["content-length"]?.toIntOrNull() ?: 0
        val bodyOffset = headerEnd + 4
        val body = ByteArray(maxOf(0, contentLen))
        val initialLen = minOf(all.size - bodyOffset, contentLen)
        if (initialLen > 0) {
            System.arraycopy(all, bodyOffset, body, 0, initialLen)
        }
        var copied = maxOf(0, initialLen)
        while (copied < contentLen) {
            val r = input.read(body, copied, contentLen - copied)
            if (r <= 0) break
            copied += r
        }
        return HttpRequest(method, path, headers, body)
    }

    private fun handleClient(socket: Socket) {
        socket.use { s ->
            try {
                s.soTimeout = 30000
                val inp = s.getInputStream()
                val out = s.getOutputStream()
                val req = readRequest(inp) ?: return

                routeRequest(req, out)
            } catch (_: Exception) {
            }
        }
    }

    private fun routeRequest(req: HttpRequest, out: OutputStream) {
        val m = req.method
        val p = req.path

        // Static web assets
        if (m == "GET" && (p == "/" || p == "/index.html")) {
            sendAsset(out, req, "web/index.html", "text/html; charset=utf-8"); return
        }
        if (m == "GET" && p in setOf("/style.css", "/script.js", "/icon.svg")) {
            val name = p.removePrefix("/")
            sendAsset(out, req, "web/$name", mimeFor(name)); return
        }

        if (m == "GET" && p == "/api/ping") {
            sendJson(out, 200, JSONObject().put("ok", true).put("native", true).toString()); return
        }

        if (m == "GET" && p == "/api/network-info") {
            val obj = JSONObject()
                .put("port", port)
                .put("native", true)
                .put("localUrl", "http://127.0.0.1:$port/")
                .put("lanUrls", JSONArray())
            sendJson(out, 200, obj.toString()); return
        }

        // App Info & In-App Self-Updater (GitHub Releases)
        if (m == "GET" && p == "/api/app-info") {
            val obj = JSONObject()
                .put("versionCode", BuildConfig.VERSION_CODE)
                .put("versionName", BuildConfig.VERSION_NAME)
                .put("githubRepo", BuildConfig.GITHUB_REPO)
            sendJson(out, 200, obj.toString()); return
        }

        if (m == "POST" && p == "/api/check-update") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val repo = body.optString("repo", "").trim().ifEmpty { BuildConfig.GITHUB_REPO }.trim('/')
            val token = body.optString("token", "").trim()
            if (!Regex("^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$").matches(repo)) {
                sendError(out, 400, "Zadej GitHub repozitář ve tvaru uzivatel/nazev-repozitare.")
                return
            }
            val res = checkGithubUpdate(repo, token)
            if (res.has("error")) sendJson(out, 400, res.toString())
            else sendJson(out, 200, res.toString())
            return
        }

        if (m == "POST" && p == "/api/download-update") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val apkUrl = body.optString("apkUrl", "").trim()
            val token = body.optString("token", "").trim()
            val useApiAsset = body.optBoolean("useApiAsset", false)
            if (!apkUrl.startsWith("https://")) {
                sendError(out, 400, "Neplatná adresa aktualizace.")
                return
            }
            if (updateState != "downloading") {
                startApkDownload(apkUrl, token, useApiAsset)
            }
            sendJson(out, 200, buildUpdateStatusJson().toString()); return
        }

        if (m == "GET" && p == "/api/update-status") {
            sendJson(out, 200, buildUpdateStatusJson().toString()); return
        }

        // Songs
        if (m == "GET" && p == "/api/songs") {
            val raw = synchronized(jsonLock) { songsJsonFile.readText(StandardCharsets.UTF_8).ifBlank { "[]" } }
            sendJson(out, 200, raw); return
        }
        if (m == "POST" && p == "/api/songs") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val title = body.optString("title", "").trim()
            if (title.isEmpty()) { sendError(out, 400, "Chybí název písničky"); return }
            val id = "song_${System.currentTimeMillis()}_${UUID.randomUUID().toString().replace("-", "").take(6)}"
            val songDir = File(dataDir, id).apply { mkdirs() }

            var audioUrl: Any = JSONObject.NULL
            var coverUrl: Any = JSONObject.NULL
            val stagingToken = body.optString("stagingToken", "").trim()
            if (Regex("^imp_[a-zA-Z0-9_]+$").matches(stagingToken)) {
                val stageDir = File(stagingRoot, stagingToken)
                if (stageDir.exists()) {
                    if (body.optBoolean("useStagedAudio", true)) {
                        stageDir.listFiles()?.firstOrNull { it.name.startsWith("audio.") }?.let { af ->
                            val dest = File(songDir, af.name)
                            af.copyTo(dest, overwrite = true)
                            audioUrl = "/data/$id/${af.name}"
                        }
                    }
                    if (body.optBoolean("useStagedCover", true)) {
                        stageDir.listFiles()?.firstOrNull { it.name.startsWith("cover.") }?.let { cf ->
                            val dest = File(songDir, cf.name)
                            cf.copyTo(dest, overwrite = true)
                            coverUrl = "/data/$id/${cf.name}"
                        }
                    }
                    stageDir.deleteRecursively()
                }
            }

            val song = JSONObject()
                .put("id", id)
                .put("title", title)
                .put("artist", body.optString("artist", "").trim())
                .put("album", body.optString("album", "").trim())
                .put("lyrics", body.optString("lyrics", ""))
                .put("audioFile", audioUrl)
                .put("coverFile", coverUrl)
                .put("createdAt", System.currentTimeMillis())
            synchronized(jsonLock) {
                val arr = readJsonArray(songsJsonFile)
                val updated = JSONArray()
                updated.put(song)
                for (i in 0 until arr.length()) updated.put(arr.get(i))
                songsJsonFile.writeText(updated.toString(), StandardCharsets.UTF_8)
            }
            sendJson(out, 201, song.toString()); return
        }

        val songMatch = Regex("^/api/songs/([a-zA-Z0-9_-]+)$").matchEntire(p)
        if (songMatch != null) {
            val id = songMatch.groupValues[1]
            if (m == "PUT") {
                val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
                var target: JSONObject? = null
                synchronized(jsonLock) {
                    val arr = readJsonArray(songsJsonFile)
                    for (i in 0 until arr.length()) {
                        val s = arr.getJSONObject(i)
                        if (s.optString("id") == id) {
                            if (body.has("title")) s.put("title", body.optString("title").trim())
                            if (body.has("artist")) s.put("artist", body.optString("artist").trim())
                            if (body.has("album")) s.put("album", body.optString("album").trim())
                            if (body.has("lyrics")) s.put("lyrics", body.optString("lyrics"))
                            target = s
                            break
                        }
                    }
                    if (target != null) songsJsonFile.writeText(arr.toString(), StandardCharsets.UTF_8)
                }
                if (target == null) sendError(out, 404, "Písnička nenalezena")
                else sendJson(out, 200, target.toString())
                return
            }
            if (m == "DELETE") {
                synchronized(jsonLock) {
                    val arr = readJsonArray(songsJsonFile)
                    val remaining = JSONArray()
                    for (i in 0 until arr.length()) {
                        val s = arr.getJSONObject(i)
                        if (s.optString("id") != id) remaining.put(s)
                    }
                    songsJsonFile.writeText(remaining.toString(), StandardCharsets.UTF_8)

                    val pls = readJsonArray(playlistsJsonFile)
                    for (i in 0 until pls.length()) {
                        val pl = pls.getJSONObject(i)
                        val ids = pl.optJSONArray("songIds") ?: continue
                        val newIds = JSONArray()
                        for (j in 0 until ids.length()) {
                            if (ids.optString(j) != id) newIds.put(ids.get(j))
                        }
                        pl.put("songIds", newIds)
                    }
                    playlistsJsonFile.writeText(pls.toString(), StandardCharsets.UTF_8)
                }
                File(dataDir, id).deleteRecursively()
                sendJson(out, 200, """{"deleted":true}"""); return
            }
        }

        val mediaMatch = Regex("^/api/songs/([a-zA-Z0-9_-]+)/(audio|cover)$").matchEntire(p)
        if (mediaMatch != null) {
            val id = mediaMatch.groupValues[1]
            val kind = mediaMatch.groupValues[2]
            if (m == "POST") {
                val origName = req.headers["x-filename"] ?: ""
                val ext = safeExtension(origName, if (kind == "audio") ".mp3" else ".jpg")
                val songDir = File(dataDir, id).apply { mkdirs() }
                songDir.listFiles()?.filter { it.name.startsWith("$kind.") }?.forEach { it.delete() }
                var destName = "$kind$ext"
                val destFile = File(songDir, destName)
                destFile.writeBytes(req.body)
                if (kind == "cover") {
                    val squareFile = File(songDir, "cover.jpg")
                    if (cropImageToSquareJpeg(destFile, squareFile)) {
                        destName = "cover.jpg"
                    }
                }
                var target: JSONObject? = null
                synchronized(jsonLock) {
                    val arr = readJsonArray(songsJsonFile)
                    for (i in 0 until arr.length()) {
                        val s = arr.getJSONObject(i)
                        if (s.optString("id") == id) {
                            s.put(if (kind == "audio") "audioFile" else "coverFile", "/data/$id/$destName")
                            target = s
                            break
                        }
                    }
                    if (target != null) songsJsonFile.writeText(arr.toString(), StandardCharsets.UTF_8)
                }
                if (target == null) sendError(out, 404, "Písnička nenalezena")
                else sendJson(out, 200, target.toString())
                return
            }
            if (m == "DELETE" && kind == "cover") {
                File(dataDir, id).listFiles()?.filter { it.name.startsWith("cover.") }?.forEach { it.delete() }
                var target: JSONObject? = null
                synchronized(jsonLock) {
                    val arr = readJsonArray(songsJsonFile)
                    for (i in 0 until arr.length()) {
                        val s = arr.getJSONObject(i)
                        if (s.optString("id") == id) {
                            s.put("coverFile", JSONObject.NULL)
                            target = s
                            break
                        }
                    }
                    if (target != null) songsJsonFile.writeText(arr.toString(), StandardCharsets.UTF_8)
                }
                if (target == null) sendError(out, 404, "Písnička nenalezena")
                else sendJson(out, 200, target.toString())
                return
            }
        }

        // Playlists
        if (m == "GET" && p == "/api/playlists") {
            val raw = synchronized(jsonLock) { playlistsJsonFile.readText(StandardCharsets.UTF_8).ifBlank { "[]" } }
            sendJson(out, 200, raw); return
        }
        if (m == "POST" && p == "/api/playlists") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val name = body.optString("name", "").trim()
            if (name.isEmpty()) { sendError(out, 400, "Chybí název playlistu"); return }
            val pl = JSONObject()
                .put("id", "pl_${System.currentTimeMillis()}_${UUID.randomUUID().toString().replace("-", "").take(6)}")
                .put("name", name)
                .put("songIds", body.optJSONArray("songIds") ?: JSONArray())
                .put("createdAt", System.currentTimeMillis())
            synchronized(jsonLock) {
                val arr = readJsonArray(playlistsJsonFile)
                val updated = JSONArray()
                updated.put(pl)
                for (i in 0 until arr.length()) updated.put(arr.get(i))
                playlistsJsonFile.writeText(updated.toString(), StandardCharsets.UTF_8)
            }
            sendJson(out, 201, pl.toString()); return
        }

        val plMatch = Regex("^/api/playlists/([a-zA-Z0-9_-]+)$").matchEntire(p)
        if (plMatch != null) {
            val plId = plMatch.groupValues[1]
            if (m == "PUT") {
                val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
                var target: JSONObject? = null
                synchronized(jsonLock) {
                    val arr = readJsonArray(playlistsJsonFile)
                    for (i in 0 until arr.length()) {
                        val pl = arr.getJSONObject(i)
                        if (pl.optString("id") == plId) {
                            if (body.has("name")) pl.put("name", body.optString("name").trim())
                            if (body.has("songIds")) pl.put("songIds", body.optJSONArray("songIds") ?: JSONArray())
                            target = pl
                            break
                        }
                    }
                    if (target != null) playlistsJsonFile.writeText(arr.toString(), StandardCharsets.UTF_8)
                }
                if (target == null) sendError(out, 404, "Playlist nenalezen")
                else sendJson(out, 200, target.toString())
                return
            }
            if (m == "DELETE") {
                synchronized(jsonLock) {
                    val arr = readJsonArray(playlistsJsonFile)
                    val remaining = JSONArray()
                    for (i in 0 until arr.length()) {
                        if (arr.getJSONObject(i).optString("id") != plId) remaining.put(arr.get(i))
                    }
                    playlistsJsonFile.writeText(remaining.toString(), StandardCharsets.UTF_8)
                }
                sendJson(out, 200, """{"deleted":true}"""); return
            }
        }

        // Settings (dual-persisted in settings.json + Android SharedPreferences so updates/restarts never lose them)
        if (m == "GET" && p == "/api/settings") {
            val raw = synchronized(jsonLock) {
                val fromFile = if (settingsJsonFile.exists()) settingsJsonFile.readText(StandardCharsets.UTF_8).trim() else ""
                val fromPrefs = prefs.getString("settings_json", "")?.trim() ?: ""
                when {
                    fromFile.startsWith("{") && fromFile.length > 2 -> fromFile
                    fromPrefs.startsWith("{") && fromPrefs.length > 2 -> {
                        settingsJsonFile.writeText(fromPrefs, StandardCharsets.UTF_8)
                        fromPrefs
                    }
                    else -> "{}"
                }
            }
            sendJson(out, 200, raw); return
        }
        if (m == "PUT" && p == "/api/settings") {
            val text = String(req.body, StandardCharsets.UTF_8).trim()
            if (text.startsWith("{")) {
                synchronized(jsonLock) {
                    val tmp = File(dataDir, "settings.json.tmp")
                    tmp.writeText(text, StandardCharsets.UTF_8)
                    if (!tmp.renameTo(settingsJsonFile)) {
                        settingsJsonFile.writeText(text, StandardCharsets.UTF_8)
                        tmp.delete()
                    }
                    prefs.edit().putString("settings_json", text).apply()
                }
            }
            sendJson(out, 200, text.ifBlank { "{}" }); return
        }

        // Find Lyrics (LRCLIB -> NetEase LRC -> Lyrist -> lyrics.ovh)
        if (m == "POST" && p == "/api/find-lyrics") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val title = body.optString("title", "").trim()
            val artist = body.optString("artist", "").trim()
            val album = body.optString("album", "").trim()
            val duration = body.optInt("duration", 0)
            if (title.isEmpty()) { sendError(out, 400, "Chybí název písničky"); return }
            val result = findSongLyrics(title, artist, album, duration)
            if (result == null) {
                sendError(out, 404, "Lyrics nebyly nalezeny v LRCLIB, NetEase, Lyrist ani lyrics.ovh.")
            } else {
                sendJson(out, 200, result.toString())
            }
            return
        }

        // Translate (fast deduplicated Google Translate, zero disk cache)
        if (m == "POST" && p == "/api/translate") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            var target = body.optString("target", "cs").trim().lowercase()
            var source = body.optString("source", "auto").trim().lowercase()
            if (!Regex("^[a-z]{2,5}(-[a-z]{2,4})?$").matches(target)) target = "cs"
            if (!Regex("^(auto|[a-z]{2,5}(-[a-z]{2,4})?)$").matches(source)) source = "auto"
            val linesArr = body.optJSONArray("lines") ?: JSONArray()
            val inputLines = (0 until linesArr.length()).map { linesArr.optString(it, "") }
            val translated = translateLines(inputLines, source, target)
            val outArr = JSONArray()
            translated.forEach { outArr.put(it) }
            sendJson(out, 200, JSONObject().put("target", target).put("lines", outArr).toString())
            return
        }

        // Staging file preview & cleanup
        val stageGet = Regex("^/api/staging/(imp_[a-zA-Z0-9_]+)/([a-zA-Z0-9._-]+)$").matchEntire(p)
        if (m == "GET" && stageGet != null) {
            val f = File(File(stagingRoot, stageGet.groupValues[1]), stageGet.groupValues[2])
            if (f.exists() && f.isFile) sendFileWithRange(out, req, f, mimeFor(f.name))
            else sendError(out, 404, "Soubor nenalezen")
            return
        }
        val stageDel = Regex("^/api/staging/(imp_[a-zA-Z0-9_]+)$").matchEntire(p)
        if (m == "DELETE" && stageDel != null) {
            File(stagingRoot, stageDel.groupValues[1]).deleteRecursively()
            sendJson(out, 200, """{"cleaned":true}"""); return
        }

        // POST /api/import-url (Native YouTube / YT Music download on Android via yt-dlp!)
        if (m == "POST" && p == "/api/import-url") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val url = body.optString("url", "").trim()
            if (!Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(url)) {
                sendError(out, 400, "Zadej platný odkaz (http:// nebo https://)")
                return
            }
            val result = importFromYoutubeUrl(url)
            if (result.has("error")) sendJson(out, 500, result.toString())
            else sendJson(out, 200, result.toString())
            return
        }

        // POST /api/import-playlist & GET /api/playlist-import-status (Download whole YouTube / YT Music playlists!)
        if (m == "POST" && p == "/api/import-playlist") {
            val body = JSONObject(String(req.body, StandardCharsets.UTF_8))
            val url = body.optString("url", "").trim()
            val customName = body.optString("playlistName", "").trim()
            if (!Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(url)) {
                sendError(out, 400, "Zadej platný odkaz na playlist (http:// nebo https://)")
                return
            }
            if (plImportState == "running") {
                sendJson(out, 200, buildPlaylistImportStatusJson().toString())
                return
            }
            startPlaylistImport(url, customName)
            sendJson(out, 200, buildPlaylistImportStatusJson().toString())
            return
        }
        if (m == "GET" && p == "/api/playlist-import-status") {
            sendJson(out, 200, buildPlaylistImportStatusJson().toString())
            return
        }

        // Serve media: /data/{id}/{filename} (check writable filesDir first, then bundled seed_data asset)
        val dataMatch = Regex("^/data/([a-zA-Z0-9_-]+)/([a-zA-Z0-9._-]+)$").matchEntire(p)
        if (m == "GET" && dataMatch != null) {
            val id = dataMatch.groupValues[1]
            val fileName = dataMatch.groupValues[2]
            val localFile = File(File(dataDir, id), fileName)
            if (localFile.exists() && localFile.isFile) {
                sendFileWithRange(out, req, localFile, mimeFor(fileName))
                return
            }
            sendAsset(out, req, "seed_data/$id/$fileName", mimeFor(fileName))
            return
        }

        sendError(out, 404, "Nenalezeno")
    }

    // ===================== NATIVE ANDROID YOUTUBE / YT MUSIC IMPORTER =====================
    private val audioExts = setOf("m4a", "mp3", "webm", "opus", "ogg", "wav", "flac", "aac", "mp4", "m4b", "3gp", "mkv")
    private val coverExts = setOf("jpg", "jpeg", "png", "webp")

    private fun normalizeYtUrl(rawUrl: String): String {
        val m = Regex("(?:v=|youtu\\.be/)([a-zA-Z0-9_-]{11})").find(rawUrl)
        return if (m != null) "https://www.youtube.com/watch?v=${m.groupValues[1]}" else rawUrl
    }

    private fun runYtDlpAttempt(url: String, stageDir: File, formatArg: String, extractorArgs: String?): String {
        stageDir.listFiles()?.forEach { it.delete() }
        val outTemplate = File(stageDir, "media.%(ext)s").absolutePath
        val ytReq = YoutubeDLRequest(url).apply {
            addOption("--no-playlist")
            addOption("--no-simulate")
            addOption("--no-warnings")
            addOption("--no-mtime")
            addOption("--no-part")
            addOption("--no-cache-dir")
            addOption("--force-ipv4")
            addOption("--socket-timeout", "20")
            addOption("--print-json")
            addOption("-f", formatArg)
            if (ffmpegReady) {
                addOption("-x")
                addOption("--audio-format", "mp3")
                addOption("--audio-quality", "0")
            }
            addOption("--write-thumbnail")
            if (!extractorArgs.isNullOrBlank()) {
                addOption("--extractor-args", extractorArgs)
            }
            addOption("-o", outTemplate)
        }
        val resp = YoutubeDL.getInstance().execute(ytReq)
        val hasDownloadedAudio = stageDir.listFiles()?.any {
            it.isFile && it.length() > 1024 && it.extension.lowercase() in audioExts
        } == true
        if (!hasDownloadedAudio) {
            val foundNames = stageDir.listFiles()?.joinToString(", ") { "${it.name} (${it.length()}B)" } ?: "žádné"
            throw IOException("Audio nebylo staženo (soubory: $foundNames)")
        }
        return resp.out ?: ""
    }

    private fun importFromYoutubeUrl(url: String): JSONObject {
        val token = "imp_${System.currentTimeMillis()}_${UUID.randomUUID().toString().replace("-", "").take(6)}"
        val stageDir = File(stagingRoot, token).apply { mkdirs() }
        return try {
            ensureYoutubeDlInit()
            val isYoutube = url.contains("youtube.com", ignoreCase = true) || url.contains("youtu.be", ignoreCase = true)
            val cleanUrl = if (isYoutube) normalizeYtUrl(url) else url

            // Triple: (targetUrl, formatArg, extractorArgs)
            val attempts: List<Triple<String, String, String?>> = if (isYoutube) {
                listOf(
                    Triple(url, "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/18/best", "youtube:player_client=android_vr,tv_embedded"),
                    Triple(cleanUrl, "bestaudio[ext=m4a]/bestaudio/18/best", "youtube:player_client=ios,android"),
                    Triple(cleanUrl, "bestaudio/18/best", null)
                )
            } else {
                listOf(Triple(url, "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best", null))
            }

            var stdOut = ""
            var lastErr: Exception? = null
            for ((idx, attempt) in attempts.withIndex()) {
                try {
                    stdOut = runYtDlpAttempt(attempt.first, stageDir, attempt.second, attempt.third)
                    lastErr = null
                    break
                } catch (e: Exception) {
                    lastErr = e
                    // If first attempt fails (e.g. 403 Forbidden), update yt-dlp to latest NIGHTLY before retrying
                    if (idx == 0) {
                        updateYoutubeDlOnce()
                    }
                }
            }
            if (lastErr != null) throw lastErr

            var meta: JSONObject? = null
            for (line in stdOut.split(Regex("\\r?\\n"))) {
                val tr = line.trim()
                if (tr.startsWith("{") && tr.endsWith("}")) {
                    try { meta = JSONObject(tr); break } catch (_: Exception) {}
                }
            }

            val files = stageDir.listFiles()?.filter { it.isFile } ?: emptyList()

            var hasAudio = false
            var audioName: String? = null
            val audioCandidates = files.filter { it.extension.lowercase() in audioExts && it.length() > 1024 }
            val chosenAudio = audioCandidates.firstOrNull { it.extension.equals("mp3", ignoreCase = true) }
                ?: audioCandidates.maxByOrNull { it.length() }
            chosenAudio?.let { af ->
                val destName = "audio.${af.extension.lowercase()}"
                val dest = File(stageDir, destName)
                if (af.absolutePath != dest.absolutePath) af.renameTo(dest)
                hasAudio = true
                audioName = destName
            }

            var hasCover = false
            var coverPreviewUrl: String? = null
            files.firstOrNull { it.extension.lowercase() in coverExts }?.let { cf ->
                val squareDest = File(stageDir, "cover.jpg")
                val finalName = if (cropImageToSquareJpeg(cf, squareDest)) {
                    "cover.jpg"
                } else {
                    val fallbackName = "cover.${cf.extension.lowercase()}"
                    val fbDest = File(stageDir, fallbackName)
                    if (cf.absolutePath != fbDest.absolutePath) cf.renameTo(fbDest)
                    fallbackName
                }
                hasCover = true
                coverPreviewUrl = "/api/staging/$token/$finalName"
            }

            if (!hasAudio) {
                stageDir.deleteRecursively()
                return JSONObject().put("error", "Nepodařilo se stáhnout audio soubor z tohoto odkazu.")
            }

            var title = ""
            var artist = ""
            var album = ""
            var duration = 0
            meta?.let { m ->
                title = m.optString("track", "").ifBlank { m.optString("title", "") }.trim()
                artist = m.optString("artist", "").ifBlank {
                    val arts = m.optJSONArray("artists")
                    if (arts != null && arts.length() > 0) arts.optString(0, "")
                    else m.optString("creator", "").ifBlank {
                        m.optString("uploader", "").ifBlank { m.optString("channel", "") }
                    }
                }.replace(Regex("\\s*-\\s*Topic$"), "").trim()
                album = m.optString("album", "").trim()
                duration = Math.round(m.optDouble("duration", 0.0)).toInt()

                if (m.optString("track", "").isBlank()) {
                    val splitMatch = Regex("^(.+?)\\s+-\\s+(.+)$").matchEntire(title)
                    if (splitMatch != null) {
                        val candArtist = splitMatch.groupValues[1].trim()
                        val candTitle = splitMatch.groupValues[2].trim()
                        if (artist.isBlank() || artist == m.optString("uploader", "")) artist = candArtist
                        title = candTitle
                    }
                }
                title = title.replace(
                    Regex("\\s*[\\(\\[](Official\\s*(Music\\s*)?Video|Official\\s*Audio|Lyric\\s*Video|Lyrics|HD|4K)[\\)\\]]", RegexOption.IGNORE_CASE),
                    ""
                ).trim()
            }

            var lyrics = ""
            var lyricsSynced = false
            if (title.isNotBlank()) {
                findSongLyrics(title, artist, album, duration)?.let { lrc ->
                    lyrics = lrc.optString("lyrics", "")
                    lyricsSynced = lrc.optBoolean("synced", false)
                }
            }

            JSONObject()
                .put("token", token)
                .put("title", title)
                .put("artist", artist)
                .put("album", album)
                .put("lyrics", lyrics)
                .put("lyricsSynced", lyricsSynced)
                .put("hasAudio", hasAudio)
                .put("audioName", audioName ?: JSONObject.NULL)
                .put("hasCover", hasCover)
                .put("coverPreviewUrl", coverPreviewUrl ?: JSONObject.NULL)
        } catch (e: Exception) {
            stageDir.deleteRecursively()
            JSONObject().put("error", "Import se nezdařil: ${e.message ?: "neznámá chyba"}")
        }
    }

    // ===================== WHOLE YOUTUBE / YT MUSIC PLAYLIST DOWNLOADER =====================
    private fun buildPlaylistImportStatusJson(): JSONObject = JSONObject()
        .put("state", plImportState)
        .put("playlistName", plImportName)
        .put("current", plImportCurrent)
        .put("total", plImportTotal)
        .put("currentTitle", plImportCurrentTitle)
        .put("downloaded", plImportDownloaded)
        .put("skipped", plImportSkipped)
        .put("failed", plImportFailed)
        .put("error", plImportError)

    private fun startPlaylistImport(url: String, customName: String) {
        plImportState = "running"
        plImportName = customName.ifBlank { "Načítám playlist..." }
        plImportCurrent = 0
        plImportTotal = 0
        plImportCurrentTitle = "Načítám seznam skladeb..."
        plImportDownloaded = 0
        plImportSkipped = 0
        plImportFailed = 0
        plImportError = ""

        val pool = executor ?: return
        pool.execute {
            try {
                ensureYoutubeDlInit()
                val listReq = YoutubeDLRequest(url).apply {
                    addOption("--flat-playlist")
                    addOption("--dump-single-json")
                    addOption("--no-warnings")
                    addOption("--socket-timeout", "20")
                }
                val listOut = YoutubeDL.getInstance().execute(listReq).out ?: ""
                val jsonLine = listOut.split(Regex("\\r?\\n")).map { it.trim() }
                    .firstOrNull { it.startsWith("{") && it.endsWith("}") }
                    ?: throw IOException("Nepodařilo se načíst seznam skladeb z playlistu.")
                val plMeta = JSONObject(jsonLine)
                val entries = plMeta.optJSONArray("entries")
                    ?: throw IOException("Odkaz neobsahuje žádný playlist skladeb.")
                if (entries.length() == 0) throw IOException("Playlist je prázdný.")

                val finalPlName = customName.ifBlank {
                    plMeta.optString("title", "").trim().ifEmpty { "Stažený playlist" }
                }
                plImportName = finalPlName
                plImportTotal = entries.length()

                // Create playlist immediately so songs appear inside it as they download
                val plId = "pl_${System.currentTimeMillis()}_${UUID.randomUUID().toString().replace("-", "").take(6)}"
                synchronized(jsonLock) {
                    val pls = readJsonArray(playlistsJsonFile)
                    val newPl = JSONObject()
                        .put("id", plId)
                        .put("name", finalPlName)
                        .put("songIds", JSONArray())
                        .put("createdAt", System.currentTimeMillis())
                    val updatedPls = JSONArray()
                    updatedPls.put(newPl)
                    for (i in 0 until pls.length()) updatedPls.put(pls.get(i))
                    playlistsJsonFile.writeText(updatedPls.toString(), StandardCharsets.UTF_8)
                }

                for (i in 0 until entries.length()) {
                    plImportCurrent = i + 1
                    val entry = entries.optJSONObject(i) ?: continue
                    val entryTitle = entry.optString("title", "Skladba ${i + 1}").trim()
                    val entryId = entry.optString("id", "").trim()
                    val entryUrl = entry.optString("url", "").trim().let { raw ->
                        when {
                            raw.startsWith("http") -> raw
                            entryId.isNotEmpty() -> "https://www.youtube.com/watch?v=$entryId"
                            else -> ""
                        }
                    }
                    if (entryUrl.isEmpty() || entryTitle == "[Deleted video]" || entryTitle == "[Private video]") {
                        plImportSkipped++
                        continue
                    }
                    plImportCurrentTitle = entryTitle

                    // Check if song with same title already exists -> just add to playlist instead of re-downloading
                    var existingId: String? = null
                    synchronized(jsonLock) {
                        val songs = readJsonArray(songsJsonFile)
                        val normEntry = entryTitle.lowercase().replace(Regex("[^a-z0-9]+"), "")
                        for (k in 0 until songs.length()) {
                            val s = songs.getJSONObject(k)
                            val normS = s.optString("title", "").lowercase().replace(Regex("[^a-z0-9]+"), "")
                            if (normEntry.length >= 4 && normEntry == normS && !s.isNull("audioFile")) {
                                existingId = s.optString("id")
                                break
                            }
                        }
                    }
                    if (existingId != null) {
                        addSongIdToPlaylist(plId, existingId!!)
                        plImportSkipped++
                        continue
                    }

                    val imported = importFromYoutubeUrl(entryUrl)
                    if (imported.has("error") || !imported.optBoolean("hasAudio", false)) {
                        plImportFailed++
                        continue
                    }
                    val token = imported.optString("token", "")
                    val songId = "song_${System.currentTimeMillis()}_${UUID.randomUUID().toString().replace("-", "").take(6)}"
                    val songDir = File(dataDir, songId).apply { mkdirs() }
                    val stageDir = File(stagingRoot, token)
                    var audioUrl: Any = JSONObject.NULL
                    var coverUrl: Any = JSONObject.NULL
                    if (stageDir.exists()) {
                        stageDir.listFiles()?.firstOrNull { it.name.startsWith("audio.") }?.let { af ->
                            af.copyTo(File(songDir, af.name), overwrite = true)
                            audioUrl = "/data/$songId/${af.name}"
                        }
                        stageDir.listFiles()?.firstOrNull { it.name.startsWith("cover.") }?.let { cf ->
                            cf.copyTo(File(songDir, cf.name), overwrite = true)
                            coverUrl = "/data/$songId/${cf.name}"
                        }
                        stageDir.deleteRecursively()
                    }
                    val newSong = JSONObject()
                        .put("id", songId)
                        .put("title", imported.optString("title", entryTitle).ifBlank { entryTitle })
                        .put("artist", imported.optString("artist", ""))
                        .put("album", imported.optString("album", ""))
                        .put("lyrics", imported.optString("lyrics", ""))
                        .put("audioFile", audioUrl)
                        .put("coverFile", coverUrl)
                        .put("createdAt", System.currentTimeMillis())

                    synchronized(jsonLock) {
                        val arr = readJsonArray(songsJsonFile)
                        val updated = JSONArray()
                        updated.put(newSong)
                        for (k in 0 until arr.length()) updated.put(arr.get(k))
                        songsJsonFile.writeText(updated.toString(), StandardCharsets.UTF_8)
                    }
                    addSongIdToPlaylist(plId, songId)
                    plImportDownloaded++
                }
                plImportCurrentTitle = "Hotovo"
                plImportState = "done"
            } catch (e: Exception) {
                plImportError = e.message ?: "Stahování playlistu selhalo."
                plImportState = "error"
            }
        }
    }

    private fun addSongIdToPlaylist(plId: String, songId: String) {
        synchronized(jsonLock) {
            val pls = readJsonArray(playlistsJsonFile)
            for (i in 0 until pls.length()) {
                val pl = pls.getJSONObject(i)
                if (pl.optString("id") == plId) {
                    val ids = pl.optJSONArray("songIds") ?: JSONArray()
                    var exists = false
                    for (j in 0 until ids.length()) {
                        if (ids.optString(j) == songId) { exists = true; break }
                    }
                    if (!exists) ids.put(songId)
                    pl.put("songIds", ids)
                    break
                }
            }
            playlistsJsonFile.writeText(pls.toString(), StandardCharsets.UTF_8)
        }
    }

    // ===================== IN-APP GITHUB RELEASES UPDATER =====================
    private fun buildUpdateStatusJson(): JSONObject {
        val apkFile = File(File(appContext.cacheDir, "updates"), "SongApp-Update.apk")
        return JSONObject()
            .put("state", updateState)
            .put("progress", updateProgress)
            .put("downloadedMb", updateDownloadedMb)
            .put("totalMb", updateTotalMb)
            .put("error", updateError)
            .put("ready", updateState == "ready" && apkFile.exists() && apkFile.length() > 0L)
    }

    private fun checkGithubUpdate(repo: String, token: String): JSONObject {
        val headers = HashMap<String, String>()
        headers["Accept"] = "application/vnd.github+json"
        if (token.isNotEmpty()) headers["Authorization"] = "Bearer $token"

        val raw = httpGet("https://api.github.com/repos/$repo/releases/latest", headers, 10000)
            ?: return JSONObject().put(
                "error",
                "Nepodařilo se načíst aktualizace z GitHubu ($repo). Pokud je repozitář privátní, zadej GitHub Token."
            )
        return try {
            val rel = JSONObject(raw)
            val tag = rel.optString("tag_name", "").trim()
            val cleanVer = tag.removePrefix("v").ifEmpty { "0.0.0" }
            val remoteCode = Regex("(\\d+)$").find(cleanVer)?.groupValues?.get(1)?.toIntOrNull() ?: 0
            val assets = rel.optJSONArray("assets") ?: JSONArray()

            var apkBrowserUrl = ""
            var apkApiUrl = ""
            var apkSize = 0L
            for (i in 0 until assets.length()) {
                val a = assets.getJSONObject(i)
                val name = a.optString("name", "")
                if (name.endsWith(".apk", ignoreCase = true)) {
                    apkBrowserUrl = a.optString("browser_download_url", "")
                    apkApiUrl = a.optString("url", "")
                    apkSize = a.optLong("size", 0L)
                    break
                }
            }
            if (apkBrowserUrl.isEmpty() && apkApiUrl.isEmpty()) {
                return JSONObject().put("error", "V posledním GitHub Release ($tag) nebyl nalezen .apk soubor.")
            }
            val useApiAsset = token.isNotEmpty() && apkApiUrl.isNotEmpty()
            val downloadUrl = if (useApiAsset) apkApiUrl else apkBrowserUrl
            val hasUpdate = remoteCode > BuildConfig.VERSION_CODE ||
                (remoteCode == 0 && cleanVer != BuildConfig.VERSION_NAME)

            JSONObject()
                .put("hasUpdate", hasUpdate)
                .put("currentVersion", BuildConfig.VERSION_NAME)
                .put("currentVersionCode", BuildConfig.VERSION_CODE)
                .put("latestVersion", cleanVer)
                .put("latestVersionCode", remoteCode)
                .put("apkUrl", downloadUrl)
                .put("useApiAsset", useApiAsset)
                .put("apkSizeMb", Math.round((apkSize / 1048576.0) * 10.0) / 10.0)
                .put("releaseNotes", rel.optString("body", ""))
        } catch (e: Exception) {
            JSONObject().put("error", "Chyba čtení verze: ${e.message ?: "neznámá chyba"}")
        }
    }

    private fun startApkDownload(apkUrl: String, token: String, useApiAsset: Boolean) {
        updateState = "downloading"
        updateProgress = 0
        updateDownloadedMb = 0.0
        updateTotalMb = 0.0
        updateError = ""

        val pool = executor ?: return
        pool.execute {
            try {
                val updatesDir = File(appContext.cacheDir, "updates").apply { mkdirs() }
                val tmpFile = File(updatesDir, "SongApp-Update.apk.tmp")
                val finalFile = File(updatesDir, "SongApp-Update.apk")
                if (tmpFile.exists()) tmpFile.delete()

                var currentUrl = apkUrl
                var redirects = 0
                var conn: HttpURLConnection
                while (true) {
                    conn = URL(currentUrl).openConnection() as HttpURLConnection
                    conn.instanceFollowRedirects = false
                    conn.requestMethod = "GET"
                    conn.connectTimeout = 15000
                    conn.readTimeout = 30000
                    conn.setRequestProperty("User-Agent", "SongAppMobile/${BuildConfig.VERSION_NAME}")
                    val host = URL(currentUrl).host.lowercase()
                    if (host.endsWith("github.com")) {
                        if (token.isNotEmpty()) conn.setRequestProperty("Authorization", "Bearer $token")
                        if (useApiAsset) conn.setRequestProperty("Accept", "application/octet-stream")
                    }
                    val code = conn.responseCode
                    if (code in setOf(301, 302, 303, 307, 308) && redirects < 6) {
                        val loc = conn.getHeaderField("Location") ?: break
                        conn.disconnect()
                        currentUrl = URL(URL(currentUrl), loc).toString()
                        redirects++
                        continue
                    }
                    if (code !in 200..299) {
                        conn.disconnect()
                        throw IOException("Server vrátil chybu HTTP $code")
                    }
                    break
                }

                val totalBytes = conn.contentLengthLong
                if (totalBytes > 0) updateTotalMb = Math.round((totalBytes / 1048576.0) * 10.0) / 10.0

                conn.inputStream.use { inp ->
                    tmpFile.outputStream().use { fout ->
                        val buf = ByteArray(65536)
                        var copied = 0L
                        while (true) {
                            val r = inp.read(buf)
                            if (r <= 0) break
                            fout.write(buf, 0, r)
                            copied += r
                            updateDownloadedMb = Math.round((copied / 1048576.0) * 10.0) / 10.0
                            if (totalBytes > 0) {
                                updateProgress = ((copied * 100L) / totalBytes).toInt().coerceIn(0, 100)
                            }
                        }
                    }
                }
                conn.disconnect()

                if (finalFile.exists()) finalFile.delete()
                if (!tmpFile.renameTo(finalFile)) {
                    tmpFile.copyTo(finalFile, overwrite = true)
                    tmpFile.delete()
                }
                updateProgress = 100
                updateState = "ready"
            } catch (e: Exception) {
                updateError = e.message ?: "Stahování aktualizace selhalo."
                updateState = "error"
            }
        }
    }

    // ===================== MULTI-LIBRARY LYRICS FINDER =====================
    private fun cleanLyricsTitle(raw: String): String {
        var t = raw.replace(
            Regex("""\s*[\(\[][^\)\]]*(slowed|sped\s*up|reverb|nightcore|official|lyric|audio|video|hd|4k|visualizer|remaster|explicit|clean|version|edit|feat\.?|ft\.?|prod\.?)[^\)\]]*[\)\]]""", RegexOption.IGNORE_CASE),
            ""
        )
        t = t.replace(Regex("""\s+(feat\.?|ft\.?)\s+.*$""", RegexOption.IGNORE_CASE), "")
        t = t.replace(Regex("""\s+"""), " ").trim()
        return t.ifEmpty { raw.trim() }
    }

    private fun findSongLyrics(title: String, artist: String, album: String, duration: Int): JSONObject? {
        val cleanTitle = cleanLyricsTitle(title)
        val cleanArtist = artist.replace(Regex("""\s*(,|&|feat\.?|ft\.?|x)\s+.*$""", RegexOption.IGNORE_CASE), "").trim().ifEmpty { artist }
        var fallbackPlain = ""
        var fallbackSource = ""

        // 1. LRCLIB
        var lrcFound: JSONObject? = null
        if (artist.isNotEmpty()) {
            var qUrl = "https://lrclib.net/api/get?track_name=${urlEnc(title)}&artist_name=${urlEnc(artist)}"
            if (album.isNotEmpty()) qUrl += "&album_name=${urlEnc(album)}"
            if (duration > 0) qUrl += "&duration=$duration"
            httpGet(qUrl)?.let { try { lrcFound = JSONObject(it) } catch (_: Exception) {} }
        }
        if (lrcFound == null || (lrcFound!!.optString("syncedLyrics").isBlank() && lrcFound!!.optString("plainLyrics").isBlank())) {
            val queries = linkedSetOf(
                if (artist.isNotEmpty()) "$artist $title" else title,
                if (cleanArtist.isNotEmpty()) "$cleanArtist $cleanTitle" else cleanTitle
            )
            for (q in queries) {
                val raw = httpGet("https://lrclib.net/api/search?q=${urlEnc(q)}") ?: continue
                try {
                    val arr = JSONArray(raw)
                    var best: JSONObject? = null
                    for (i in 0 until arr.length()) {
                        val item = arr.getJSONObject(i)
                        if (item.optString("syncedLyrics").isNotBlank()) { best = item; break }
                        if (best == null && item.optString("plainLyrics").isNotBlank()) best = item
                    }
                    if (best != null) { lrcFound = best; break }
                } catch (_: Exception) {}
            }
        }
        lrcFound?.let {
            val synced = it.optString("syncedLyrics").trim()
            if (synced.isNotEmpty() && synced != "null") {
                return JSONObject().put("lyrics", synced).put("synced", true).put("source", "LRCLIB")
            }
            val plain = it.optString("plainLyrics").trim()
            if (plain.isNotEmpty() && plain != "null") {
                fallbackPlain = plain; fallbackSource = "LRCLIB"
            }
        }

        // 2. NetEase Cloud Music (synced LRC)
        val neHeaders = mapOf("Referer" to "https://music.163.com/")
        val neQ = if (cleanArtist.isNotEmpty()) "$cleanArtist $cleanTitle" else cleanTitle
        httpGet("https://music.163.com/api/search/get?type=1&s=${urlEnc(neQ)}&limit=5", neHeaders, 5500)?.let { raw ->
            try {
                val songs = JSONObject(raw).optJSONObject("result")?.optJSONArray("songs")
                if (songs != null && songs.length() > 0) {
                    var chosen = songs.getJSONObject(0)
                    if (cleanArtist.isNotEmpty()) {
                        for (i in 0 until songs.length()) {
                            val cand = songs.getJSONObject(i)
                            val arts = cand.optJSONArray("artists") ?: continue
                            for (j in 0 until arts.length()) {
                                if (arts.getJSONObject(j).optString("name").lowercase().contains(cleanArtist.lowercase())) {
                                    chosen = cand; break
                                }
                            }
                        }
                    }
                    val sid = chosen.optLong("id", 0L)
                    if (sid > 0) {
                        httpGet("https://music.163.com/api/song/lyric?id=$sid&lv=1", neHeaders, 5500)?.let { lrcRaw ->
                            val text = JSONObject(lrcRaw).optJSONObject("lrc")?.optString("lyric")?.trim() ?: ""
                            if (text.isNotEmpty() && !text.contains("纯音乐，请欣赏")) {
                                if (Regex("""\[\d{1,2}:\d{2}""").containsMatchIn(text)) {
                                    return JSONObject().put("lyrics", text).put("synced", true).put("source", "NetEase")
                                } else if (fallbackPlain.isEmpty()) {
                                    fallbackPlain = text; fallbackSource = "NetEase"
                                }
                            }
                        }
                    }
                }
            } catch (_: Exception) {}
        }

        if (fallbackPlain.isNotEmpty()) {
            return JSONObject().put("lyrics", fallbackPlain).put("synced", false).put("source", fallbackSource)
        }

        // 3. Lyrist
        val lyristUrl = if (cleanArtist.isNotEmpty()) {
            "https://lyrist.vercel.app/api/${urlEnc(cleanTitle)}/${urlEnc(cleanArtist)}"
        } else {
            "https://lyrist.vercel.app/api/${urlEnc(cleanTitle)}"
        }
        httpGet(lyristUrl, emptyMap(), 6000)?.let { raw ->
            try {
                val lyr = JSONObject(raw).optString("lyrics").trim()
                if (lyr.isNotEmpty() && lyr != "null") {
                    return JSONObject().put("lyrics", lyr).put("synced", false).put("source", "Lyrist")
                }
            } catch (_: Exception) {}
        }

        // 4. lyrics.ovh
        if (artist.isNotEmpty()) {
            val pairs = linkedSetOf(artist to title, cleanArtist to cleanTitle)
            for ((a, t) in pairs) {
                httpGet("https://api.lyrics.ovh/v1/${urlEnc(a)}/${urlEnc(t)}", emptyMap(), 6000)?.let { raw ->
                    try {
                        val lyr = JSONObject(raw).optString("lyrics").trim()
                        if (lyr.isNotEmpty() && lyr != "null") {
                            return JSONObject().put("lyrics", lyr).put("synced", false).put("source", "lyrics.ovh")
                        }
                    } catch (_: Exception) {}
                }
            }
        }
        return null
    }

    // ===================== FAST DEDUPLICATED GOOGLE TRANSLATE =====================
    private fun translateLines(inputLines: List<String>, source: String, target: String): List<String> {
        if (inputLines.isEmpty()) return emptyList()
        val uniqueList = ArrayList<String>()
        val uniqueMap = HashMap<String, Int>()
        for (line in inputLines) {
            val tr = line.trim()
            if (tr.isNotEmpty() && !uniqueMap.containsKey(tr)) {
                uniqueMap[tr] = uniqueList.size
                uniqueList.add(tr)
            }
        }
        val apiUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=$source&tl=$target&dt=t"
        val translatedUnique = ArrayList<String>()
        val batch = ArrayList<String>()
        var chars = 0
        for (u in uniqueList) {
            if (batch.isNotEmpty() && chars + u.length + 1 > 3400) {
                translatedUnique.addAll(translateBatch(apiUrl, batch))
                batch.clear(); chars = 0
            }
            batch.add(u); chars += u.length + 1
        }
        if (batch.isNotEmpty()) translatedUnique.addAll(translateBatch(apiUrl, batch))

        return inputLines.map { line ->
            val tr = line.trim()
            if (tr.isEmpty()) "" else {
                val idx = uniqueMap[tr] ?: -1
                if (idx in translatedUnique.indices) translatedUnique[idx] else line
            }
        }
    }

    private fun translateBatch(apiUrl: String, chunk: List<String>): List<String> {
        if (chunk.isEmpty()) return emptyList()
        val joined = chunk.joinToString("\n")
        val translated = translateRaw(apiUrl, joined)
        val split = translated.split(Regex("\\r?\\n"))
        if (split.size == chunk.size) return split
        if (chunk.size == 1) return listOf(translated.replace(Regex("\\r?\\n"), " ").trim())
        val mid = chunk.size / 2
        return translateBatch(apiUrl, chunk.subList(0, mid)) + translateBatch(apiUrl, chunk.subList(mid, chunk.size))
    }

    private fun translateRaw(apiUrl: String, text: String): String {
        val conn = URL(apiUrl).openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.connectTimeout = 8000
        conn.readTimeout = 10000
        conn.doOutput = true
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")
        conn.setRequestProperty("User-Agent", "Mozilla/5.0")
        val postBytes = ("q=" + URLEncoder.encode(text, "UTF-8")).toByteArray(StandardCharsets.UTF_8)
        conn.outputStream.use { it.write(postBytes) }
        val resp = conn.inputStream.bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
        conn.disconnect()
        val parsed = JSONArray(resp)
        val segs = parsed.optJSONArray(0) ?: return text
        val sb = StringBuilder()
        for (i in 0 until segs.length()) {
            val seg = segs.optJSONArray(i) ?: continue
            val part = seg.optString(0, "")
            if (part.isNotEmpty() && part != "null") sb.append(part)
        }
        return sb.toString()
    }

    // ===================== HTTP HELPERS & RANGE STREAMING =====================
    private fun httpGet(url: String, headers: Map<String, String> = emptyMap(), timeoutMs: Int = 6000): String? {
        return try {
            val conn = URL(url).openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = timeoutMs
            conn.readTimeout = timeoutMs
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Android) SongAppMobile/1.0")
            conn.setRequestProperty("Accept-Encoding", "gzip")
            for ((k, v) in headers) conn.setRequestProperty(k, v)
            val code = conn.responseCode
            if (code !in 200..299) { conn.disconnect(); return null }
            val stream = if ("gzip".equals(conn.contentEncoding, ignoreCase = true)) {
                GZIPInputStream(conn.inputStream)
            } else conn.inputStream
            val body = stream.bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
            conn.disconnect()
            body
        } catch (_: Exception) {
            null
        }
    }

    private fun urlEnc(s: String): String = URLEncoder.encode(s, "UTF-8").replace("+", "%20")

    private fun readJsonArray(file: File): JSONArray {
        val raw = if (file.exists()) file.readText(StandardCharsets.UTF_8).trim() else "[]"
        return if (raw.startsWith("[")) JSONArray(raw) else JSONArray()
    }

    private fun safeExtension(encodedName: String, defaultExt: String): String {
        if (encodedName.isBlank()) return defaultExt
        val dec = try { URLDecoder.decode(encodedName, "UTF-8") } catch (_: Exception) { encodedName }
        val dot = dec.lastIndexOf('.')
        if (dot >= 0) {
            val ext = dec.substring(dot).lowercase()
            if (Regex("^\\.[a-z0-9]{1,8}$").matches(ext)) return ext
        }
        return defaultExt
    }

    private fun mimeFor(name: String): String {
        return when (name.substringAfterLast('.', "").lowercase()) {
            "html" -> "text/html; charset=utf-8"
            "css" -> "text/css; charset=utf-8"
            "js" -> "application/javascript; charset=utf-8"
            "json" -> "application/json; charset=utf-8"
            "svg" -> "image/svg+xml"
            "mp3" -> "audio/mpeg"
            "m4a", "mp4", "m4b" -> "audio/mp4"
            "3gp" -> "audio/3gpp"
            "mkv" -> "video/x-matroska"
            "webm" -> "audio/webm"
            "ogg" -> "audio/ogg"
            "opus" -> "audio/opus"
            "wav" -> "audio/wav"
            "flac" -> "audio/flac"
            "aac" -> "audio/aac"
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "webp" -> "image/webp"
            "gif" -> "image/gif"
            else -> "application/octet-stream"
        }
    }

    private fun sendJson(out: OutputStream, code: Int, body: String) {
        val bytes = body.toByteArray(StandardCharsets.UTF_8)
        val header = "HTTP/1.1 $code ${statusText(code)}\r\n" +
            "Content-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: ${bytes.size}\r\n" +
            "Cache-Control: no-cache\r\n" +
            "Connection: close\r\n\r\n"
        out.write(header.toByteArray(StandardCharsets.US_ASCII))
        out.write(bytes)
        out.flush()
    }

    private fun sendError(out: OutputStream, code: Int, msg: String) {
        sendJson(out, code, JSONObject().put("error", msg).toString())
    }

    private fun parseRange(rangeHeader: String?, total: Long): Pair<Long, Long>? {
        if (rangeHeader.isNullOrBlank()) return null
        val m = Regex("bytes=(\\d*)-(\\d*)").find(rangeHeader) ?: return null
        val sStr = m.groupValues[1]
        val eStr = m.groupValues[2]
        val start: Long
        val end: Long
        if (sStr.isEmpty() && eStr.isNotEmpty()) {
            val suffix = eStr.toLongOrNull() ?: return null
            start = maxOf(0L, total - suffix)
            end = total - 1
        } else {
            start = sStr.toLongOrNull() ?: 0L
            end = if (eStr.isNotEmpty()) minOf(total - 1, eStr.toLongOrNull() ?: (total - 1)) else total - 1
        }
        return if (start > end || start >= total) null else (start to end)
    }

    private fun sendFileWithRange(out: OutputStream, req: HttpRequest, file: File, mime: String) {
        val total = file.length()
        val range = parseRange(req.headers["range"], total)
        val start = range?.first ?: 0L
        val end = range?.second ?: (total - 1)
        val len = maxOf(0L, end - start + 1)
        val code = if (range != null) 206 else 200
        val sb = StringBuilder()
        sb.append("HTTP/1.1 $code ${statusText(code)}\r\n")
        sb.append("Content-Type: $mime\r\n")
        sb.append("Accept-Ranges: bytes\r\n")
        sb.append("Content-Length: $len\r\n")
        if (range != null) sb.append("Content-Range: bytes $start-$end/$total\r\n")
        sb.append("Connection: close\r\n\r\n")
        out.write(sb.toString().toByteArray(StandardCharsets.US_ASCII))
        RandomAccessFile(file, "r").use { raf ->
            raf.seek(start)
            val buf = ByteArray(65536)
            var rem = len
            while (rem > 0) {
                val r = raf.read(buf, 0, minOf(buf.size.toLong(), rem).toInt())
                if (r <= 0) break
                out.write(buf, 0, r)
                rem -= r
            }
        }
        out.flush()
    }

    private fun sendAsset(out: OutputStream, req: HttpRequest, assetPath: String, mime: String) {
        // Prefer openFd for uncompressed assets (instant seeking + Range support for audio/images)
        try {
            appContext.assets.openFd(assetPath).use { afd ->
                val total = afd.length
                val range = parseRange(req.headers["range"], total)
                val start = range?.first ?: 0L
                val end = range?.second ?: (total - 1)
                val len = maxOf(0L, end - start + 1)
                val code = if (range != null) 206 else 200
                val sb = StringBuilder()
                sb.append("HTTP/1.1 $code ${statusText(code)}\r\n")
                sb.append("Content-Type: $mime\r\n")
                sb.append("Accept-Ranges: bytes\r\n")
                sb.append("Content-Length: $len\r\n")
                if (range != null) sb.append("Content-Range: bytes $start-$end/$total\r\n")
                sb.append("Connection: close\r\n\r\n")
                out.write(sb.toString().toByteArray(StandardCharsets.US_ASCII))
                afd.createInputStream().use { inp ->
                    skipFully(inp, start)
                    val buf = ByteArray(65536)
                    var rem = len
                    while (rem > 0) {
                        val r = inp.read(buf, 0, minOf(buf.size.toLong(), rem).toInt())
                        if (r <= 0) break
                        out.write(buf, 0, r)
                        rem -= r
                    }
                }
                out.flush()
                return
            }
        } catch (_: Exception) {
        }

        // Fallback for compressed assets (.html, .css, .js, .svg)
        try {
            val bytes = appContext.assets.open(assetPath).use { it.readBytes() }
            val header = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: $mime\r\n" +
                "Content-Length: ${bytes.size}\r\n" +
                "Cache-Control: no-cache\r\n" +
                "Connection: close\r\n\r\n"
            out.write(header.toByteArray(StandardCharsets.US_ASCII))
            out.write(bytes)
            out.flush()
        } catch (_: Exception) {
            sendError(out, 404, "Soubor nenalezen")
        }
    }

    private fun skipFully(inp: InputStream, bytesToSkip: Long) {
        var remaining = bytesToSkip
        while (remaining > 0) {
            val skipped = inp.skip(remaining)
            if (skipped <= 0) {
                if (inp.read() == -1) break
                remaining--
            } else {
                remaining -= skipped
            }
        }
    }

    private fun statusText(code: Int): String = when (code) {
        200 -> "OK"
        201 -> "Created"
        206 -> "Partial Content"
        400 -> "Bad Request"
        404 -> "Not Found"
        500 -> "Internal Server Error"
        else -> "OK"
    }
}
