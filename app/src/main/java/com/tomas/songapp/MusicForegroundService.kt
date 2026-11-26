package com.tomas.songapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle
import java.io.File

class MusicForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "song_app_playback"
        const val NOTIF_ID = 1001
        const val ACTION_UPDATE = "com.tomas.songapp.UPDATE_PLAYBACK"
        const val ACTION_STOP = "com.tomas.songapp.STOP_PLAYBACK"
        const val ACTION_PREV = "com.tomas.songapp.MEDIA_PREV"
        const val ACTION_TOGGLE = "com.tomas.songapp.MEDIA_TOGGLE"
        const val ACTION_NEXT = "com.tomas.songapp.MEDIA_NEXT"
        const val EXTRA_TITLE = "title"
        const val EXTRA_ARTIST = "artist"
        const val EXTRA_ALBUM = "album"
        const val EXTRA_COVER = "cover"
        const val EXTRA_PLAYING = "playing"
        const val EXTRA_POSITION = "position"
        const val EXTRA_DURATION = "duration"
        const val EXTRA_SPEED = "speed"

        @Volatile
        var onMediaAction: ((String) -> Unit)? = null

        @Volatile
        var onMediaSeek: ((Long) -> Unit)? = null
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private lateinit var mediaSession: MediaSessionCompat

    private var lastTitle = "Song App"
    private var lastArtist = "Neznámý interpret"
    private var lastAlbum = "Song App"
    private var lastCoverPath = ""
    private var cachedCoverPath = ""
    private var cachedCoverBitmap: Bitmap? = null
    private var lastDurationMs = 0L

    override fun onCreate() {
        super.onCreate()
        createChannel()
        mediaSession = MediaSessionCompat(this, "SongAppMediaSession").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() { onMediaAction?.invoke("play") }
                override fun onPause() { onMediaAction?.invoke("pause") }
                override fun onSkipToNext() { onMediaAction?.invoke("next") }
                override fun onSkipToPrevious() { onMediaAction?.invoke("prev") }
                override fun onSeekTo(pos: Long) { onMediaSeek?.invoke(pos) }
            })
            isActive = true
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PREV -> {
                onMediaAction?.invoke("prev")
                return START_STICKY
            }
            ACTION_TOGGLE -> {
                onMediaAction?.invoke("toggle")
                return START_STICKY
            }
            ACTION_NEXT -> {
                onMediaAction?.invoke("next")
                return START_STICKY
            }
            ACTION_STOP -> {
                releaseWakeLock()
                mediaSession.isActive = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
                return START_NOT_STICKY
            }
        }

        val title = intent?.getStringExtra(EXTRA_TITLE)?.ifBlank { lastTitle } ?: lastTitle
        val artist = intent?.getStringExtra(EXTRA_ARTIST)?.ifBlank { lastArtist } ?: lastArtist
        val album = intent?.getStringExtra(EXTRA_ALBUM)?.ifBlank { "Song App" } ?: "Song App"
        val coverPath = intent?.getStringExtra(EXTRA_COVER) ?: lastCoverPath
        val playing = intent?.getBooleanExtra(EXTRA_PLAYING, true) ?: true
        val positionMs = intent?.getLongExtra(EXTRA_POSITION, 0L)?.coerceAtLeast(0L) ?: 0L
        val durationMs = intent?.getLongExtra(EXTRA_DURATION, lastDurationMs)?.coerceAtLeast(0L) ?: lastDurationMs
        val speed = intent?.getFloatExtra(EXTRA_SPEED, 1.0f)?.coerceIn(0.25f, 3.0f) ?: 1.0f

        lastTitle = title
        lastArtist = artist
        lastAlbum = album
        lastCoverPath = coverPath
        if (durationMs > 0L) lastDurationMs = durationMs

        if (playing) acquireWakeLock() else releaseWakeLock()

        val coverBmp = loadCoverBitmap(coverPath)
        updateMediaSessionState(title, artist, album, coverBmp, playing, positionMs, lastDurationMs, speed)

        val notification = buildNotification(title, artist, coverBmp, playing)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(NOTIF_ID, notification)
        }
        return START_STICKY
    }

    override fun onDestroy() {
        releaseWakeLock()
        try {
            mediaSession.isActive = false
            mediaSession.release()
        } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun loadCoverBitmap(coverUrlPath: String): Bitmap? {
        if (coverUrlPath.isBlank()) {
            cachedCoverPath = ""
            cachedCoverBitmap = null
            return null
        }
        if (coverUrlPath == cachedCoverPath && cachedCoverBitmap != null) {
            return cachedCoverBitmap
        }
        val cleanRel = coverUrlPath.substringBefore('?').removePrefix("/")
        val file = File(filesDir, cleanRel)
        if (!file.exists() || !file.isFile) {
            cachedCoverPath = coverUrlPath
            cachedCoverBitmap = null
            return null
        }
        return try {
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeFile(file.absolutePath, bounds)
            var sample = 1
            val maxDim = maxOf(bounds.outWidth, bounds.outHeight)
            while (maxDim / sample > 512) sample *= 2
            val opts = BitmapFactory.Options().apply { inSampleSize = sample }
            val bmp = BitmapFactory.decodeFile(file.absolutePath, opts)
            cachedCoverPath = coverUrlPath
            cachedCoverBitmap = bmp
            bmp
        } catch (_: Exception) {
            null
        }
    }

    private fun updateMediaSessionState(
        title: String,
        artist: String,
        album: String,
        cover: Bitmap?,
        playing: Boolean,
        positionMs: Long,
        durationMs: Long,
        speed: Float
    ) {
        if (!mediaSession.isActive) mediaSession.isActive = true

        val metaBuilder = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, durationMs)
        if (cover != null) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, cover)
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_DISPLAY_ICON, cover)
        }
        mediaSession.setMetadata(metaBuilder.build())

        val actions = PlaybackStateCompat.ACTION_PLAY or
            PlaybackStateCompat.ACTION_PAUSE or
            PlaybackStateCompat.ACTION_PLAY_PAUSE or
            PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
            PlaybackStateCompat.ACTION_SEEK_TO

        val stateCode = if (playing) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
        val stateObj = PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(stateCode, positionMs, if (playing) speed else 0f)
            .build()
        mediaSession.setPlaybackState(stateObj)
    }

    private fun acquireWakeLock() {
        try {
            if (wakeLock == null) {
                val pm = getSystemService(POWER_SERVICE) as? PowerManager
                wakeLock = pm?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SongApp::PlaybackWakeLock")?.apply {
                    setReferenceCounted(false)
                }
            }
            if (wakeLock?.isHeld == false) wakeLock?.acquire(4 * 60 * 60 * 1000L)
        } catch (_: Exception) {}
    }

    private fun releaseWakeLock() {
        try {
            if (wakeLock?.isHeld == true) wakeLock?.release()
        } catch (_: Exception) {}
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Přehrávání hudby",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Ovládání přehrávání hudby na zamykací obrazovce a v oznamovací liště"
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm?.createNotificationChannel(channel)
        }
    }

    private fun actionPendingIntent(action: String, reqCode: Int): PendingIntent {
        val intent = Intent(this, MusicForegroundService::class.java).apply { this.action = action }
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        return PendingIntent.getService(this, reqCode, intent, flags)
    }

    private fun buildNotification(title: String, artist: String, cover: Bitmap?, playing: Boolean): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val piFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val contentPendingIntent = PendingIntent.getActivity(this, 0, openIntent, piFlags)

        val style = MediaStyle()
            .setMediaSession(mediaSession.sessionToken)
            .setShowActionsInCompactView(0, 1, 2)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setLargeIcon(cover)
            .setContentTitle(title)
            .setContentText(artist)
            .setOngoing(playing)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setStyle(style)
            .setContentIntent(contentPendingIntent)
            .addAction(R.drawable.ic_prev, "Předchozí", actionPendingIntent(ACTION_PREV, 1))
            .addAction(
                if (playing) R.drawable.ic_pause else R.drawable.ic_play,
                if (playing) "Pauza" else "Hrát",
                actionPendingIntent(ACTION_TOGGLE, 2)
            )
            .addAction(R.drawable.ic_next, "Další", actionPendingIntent(ACTION_NEXT, 3))
            .build()
    }
}
