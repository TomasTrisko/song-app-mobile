# Song App Mobile (Nativní Android `.apk` aplikace)

Čistá, samostatná nativní Android aplikace (`com.tomas.songapp`) s mobilním UI ze `song-database` a **vestavěným stahováním přímo z YouTube a YouTube Music** uvnitř telefonu (pomocí nativního `yt-dlp` pro Android).

Po nainstalování `.apk` **nepotřebuješ PC ani externí server** — všechny stažené písničky, covery, lyrics a playlisty zůstávají uložené lokálně v paměti telefonu a hrají i 100 % offline (včetně pozadí a zamčeného displeje).

---

## Jak získat hotové `SongApp-Mobile.apk` zdarma (bez instalace na PC)

Celý projekt má jen **23 malých souborů (< 300 KB)**, takže ho na GitHub nahraješ jedním přetažením:

1. Na [GitHub.com](https://github.com/new) vytvoř nový repozitář (např. `song-app-mobile`).
2. Přetáhni celý obsah složky `song-app-mobile` do repozitáře (včetně `.github`, `app`, `build.gradle.kts`, `settings.gradle.kts`, `gradle.properties`).
3. Otevři záložku **Actions** → za cca 2–3 minuty zezelená **Build Android APK** ✅.
4. Vpravo v sekci **Releases** klikni na **`Song App v1.0.1`** a stáhni **`SongApp-Mobile.apk`** přímo do mobilu.

## Stahování z YouTube / YouTube Music v mobilu
- V aplikaci klepni na **+ Přidat**, vlož odkaz z **YouTube** nebo **YouTube Music** a klepni na **Načíst**.
- Aplikace si sama stáhne audio v nejlepší kvalitě, cover art, název, interpreta, album a automaticky vyhledá synchronizované lyrics (**LRCLIB**, **NetEase LRC**, **Lyrist**, **lyrics.ovh**).

## Automatické aktualizace přímo v aplikaci
- Všechny verze jsou podepsané stejným klíčem (`app/songapp-signing.jks`), takže aktualizace zachová všechny stažené písničky, playlisty i nastavení.
- V aplikaci stačí otevřít **Nastavení → 🔄 Zkontrolovat aktualizace** (u privátního repozitáře zadej jednou svůj GitHub Token v *Nastavení GitHub zdroje aktualizací*).
