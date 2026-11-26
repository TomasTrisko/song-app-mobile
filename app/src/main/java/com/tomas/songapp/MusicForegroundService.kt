package com.tomas.songapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

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
        const val EXTRA_PLAYING = "playing"

        @Volatile
        var onMediaAction: ((String) -> Unit)? = null
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private var lastTitle = "Song App"
    private var lastArtist = "Přehrává se"

    override fun onCreate() {
        super.onCreate()
        createChannel()
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
        val playing = intent?.getBooleanExtra(EXTRA_PLAYING, true) ?: true
        lastTitle = title
        lastArtist = artist

        if (playing) acquireWakeLock() else releaseWakeLock()

        val notification = buildNotification(title, artist, playing)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(NOTIF_ID, notification)
        }
        return START_STICKY
    }

    override fun onDestroy() {
        releaseWakeLock()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun acquireWakeLock() {
        try {
            if (wakeLock == null) {
                val pm = getSystemService(POWER_SERVICE) as? PowerManager
                wakeLock = pm?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SongApp::PlaybackWakeLock")?.apply {
                    setReferenceCounted(false)
                }
            }
            if (wakeLock?.isHeld == false) {
                wakeLock?.acquire(4 * 60 * 60 * 1000L) // up to 4 hours per play session
            }
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
                description = "Udržuje přehrávání písniček na pozadí i při zamčeném displeji"
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

    private fun buildNotification(title: String, artist: String, playing: Boolean): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val piFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val contentPendingIntent = PendingIntent.getActivity(this, 0, openIntent, piFlags)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(if (playing) artist else "$artist (Pozastaveno)")
            .setOngoing(playing)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setContentIntent(contentPendingIntent)
            .addAction(0, "⏮ Předchozí", actionPendingIntent(ACTION_PREV, 1))
            .addAction(0, if (playing) "⏸ Pauza" else "▶ Hrát", actionPendingIntent(ACTION_TOGGLE, 2))
            .addAction(0, "⏭ Další", actionPendingIntent(ACTION_NEXT, 3))
            .build()
    }
}
