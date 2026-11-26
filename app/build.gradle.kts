plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val appVersionCode = (project.findProperty("versionCode") as String?)?.toIntOrNull() ?: 1
val appVersionName = (project.findProperty("versionName") as String?)?.ifBlank { "1.0.$appVersionCode" } ?: "1.0.$appVersionCode"
val githubRepo = ((project.findProperty("githubRepo") as String?) ?: "").replace("\"", "")

android {
    namespace = "com.tomas.songapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.tomas.songapp"
        minSdk = 24
        targetSdk = 34
        versionCode = appVersionCode
        versionName = appVersionName
        buildConfigField("String", "GITHUB_REPO", "\"$githubRepo\"")
        ndk {
            abiFilters += listOf("arm64-v8a", "armeabi-v7a")
        }
    }

    packaging {
        jniLibs {
            useLegacyPackaging = true
        }
    }

    signingConfigs {
        create("songapp") {
            storeFile = file("songapp-signing.jks")
            storePassword = "songapp123"
            keyAlias = "songapp"
            keyPassword = "songapp123"
        }
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("songapp")
        }
        debug {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("songapp")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    androidResources {
        noCompress += listOf(
            "mp3", "m4a", "webm", "opus", "ogg", "wav", "flac", "aac",
            "jpg", "jpeg", "png", "webp", "gif"
        )
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.1")
    implementation("androidx.media:media:1.7.0")
    implementation("io.github.junkfood02.youtubedl-android:library:0.18.1")
    implementation("io.github.junkfood02.youtubedl-android:ffmpeg:0.18.1")
}
