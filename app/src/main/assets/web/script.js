const OFFLINE_CACHE = "song-app-offline-v1";
const DEFAULT_SETTINGS = {
  lightweightMode: false,
  themeMode: "color-dynamic-dark",
  dynamicColor: true,
  visualizerMode: "background",
  autoScrollLyrics: true,
  mediaSession: true,
  defaultVolume: 40,
  rememberVolume: false,
  rememberAudioFx: true,
  rememberPlaybackModes: true,
  defaultTranslationMode: "both",
  lastVolume: 40,
  lastPitch: 0,
  lastReverb: 0,
  lastShuffle: false,
  lastRepeat: "off",
  rememberPlaybackState: true,
  lyricsFontSize: "md",
  skipSeconds: 5,
  checkDuplicates: true,
  confirmDelete: true,
  sortBy: "newest",
  viewMode: "grid",
  lastSongId: null,
  lastSongTime: 0,
  githubRepo: "",
  githubToken: "",
};

const GRADIENTS = [
  "linear-gradient(135deg, #4c1d95, #1e1b4b)",
  "linear-gradient(135deg, #1e3a8a, #172554)",
  "linear-gradient(135deg, #701a75, #3b0764)",
  "linear-gradient(135deg, #0f766e, #134e4a)",
  "linear-gradient(135deg, #9f1239, #4c0519)",
  "linear-gradient(135deg, #3730a3, #0f172a)",
  "linear-gradient(135deg, #1d4ed8, #312e81)",
  "linear-gradient(135deg, #6d28d9, #0f172a)",
];

const SELECT_OPTIONS = {
  sortBy: [
    { value: "newest", label: "Nejnovější", sub: "Podle data přidání do knihovny" },
    { value: "title", label: "Název A–Z", sub: "Abecedně podle názvu skladby" },
    { value: "artist", label: "Interpret A–Z", sub: "Abecedně podle interpreta" },
    { value: "lyrics", label: "S lyrics první", sub: "Skladby s textem nahoře" },
  ],
  translateLang: [
    { value: "cs", label: "Čeština" },
    { value: "sk", label: "Slovenština" },
    { value: "en", label: "Angličtina" },
    { value: "de", label: "Němčina" },
    { value: "es", label: "Španělština" },
    { value: "fr", label: "Francouzština" },
    { value: "it", label: "Italština" },
    { value: "pl", label: "Polština" },
    { value: "ja", label: "Japonština" },
    { value: "ko", label: "Korejština" },
    { value: "custom", label: "Jiný jazyk", sub: "Zadej vlastní ISO kód (např. nl, pt, sv)" },
  ],
  themeMode: [
    { value: "color-dynamic-dark", label: "Color-Dynamic", sub: "Dynamické barvy a gradienty podle obalu alba" },
    { value: "dark", label: "Dark", sub: "Výchozí tmavý fialový vzhled" },
  ],
  visualizerMode: [
    { value: "off", label: "Vypnuto", sub: "Šetří baterii a GPU" },
    { value: "background", label: "Pozadí", sub: "Jemný vizualizér na pozadí knihovny" },
    { value: "player", label: "Přehrávač", sub: "Vizualizér v obrazovce přehrávání" },
    { value: "both", label: "Obojí", sub: "Pozadí i přehrávač" },
  ],
  lyricsFontSize: [
    { value: "sm", label: "Malé" },
    { value: "md", label: "Střední" },
    { value: "lg", label: "Velké" },
  ],
  skipSeconds: [
    { value: "5", label: "5 s" },
    { value: "10", label: "10 s" },
    { value: "15", label: "15 s" },
    { value: "30", label: "30 s" },
  ],
  defaultTranslationMode: [
    { value: "both", label: "Obojí", sub: "Originální text i překlad pod sebou" },
    { value: "only", label: "Jen překlad", sub: "Zobrazí pouze přeložené řádky" },
    { value: "original", label: "Originál", sub: "Ponechá originál s rychlým přepnutím" },
  ],
};

const PATCH_NOTES = [
  {
    version: "v1.2.0",
    date: "Aktuální verze",
    items: [
      "<strong>Výkon a baterie na pozadí:</strong> Vizuální efekty a vizualizér se automaticky pozastaví při přechodu na pozadí nebo zhasnutí obrazovky (automatický Lightweight režim).",
      "<strong>Reverb v Lightweight režimu:</strong> Zvukový efekt Reverb zůstává plně funkční i při zapnutém Lightweight režimu.",
      "<strong>Bez ztlumování při notifikacích:</strong> Přehrávač vypíná audio ducking, takže příchozí systémové notifikace už neztlumují hudbu.",
      "<strong>Keep Screen On u Lyrics:</strong> Při otevřeném fullscreen zobrazení textů zůstává displej aktivní a nezhasíná.",
      "<strong>Spolehlivé ukládání nastavení:</strong> Opraveno resetování nastavení po restartu aplikace; všechna nastavení se nyní zálohují i do nativních Android SharedPreferences a přežijí instalaci aktualizace.",
      "<strong>Gesta a plynulé přechody:</strong> V přehrávači lze potáhnutím dolů minimalizovat přehrávač a tažením zprava doleva přepnout na Lyrics (a dále na FX). Přidána spouštěcí animace a plynulé slide panely bez vyskakovacích dialogů.",
      "<strong>Rozložení pro POCO F9 Ultra a nový design:</strong> Opraveno přetékání prvků a ošetřeny systémové okraje (výřez displeje / gesta), výchozí zobrazení knihovny je nyní mřížka (kostky), vyhledávání přesunuto vpravo nahoru vedle ikony menu, posuvník skladby má plynulý gradient s tečkou a všechna emoji byla nahrazena čistými vektorovými ikonami.",
      "<strong>Vlastní in-app menu:</strong> Systémová Android rozbalovací menu nahrazena plynulými custom panely sladěnými s Dynamic Colors.",
      "<strong>Stahování celých playlistů:</strong> Možnost vložit odkaz na playlist z YouTube nebo YouTube Music a stáhnout všechny skladby jako MP3 se čtvercovým coverem a texty.",
      "<strong>Patch Notes:</strong> Přehled novinek a oprav přímo v sekci Nastavení.",
    ],
  },
  {
    version: "v1.1.0",
    date: "Předchozí verze",
    items: [
      "<strong>Color-Dynamic-Dark:</strong> Celé rozhraní se dynamicky zabarvuje podle dominantních barev obalu přehrávané skladby.",
      "<strong>HyperOS 3 Media karta:</strong> Podpora živého posuvníku času a obalu skladby v systémovém panelu i na zamykací obrazovce.",
      "<strong>Čtvercové covery a MP3:</strong> Automatický ořez stahovaných obalů do formátu 1:1 a konverze staženého audia do MP3.",
    ],
  },
];

const ICONS = {
  music: (sz = 24) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
  play: (sz = 16) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`,
  pause: (sz = 16) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
  more: (sz = 18) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>`,
  chevUp: (sz = 13) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
  chevDown: (sz = 13) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  close: (sz = 14) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  check: (sz = 16) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  clock: (sz = 13) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  next: (sz = 18) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.4"></line></svg>`,
  plus: (sz = 18) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  search: (sz = 18) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  edit: (sz = 18) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
  trash: (sz = 18) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>`,
  refresh: (sz = 15) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
  image: (sz = 20) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
};

function loadRawLocalSettings() {
  try {
    const raw = localStorage.getItem("songapp_mobile_settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  return {};
}

const state = {
  songs: [],
  playlists: [],
  activeTab: "Library",
  activePlaylistId: null,
  playQueuePlaylistId: null,
  editingPlaylistId: null,
  addToPlaylistSongId: null,
  search: "",
  searchFilter: "all",
  searchOpen: false,
  selectedId: null,
  playingId: null,
  editingId: null,
  pendingAudioFile: null,
  pendingCoverFile: null,
  removeCoverFlag: false,
  stagingToken: null,
  serverAvailable: false,
  parsedLyrics: null,
  renderedLyricsKey: "",
  activeLyricIdx: -1,
  syncMode: false,
  syncLines: [],
  syncCursor: -1,
  pitchSemitones: 0,
  reverbPercent: 0,
  shuffle: false,
  repeatMode: "off",
  loopA: null,
  loopB: null,
  settings: { ...DEFAULT_SETTINGS, ...loadRawLocalSettings() },
  selectedTranslateLang: "cs",
  translationCache: {},
  activeTranslationLang: null,
  translationMode: "both",
  translating: false,
  npOpen: false,
  npTab: "player",
  fsLyricsOpen: false,
  isBackground: false,
  upNextQueue: [],
  shuffleHistory: [],
};

const $ = (id) => document.getElementById(id);
const on = (id, ev, fn) => {
  const el = $(id);
  if (el) el.addEventListener(ev, fn);
};
const onEnter = (id, fn) => on(id, "keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); fn(); } });
const audioEl = $("audioPlayer");

let toastTimer = null;
function showToast(msg, isError = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show" + (isError ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2700);
}

function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function gradientFor(id) {
  let h = 0;
  const s = String(id || "x");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatLrcTime(sec) {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  const cs = Math.floor((s - Math.floor(s)) * 100);
  return `[${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}.${String(cs).padStart(2, "0")}]`;
}

function renderCoverHtml(song, iconSize = 26) {
  if (state.settings.lightweightMode) return "";
  if (song && song.coverFile) {
    return `<img src="${escapeHtml(song.coverFile)}?v=${encodeURIComponent(song._ts || "")}" alt="" loading="lazy" />`;
  }
  return `<div style="width:100%;height:100%;background:${gradientFor(song?.id)};display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.78);">${ICONS.music(iconSize)}</div>`;
}

function getSongById(id) {
  return state.songs.find((s) => s.id === id) || null;
}

function getPlaylistSongs(plId) {
  const pl = state.playlists.find((p) => p.id === plId);
  if (!pl || !Array.isArray(pl.songIds)) return [];
  const map = new Map(state.songs.map((s) => [s.id, s]));
  return pl.songIds.map((id) => map.get(id)).filter(Boolean);
}

function sortSongsList(list) {
  const sortBy = state.settings.sortBy || "newest";
  const copy = [...list];
  if (sortBy === "title") copy.sort((a, b) => (a.title || "").localeCompare(b.title || "", "cs"));
  else if (sortBy === "artist") copy.sort((a, b) => (a.artist || "").localeCompare(b.artist || "", "cs"));
  else if (sortBy === "lyrics") copy.sort((a, b) => (b.lyrics?.trim() ? 1 : 0) - (a.lyrics?.trim() ? 1 : 0));
  return copy;
}

function optionLabel(group, val) {
  const list = SELECT_OPTIONS[group] || [];
  const found = list.find((o) => String(o.value) === String(val));
  return found ? found.label : String(val);
}

// ===================== LAUNCH SPLASH ANIMATION =====================
let splashDismissed = false;
function dismissLaunchSplash() {
  if (splashDismissed) return;
  splashDismissed = true;
  const el = $("launchSplash");
  if (!el) return;
  if (state.settings.lightweightMode) {
    el.style.display = "none";
    return;
  }
  el.classList.add("hide");
  setTimeout(() => { el.style.display = "none"; }, 480);
}
setTimeout(dismissLaunchSplash, 1100);

// ===================== NATIVE ANDROID BRIDGE & BACKGROUND OPTIMIZATION =====================
const IS_NATIVE_ANDROID = Boolean(window.AndroidApp && typeof window.AndroidApp.isNative === "function" && window.AndroidApp.isNative());

function setAndroidKeepScreenOn(keepOn) {
  if (IS_NATIVE_ANDROID && typeof window.AndroidApp.setKeepScreenOn === "function") {
    try { window.AndroidApp.setKeepScreenOn(Boolean(keepOn)); } catch {}
  }
}

function notifyAndroidPlayback(playing) {
  if (!IS_NATIVE_ANDROID) return;
  const song = getSongById(state.playingId);
  if (!song) {
    try { window.AndroidApp.stopPlaybackNotification(); } catch {}
    return;
  }
  const posMs = isFinite(audioEl.currentTime) ? Math.max(0, Math.floor(audioEl.currentTime * 1000)) : 0;
  const durMs = isFinite(audioEl.duration) && audioEl.duration > 0 ? Math.floor(audioEl.duration * 1000) : 0;
  const speed = isFinite(audioEl.playbackRate) && audioEl.playbackRate > 0 ? audioEl.playbackRate : 1.0;
  const cover = (!state.settings.lightweightMode && song.coverFile) ? song.coverFile : "";
  try {
    if (typeof window.AndroidApp.updatePlaybackMedia === "function") {
      window.AndroidApp.updatePlaybackMedia(
        song.title || "Song App",
        song.artist || "Neznámý interpret",
        song.album || "Song App",
        cover,
        Boolean(playing),
        posMs,
        durMs,
        speed
      );
    } else if (typeof window.AndroidApp.updatePlaybackNotification === "function") {
      window.AndroidApp.updatePlaybackNotification(song.title || "Song App", song.artist || "Neznámý interpret", Boolean(playing));
    }
  } catch {}
}

window.handleAndroidBackgroundState = function (isBg) {
  const bg = Boolean(isBg);
  state.isBackground = bg;
  document.body.classList.toggle("auto-lightweight", bg);
  if (bg) {
    persistPlaybackPosition(true);
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    clearVisualizers();
    ["bgVisualizerCanvas", "npVisualizerCanvas", "fsVisualizerCanvas"].forEach(releaseCanvas);
  } else {
    updateSeekbarUI();
    updateActiveLyric(false);
    if (!audioEl.paused && !state.settings.lightweightMode) {
      startAnimationLoop();
    }
  }
};

window.handleAndroidMediaAction = function (act) {
  if (act === "play") {
    if (!state.playingId) return;
    ensureAudioGraph();
    audioEl.play().catch(() => {});
  } else if (act === "pause") {
    audioEl.pause();
  } else if (act === "toggle") {
    if (!state.playingId) return;
    ensureAudioGraph();
    if (audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
  } else if (act === "next") {
    playAdjacent(1);
  } else if (act === "prev") {
    playAdjacent(-1);
  }
};

window.handleAndroidMediaSeek = function (posMs) {
  if (!state.playingId || !isFinite(audioEl.duration) || audioEl.duration <= 0) return;
  const sec = Math.max(0, Math.min(audioEl.duration, Number(posMs) / 1000));
  audioEl.currentTime = sec;
  updateSeekbarUI();
  updateActiveLyric(true);
  notifyAndroidPlayback(!audioEl.paused);
};

window.handleAndroidBack = function () {
  const sheets = [
    "customSelectSheet",
    "duplicateModal",
    "deleteModal",
    "patchNotesSheet",
    "playlistImportSheet",
    "addToPlaylistModal",
    "playlistModal",
    "songModal",
    "actionSheet",
    "mainMenuSheet",
  ];
  for (const id of sheets) {
    const el = $(id);
    if (el && el.classList.contains("open")) {
      if (id === "songModal") closeSongModal();
      else el.classList.remove("open");
      return true;
    }
  }
  if (state.fsLyricsOpen) { closeFsLyrics(); return true; }
  if (state.npOpen) { closeNowPlaying(); return true; }
  if (state.searchOpen) { closeSearchDrawer(); return true; }
  if (state.activeTab === "Playlists" && state.activePlaylistId) { closePlaylistDetail(); return true; }
  if (state.activeTab !== "Library") { switchTab("Library"); return true; }
  return false;
};

// ===================== APP INFO, UPDATER & PATCH NOTES =====================
async function loadNetworkInfo() {
  try {
    const res = await fetch("/api/app-info");
    if (!res.ok) return;
    const info = await res.json();
    if (info.versionName) $("appVersionBadge").textContent = `v${info.versionName}`;
    if (info.githubRepo && !state.settings.githubRepo) {
      state.settings.githubRepo = info.githubRepo;
      $("setGithubRepo").value = info.githubRepo;
    }
  } catch {}
}

function setCheckUpdateBtnState(loading) {
  const btn = $("checkUpdateBtn");
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span>Kontroluji...</span>`
    : `${ICONS.refresh(15)}<span>Zkontrolovat aktualizace</span>`;
}

let updatePollTimer = null;
function setUpdateUi(text, progress = null, showInstall = false) {
  $("updateStatusBox").style.display = "flex";
  $("updateStatusText").textContent = text;
  $("updateProgressTrack").style.display = progress !== null ? "block" : "none";
  if (progress !== null) $("updateProgressFill").style.width = `${progress}%`;
  $("installUpdateBtn").style.display = showInstall ? "inline-flex" : "none";
}

function triggerApkInstall() {
  if (IS_NATIVE_ANDROID && typeof window.AndroidApp.installDownloadedUpdate === "function") {
    window.AndroidApp.installDownloadedUpdate();
  } else {
    showToast("Instalace APK funguje přímo na Android mobilu.", true);
  }
}

function startUpdatePolling(latestVersion) {
  clearInterval(updatePollTimer);
  updatePollTimer = setInterval(async () => {
    try {
      const r = await fetch("/api/update-status");
      if (!r.ok) return;
      const st = await r.json();
      if (st.state === "downloading") {
        const mbTxt = st.totalMb > 0 ? ` (${st.downloadedMb} / ${st.totalMb} MB)` : st.downloadedMb > 0 ? ` (${st.downloadedMb} MB)` : "";
        setUpdateUi(`Stahuji aktualizaci v${latestVersion}... ${st.progress}%${mbTxt}`, st.progress, false);
      } else if (st.state === "ready") {
        clearInterval(updatePollTimer);
        setUpdateUi(`Aktualizace v${latestVersion} stažena. Spouštím instalaci...`, 100, true);
        setCheckUpdateBtnState(false);
        triggerApkInstall();
      } else if (st.state === "error") {
        clearInterval(updatePollTimer);
        setUpdateUi(`Chyba stahování: ${st.error || "neznámá chyba"}`, null, false);
        setCheckUpdateBtnState(false);
      }
    } catch {}
  }, 500);
}

async function checkForUpdates() {
  const repo = ($("setGithubRepo").value || state.settings.githubRepo || "").trim();
  const token = ($("setGithubToken").value || state.settings.githubToken || "").trim();
  if (!repo) {
    setUpdateUi("Nejprve vyplň GitHub repozitář (uzivatel/nazev) níže v Nastavení GitHub zdroje.", null, false);
    document.querySelector(".update-config-details")?.setAttribute("open", "open");
    return;
  }
  setCheckUpdateBtnState(true);
  setUpdateUi("Kontroluji novou verzi na GitHubu...", null, false);
  try {
    const res = await fetch("/api/check-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo, token }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Kontrola aktualizací se nezdařila.");

    if (!data.hasUpdate) {
      setUpdateUi(`Máš nejnovější verzi (v${data.currentVersion}).`, null, false);
      setCheckUpdateBtnState(false);
      showToast("Aplikace je aktuální");
      return;
    }

    const sizeTxt = data.apkSizeMb > 0 ? ` (${data.apkSizeMb} MB)` : "";
    setUpdateUi(`Nalezena nová verze v${data.latestVersion}${sizeTxt}. Zahajuji stahování...`, 0, false);
    showToast(`Stahuji aktualizaci v${data.latestVersion}...`);

    const dlRes = await fetch("/api/download-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apkUrl: data.apkUrl, token, useApiAsset: Boolean(data.useApiAsset) }),
    });
    if (!dlRes.ok) throw new Error("Nepodařilo se spustit stahování aktualizace.");
    startUpdatePolling(data.latestVersion);
  } catch (err) {
    setUpdateUi(`Chyba: ${err.message || "Nepodařilo se zkontrolovat aktualizace."}`, null, false);
    setCheckUpdateBtnState(false);
  }
}

function openPatchNotes() {
  $("patchNotesBody").innerHTML = PATCH_NOTES.map((entry) => `
    <div class="patch-card">
      <div class="patch-head">
        <span class="patch-ver">${escapeHtml(entry.version)}</span>
        <span class="patch-date">${escapeHtml(entry.date)}</span>
      </div>
      <ul class="patch-list">
        ${entry.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `).join("");
  $("patchNotesSheet").classList.add("open");
}

// ===================== CUSTOM IN-APP SELECT & CONFIRM SHEETS =====================
let customSelectCallback = null;
function openCustomSelect(title, options, currentVal, onSelect) {
  $("customSelectTitle").textContent = title;
  customSelectCallback = onSelect;
  $("customSelectList").innerHTML = options.map((opt) => {
    const selected = String(opt.value) === String(currentVal);
    return `
      <button type="button" class="action-item${selected ? " selected" : ""}" data-select-val="${escapeHtml(opt.value)}">
        <div style="min-width:0;flex:1;">
          <div>${escapeHtml(opt.label)}</div>
          ${opt.sub ? `<div class="action-item-sub">${escapeHtml(opt.sub)}</div>` : ""}
        </div>
        ${selected ? `<span class="action-check">${ICONS.check(17)}</span>` : ""}
      </button>`;
  }).join("");
  $("customSelectSheet").classList.add("open");
}

function closeCustomSelect() {
  $("customSelectSheet").classList.remove("open");
  customSelectCallback = null;
}

let pendingConfirmAction = null;
function openConfirmSheet({ title, descHtml, confirmLabel = "Smazat", onConfirm }) {
  $("deleteModalTitle").textContent = title;
  $("deleteModalDesc").innerHTML = descHtml;
  $("confirmDeleteBtn").textContent = confirmLabel;
  pendingConfirmAction = onConfirm;
  $("deleteModal").classList.add("open");
}

function closeConfirmSheet() {
  $("deleteModal").classList.remove("open");
  pendingConfirmAction = null;
}

// ===================== NAVIGATION, SEARCH DRAWER & MENU =====================
function switchTab(tabName) {
  state.activeTab = tabName;
  ["Library", "Playlists", "Settings"].forEach((t) => {
    const el = $(`view${t}`);
    if (el) el.classList.toggle("active", t === tabName);
  });
  $("bottomNav").querySelectorAll(".nav-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tabName);
  });
  if (tabName === "Settings") {
    loadNetworkInfo();
    $("offlineCountLabel").textContent = String(state.songs.length);
  }
}

function openSearchDrawer() {
  state.searchOpen = true;
  $("searchDrawer").classList.add("open");
  renderSearch();
  setTimeout(() => $("searchInput").focus(), 140);
}

function closeSearchDrawer() {
  state.searchOpen = false;
  $("searchInput").blur();
  $("searchDrawer").classList.remove("open");
}

function openMainMenu() {
  $("mainMenuSheet").classList.add("open");
}

function closeMainMenu() {
  $("mainMenuSheet").classList.remove("open");
}

function openNowPlaying(tab = null) {
  if (!state.playingId && !state.selectedId) {
    showToast("Nejprve vyber písničku.", true);
    return;
  }
  if (!state.selectedId) state.selectedId = state.playingId;
  state.npOpen = true;
  if (tab) setNpTab(tab);
  const sheet = $("nowPlayingSheet");
  sheet.classList.remove("dragging");
  sheet.style.transform = "";
  sheet.style.opacity = "";
  sheet.classList.add("open");
  renderNowPlaying();
  updateSeekbarUI();
}

function closeNowPlaying() {
  state.npOpen = false;
  const sheet = $("nowPlayingSheet");
  sheet.classList.remove("dragging");
  sheet.style.transform = "";
  sheet.style.opacity = "";
  sheet.classList.remove("open");
}

function setNpTab(tab) {
  state.npTab = tab;
  $("npTabs").querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.npTab === tab));
  $("npTabPlayer").classList.toggle("active", tab === "player");
  $("npTabLyrics").classList.toggle("active", tab === "lyrics");
  $("npTabFx").classList.toggle("active", tab === "fx");
  if (tab === "lyrics") {
    const song = getSongById(state.playingId || state.selectedId);
    if (song) renderLyricsView(song, false);
  }
  if (tab === "fx") renderUpNextList();
}

// ===================== WHOLE PLAYLIST DOWNLOADER =====================
let plImportPollTimer = null;
let plImportLastCount = -1;

function openPlaylistImportSheet() {
  $("playlistImportSheet").classList.add("open");
  pollPlaylistImportStatus(true);
}

function closePlaylistImportSheet() {
  $("playlistImportSheet").classList.remove("open");
}

async function pollPlaylistImportStatus(onlyIfRunning = false) {
  try {
    const res = await fetch("/api/playlist-import-status");
    if (!res.ok) return;
    const st = await res.json();
    if (onlyIfRunning && st.state !== "running") return;

    const box = $("plImportStatusBox");
    const txt = $("plImportStatusText");
    const fill = $("plImportProgressFill");
    const btn = $("startPlImportBtn");

    if (st.state === "running") {
      box.style.display = "flex";
      const pct = st.total > 0 ? Math.min(99, Math.round((st.current / st.total) * 100)) : 8;
      fill.style.width = `${pct}%`;
      const doneCnt = (st.downloaded || 0) + (st.skipped || 0);
      txt.textContent = st.total > 0
        ? `${st.playlistName}: ${st.current}/${st.total} — ${st.currentTitle} (staženo: ${st.downloaded}, přeskočeno: ${st.skipped})`
        : `${st.currentTitle || "Načítám playlist..."}`;
      btn.disabled = true;
      btn.textContent = "Stahuji...";

      if (doneCnt !== plImportLastCount && doneCnt > 0) {
        plImportLastCount = doneCnt;
        refreshSongsAndPlaylistsOnly();
      }
      if (!plImportPollTimer) {
        plImportPollTimer = setInterval(() => pollPlaylistImportStatus(false), 950);
      }
    } else if (st.state === "done") {
      clearInterval(plImportPollTimer);
      plImportPollTimer = null;
      box.style.display = "flex";
      fill.style.width = "100%";
      txt.textContent = `Hotovo: „${st.playlistName}“ — staženo ${st.downloaded}, přeskočeno ${st.skipped}${st.failed ? `, chyby: ${st.failed}` : ""}.`;
      btn.disabled = false;
      btn.textContent = "Stáhnout playlist";
      plImportLastCount = -1;
      await refreshSongsAndPlaylistsOnly();
      showToast(`Playlist „${st.playlistName}“ stažen (${st.downloaded} nových)`);
    } else if (st.state === "error") {
      clearInterval(plImportPollTimer);
      plImportPollTimer = null;
      box.style.display = "flex";
      fill.style.width = "0%";
      txt.textContent = `Chyba: ${st.error || "Stahování playlistu selhalo."}`;
      btn.disabled = false;
      btn.textContent = "Stáhnout playlist";
      plImportLastCount = -1;
    }
  } catch {}
}

async function startPlaylistDownload(e) {
  e.preventDefault();
  const url = $("plImportUrlInput").value.trim();
  const playlistName = $("plImportNameInput").value.trim();
  if (!/^https?:\/\//i.test(url)) {
    showToast("Zadej platný odkaz na playlist (http/https).", true);
    return;
  }
  const btn = $("startPlImportBtn");
  btn.disabled = true;
  btn.textContent = "Spouštím...";
  $("plImportStatusBox").style.display = "flex";
  $("plImportProgressFill").style.width = "6%";
  $("plImportStatusText").textContent = "Načítám seznam skladeb z playlistu...";
  plImportLastCount = 0;

  try {
    const res = await fetch("/api/import-playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, playlistName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Nepodařilo se spustit stahování playlistu.");
    clearInterval(plImportPollTimer);
    plImportPollTimer = setInterval(() => pollPlaylistImportStatus(false), 950);
    pollPlaylistImportStatus(false);
    showToast("Stahování playlistu zahájeno na pozadí");
  } catch (err) {
    $("plImportStatusText").textContent = `Chyba: ${err.message || "Nepodařilo se spustit stahování."}`;
    btn.disabled = false;
    btn.textContent = "Stáhnout playlist";
  }
}

async function refreshSongsAndPlaylistsOnly() {
  try {
    const [songsRes, plRes] = await Promise.all([
      fetch("/api/songs"),
      fetch("/api/playlists").catch(() => null),
    ]);
    if (songsRes.ok) state.songs = await songsRes.json();
    if (plRes && plRes.ok) state.playlists = await plRes.json();
    $("offlineCountLabel").textContent = String(state.songs.length);
    renderAllSongLists();
  } catch {}
}

// ===================== RENDER SONG LISTS & PLAYLISTS =====================
function songRowHtml(song, opts = {}) {
  const isPlaying = state.playingId === song.id && !audioEl.paused;
  const isCurrent = state.playingId === song.id;
  const hasLrc = /\[\d{1,2}:\d{2}/.test(song.lyrics || "");
  const hasLyrics = Boolean(song.lyrics && song.lyrics.trim());

  const reorderHtml = opts.reorder ? `
    <div class="reorder-btns">
      <button type="button" class="reorder-btn" data-move="up" data-id="${escapeHtml(song.id)}" title="Posunout nahoru">${ICONS.chevUp(13)}</button>
      <button type="button" class="reorder-btn" data-move="down" data-id="${escapeHtml(song.id)}" title="Posunout dolů">${ICONS.chevDown(13)}</button>
    </div>` : "";

  return `
    <div class="song-row${isCurrent ? " playing" : ""}" data-song-id="${escapeHtml(song.id)}">
      <div class="row-cover">${renderCoverHtml(song, 22)}</div>
      <div class="row-info">
        <div class="row-title">
          ${isPlaying ? `<span style="color:var(--accent);display:inline-flex;flex-shrink:0;">${ICONS.play(12)}</span>` : ""}
          <span class="ellipsis">${escapeHtml(song.title || "Bez názvu")}</span>
        </div>
        <div class="row-artist ellipsis">${escapeHtml(song.artist || "Neznámý interpret")}${song.album ? ` • ${escapeHtml(song.album)}` : ""}</div>
        <div class="row-badges">
          ${hasLrc ? `<span class="tiny-badge synced">LRC</span>` : hasLyrics ? `<span class="tiny-badge">Lyrics</span>` : ""}
        </div>
      </div>
      ${reorderHtml}
      <button type="button" class="more-btn" data-more-id="${escapeHtml(song.id)}" title="Možnosti">${ICONS.more(18)}</button>
    </div>`;
}

function songCardHtml(song) {
  const isPlaying = state.playingId === song.id && !audioEl.paused;
  const isCurrent = state.playingId === song.id;
  return `
    <div class="song-card${isCurrent ? " playing" : ""}" data-song-id="${escapeHtml(song.id)}">
      <div class="card-cover">
        ${renderCoverHtml(song, 34)}
        <button type="button" class="card-play-fab" data-play-id="${escapeHtml(song.id)}" title="Přehrát">
          ${isPlaying ? ICONS.pause(16) : ICONS.play(16)}
        </button>
      </div>
      <div class="card-meta-row">
        <div class="card-meta">
          <div class="card-title ellipsis">${escapeHtml(song.title || "Bez názvu")}</div>
          <div class="card-artist ellipsis">${escapeHtml(song.artist || "Neznámý interpret")}</div>
        </div>
        <button type="button" class="more-btn" data-more-id="${escapeHtml(song.id)}" title="Možnosti">${ICONS.more(17)}</button>
      </div>
    </div>`;
}

function renderLibrary() {
  const list = sortSongsList(state.songs);
  $("libraryCountLabel").textContent = `${state.songs.length} písniček`;
  $("offlineCountLabel").textContent = String(state.songs.length);
  const container = $("librarySongs");
  if (list.length === 0) {
    container.className = "";
    container.innerHTML = `<div class="empty-state">Zatím tu nejsou žádné písničky.<br/>Klepni nahoře na <strong>Přidat</strong>.</div>`;
    return;
  }
  const viewMode = state.settings.viewMode || "grid";
  const useList = state.settings.lightweightMode || viewMode === "list";
  container.className = useList ? "songs-list" : "songs-grid";
  container.innerHTML = useList ? list.map((s) => songRowHtml(s)).join("") : list.map(songCardHtml).join("");
  $("viewToggleIcon").innerHTML = useList
    ? `<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>`
    : `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`;
}

function renderPlaylists() {
  $("playlistsCountLabel").textContent = `${state.playlists.length} playlistů`;
  const listEl = $("playlistsList");
  if (state.playlists.length === 0) {
    listEl.innerHTML = `<div class="empty-state">Zatím nemáš žádný playlist.<br/>Vytvoř nový nebo stáhni celý playlist z YouTube Music.</div>`;
  } else {
    listEl.innerHTML = state.playlists.map((pl) => {
      const songs = getPlaylistSongs(pl.id);
      const firstCover = songs.find((s) => s.coverFile);
      return `
        <div class="playlist-card" data-open-pl="${escapeHtml(pl.id)}">
          <div class="playlist-thumb" style="background:${gradientFor(pl.id)};color:rgba(255,255,255,0.85);">
            ${firstCover && !state.settings.lightweightMode ? `<img src="${escapeHtml(firstCover.coverFile)}" alt="" />` : ICONS.music(22)}
          </div>
          <div class="playlist-meta">
            <div class="playlist-name ellipsis">${escapeHtml(pl.name)}</div>
            <div class="playlist-count">${songs.length} písniček</div>
          </div>
          <button type="button" class="icon-pill icon-pill-sm" data-play-pl="${escapeHtml(pl.id)}" title="Přehrát">${ICONS.play(15)}</button>
        </div>`;
    }).join("");
  }

  if (state.activePlaylistId) {
    const pl = state.playlists.find((p) => p.id === state.activePlaylistId);
    if (!pl) { closePlaylistDetail(); return; }
    const songs = getPlaylistSongs(pl.id);
    $("plDetailName").textContent = pl.name;
    $("plDetailCount").textContent = `${songs.length} písniček`;
    $("playlistSongsList").className = "songs-list";
    $("playlistSongsList").innerHTML = songs.length
      ? songs.map((s) => songRowHtml(s, { reorder: true })).join("")
      : `<div class="empty-state">Tento playlist je zatím prázdný.<br/>Přidej písničky přes tlačítko možností v knihovně.</div>`;
  }
}

function openPlaylistDetail(plId) {
  state.activePlaylistId = plId;
  $("playlistsHome").style.display = "none";
  $("playlistDetail").style.display = "flex";
  renderPlaylists();
}

function closePlaylistDetail() {
  state.activePlaylistId = null;
  $("playlistDetail").style.display = "none";
  $("playlistsHome").style.display = "flex";
}

function renderSearch() {
  const q = state.search.trim().toLowerCase();
  const f = state.searchFilter;
  $("clearSearchBtn").style.display = q ? "inline-flex" : "none";
  let list = state.songs.filter((s) => {
    if (f === "lyrics" && !(s.lyrics && s.lyrics.trim())) return false;
    if (f === "audio" && !s.audioFile) return false;
    if (!q) return true;
    return [s.title, s.artist, s.album, s.lyrics].some((v) => String(v || "").toLowerCase().includes(q));
  });
  list = sortSongsList(list);
  const el = $("searchResults");
  el.className = "songs-list";
  el.innerHTML = list.length
    ? list.map((s) => songRowHtml(s)).join("")
    : `<div class="empty-state">Nic neodpovídá hledání.</div>`;
}

function renderAllSongLists() {
  renderLibrary();
  renderPlaylists();
  if (state.searchOpen) renderSearch();
}

// ===================== LYRICS PARSING =====================
function parseLyrics(rawText) {
  const rawLines = String(rawText || "").replace(/\r\n/g, "\n").split("\n");
  const timeTagRe = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  const metaTagRe = /^\[(ti|ar|al|by|length|re|ve):.*\]$/i;
  const offsetRe = /^\[offset:\s*([+-]?\d+)\s*\]$/i;

  let offsetSec = 0;
  let hasTimestamps = false;
  const passes = [[]];
  let lastLineFirstTime = -1;
  const plainLines = [];

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    const offMatch = trimmed.match(offsetRe);
    if (offMatch) { offsetSec = Number(offMatch[1]) / 1000; continue; }
    if (metaTagRe.test(trimmed)) continue;

    const matches = [...raw.matchAll(timeTagRe)];
    if (matches.length > 0) {
      hasTimestamps = true;
      const cleanText = raw.replace(timeTagRe, "").trim();
      const times = matches.map((m) => {
        const min = parseInt(m[1], 10);
        const sec = parseInt(m[2], 10);
        const fracStr = m[3] || "0";
        const frac = parseInt(fracStr, 10) / Math.pow(10, fracStr.length);
        return Math.max(0, min * 60 + sec + frac + offsetSec);
      });
      if (lastLineFirstTime >= 0 && times[0] + 15 < lastLineFirstTime && passes[passes.length - 1].length >= 4) {
        passes.push([]);
      }
      lastLineFirstTime = times[0];
      for (const t of times) {
        if (cleanText !== "") passes[passes.length - 1].push({ text: cleanText, time: t, isEmpty: false });
      }
    } else {
      plainLines.push({ text: trimmed, time: null, isEmpty: trimmed === "" });
    }
  }

  if (hasTimestamps) {
    const primaryPass = passes[0];
    let combined = [...primaryPass];
    for (let p = 1; p < passes.length; p++) {
      const pass = passes[p];
      if (!pass.length) continue;
      if (pass.length >= 4 && primaryPass.length >= 4) {
        let overlap = 0;
        for (const item of pass) {
          if (primaryPass.some((b) => Math.abs(b.time - item.time) <= 1.5)) overlap++;
        }
        if (overlap / pass.length >= 0.45) continue;
      }
      combined = combined.concat(pass);
    }
    combined.sort((a, b) => a.time - b.time);
    const deduped = [];
    for (const item of combined) {
      const prev = deduped[deduped.length - 1];
      if (prev && Math.abs(prev.time - item.time) <= 0.5 && prev.text.toLowerCase() === item.text.toLowerCase()) continue;
      deduped.push(item);
    }
    return { mode: "lrc", lines: deduped };
  }

  const nonEmpty = plainLines.filter((l) => !l.isEmpty);
  if (nonEmpty.length >= 8 && nonEmpty.length % 2 === 0) {
    const half = nonEmpty.length / 2;
    let same = 0;
    for (let i = 0; i < half; i++) {
      if (nonEmpty[i].text.toLowerCase() === nonEmpty[i + half].text.toLowerCase()) same++;
    }
    if (same / half >= 0.8) {
      const trimmedPlain = [];
      let seen = 0;
      for (const l of plainLines) {
        trimmedPlain.push(l);
        if (!l.isEmpty && ++seen >= half) break;
      }
      return { mode: "plain", lines: trimmedPlain };
    }
  }
  return { mode: "plain", lines: plainLines };
}

function computeAutoTimes(lines, duration) {
  if (!isFinite(duration) || duration <= 0) return null;
  const startMargin = Math.min(8, duration * 0.04);
  const endMargin = Math.min(6, duration * 0.03);
  const usable = Math.max(1, duration - startMargin - endMargin);
  const weights = lines.map((l) => (l.isEmpty ? 10 : Math.max(14, l.text.length)));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return lines.map((l, i) => { const t = startMargin + (acc / totalWeight) * usable; acc += weights[i]; return t; });
}

function findNextNonEmptyIndex(lines, fromIdx) {
  for (let i = fromIdx; i < lines.length; i++) if (!lines[i].isEmpty) return i;
  return -1;
}

// ===================== TRANSLATION (MEMORY ONLY, NO DISK CACHE) =====================
function getSelectedTranslateLang() {
  const v = state.selectedTranslateLang || "cs";
  if (v === "custom") {
    const raw = ($("customLangInput").value || "").trim().toLowerCase();
    return /^[a-z]{2,5}(-[a-z]{2,4})?$/.test(raw) ? raw : "";
  }
  return v;
}

function getTranslationCacheKey(song, lang) {
  return `${song.id}::${lang}::${song.lyrics || ""}`;
}

async function fetchLyricsTranslation(song, targetLang) {
  const parsed = state.parsedLyrics && (state.playingId || state.selectedId) === song.id ? state.parsedLyrics : parseLyrics(song.lyrics);
  const nonEmptyIndices = [];
  const textsToSend = [];
  parsed.lines.forEach((l, idx) => {
    if (!l.isEmpty) { nonEmptyIndices.push(idx); textsToSend.push(l.text); }
  });
  if (!textsToSend.length) return null;

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId: song.id, source: "auto", target: targetLang, lines: textsToSend }),
  });
  if (!res.ok) throw new Error("Překlad se nezdařil");
  const data = await res.json();
  const trLines = Array.isArray(data.lines) ? data.lines : [];
  const full = new Array(parsed.lines.length).fill("");
  nonEmptyIndices.forEach((lineIdx, k) => {
    full[lineIdx] = trLines[k] !== undefined ? trLines[k] : parsed.lines[lineIdx].text;
  });
  return full;
}

async function translateCurrentLyrics() {
  const song = getSongById(state.playingId || state.selectedId);
  if (!song || !song.lyrics || !song.lyrics.trim()) return;
  if (!state.serverAvailable) { showToast("Překlad vyžaduje připojení k internetu.", true); return; }

  const targetLang = getSelectedTranslateLang();
  if (!targetLang) { showToast("Zadej platný kód jazyka (např. de, es, pl, ja).", true); $("customLangInput").focus(); return; }

  const cacheKey = getTranslationCacheKey(song, targetLang);
  if (state.translationCache[cacheKey]) {
    state.activeTranslationLang = targetLang;
    state.translationMode = state.settings.defaultTranslationMode || "both";
    renderLyricsView(song, true);
    if (state.fsLyricsOpen) renderFsLyrics(true);
    return;
  }

  const btn = $("translateBtn");
  state.translating = true;
  btn.disabled = true;
  btn.textContent = "Překládám...";
  try {
    const full = await fetchLyricsTranslation(song, targetLang);
    if (!full) return;
    state.translationCache[cacheKey] = full;
    state.activeTranslationLang = targetLang;
    state.translationMode = state.settings.defaultTranslationMode || "both";
    renderLyricsView(song, true);
    if (state.fsLyricsOpen) renderFsLyrics(true);
    showToast("Lyrics přeloženy");
  } catch (err) {
    showToast(err.message || "Chyba při překladu", true);
  } finally {
    state.translating = false;
    btn.disabled = false;
    btn.textContent = "Přeložit";
  }
}

let autoTranslatingKey = "";
let autoTranslateTimer = null;
function scheduleAutoTranslate(song) {
  if (!song || !song.lyrics || !song.lyrics.trim()) return;
  if (!state.serverAvailable || !state.activeTranslationLang || state.translationMode === "original") return;
  const cacheKey = getTranslationCacheKey(song, state.activeTranslationLang);
  if (state.translationCache[cacheKey] || autoTranslatingKey === cacheKey) return;

  clearTimeout(autoTranslateTimer);
  const start = () => {
    autoTranslateTimer = setTimeout(async () => {
      if ((state.playingId || state.selectedId) !== song.id) return;
      const targetLang = state.activeTranslationLang;
      if (!targetLang || state.translationCache[cacheKey] || autoTranslatingKey === cacheKey) return;
      autoTranslatingKey = cacheKey;
      try {
        const full = await fetchLyricsTranslation(song, targetLang);
        if (full) {
          state.translationCache[cacheKey] = full;
          if ((state.playingId || state.selectedId) === song.id) {
            renderLyricsView(song, true);
            if (state.fsLyricsOpen) renderFsLyrics(true);
          }
        }
      } catch {}
      finally { if (autoTranslatingKey === cacheKey) autoTranslatingKey = ""; }
    }, 450);
  };

  if (state.playingId === song.id && audioEl.readyState < 3 && !audioEl.paused) {
    audioEl.addEventListener("canplay", start, { once: true });
  } else if (state.playingId === song.id && audioEl.readyState < 3) {
    audioEl.addEventListener("playing", start, { once: true });
  } else {
    start();
  }
}

// ===================== RENDER LYRICS & SYNC MODE =====================
function renderLyricsView(song, forceRebuild = false) {
  const lyricsEl = $("detailLyrics");
  const badgeEl = $("syncBadge");
  const syncBtn = $("syncLyricsBtn");
  const toolbar = $("syncToolbar");
  const trBar = $("translateBar");
  const trModes = $("translateModes");

  if (!song || !song.lyrics || !song.lyrics.trim()) {
    badgeEl.style.display = "none";
    syncBtn.style.display = "none";
    toolbar.classList.remove("active");
    trBar.classList.remove("visible");
    state.parsedLyrics = null;
    state.renderedLyricsKey = "";
    lyricsEl.innerHTML = `<div class="empty-state">Tato písnička zatím nemá lyrics.<br/>Klepni nahoře na <strong>Najít lyrics</strong>.</div>`;
    return;
  }

  if (state.syncMode) {
    toolbar.classList.add("active");
    trBar.classList.remove("visible");
    badgeEl.style.display = "none";
    syncBtn.style.display = "none";
    lyricsEl.innerHTML = state.syncLines.map((l, i) => {
      if (!l.text) return `<div class="lyric-gap"></div>`;
      const cls = i === state.syncCursor ? "sync-current" : l.time !== null ? "sync-done" : "";
      const tag = l.time !== null ? `<span class="lyric-time">${formatTime(l.time)}</span>` : "";
      return `<div class="lyric-line ${cls}" data-lyric-idx="${i}"><span>${escapeHtml(l.text)}</span>${tag}</div>`;
    }).join("");
    const curEl = lyricsEl.querySelector(`[data-lyric-idx="${state.syncCursor}"]`);
    if (curEl) curEl.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  toolbar.classList.remove("active");
  trBar.classList.add("visible");

  const selectedLang = getSelectedTranslateLang();
  const cacheKey = selectedLang ? getTranslationCacheKey(song, selectedLang) : "";
  const cachedLines = cacheKey ? state.translationCache[cacheKey] : null;
  const showTr = Boolean(cachedLines && state.activeTranslationLang === selectedLang && state.translationMode !== "original");

  trModes.classList.toggle("visible", Boolean(cachedLines && state.activeTranslationLang === selectedLang));
  trModes.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.trMode === state.translationMode));

  const key = `${song.id}::${song.lyrics}::${showTr ? `${selectedLang}:${state.translationMode}` : "orig"}`;
  if (forceRebuild || state.renderedLyricsKey !== key) {
    state.parsedLyrics = parseLyrics(song.lyrics);
    state.renderedLyricsKey = key;
    state.activeLyricIdx = -1;

    const isLrc = state.parsedLyrics.mode === "lrc";
    badgeEl.style.display = "inline-flex";
    badgeEl.className = "sync-badge " + (isLrc ? "synced" : "auto");
    badgeEl.innerHTML = isLrc ? ICONS.check(13) : ICONS.clock(13);
    badgeEl.title = isLrc ? "Synchronizované LRC lyrics" : "Automatický odhad času";
    syncBtn.style.display = song.audioFile ? "inline-flex" : "none";
    $("syncLyricsBtnText").textContent = isLrc ? "Přesync" : "Sync";

    lyricsEl.innerHTML = state.parsedLyrics.lines.map((line, i) => {
      if (line.isEmpty) return `<div class="lyric-gap"></div>`;
      const timeTag = line.time !== null ? `<span class="lyric-time">${formatTime(line.time)}</span>` : "";
      if (showTr && cachedLines[i]) {
        if (state.translationMode === "only") {
          return `<div class="lyric-line" data-lyric-idx="${i}"><span>${escapeHtml(cachedLines[i])}</span>${timeTag}</div>`;
        }
        return `<div class="lyric-line" data-lyric-idx="${i}"><div class="lyric-text-wrap"><span>${escapeHtml(line.text)}</span><span class="lyric-sub">${escapeHtml(cachedLines[i])}</span></div>${timeTag}</div>`;
      }
      return `<div class="lyric-line" data-lyric-idx="${i}"><span>${escapeHtml(line.text)}</span>${timeTag}</div>`;
    }).join("");
  }
  updateActiveLyric(false);
}

function updateActiveLyric(shouldScroll = true) {
  if (state.syncMode || !state.parsedLyrics) return;
  const song = getSongById(state.playingId || state.selectedId);
  if (!song || state.playingId !== song.id) return;

  const lines = state.parsedLyrics.lines;
  const t = audioEl.currentTime;
  let activeIdx = -1;
  if (state.parsedLyrics.mode === "lrc") {
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].isEmpty && lines[i].time !== null && lines[i].time <= t + 0.08) activeIdx = i;
    }
  } else {
    const autoTimes = computeAutoTimes(lines, audioEl.duration);
    if (autoTimes) {
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].isEmpty && autoTimes[i] <= t) activeIdx = i;
      }
    }
  }

  if (activeIdx === state.activeLyricIdx) return;
  state.activeLyricIdx = activeIdx;

  const lyricsEl = $("detailLyrics");
  lyricsEl.querySelectorAll(".lyric-line").forEach((node) => {
    const idx = Number(node.dataset.lyricIdx);
    node.classList.toggle("active", idx === activeIdx);
    node.classList.toggle("past", activeIdx >= 0 && idx < activeIdx);
  });

  if (shouldScroll && state.settings.autoScrollLyrics && activeIdx >= 0 && state.npOpen && state.npTab === "lyrics") {
    const activeNode = lyricsEl.querySelector(`[data-lyric-idx="${activeIdx}"]`);
    if (activeNode) activeNode.scrollIntoView({ behavior: state.settings.lightweightMode ? "auto" : "smooth", block: "center" });
  }
  if (state.fsLyricsOpen) syncFsActiveLyric(activeIdx, shouldScroll);
}

function startSyncMode() {
  const song = getSongById(state.playingId || state.selectedId);
  if (!song || !song.audioFile || !song.lyrics?.trim()) return;
  const parsed = parseLyrics(song.lyrics);
  state.syncLines = parsed.lines.map((l) => ({ text: l.text, time: null, isEmpty: l.isEmpty }));
  state.syncCursor = findNextNonEmptyIndex(state.syncLines, 0);
  state.syncMode = true;
  if (state.playingId !== song.id) {
    state.playingId = song.id;
    audioEl.src = song.audioFile;
    audioEl.currentTime = 0;
  } else {
    audioEl.currentTime = 0;
  }
  audioEl.play().catch(() => {});
  renderLyricsView(song, true);
}

function stampNextSyncLine() {
  if (!state.syncMode || state.syncCursor < 0) return;
  state.syncLines[state.syncCursor].time = audioEl.currentTime;
  state.syncCursor = findNextNonEmptyIndex(state.syncLines, state.syncCursor + 1);
  const song = getSongById(state.playingId || state.selectedId);
  renderLyricsView(song, true);
  if (state.syncCursor < 0) showToast("Všechny řádky označeny. Klepni na Uložit.");
}

function undoSyncLine() {
  if (!state.syncMode) return;
  const start = state.syncCursor < 0 ? state.syncLines.length - 1 : state.syncCursor - 1;
  for (let i = start; i >= 0; i--) {
    if (!state.syncLines[i].isEmpty && state.syncLines[i].time !== null) {
      state.syncLines[i].time = null;
      state.syncCursor = i;
      audioEl.currentTime = Math.max(0, audioEl.currentTime - 2);
      renderLyricsView(getSongById(state.playingId || state.selectedId), true);
      return;
    }
  }
}

async function saveSyncMode() {
  const song = getSongById(state.playingId || state.selectedId);
  if (!song) return;
  const lrcText = state.syncLines.map((l) => (l.isEmpty ? "" : (l.time !== null ? `${formatLrcTime(l.time)} ${l.text}` : l.text))).join("\n");
  try {
    const res = await fetch(`/api/songs/${song.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics: lrcText }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    updated._ts = Date.now();
    const idx = state.songs.findIndex((s) => s.id === updated.id);
    if (idx >= 0) state.songs[idx] = updated;
    state.syncMode = false;
    state.renderedLyricsKey = "";
    renderAllSongLists();
    renderLyricsView(updated, true);
    showToast("Synchronizované lyrics uloženy");
  } catch {
    showToast("Nepodařilo se uložit synchronizaci.", true);
  }
}

function cancelSyncMode() {
  state.syncMode = false;
  state.renderedLyricsKey = "";
  const song = getSongById(state.playingId || state.selectedId);
  if (song) renderLyricsView(song, true);
}

// ===================== FULLSCREEN LYRICS (KEEP SCREEN ON) =====================
let fsRenderedKey = "";
let fsLastSongId = null;

function renderFsLyrics(force = false) {
  const song = getSongById(state.playingId || state.selectedId);
  if (!song) return;
  const songChanged = fsLastSongId !== song.id;
  fsLastSongId = song.id;
  $("fsTitle").textContent = song.title || "Bez názvu";
  $("fsArtist").textContent = song.artist || "";
  $("fsBgCover").style.backgroundImage = song.coverFile && !state.settings.lightweightMode ? `url("${song.coverFile}?v=${encodeURIComponent(song._ts || "")}")` : "none";
  $("fsCoverMini").innerHTML = renderCoverHtml(song, 18);

  const selectedLang = state.activeTranslationLang || getSelectedTranslateLang();
  const cacheKey = selectedLang ? getTranslationCacheKey(song, selectedLang) : "";
  const cachedLines = cacheKey ? state.translationCache[cacheKey] : null;
  const showTr = Boolean(cachedLines && state.activeTranslationLang === selectedLang && state.translationMode !== "original");

  const key = `${song.id}::${song.lyrics || ""}::${showTr ? `${selectedLang}:${state.translationMode}` : "orig"}`;
  if (force || fsRenderedKey !== key) {
    fsRenderedKey = key;
    if (!song.lyrics?.trim()) {
      $("fsLyricsContent").innerHTML = `<div class="fs-lyric-line" style="cursor:default;">Tato písnička nemá zadané lyrics.</div>`;
    } else {
      const parsed = state.parsedLyrics && (state.playingId || state.selectedId) === song.id ? state.parsedLyrics : parseLyrics(song.lyrics);
      $("fsLyricsContent").innerHTML = parsed.lines.map((line, i) => {
        if (line.isEmpty) return `<div class="fs-lyric-gap"></div>`;
        if (showTr && cachedLines[i]) {
          if (state.translationMode === "only") return `<div class="fs-lyric-line" data-fs-idx="${i}">${escapeHtml(cachedLines[i])}</div>`;
          return `<div class="fs-lyric-line" data-fs-idx="${i}">${escapeHtml(line.text)}<span class="fs-lyric-sub">${escapeHtml(cachedLines[i])}</span></div>`;
        }
        return `<div class="fs-lyric-line" data-fs-idx="${i}">${escapeHtml(line.text)}</div>`;
      }).join("");
    }
    if (songChanged) $("fsLyricsScroll").scrollTop = 0;
  }
  syncFsActiveLyric(state.activeLyricIdx, false);
  const playing = !audioEl.paused;
  $("fsPlayIcon").style.display = playing ? "none" : "block";
  $("fsPauseIcon").style.display = playing ? "block" : "none";
  syncVolumeUI(audioEl.muted ? 0 : audioEl.volume);
  updateSeekbarUI();
}

function syncFsActiveLyric(activeIdx, shouldScroll = true) {
  if (!state.fsLyricsOpen) return;
  const nodes = $("fsLyricsContent").querySelectorAll(".fs-lyric-line[data-fs-idx]");
  let activeNode = null;
  nodes.forEach((n) => {
    const isAct = Number(n.dataset.fsIdx) === activeIdx;
    n.classList.toggle("active", isAct);
    if (isAct) activeNode = n;
  });
  if (shouldScroll && activeNode && state.settings.autoScrollLyrics) {
    activeNode.scrollIntoView({ behavior: state.settings.lightweightMode ? "auto" : "smooth", block: "center" });
  }
}

function openFsLyrics() {
  if (!getSongById(state.playingId || state.selectedId)) { showToast("Nejprve vyber písničku.", true); return; }
  state.fsLyricsOpen = true;
  $("fsLyricsOverlay").classList.add("open");
  setAndroidKeepScreenOn(true);
  renderFsLyrics(true);
}

function closeFsLyrics() {
  state.fsLyricsOpen = false;
  $("fsLyricsOverlay").classList.remove("open");
  setAndroidKeepScreenOn(false);
}

// ===================== PLAYBACK, SHUFFLE, QUEUE, A-B LOOP =====================
function getPlayableQueue() {
  const base = state.playQueuePlaylistId ? getPlaylistSongs(state.playQueuePlaylistId) : sortSongsList(state.songs);
  return base.filter((s) => s.audioFile);
}

function togglePlaySong(id, queuePlaylistId = undefined, recordHistory = true) {
  const song = getSongById(id);
  if (!song || !song.audioFile) { showToast("Tato písnička nemá audio soubor.", true); return; }

  if (queuePlaylistId !== undefined) state.playQueuePlaylistId = queuePlaylistId;
  state.selectedId = id;

  if (state.playingId === id) {
    ensureAudioGraph();
    if (audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
    return;
  }

  state.playingId = id;
  state.loopA = null;
  state.loopB = null;
  if (recordHistory) {
    state.shuffleHistory = state.shuffleHistory.filter((x) => x !== id);
    state.shuffleHistory.push(id);
    if (state.shuffleHistory.length > 60) state.shuffleHistory.shift();
  }

  ensureAudioGraph();
  audioEl.src = song.audioFile;
  applyPitchRate();
  setSeekProgress(0);
  audioEl.play().catch(() => {});
  applyDynamicColor(song);
  renderAllSongLists();
  renderPlayer();
  renderNowPlaying();
  if (state.fsLyricsOpen) renderFsLyrics(true);
  updateMediaSession(song);
  scheduleAutoTranslate(song);
}

function playAdjacent(step, isAutoEnd = false) {
  if (isAutoEnd && state.repeatMode === "one" && state.playingId) {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
    return;
  }
  if (step > 0 && state.upNextQueue.length > 0) {
    const nextId = state.upNextQueue.shift();
    renderQueuePill();
    renderUpNextList();
    if (getSongById(nextId)?.audioFile) { togglePlaySong(nextId); return; }
  }

  const playable = getPlayableQueue();
  if (!playable.length) return;

  if (state.shuffle && step > 0) {
    const cooldown = Math.min(25, Math.max(0, playable.length - 1));
    const recent = new Set(state.shuffleHistory.slice(-cooldown));
    if (state.playingId) recent.add(state.playingId);
    let candidates = playable.filter((s) => !recent.has(s.id));
    if (!candidates.length) candidates = playable.filter((s) => s.id !== state.playingId);
    if (!candidates.length) candidates = playable;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    togglePlaySong(pick.id);
    return;
  }

  const curIdx = playable.findIndex((s) => s.id === state.playingId);
  let nextIdx = curIdx < 0 ? 0 : curIdx + step;
  if (nextIdx >= playable.length) {
    if (state.repeatMode === "all" || !isAutoEnd) nextIdx = 0;
    else return;
  }
  if (nextIdx < 0) nextIdx = playable.length - 1;
  togglePlaySong(playable[nextIdx].id);
}

function enqueueUpNext(songId) {
  const song = getSongById(songId);
  if (!song || !song.audioFile) { showToast("Písnička nemá audio.", true); return; }
  state.upNextQueue.push(songId);
  renderQueuePill();
  renderUpNextList();
  showToast(`Zařazeno jako další: ${song.title}`);
}

function renderQueuePill() {
  const n = state.upNextQueue.length;
  $("queuePill").style.display = n > 0 ? "inline-flex" : "none";
  $("queuePillCount").textContent = String(n);
}

function renderUpNextList() {
  const el = $("upNextList");
  if (!state.upNextQueue.length) {
    el.innerHTML = `<div class="fx-sub">Fronta je prázdná. Přidej skladbu přes menu možností u písničky.</div>`;
    return;
  }
  el.innerHTML = state.upNextQueue.map((id, idx) => {
    const s = getSongById(id);
    if (!s) return "";
    return `<div class="upnext-item"><span class="ellipsis">${idx + 1}. ${escapeHtml(s.title)}</span><button type="button" class="btn btn-secondary btn-xs" data-remove-q="${idx}" title="Odebrat">${ICONS.close(13)}</button></div>`;
  }).join("");
}

function renderAbLoop() {
  const dur = audioEl.duration;
  const hasA = state.loopA !== null;
  const hasB = state.loopB !== null;
  $("abLoopBtn").classList.toggle("active", hasA);
  $("abLoopBtnText").textContent = !hasA ? "A–B" : !hasB ? `A: ${formatTime(state.loopA)}` : `${formatTime(state.loopA)}–${formatTime(state.loopB)}`;
  $("abLoopBtnFx").textContent = !hasA ? "Nastavit A" : !hasB ? "Nastavit B" : "Zrušit A–B";
  $("abLoopStatus").textContent = !hasA
    ? "Vypnuto – nastav bod A a B pro opakování části skladby."
    : !hasB
      ? `Bod A nastaven na ${formatTime(state.loopA)}. Klepni pro nastavení bodu B.`
      : `Aktivní smyčka: ${formatTime(state.loopA)} až ${formatTime(state.loopB)}`;
  $("abLoopBadge").style.display = hasA ? "inline" : "none";
  $("abLoopBadge").textContent = hasB ? `A–B ${formatTime(state.loopA)}–${formatTime(state.loopB)}` : hasA ? `A: ${formatTime(state.loopA)}` : "";
  $("abMarkerA").style.display = hasA && isFinite(dur) && dur > 0 ? "block" : "none";
  $("abMarkerB").style.display = hasB && isFinite(dur) && dur > 0 ? "block" : "none";
  if (hasA && dur > 0) $("abMarkerA").style.left = `${(state.loopA / dur) * 100}%`;
  if (hasB && dur > 0) $("abMarkerB").style.left = `${(state.loopB / dur) * 100}%`;
}

function handleAbLoopClick() {
  if (!state.playingId || !isFinite(audioEl.duration)) { showToast("Nejprve spusť písničku.", true); return; }
  if (state.loopA === null) {
    state.loopA = audioEl.currentTime;
    state.loopB = null;
    showToast(`Bod A nastaven (${formatTime(state.loopA)})`);
  } else if (state.loopB === null) {
    const t = audioEl.currentTime;
    if (t <= state.loopA + 0.4) { showToast("Bod B musí být až za bodem A.", true); return; }
    state.loopB = t;
    audioEl.currentTime = state.loopA;
    showToast("Smyčka A–B aktivní");
  } else {
    state.loopA = null;
    state.loopB = null;
    showToast("Smyčka A–B zrušena");
  }
  renderAbLoop();
}

function enforceAbLoop() {
  if (state.loopA !== null && state.loopB !== null && audioEl.currentTime >= state.loopB) {
    audioEl.currentTime = state.loopA;
  }
}

// ===================== PROGRESS BAR & SCRUBBER =====================
function setSeekProgress(pct) {
  const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
  const sb = $("seekBar");
  const fs = $("fsSeekBar");
  if (sb) {
    sb.value = clamped;
    sb.style.setProperty("--seek-pct", `${clamped}%`);
  }
  if (fs) {
    fs.value = clamped;
    fs.style.setProperty("--seek-pct", `${clamped}%`);
  }
  const mf = $("miniProgressFill");
  if (mf) mf.style.width = `${clamped}%`;
}

function updateSeekbarUI() {
  if (!isFinite(audioEl.duration) || audioEl.duration <= 0) {
    setSeekProgress(0);
    return;
  }
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  const cur = formatTime(audioEl.currentTime);
  const tot = formatTime(audioEl.duration);
  setSeekProgress(pct);
  $("currentTime").textContent = cur;
  $("totalTime").textContent = tot;
  if (state.fsLyricsOpen) {
    $("fsCurTime").textContent = cur;
    $("fsTotalTime").textContent = tot;
  }
}

// ===================== RENDER PLAYER & NOW PLAYING =====================
function renderPlayer() {
  const song = getSongById(state.playingId);
  const playing = Boolean(song && !audioEl.paused);

  $("miniPlayer").style.display = song ? "block" : "none";
  if (song) {
    $("miniTitle").textContent = song.title || "Bez názvu";
    $("miniArtist").textContent = song.artist || "Neznámý interpret";
    const coverKey = `${song.id}::${song.coverFile || ""}::${song._ts || ""}::${state.settings.lightweightMode ? 1 : 0}`;
    if ($("miniCover").dataset.coverKey !== coverKey) {
      $("miniCover").dataset.coverKey = coverKey;
      $("miniCover").innerHTML = renderCoverHtml(song, 20);
    }
  }
  $("miniPlayIcon").style.display = playing ? "none" : "block";
  $("miniPauseIcon").style.display = playing ? "block" : "none";
  $("playIcon").style.display = playing ? "none" : "block";
  $("pauseIcon").style.display = playing ? "block" : "none";
  $("fsPlayIcon").style.display = playing ? "none" : "block";
  $("fsPauseIcon").style.display = playing ? "block" : "none";

  $("shuffleBtn").classList.toggle("active", state.shuffle);
  $("repeatBtn").classList.toggle("active", state.repeatMode !== "off");
  $("repeatOneDot").style.display = state.repeatMode === "one" ? "block" : "none";
  renderAbLoop();
  renderQueuePill();
}

function renderNowPlayingHeaderAndActions() {
  const pl = state.playQueuePlaylistId ? state.playlists.find((p) => p.id === state.playQueuePlaylistId) : null;
  $("npQueueLabel").textContent = pl ? pl.name : "Všechny písničky";
}

function renderNowPlaying() {
  const song = getSongById(state.playingId || state.selectedId);
  renderNowPlayingHeaderAndActions();
  if (!song) return;

  $("npTitle").textContent = song.title || "Bez názvu";
  $("npArtist").textContent = [song.artist || "Neznámý interpret", song.album].filter(Boolean).join(" • ");
  $("npBgBlur").style.backgroundImage = song.coverFile && !state.settings.lightweightMode ? `url("${song.coverFile}?v=${encodeURIComponent(song._ts || "")}")` : "none";

  const coverKey = `${song.id}::${song.coverFile || ""}::${song._ts || ""}::${state.settings.lightweightMode ? 1 : 0}`;
  if ($("npCoverBox").dataset.coverKey !== coverKey) {
    $("npCoverBox").dataset.coverKey = coverKey;
    $("npCoverBox").innerHTML = renderCoverHtml(song, 54);
    $("npCoverBox").classList.remove("cover-pop");
    void $("npCoverBox").offsetWidth;
    $("npCoverBox").classList.add("cover-pop");
  }
  renderLyricsView(song, false);
  renderUpNextList();
}

// ===================== WEB AUDIO: PITCH, REVERB (ALWAYS ACTIVE EVEN IN LIGHTWEIGHT), VISUALIZER =====================
let audioCtx = null, sourceNode = null, dryGain = null, wetGain = null, convolverNode = null, analyserNode = null, freqData = null;

function buildReverbImpulse(ctx, seconds = 2.4, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return impulse;
}

function ensureAudioGraph() {
  // Audio graph stays active in Lightweight mode too so Reverb always works!
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    sourceNode = audioCtx.createMediaElementSource(audioEl);
    dryGain = audioCtx.createGain();
    wetGain = audioCtx.createGain();
    convolverNode = audioCtx.createConvolver();
    convolverNode.buffer = buildReverbImpulse(audioCtx);
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 128;
    analyserNode.smoothingTimeConstant = 0.8;
    freqData = new Uint8Array(analyserNode.frequencyBinCount);

    sourceNode.connect(dryGain);
    sourceNode.connect(convolverNode);
    convolverNode.connect(wetGain);
    dryGain.connect(analyserNode);
    wetGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    applyReverb();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
}

function applyPitchRate() {
  const st = Math.round(Number(state.pitchSemitones) || 0);
  state.pitchSemitones = st;
  audioEl.preservesPitch = false;
  audioEl.mozPreservesPitch = false;
  audioEl.webkitPreservesPitch = false;
  audioEl.playbackRate = Math.pow(2, st / 12);
  const label = `${st >= 0 ? "+" : ""}${st} st`;
  $("pitchBar").value = st;
  $("pitchValue").textContent = label;
  $("fsPitchBar").value = st;
  $("fsPitchVal").textContent = label;
  updateQuickFxBadge();
  if (state.playingId) notifyAndroidPlayback(!audioEl.paused);
}

function applyReverb() {
  // Reverb works in BOTH normal and Lightweight mode!
  const pct = Math.max(0, Math.min(100, Number(state.reverbPercent) || 0));
  state.reverbPercent = pct;
  $("reverbBar").value = pct;
  $("reverbValue").textContent = `${pct}%`;
  $("fsReverbBar").value = pct;
  $("fsReverbVal").textContent = `${pct}%`;
  if (dryGain && wetGain && audioCtx) {
    const wet = (pct / 100) * 0.85;
    dryGain.gain.setTargetAtTime(Math.max(0.25, 1 - wet * 0.55), audioCtx.currentTime, 0.02);
    wetGain.gain.setTargetAtTime(wet, audioCtx.currentTime, 0.02);
  }
  updateQuickFxBadge();
}

function updateQuickFxBadge() {
  const parts = [];
  if (state.pitchSemitones !== 0) parts.push(`${state.pitchSemitones > 0 ? "+" : ""}${state.pitchSemitones}st`);
  if (state.reverbPercent > 0) parts.push(`Rev ${state.reverbPercent}%`);
  $("npQuickFxLabel").textContent = parts.length ? parts.join(" • ") : "FX";
  $("npQuickFxBtn").classList.toggle("active", parts.length > 0);
}

function setPitch(val) {
  state.pitchSemitones = Number(val) || 0;
  applyPitchRate();
  if (state.settings.rememberAudioFx) { state.settings.lastPitch = state.pitchSemitones; saveSettings(); }
}

function setReverb(val) {
  if (Number(val) > 0) ensureAudioGraph();
  state.reverbPercent = Number(val) || 0;
  applyReverb();
  if (state.settings.rememberAudioFx) { state.settings.lastReverb = state.reverbPercent; saveSettings(); }
}

function syncVolumeUI(shownVol) {
  const pct = Math.round(shownVol * 100);
  const muted = audioEl.muted || pct === 0;
  $("volumeBar").value = shownVol;
  $("volumeLabel").textContent = `${pct}%`;
  $("fsVolumeBar").value = shownVol;
  $("fsVolumeVal").textContent = `${pct}%`;
  $("muteBtn").textContent = muted ? "Zapnout zvuk" : "Ztlumit";
  $("fsVolIconOn").style.display = muted ? "none" : "block";
  $("fsVolIconOff").style.display = muted ? "block" : "none";
}

// Visualizer & animation loop (stops automatically in background or Lightweight mode)
let rafId = null;
function releaseCanvas(id) {
  const c = $(id);
  if (c) { c.width = 0; c.height = 0; }
}

function clearVisualizers() {
  ["bgVisualizerCanvas", "npVisualizerCanvas", "fsVisualizerCanvas"].forEach((id) => {
    const c = $(id);
    if (c && c.width > 0) c.getContext("2d").clearRect(0, 0, c.width, c.height);
  });
}

function drawBarsToCanvas(id, rgb1, rgb2, alpha = 0.25) {
  const c = $(id);
  if (!c || !freqData) return;
  const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return;
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  const bars = 28;
  const bw = w / bars;
  const grad = ctx.createLinearGradient(0, h, 0, h * 0.45);
  grad.addColorStop(0, `rgba(${rgb1}, ${alpha})`);
  grad.addColorStop(1, `rgba(${rgb2}, ${alpha * 0.2})`);
  ctx.fillStyle = grad;
  for (let i = 0; i < bars; i++) {
    const val = freqData[Math.min(freqData.length - 1, Math.floor((i / bars) * (freqData.length * 0.72)))] / 255;
    const bh = Math.max(2, val * h * 0.42);
    ctx.fillRect(i * bw + 2, h - bh, Math.max(2, bw - 4), bh);
  }
}

function startAnimationLoop() {
  if (state.settings.lightweightMode || state.isBackground || document.hidden || rafId) return;
  const tick = () => {
    if (audioEl.paused || state.settings.lightweightMode || state.isBackground || document.hidden) {
      rafId = null;
      clearVisualizers();
      return;
    }
    enforceAbLoop();
    updateActiveLyric(true);
    const mode = state.settings.visualizerMode || "background";
    if (mode !== "off" && analyserNode && freqData) {
      analyserNode.getByteFrequencyData(freqData);
      const cs = getComputedStyle(document.documentElement);
      const rgb1 = cs.getPropertyValue("--accent-rgb").trim() || "139, 92, 246";
      const rgb2 = cs.getPropertyValue("--accent2-rgb").trim() || "236, 72, 153";
      if (state.fsLyricsOpen) {
        drawBarsToCanvas("fsVisualizerCanvas", rgb1, rgb2, 0.34);
      } else if (state.npOpen && (mode === "player" || mode === "both")) {
        drawBarsToCanvas("npVisualizerCanvas", rgb1, rgb2, 0.3);
      } else if (!state.npOpen && (mode === "background" || mode === "both")) {
        drawBarsToCanvas("bgVisualizerCanvas", rgb1, rgb2, 0.24);
      }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

// ===================== DYNAMIC COVER-ART THEME (COLOR-DYNAMIC-DARK) =====================
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueDistance(h1, h2) {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 1 - d);
}

function syncSystemBarColor(r, g, b) {
  const hex = `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
  const meta = $("themeColorMeta");
  if (meta) meta.setAttribute("content", hex);
  if (IS_NATIVE_ANDROID && typeof window.AndroidApp.setSystemBarColor === "function") {
    try { window.AndroidApp.setSystemBarColor(r, g, b); } catch {}
  }
}

function setAccentColors(c1, c2) {
  const [h1, s1, l1] = rgbToHsl(c1[0], c1[1], c1[2]);
  const cs1 = s1 < 0.12 ? s1 : Math.max(0.45, Math.min(0.88, s1));
  const cl1 = Math.max(0.50, Math.min(0.66, l1));
  const [ar, ag, ab] = hslToRgb(h1, cs1, cl1);
  const [hr, hg, hb] = hslToRgb(h1, cs1, Math.min(0.76, cl1 + 0.1));
  const [tr, tg, tb] = hslToRgb(h1, Math.min(0.9, cs1 + 0.05), 0.78);
  const [lr, lg, lb] = hslToRgb(h1, Math.min(0.9, cs1 + 0.05), 0.87);

  const second = c2 || c1;
  const [h2, s2, l2] = rgbToHsl(second[0], second[1], second[2]);
  const cs2 = s2 < 0.12 ? s2 : Math.max(0.45, Math.min(0.88, s2));
  const cl2 = Math.max(0.50, Math.min(0.66, l2));
  const [a2r, a2g, a2b] = hslToRgb(h2, cs2, cl2);
  const [t2r, t2g, t2b] = hslToRgb(h2, Math.min(0.9, cs2 + 0.05), 0.78);

  const root = document.documentElement.style;
  root.setProperty("--accent", `rgb(${ar}, ${ag}, ${ab})`);
  root.setProperty("--accent-hover", `rgb(${hr}, ${hg}, ${hb})`);
  root.setProperty("--accent-soft", `rgba(${ar}, ${ag}, ${ab}, 0.18)`);
  root.setProperty("--accent-glow", `rgba(${hr}, ${hg}, ${hb}, 0.85)`);
  root.setProperty("--accent-text", `rgb(${tr}, ${tg}, ${tb})`);
  root.setProperty("--accent-text-light", `rgb(${lr}, ${lg}, ${lb})`);
  root.setProperty("--accent-rgb", `${ar}, ${ag}, ${ab}`);

  root.setProperty("--accent-2", `rgb(${a2r}, ${a2g}, ${a2b})`);
  root.setProperty("--accent2", `rgb(${a2r}, ${a2g}, ${a2b})`);
  root.setProperty("--accent2-soft", `rgba(${a2r}, ${a2g}, ${a2b}, 0.18)`);
  root.setProperty("--accent2-text", `rgb(${t2r}, ${t2g}, ${t2b})`);
  root.setProperty("--accent2-rgb", `${a2r}, ${a2g}, ${a2b}`);

  const bgSat = s1 < 0.12 ? 0.06 : Math.min(0.32, Math.max(0.20, s1 * 0.42));
  const [b0r, b0g, b0b] = hslToRgb(h1, bgSat, 0.055);
  const [b1r, b1g, b1b] = hslToRgb(h1, bgSat * 0.92, 0.085);
  const [b2r, b2g, b2b] = hslToRgb(h1, bgSat * 0.85, 0.12);
  const [b3r, b3g, b3b] = hslToRgb(h1, bgSat * 0.82, 0.16);
  const [bir, big, bib] = hslToRgb(h1, bgSat, 0.065);
  const [pbr, pbg, pbb] = hslToRgb(h1, bgSat, 0.068);

  root.setProperty("--bg-base", `rgb(${b0r}, ${b0g}, ${b0b})`);
  root.setProperty("--bg-surface", `rgb(${b1r}, ${b1g}, ${b1b})`);
  root.setProperty("--bg-elevated", `rgb(${b2r}, ${b2g}, ${b2b})`);
  root.setProperty("--bg-hover", `rgb(${b3r}, ${b3g}, ${b3b})`);
  root.setProperty("--bg-input", `rgb(${bir}, ${big}, ${bib})`);
  root.setProperty("--surface-translucent", `rgba(${b1r}, ${b1g}, ${b1b}, 0.88)`);
  root.setProperty("--player-bg", `rgb(${pbr}, ${pbg}, ${pbb})`);
  syncSystemBarColor(b0r, b0g, b0b);
}

function resetDefaultAccent() {
  const root = document.documentElement.style;
  root.setProperty("--bg-base", "#0b0d12");
  root.setProperty("--bg-surface", "#12151e");
  root.setProperty("--bg-elevated", "#181c28");
  root.setProperty("--bg-hover", "#202536");
  root.setProperty("--bg-input", "#0e1118");
  root.setProperty("--surface-translucent", "rgba(18, 21, 30, 0.88)");
  root.setProperty("--player-bg", "#0e1017");

  root.setProperty("--accent", "#8b5cf6");
  root.setProperty("--accent-hover", "#9f75ff");
  root.setProperty("--accent-soft", "rgba(139, 92, 246, 0.16)");
  root.setProperty("--accent-glow", "rgba(167, 139, 250, 0.85)");
  root.setProperty("--accent-text", "#c4b5fd");
  root.setProperty("--accent-text-light", "#ddd6fe");
  root.setProperty("--accent-rgb", "139, 92, 246");

  root.setProperty("--accent-2", "#06b6d4");
  root.setProperty("--accent2", "#06b6d4");
  root.setProperty("--accent2-soft", "rgba(6, 182, 212, 0.16)");
  root.setProperty("--accent2-text", "#67e8f9");
  root.setProperty("--accent2-rgb", "6, 182, 212");
  syncSystemBarColor(11, 13, 18);
}

function applyDynamicColor(song) {
  const mode = state.settings.themeMode || (state.settings.dynamicColor === false ? "dark" : "color-dynamic-dark");
  if (state.settings.lightweightMode || mode !== "color-dynamic-dark" || !song || !song.coverFile) {
    resetDefaultAccent();
    return;
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const c = document.createElement("canvas");
      c.width = 32; c.height = 32;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 32).data;

      const buckets = Array.from({ length: 18 }, () => ({ weight: 0, count: 0, r: 0, g: 0, b: 0 }));
      const neutral = { count: 0, r: 0, g: 0, b: 0 };

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 180) continue;
        const [h, s, l] = rgbToHsl(r, g, b);
        if (l < 0.08 || l > 0.94) continue;
        if (s < 0.12) {
          neutral.count++; neutral.r += r; neutral.g += g; neutral.b += b;
          continue;
        }
        const idx = Math.floor(h * 18) % 18;
        const w = s * (1 - Math.abs(l - 0.52));
        buckets[idx].weight += w; buckets[idx].count++;
        buckets[idx].r += r * w; buckets[idx].g += g * w; buckets[idx].b += b * w;
      }

      const ranked = buckets
        .map((bk) => ({ weight: bk.weight, count: bk.count, rgb: bk.weight > 0 ? [bk.r / bk.weight, bk.g / bk.weight, bk.b / bk.weight] : null }))
        .filter((x) => x.count >= 2 && x.weight > 0.05)
        .sort((a, b) => b.weight - a.weight);

      if (!ranked.length) {
        if (neutral.count > 0) {
          const avg = [neutral.r / neutral.count, neutral.g / neutral.count, neutral.b / neutral.count];
          setAccentColors(avg, avg);
        } else resetDefaultAccent();
        return;
      }

      const primary = ranked[0].rgb;
      const [h1] = rgbToHsl(primary[0], primary[1], primary[2]);
      let secondary = null;
      for (const minDeg of [40, 20, 0]) {
        let bestCand = null, bestScore = -1;
        for (let i = 1; i < ranked.length; i++) {
          const cand = ranked[i].rgb;
          const [hc] = rgbToHsl(cand[0], cand[1], cand[2]);
          const dist = hueDistance(h1, hc);
          if (dist >= minDeg / 360) {
            const score = ranked[i].weight * (0.4 + dist);
            if (score > bestScore) { bestScore = score; bestCand = cand; }
          }
        }
        if (bestCand) { secondary = bestCand; break; }
      }
      if (!secondary) {
        secondary = neutral.count >= 10
          ? [neutral.r / neutral.count, neutral.g / neutral.count, neutral.b / neutral.count]
          : primary;
      }
      setAccentColors(primary, secondary);
    } catch { resetDefaultAccent(); }
  };
  img.onerror = resetDefaultAccent;
  img.src = `${song.coverFile}?v=${encodeURIComponent(song._ts || "")}`;
}

// ===================== WEB MEDIA SESSION (BROWSER FALLBACK) =====================
function updateMediaSession(songOverride = null) {
  if (IS_NATIVE_ANDROID) return;
  if (!("mediaSession" in navigator)) return;
  if (!state.settings.mediaSession) { navigator.mediaSession.metadata = null; return; }
  const song = songOverride || getSongById(state.playingId);
  if (!song) return;
  const artwork = song.coverFile && !state.settings.lightweightMode
    ? [{ src: new URL(song.coverFile, location.origin).href, sizes: "512x512", type: "image/jpeg" }]
    : [];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title || "Bez názvu",
    artist: song.artist || "Neznámý interpret",
    album: song.album || "Song App",
    artwork,
  });
  navigator.mediaSession.playbackState = audioEl.paused ? "paused" : "playing";
  navigator.mediaSession.setActionHandler("play", () => audioEl.play().catch(() => {}));
  navigator.mediaSession.setActionHandler("pause", () => audioEl.pause());
  navigator.mediaSession.setActionHandler("previoustrack", () => playAdjacent(-1));
  navigator.mediaSession.setActionHandler("nexttrack", () => playAdjacent(1));
  navigator.mediaSession.setActionHandler("seekbackward", () => { audioEl.currentTime = Math.max(0, audioEl.currentTime - (Number(state.settings.skipSeconds) || 5)); });
  navigator.mediaSession.setActionHandler("seekforward", () => { if (isFinite(audioEl.duration)) audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + (Number(state.settings.skipSeconds) || 5)); });
}

// ===================== ACTION SHEET (CUSTOM CONTEXT MENU, ZERO EMOJIS) =====================
function openSongActionSheet(songId, fromPlaylist = false) {
  const song = getSongById(songId);
  if (!song) return;
  $("actionSheetHeader").innerHTML = `
    <div class="row-cover" style="width:44px;height:44px;">${renderCoverHtml(song, 20)}</div>
    <div style="min-width:0;flex:1;">
      <div class="card-title ellipsis">${escapeHtml(song.title || "Bez názvu")}</div>
      <div class="card-artist ellipsis">${escapeHtml(song.artist || "Neznámý interpret")}</div>
    </div>`;
  $("actionSheetList").innerHTML = `
    <button type="button" class="action-item" data-act="play">${ICONS.play(17)}<span>Přehrát</span></button>
    <button type="button" class="action-item" data-act="upnext">${ICONS.next(17)}<span>Přehrát jako další</span></button>
    <button type="button" class="action-item" data-act="add-to-pl">${ICONS.plus(18)}<span>Přidat do playlistu</span></button>
    ${fromPlaylist && state.activePlaylistId ? `<button type="button" class="action-item danger" data-act="remove-from-pl">${ICONS.close(17)}<span>Odebrat z playlistu</span></button>` : ""}
    <button type="button" class="action-item" data-act="find-lyrics">${ICONS.search(17)}<span>Najít lyrics</span></button>
    <button type="button" class="action-item" data-act="edit">${ICONS.edit(17)}<span>Upravit písničku</span></button>
    <button type="button" class="action-item danger" data-act="delete">${ICONS.trash(17)}<span>Smazat z databáze</span></button>
  `;
  $("actionSheet").dataset.songId = songId;
  $("actionSheet").classList.add("open");
}

function closeActionSheet() {
  $("actionSheet").classList.remove("open");
}

// ===================== CRUD: SONGS, IMPORT, DUPLICATES, PLAYLISTS =====================
function normalizeDupText(str, stripNoise = false) {
  let s = String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (stripNoise) {
    s = s
      .replace(/[\(\[][^\)\]]*(official|lyric|audio|video|hd|4k|visualizer|remaster|explicit|clean|feat\.?|ft\.?)[^\)\]]*[\)\]]/gi, " ")
      .replace(/\s+(feat\.?|ft\.?)\s+.*$/i, " ");
  }
  return s.replace(/[^a-z0-9]+/g, " ").trim();
}

function findDuplicateSongs(title, artist) {
  const nt = normalizeDupText(title, true);
  const na = normalizeDupText(artist, false);
  if (!nt) return [];
  const matches = [];
  for (const s of state.songs) {
    const st = normalizeDupText(s.title, true);
    const sa = normalizeDupText(s.artist, false);
    if (!st) continue;
    const exactT = nt === st;
    const simT = !exactT && nt.length >= 4 && st.length >= 4 && (nt.includes(st) || st.includes(nt));
    const matchA = na && sa && (na === sa || na.includes(sa) || sa.includes(na));
    if (exactT && matchA) matches.push({ song: s, reason: "Stejný název i interpret", score: 3 });
    else if (exactT) matches.push({ song: s, reason: "Stejný název", score: 2 });
    else if (simT && (matchA || (!na && !sa))) matches.push({ song: s, reason: "Podobný název", score: 1 });
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, 6);
}

function confirmDuplicateModal(matches) {
  return new Promise((resolve) => {
    const modal = $("duplicateModal");
    $("duplicateList").innerHTML = matches.map(({ song, reason }) => `
      <div class="duplicate-item">
        <div class="duplicate-cover">${renderCoverHtml(song, 18)}</div>
        <div style="flex:1;min-width:0;">
          <div class="card-title ellipsis">${escapeHtml(song.title)}</div>
          <div class="card-artist ellipsis">${escapeHtml(song.artist || "Neznámý interpret")}</div>
        </div>
        <span class="duplicate-badge">${escapeHtml(reason)}</span>
      </div>`).join("");
    const done = (ok) => {
      modal.classList.remove("open");
      $("confirmDuplicateBtn").onclick = null;
      $("cancelDuplicateBtn").onclick = null;
      $("closeDuplicateBtn").onclick = null;
      resolve(ok);
    };
    $("confirmDuplicateBtn").onclick = () => done(true);
    $("cancelDuplicateBtn").onclick = () => done(false);
    $("closeDuplicateBtn").onclick = () => done(false);
    modal.classList.add("open");
  });
}

function cleanupStaging() {
  if (state.stagingToken && state.serverAvailable) {
    fetch(`/api/staging/${state.stagingToken}`, { method: "DELETE" }).catch(() => {});
  }
  state.stagingToken = null;
}

function openAddModal() {
  cleanupStaging();
  state.editingId = null;
  state.pendingAudioFile = null;
  state.pendingCoverFile = null;
  state.removeCoverFlag = false;
  $("modalTitle").textContent = "Přidat písničku";
  $("saveSongBtn").textContent = "Uložit písničku";
  $("songForm").reset();
  $("urlImportBox").style.display = "flex";
  $("importStatus").style.display = "none";
  $("audioFileLabel").textContent = "Vybrat audio soubor";
  $("coverFileLabel").textContent = "Vybrat cover obrázek";
  $("coverPreviewBox").innerHTML = ICONS.image(20);
  $("clearCoverBtn").style.display = "none";
  $("songModal").classList.add("open");
}

function openEditModal(id) {
  cleanupStaging();
  const song = getSongById(id);
  if (!song) return;
  state.editingId = id;
  state.pendingAudioFile = null;
  state.pendingCoverFile = null;
  state.removeCoverFlag = false;
  $("modalTitle").textContent = "Upravit písničku";
  $("saveSongBtn").textContent = "Uložit změny";
  $("urlImportBox").style.display = "none";
  $("titleInput").value = song.title || "";
  $("artistInput").value = song.artist || "";
  $("albumInput").value = song.album || "";
  $("lyricsInput").value = song.lyrics || "";
  $("audioFileLabel").textContent = song.audioFile ? "Audio nahrané (klepni pro výměnu)" : "Vybrat audio soubor";
  $("coverFileLabel").textContent = song.coverFile ? "Cover nahraný (klepni pro výměnu)" : "Vybrat cover obrázek";
  $("coverPreviewBox").innerHTML = song.coverFile
    ? `<img src="${escapeHtml(song.coverFile)}?v=${encodeURIComponent(song._ts || "")}" alt="" />`
    : ICONS.image(20);
  $("clearCoverBtn").style.display = song.coverFile ? "inline-flex" : "none";
  $("songModal").classList.add("open");
}

function closeSongModal() {
  cleanupStaging();
  $("songModal").classList.remove("open");
}

async function importFromUrl() {
  if (!state.serverAvailable) { showToast("Lokální server není dostupný.", true); return; }
  const url = $("importUrlInput").value.trim();
  if (!/^https?:\/\//i.test(url)) { showToast("Zadej platný odkaz (http/https).", true); return; }

  cleanupStaging();
  const btn = $("importUrlBtn"), st = $("importStatus");
  btn.disabled = true; btn.textContent = "Načítám...";
  st.style.display = "block"; st.style.color = "var(--text-secondary)";
  st.textContent = "Stahuji MP3 audio, čtvercový cover, metadata a lyrics...";
  try {
    const res = await fetch("/api/import-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Import se nezdařil");
    state.stagingToken = data.token || null;
    if (data.hasAudio) $("audioFileLabel").textContent = `${data.audioName || "audio.mp3"} (z odkazu)`;
    if (data.hasCover && data.coverPreviewUrl) {
      $("coverPreviewBox").innerHTML = `<img src="${escapeHtml(data.coverPreviewUrl)}" alt="" />`;
      $("coverFileLabel").textContent = "Cover načten z odkazu";
      $("clearCoverBtn").style.display = "inline-flex";
    }
    if (data.title) $("titleInput").value = data.title;
    if (data.artist) $("artistInput").value = data.artist;
    if (data.album) $("albumInput").value = data.album;
    if (data.lyrics) $("lyricsInput").value = data.lyrics;

    const dups = findDuplicateSongs(data.title || "", data.artist || "");
    if (!data.hasAudio) {
      st.style.color = "#fca5a5";
      st.textContent = "Pozor: Audio soubor se nepodařilo stáhnout. Zkus to znovu nebo vyber soubor z mobilu.";
    } else if (dups.length) {
      st.style.color = "#fde047";
      st.textContent = `Možný duplikát: „${dups[0].song.title}“ už v databázi je.`;
    } else {
      st.style.color = "#4ade80";
      st.textContent = "Audio, cover i metadata načteny. Klepni na Uložit písničku.";
    }
  } catch (err) {
    st.style.color = "#fca5a5";
    st.textContent = `Chyba: ${err.message || "Nepodařilo se načíst."}`;
  } finally {
    btn.disabled = false; btn.textContent = "Načíst";
  }
}

async function uploadBinary(url, file) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream", "X-Filename": encodeURIComponent(file.name) },
    body: file,
  });
  if (!res.ok) throw new Error("Chyba nahrávání souboru");
  return res.json();
}

async function saveSong(e) {
  e.preventDefault();
  if (!state.serverAvailable) { showToast("Lokální server není dostupný.", true); return; }
  const title = $("titleInput").value.trim();
  const artist = $("artistInput").value.trim();
  if (!title) { showToast("Zadej název písničky.", true); return; }

  if (!state.editingId && state.settings.checkDuplicates !== false) {
    const dups = findDuplicateSongs(title, artist);
    if (dups.length) {
      const ok = await confirmDuplicateModal(dups);
      if (!ok) return;
    }
  }

  const btn = $("saveSongBtn"), orig = btn.textContent;
  btn.disabled = true; btn.textContent = "Ukládám...";
  try {
    const payload = {
      title, artist, album: $("albumInput").value.trim(), lyrics: $("lyricsInput").value,
      stagingToken: !state.editingId ? state.stagingToken : null,
      useStagedAudio: !state.pendingAudioFile,
      useStagedCover: !state.pendingCoverFile && !state.removeCoverFlag,
    };
    const res = await fetch(state.editingId ? `/api/songs/${state.editingId}` : "/api/songs", {
      method: state.editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Nepodařilo se uložit písničku");
    let saved = await res.json();

    if (state.pendingAudioFile) saved = await uploadBinary(`/api/songs/${saved.id}/audio`, state.pendingAudioFile);
    if (state.pendingCoverFile) saved = await uploadBinary(`/api/songs/${saved.id}/cover`, state.pendingCoverFile);
    else if (state.removeCoverFlag && state.editingId) {
      const delC = await fetch(`/api/songs/${saved.id}/cover`, { method: "DELETE" });
      if (delC.ok) saved = await delC.json();
    }

    saved._ts = Date.now();
    const idx = state.songs.findIndex((s) => s.id === saved.id);
    if (idx >= 0) state.songs[idx] = saved;
    else state.songs.unshift(saved);

    state.stagingToken = null;
    closeSongModal();
    renderAllSongLists();
    renderPlayer();
    renderNowPlaying();
    showToast(state.editingId ? "Písnička aktualizována" : "Písnička uložena");
  } catch (err) {
    showToast(err.message || "Chyba při ukládání", true);
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
}

async function deleteSongById(id) {
  try {
    const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    state.songs = state.songs.filter((s) => s.id !== id);
    state.playlists.forEach((p) => { if (Array.isArray(p.songIds)) p.songIds = p.songIds.filter((x) => x !== id); });
    if (state.playingId === id) {
      audioEl.pause();
      audioEl.removeAttribute("src");
      state.playingId = null;
      notifyAndroidPlayback(false);
      closeNowPlaying();
    }
    closeConfirmSheet();
    renderAllSongLists();
    renderPlayer();
    showToast("Písnička smazána");
  } catch {
    showToast("Smazání se nezdařilo.", true);
  }
}

function openDeleteModal(id) {
  const song = getSongById(id);
  if (!song) return;
  if (!state.settings.confirmDelete) { deleteSongById(id); return; }
  openConfirmSheet({
    title: "Smazat písničku?",
    descHtml: `Opravdu smazat <strong style="color:var(--text-primary);">${escapeHtml(song.title)}</strong> včetně audia a coveru z úložiště?`,
    confirmLabel: "Smazat",
    onConfirm: () => deleteSongById(id),
  });
}

async function findLyricsForSong(songId) {
  const song = getSongById(songId);
  if (!song) return;
  if (!state.serverAvailable) { showToast("Vyžaduje připojení k internetu.", true); return; }
  showToast("Hledám lyrics...");
  try {
    const res = await fetch("/api/find-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: song.title, artist: song.artist || "", album: song.album || "", duration: state.playingId === song.id && isFinite(audioEl.duration) ? Math.round(audioEl.duration) : 0 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lyrics nebyly nalezeny.");
    const saveRes = await fetch(`/api/songs/${song.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics: data.lyrics }),
    });
    if (!saveRes.ok) throw new Error("Nepodařilo se uložit lyrics.");
    const updated = await saveRes.json();
    updated._ts = Date.now();
    const idx = state.songs.findIndex((s) => s.id === updated.id);
    if (idx >= 0) state.songs[idx] = updated;
    state.renderedLyricsKey = "";
    renderAllSongLists();
    renderLyricsView(updated, true);
    if (state.fsLyricsOpen) renderFsLyrics(true);
    showToast(data.synced ? `Nalezeny LRC lyrics (${data.source})` : `Nalezeny lyrics (${data.source})`);
  } catch (err) {
    showToast(err.message || "Lyrics nenalezeny", true);
  }
}

// Playlists CRUD
function openPlaylistModal(plId = null) {
  state.editingPlaylistId = plId;
  const pl = plId ? state.playlists.find((p) => p.id === plId) : null;
  $("playlistModalTitle").textContent = pl ? "Přejmenovat playlist" : "Nový playlist";
  $("playlistNameInput").value = pl ? pl.name : "";
  $("playlistModal").classList.add("open");
  setTimeout(() => $("playlistNameInput").focus(), 120);
}

async function savePlaylist(e) {
  e.preventDefault();
  const name = $("playlistNameInput").value.trim();
  if (!name) return;
  try {
    const res = await fetch(state.editingPlaylistId ? `/api/playlists/${state.editingPlaylistId}` : "/api/playlists", {
      method: state.editingPlaylistId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error();
    const saved = await res.json();
    const idx = state.playlists.findIndex((p) => p.id === saved.id);
    if (idx >= 0) state.playlists[idx] = saved;
    else state.playlists.unshift(saved);
    $("playlistModal").classList.remove("open");
    renderPlaylists();
    showToast(state.editingPlaylistId ? "Playlist přejmenován" : "Playlist vytvořen");
  } catch { showToast("Nepodařilo se uložit playlist.", true); }
}

function deleteActivePlaylist() {
  const pl = state.playlists.find((p) => p.id === state.activePlaylistId);
  if (!pl) return;
  openConfirmSheet({
    title: "Smazat playlist?",
    descHtml: `Opravdu smazat playlist <strong style="color:var(--text-primary);">${escapeHtml(pl.name)}</strong>? Písničky zůstanou uložené v knihovně.`,
    confirmLabel: "Smazat",
    onConfirm: async () => {
      try {
        const res = await fetch(`/api/playlists/${pl.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        state.playlists = state.playlists.filter((p) => p.id !== pl.id);
        closeConfirmSheet();
        closePlaylistDetail();
        renderPlaylists();
        showToast("Playlist smazán");
      } catch {
        showToast("Nepodařilo se smazat playlist.", true);
      }
    },
  });
}

async function toggleSongInPlaylist(plId, songId, include) {
  const pl = state.playlists.find((p) => p.id === plId);
  if (!pl) return;
  const set = new Set(pl.songIds || []);
  if (include) set.add(songId); else set.delete(songId);
  try {
    const res = await fetch(`/api/playlists/${plId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songIds: [...set] }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    const idx = state.playlists.findIndex((p) => p.id === updated.id);
    if (idx >= 0) state.playlists[idx] = updated;
    renderPlaylists();
    renderAddToPlaylistChecklist();
  } catch { showToast("Nepodařilo se upravit playlist.", true); }
}

async function moveSongInPlaylist(plId, songId, dir) {
  const pl = state.playlists.find((p) => p.id === plId);
  if (!pl || !Array.isArray(pl.songIds)) return;
  const idx = pl.songIds.indexOf(songId);
  const next = idx + (dir === "up" ? -1 : 1);
  if (idx < 0 || next < 0 || next >= pl.songIds.length) return;
  const ids = [...pl.songIds];
  [ids[idx], ids[next]] = [ids[next], ids[idx]];
  try {
    const res = await fetch(`/api/playlists/${plId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songIds: ids }),
    });
    if (res.ok) {
      const updated = await res.json();
      const pi = state.playlists.findIndex((p) => p.id === updated.id);
      if (pi >= 0) state.playlists[pi] = updated;
      renderPlaylists();
    }
  } catch {}
}

function openAddToPlaylistModal(songId) {
  const song = getSongById(songId);
  if (!song) return;
  state.addToPlaylistSongId = songId;
  $("addToPlSongName").textContent = song.title;
  $("quickNewPlaylistInput").value = "";
  renderAddToPlaylistChecklist();
  $("addToPlaylistModal").classList.add("open");
}

function renderAddToPlaylistChecklist() {
  const sid = state.addToPlaylistSongId;
  const el = $("playlistCheckList");
  if (!state.playlists.length) {
    el.innerHTML = `<div class="setting-desc">Zatím nemáš žádný playlist. Vytvoř první níže.</div>`;
    return;
  }
  el.innerHTML = state.playlists.map((pl) => {
    const has = Array.isArray(pl.songIds) && pl.songIds.includes(sid);
    return `<label class="pl-check-item"><input type="checkbox" data-pl-toggle="${escapeHtml(pl.id)}" ${has ? "checked" : ""} /><span style="flex:1;font-weight:600;">${escapeHtml(pl.name)}</span><span class="setting-desc">${(pl.songIds || []).length}</span></label>`;
  }).join("");
}

async function createQuickPlaylist() {
  const name = $("quickNewPlaylistInput").value.trim();
  if (!name) return;
  try {
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, songIds: state.addToPlaylistSongId ? [state.addToPlaylistSongId] : [] }),
    });
    if (!res.ok) throw new Error();
    const created = await res.json();
    state.playlists.unshift(created);
    $("quickNewPlaylistInput").value = "";
    renderPlaylists();
    renderAddToPlaylistChecklist();
    showToast(`Playlist „${name}“ vytvořen`);
  } catch { showToast("Nepodařilo se vytvořit playlist.", true); }
}

// ===================== SETTINGS PERSISTENCE & LIGHTWEIGHT MODE =====================
let saveSettingsTimer = null;
function pushSettingsToServer() {
  if (!state.serverAvailable) return;
  fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state.settings),
    keepalive: true,
  }).catch(() => {});
}

function saveSettings(immediate = false) {
  try { localStorage.setItem("songapp_mobile_settings", JSON.stringify(state.settings)); } catch {}
  if (!state.serverAvailable) return;
  clearTimeout(saveSettingsTimer);
  if (immediate) {
    pushSettingsToServer();
  } else {
    saveSettingsTimer = setTimeout(pushSettingsToServer, 180);
  }
}

function applyLyricsFontSize() {
  const sz = state.settings.lyricsFontSize || "md";
  document.body.classList.toggle("lyrics-sm", sz === "sm");
  document.body.classList.toggle("lyrics-lg", sz === "lg");
}

function applyLightweightMode() {
  const lw = Boolean(state.settings.lightweightMode);
  document.body.classList.toggle("lightweight", lw);
  // IMPORTANT: Reverb stays 100% enabled and active in Lightweight mode!

  if (lw) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    clearVisualizers();
    ["bgVisualizerCanvas", "npVisualizerCanvas", "fsVisualizerCanvas"].forEach(releaseCanvas);
    resetDefaultAccent();
    state.translationCache = {};
  } else {
    applyDynamicColor(getSongById(state.playingId || state.selectedId));
    if (!audioEl.paused && !state.isBackground) {
      ensureAudioGraph();
      startAnimationLoop();
    }
  }
  applyReverb();
  renderAllSongLists();
  renderPlayer();
  renderNowPlaying();
  if (state.fsLyricsOpen) renderFsLyrics(true);
  updateMediaSession();
}

function syncSettingsControls() {
  const s = state.settings;
  $("setLightweightMode").checked = Boolean(s.lightweightMode);
  $("setThemeModeLabel").textContent = optionLabel("themeMode", s.themeMode || "color-dynamic-dark");
  $("setVisualizerModeLabel").textContent = optionLabel("visualizerMode", s.visualizerMode || "background");
  $("setLyricsFontSizeLabel").textContent = optionLabel("lyricsFontSize", s.lyricsFontSize || "md");
  $("setDefaultVolume").value = Number(s.defaultVolume ?? 40);
  $("setDefaultVolLabel").textContent = `${Number(s.defaultVolume ?? 40)}%`;
  $("setSkipSecondsLabel").textContent = optionLabel("skipSeconds", String(Number(s.skipSeconds || 5)));
  $("setMediaSession").checked = Boolean(s.mediaSession);
  $("setRememberVolume").checked = Boolean(s.rememberVolume);
  $("setRememberAudioFx").checked = Boolean(s.rememberAudioFx);
  $("setRememberPlaybackModes").checked = Boolean(s.rememberPlaybackModes);
  $("setRememberPlaybackState").checked = Boolean(s.rememberPlaybackState);
  $("setAutoScrollLyrics").checked = Boolean(s.autoScrollLyrics);
  $("setDefaultTranslationModeLabel").textContent = optionLabel("defaultTranslationMode", s.defaultTranslationMode || "both");
  $("setCheckDuplicates").checked = s.checkDuplicates !== false;
  $("setConfirmDelete").checked = Boolean(s.confirmDelete);
  $("setGithubRepo").value = s.githubRepo || "";
  $("setGithubToken").value = s.githubToken || "";
  $("sortTriggerLabel").textContent = optionLabel("sortBy", s.sortBy || "newest");
  $("translateLangLabel").textContent = optionLabel("translateLang", state.selectedTranslateLang || "cs");
}

function applyInitialSettings() {
  const s = state.settings;
  const vol = Math.max(0, Math.min(100, Number((s.rememberVolume ? s.lastVolume : s.defaultVolume) ?? 40))) / 100;
  audioEl.volume = vol;
  audioEl.muted = vol === 0;
  syncVolumeUI(vol);

  state.pitchSemitones = s.rememberAudioFx ? Number(s.lastPitch || 0) : 0;
  state.reverbPercent = s.rememberAudioFx ? Number(s.lastReverb || 0) : 0;
  applyPitchRate();
  applyReverb();

  state.shuffle = s.rememberPlaybackModes ? Boolean(s.lastShuffle) : false;
  state.repeatMode = s.rememberPlaybackModes && ["off", "all", "one"].includes(s.lastRepeat) ? s.lastRepeat : "off";
  applyLyricsFontSize();
  syncSettingsControls();
  applyLightweightMode();
}

let lastSavedPosTs = 0;
function persistPlaybackPosition(force = false) {
  if (!state.settings.rememberPlaybackState || !state.playingId) return;
  const now = Date.now();
  if (!force && now - lastSavedPosTs < 3500) return;
  lastSavedPosTs = now;
  state.settings.lastSongId = state.playingId;
  state.settings.lastSongTime = Math.floor(audioEl.currentTime || 0);
  try { localStorage.setItem("songapp_mobile_settings", JSON.stringify(state.settings)); } catch {}
  if (force) saveSettings(true);
}

// ===================== LOAD INITIAL DATA =====================
async function loadAppData() {
  const localRaw = loadRawLocalSettings();
  try {
    const [songsRes, plRes, setRes] = await Promise.all([
      fetch("/api/songs"),
      fetch("/api/playlists").catch(() => null),
      fetch("/api/settings").catch(() => null),
    ]);
    if (!songsRes.ok) throw new Error();
    state.songs = await songsRes.json();
    state.playlists = plRes && plRes.ok ? await plRes.json() : [];
    state.serverAvailable = true;
    $("offlineBanner").style.display = "none";

    if (setRes && setRes.ok) {
      const serverSet = await setRes.json();
      if (serverSet && typeof serverSet === "object" && Object.keys(serverSet).length > 0) {
        // Server (settings.json + SharedPreferences) is authoritative so settings persist across restarts & APK updates!
        state.settings = { ...DEFAULT_SETTINGS, ...localRaw, ...serverSet };
        try { localStorage.setItem("songapp_mobile_settings", JSON.stringify(state.settings)); } catch {}
      } else {
        state.settings = { ...DEFAULT_SETTINGS, ...localRaw };
        if (Object.keys(localRaw).length > 0) saveSettings(true);
      }
    }
  } catch {
    state.serverAvailable = false;
    $("offlineBanner").style.display = "block";
    if ("caches" in window) {
      try {
        const c = await caches.open(OFFLINE_CACHE);
        const sR = await c.match("/api/songs");
        const pR = await c.match("/api/playlists");
        if (sR) state.songs = await sR.json();
        if (pR) state.playlists = await pR.json();
      } catch {}
    }
  }

  applyInitialSettings();
  renderAllSongLists();
  loadNetworkInfo();

  // Restore last song and position if enabled
  if (state.settings.rememberPlaybackState && state.settings.lastSongId) {
    const last = getSongById(state.settings.lastSongId);
    if (last && last.audioFile) {
      state.playingId = last.id;
      state.selectedId = last.id;
      audioEl.src = last.audioFile;
      audioEl.addEventListener("loadedmetadata", () => {
        const t = Number(state.settings.lastSongTime || 0);
        if (t > 0 && isFinite(audioEl.duration) && t < audioEl.duration - 1) {
          audioEl.currentTime = t;
        }
        updateSeekbarUI();
      }, { once: true });
      applyDynamicColor(last);
      renderPlayer();
      renderNowPlaying();
    }
  }

  // Smoothly dismiss launch animation once ready
  setTimeout(dismissLaunchSplash, 140);
}

// ===================== SMOOTH TOUCH SWIPE GESTURES =====================
// Mini-player horizontal swipe -> next / prev track
(function attachMiniPlayerSwipe() {
  const el = $("miniPlayer");
  let sx = 0, sy = 0;
  el.addEventListener("touchstart", (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) playAdjacent(1); else playAdjacent(-1);
    }
  }, { passive: true });
})();

// Now Playing interactive gestures:
// - Swipe down -> smoothly drag & minimize back to main library
// - Swipe right-to-left -> switch Player -> Lyrics -> FX
// - Swipe left-to-right -> switch FX -> Lyrics -> Player
(function attachNowPlayingGestures() {
  const sheet = $("nowPlayingSheet");
  const tabOrder = ["player", "lyrics", "fx"];
  let startX = 0, startY = 0, startTs = 0;
  let mode = null; // null | "ignore" | "vertical" | "horizontal"
  let currentDy = 0;

  function canDragDownFrom(target) {
    if (target.closest('input[type="range"], button, select, textarea')) return false;
    const scrollBox = target.closest(".lyrics-scroll, .np-fx-panel");
    if (scrollBox && scrollBox.scrollTop > 2) return false;
    return true;
  }

  sheet.addEventListener("touchstart", (e) => {
    if (!state.npOpen || e.touches.length !== 1) { mode = "ignore"; return; }
    if (e.target.closest('input[type="range"]')) { mode = "ignore"; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTs = performance.now();
    currentDy = 0;
    mode = null;
  }, { passive: true });

  sheet.addEventListener("touchmove", (e) => {
    if (mode === "ignore" || !state.npOpen || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    if (mode === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.15 && canDragDownFrom(e.target)) {
        mode = "vertical";
        sheet.classList.add("dragging");
      } else if (Math.abs(dx) > Math.abs(dy) * 1.25) {
        mode = "horizontal";
      } else {
        mode = "ignore";
        return;
      }
    }

    if (mode === "vertical") {
      currentDy = Math.max(0, dy);
      sheet.style.transform = `translateY(${currentDy}px)`;
      const fade = Math.max(0.45, 1 - currentDy / 540);
      sheet.style.opacity = String(fade);
    }
  }, { passive: true });

  function finishGesture(e) {
    if (mode === "vertical") {
      const dt = Math.max(1, performance.now() - startTs);
      const velocity = currentDy / dt;
      sheet.classList.remove("dragging");
      if (currentDy > 110 || (currentDy > 48 && velocity > 0.55)) {
        closeNowPlaying();
      } else {
        sheet.style.transform = "";
        sheet.style.opacity = "";
      }
    } else if (mode === "horizontal" && e.changedTouches && e.changedTouches[0]) {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        const curIdx = tabOrder.indexOf(state.npTab);
        if (dx < 0 && curIdx < tabOrder.length - 1) {
          setNpTab(tabOrder[curIdx + 1]);
        } else if (dx > 0 && curIdx > 0) {
          setNpTab(tabOrder[curIdx - 1]);
        }
      }
    }
    mode = null;
    currentDy = 0;
  }

  sheet.addEventListener("touchend", finishGesture, { passive: true });
  sheet.addEventListener("touchcancel", () => {
    sheet.classList.remove("dragging");
    sheet.style.transform = "";
    sheet.style.opacity = "";
    mode = null;
    currentDy = 0;
  }, { passive: true });
})();

// ===================== EVENT BINDINGS =====================
$("bottomNav").addEventListener("click", (e) => {
  const tab = e.target.closest(".nav-tab");
  if (tab) switchTab(tab.dataset.tab);
});

on("lwPill", "click", () => switchTab("Settings"));
["openSearchBtn", "openSearchBtnPl"].forEach((id) => on(id, "click", openSearchDrawer));
on("closeSearchBtn", "click", closeSearchDrawer);
["openMenuBtn", "openMenuBtnPl"].forEach((id) => on(id, "click", openMainMenu));
on("closeMainMenuBtn", "click", closeMainMenu);
on("mainMenuSheet", "click", (e) => { if (e.target === $("mainMenuSheet")) closeMainMenu(); });
on("mainMenuList", "click", (e) => {
  const btn = e.target.closest("[data-menu]");
  if (!btn) return;
  const act = btn.dataset.menu;
  closeMainMenu();
  if (act === "add-song") openAddModal();
  if (act === "import-playlist") openPlaylistImportSheet();
  if (act === "toggle-view") toggleLibraryViewMode();
  if (act === "shuffle-all") shuffleAllSongs();
  if (act === "patch-notes") openPatchNotes();
  if (act === "settings") switchTab("Settings");
});

function toggleLibraryViewMode() {
  state.settings.viewMode = (state.settings.viewMode || "grid") === "grid" ? "list" : "grid";
  saveSettings(true);
  renderLibrary();
}

function shuffleAllSongs() {
  state.playQueuePlaylistId = null;
  state.shuffle = true;
  if (state.settings.rememberPlaybackModes) { state.settings.lastShuffle = true; saveSettings(true); }
  playAdjacent(1);
  openNowPlaying("player");
}

on("viewToggleBtn", "click", toggleLibraryViewMode);
on("addSongBtn", "click", openAddModal);
on("shuffleAllBtn", "click", shuffleAllSongs);

// Custom In-App Select Triggers
on("sortTrigger", "click", () => {
  openCustomSelect("Řazení písniček", SELECT_OPTIONS.sortBy, state.settings.sortBy || "newest", (val) => {
    state.settings.sortBy = val;
    $("sortTriggerLabel").textContent = optionLabel("sortBy", val);
    saveSettings(true);
    renderAllSongLists();
  });
});

on("translateLangTrigger", "click", () => {
  openCustomSelect("Jazyk překladu", SELECT_OPTIONS.translateLang, state.selectedTranslateLang || "cs", (val) => {
    state.selectedTranslateLang = val;
    $("translateLangLabel").textContent = optionLabel("translateLang", val);
    const isCustom = val === "custom";
    $("customLangInput").style.display = isCustom ? "inline-block" : "none";
    if (isCustom) $("customLangInput").focus();
    const song = getSongById(state.playingId || state.selectedId);
    if (!song) return;
    const lang = getSelectedTranslateLang();
    const ck = lang ? getTranslationCacheKey(song, lang) : "";
    state.activeTranslationLang = lang && state.translationCache[ck] ? lang : null;
    renderLyricsView(song, true);
    if (state.fsLyricsOpen) renderFsLyrics(true);
  });
});

on("setThemeModeTrigger", "click", () => {
  openCustomSelect("Barevný režim", SELECT_OPTIONS.themeMode, state.settings.themeMode || "color-dynamic-dark", (val) => {
    state.settings.themeMode = val;
    state.settings.dynamicColor = val === "color-dynamic-dark";
    $("setThemeModeLabel").textContent = optionLabel("themeMode", val);
    applyDynamicColor(getSongById(state.playingId || state.selectedId));
    saveSettings(true);
  });
});

on("setVisualizerModeTrigger", "click", () => {
  openCustomSelect("Audio vizualizér", SELECT_OPTIONS.visualizerMode, state.settings.visualizerMode || "background", (val) => {
    state.settings.visualizerMode = val;
    $("setVisualizerModeLabel").textContent = optionLabel("visualizerMode", val);
    clearVisualizers();
    saveSettings(true);
  });
});

on("setLyricsFontSizeTrigger", "click", () => {
  openCustomSelect("Velikost písma lyrics", SELECT_OPTIONS.lyricsFontSize, state.settings.lyricsFontSize || "md", (val) => {
    state.settings.lyricsFontSize = val;
    $("setLyricsFontSizeLabel").textContent = optionLabel("lyricsFontSize", val);
    applyLyricsFontSize();
    saveSettings(true);
  });
});

on("setSkipSecondsTrigger", "click", () => {
  openCustomSelect("Posun vpřed / vzad", SELECT_OPTIONS.skipSeconds, String(state.settings.skipSeconds || 5), (val) => {
    state.settings.skipSeconds = Number(val) || 5;
    $("setSkipSecondsLabel").textContent = optionLabel("skipSeconds", val);
    saveSettings(true);
  });
});

on("setDefaultTranslationModeTrigger", "click", () => {
  openCustomSelect("Zobrazení po překladu", SELECT_OPTIONS.defaultTranslationMode, state.settings.defaultTranslationMode || "both", (val) => {
    state.settings.defaultTranslationMode = val;
    $("setDefaultTranslationModeLabel").textContent = optionLabel("defaultTranslationMode", val);
    saveSettings(true);
  });
});

on("closeCustomSelectBtn", "click", closeCustomSelect);
on("customSelectSheet", "click", (e) => {
  if (e.target === $("customSelectSheet")) { closeCustomSelect(); return; }
  const btn = e.target.closest("[data-select-val]");
  if (!btn) return;
  const val = btn.dataset.selectVal;
  const cb = customSelectCallback;
  closeCustomSelect();
  if (cb) cb(val);
});

// Song containers
function handleSongContainerClick(e, fromPlaylist = false) {
  const moveBtn = e.target.closest("[data-move]");
  if (moveBtn && state.activePlaylistId) {
    e.stopPropagation();
    moveSongInPlaylist(state.activePlaylistId, moveBtn.dataset.id, moveBtn.dataset.move);
    return;
  }
  const moreBtn = e.target.closest("[data-more-id]");
  if (moreBtn) { e.stopPropagation(); openSongActionSheet(moreBtn.dataset.moreId, fromPlaylist); return; }
  const playBtn = e.target.closest("[data-play-id]");
  if (playBtn) { e.stopPropagation(); togglePlaySong(playBtn.dataset.playId, fromPlaylist ? state.activePlaylistId : null); return; }
  const row = e.target.closest("[data-song-id]");
  if (row) {
    togglePlaySong(row.dataset.songId, fromPlaylist ? state.activePlaylistId : null);
    if (state.searchOpen) closeSearchDrawer();
    openNowPlaying("player");
  }
}

on("librarySongs", "click", (e) => handleSongContainerClick(e, false));
on("playlistSongsList", "click", (e) => handleSongContainerClick(e, true));
on("searchResults", "click", (e) => handleSongContainerClick(e, false));

// Playlists view & Playlist Import
on("newPlaylistBtn", "click", () => openPlaylistModal(null));
on("openPlaylistImportBtn", "click", openPlaylistImportSheet);
["closePlImportBtn", "cancelPlImportBtn"].forEach((id) => on(id, "click", closePlaylistImportSheet));
on("playlistImportSheet", "click", (e) => { if (e.target === $("playlistImportSheet")) closePlaylistImportSheet(); });
on("playlistImportForm", "submit", startPlaylistDownload);

on("backToPlaylistsBtn", "click", closePlaylistDetail);
on("plRenameBtn", "click", () => openPlaylistModal(state.activePlaylistId));
on("plDeleteBtn", "click", deleteActivePlaylist);
on("playPlaylistBtn", "click", () => {
  const songs = getPlaylistSongs(state.activePlaylistId).filter((s) => s.audioFile);
  if (!songs.length) { showToast("Playlist nemá žádné audio.", true); return; }
  state.playingId = null;
  togglePlaySong(songs[0].id, state.activePlaylistId);
  openNowPlaying("player");
});
on("shufflePlaylistBtn", "click", () => {
  state.playQueuePlaylistId = state.activePlaylistId;
  state.shuffle = true;
  playAdjacent(1);
  openNowPlaying("player");
});
on("playlistsList", "click", (e) => {
  const playPl = e.target.closest("[data-play-pl]");
  if (playPl) {
    e.stopPropagation();
    const songs = getPlaylistSongs(playPl.dataset.playPl).filter((s) => s.audioFile);
    if (!songs.length) { showToast("Playlist je prázdný.", true); return; }
    state.playingId = null;
    togglePlaySong(songs[0].id, playPl.dataset.playPl);
    return;
  }
  const card = e.target.closest("[data-open-pl]");
  if (card) openPlaylistDetail(card.dataset.openPl);
});

// Search drawer
on("searchInput", "input", (e) => { state.search = e.target.value; renderSearch(); });
on("clearSearchBtn", "click", () => { state.search = ""; $("searchInput").value = ""; renderSearch(); $("searchInput").focus(); });
on("searchFilterChips", "click", (e) => {
  const chip = e.target.closest("[data-filter]");
  if (!chip) return;
  state.searchFilter = chip.dataset.filter;
  $("searchFilterChips").querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
  renderSearch();
});

// Patch Notes
on("openPatchNotesBtn", "click", openPatchNotes);
on("closePatchNotesBtn", "click", () => $("patchNotesSheet").classList.remove("open"));
on("patchNotesSheet", "click", (e) => { if (e.target === $("patchNotesSheet")) $("patchNotesSheet").classList.remove("open"); });

// Mini-player & Now Playing Sheet
on("miniPlayerTap", "click", (e) => { if (!e.target.closest(".mini-controls")) openNowPlaying(); });
on("miniPlayBtn", "click", () => { if (state.playingId) { ensureAudioGraph(); audioEl.paused ? audioEl.play().catch(() => {}) : audioEl.pause(); } });
on("miniNextBtn", "click", () => playAdjacent(1));
["closeNpBtn", "npGrabHandle"].forEach((id) => on(id, "click", closeNowPlaying));
on("npMoreBtn", "click", () => { const id = state.playingId || state.selectedId; if (id) openSongActionSheet(id, false); });
on("npAddPlBtn", "click", () => { const id = state.playingId || state.selectedId; if (id) openAddToPlaylistModal(id); });
on("npTabs", "click", (e) => { const b = e.target.closest("[data-np-tab]"); if (b) setNpTab(b.dataset.npTab); });
on("npQuickFxBtn", "click", () => setNpTab("fx"));
on("queuePill", "click", () => setNpTab("fx"));
["openFsLyricsBtn", "npFsLyricsBtn2"].forEach((id) => on(id, "click", openFsLyrics));
on("exitFsLyricsBtn", "click", closeFsLyrics);

// Transport, FX, Seek, Volume
["playPauseBtn", "fsPlayPauseBtn"].forEach((id) => on(id, "click", () => { if (state.playingId) { ensureAudioGraph(); audioEl.paused ? audioEl.play().catch(() => {}) : audioEl.pause(); } }));
["prevBtn", "fsPrevBtn"].forEach((id) => on(id, "click", () => playAdjacent(-1)));
["nextBtn", "fsNextBtn"].forEach((id) => on(id, "click", () => playAdjacent(1)));
on("shuffleBtn", "click", () => {
  state.shuffle = !state.shuffle;
  if (state.settings.rememberPlaybackModes) { state.settings.lastShuffle = state.shuffle; saveSettings(true); }
  renderPlayer();
  showToast(state.shuffle ? "Shuffle zapnut (min. 25 bez opakování)" : "Shuffle vypnut");
});
on("repeatBtn", "click", () => {
  const order = ["off", "all", "one"];
  state.repeatMode = order[(order.indexOf(state.repeatMode) + 1) % 3];
  if (state.settings.rememberPlaybackModes) { state.settings.lastRepeat = state.repeatMode; saveSettings(true); }
  renderPlayer();
  showToast({ off: "Opakování vypnuto", all: "Opakování seznamu", one: "Opakování 1 písničky" }[state.repeatMode]);
});
["abLoopBtn", "abLoopBtnFx"].forEach((id) => on(id, "click", handleAbLoopClick));
["seekBar", "fsSeekBar"].forEach((id) => on(id, "input", (e) => {
  const pct = Number(e.target.value);
  setSeekProgress(pct);
  if (isFinite(audioEl.duration) && audioEl.duration > 0) {
    audioEl.currentTime = (pct / 100) * audioEl.duration;
    $("currentTime").textContent = formatTime(audioEl.currentTime);
    if (state.fsLyricsOpen) $("fsCurTime").textContent = formatTime(audioEl.currentTime);
  }
}));
["pitchBar", "fsPitchBar"].forEach((id) => on(id, "input", (e) => setPitch(e.target.value)));
["pitchResetBtn", "fsPitchResetBtn"].forEach((id) => on(id, "click", () => setPitch(0)));
["reverbBar", "fsReverbBar"].forEach((id) => on(id, "input", (e) => setReverb(e.target.value)));
["reverbResetBtn", "fsReverbResetBtn"].forEach((id) => on(id, "click", () => setReverb(0)));
["volumeBar", "fsVolumeBar"].forEach((id) => on(id, "input", (e) => {
  audioEl.volume = Number(e.target.value);
  audioEl.muted = audioEl.volume === 0;
  syncVolumeUI(audioEl.volume);
  if (state.settings.rememberVolume) { state.settings.lastVolume = Math.round(audioEl.volume * 100); saveSettings(); }
}));
["muteBtn", "fsMuteBtn"].forEach((id) => on(id, "click", () => { audioEl.muted = !audioEl.muted; syncVolumeUI(audioEl.muted ? 0 : audioEl.volume); }));
on("clearQueueBtn", "click", () => { state.upNextQueue = []; renderQueuePill(); renderUpNextList(); showToast("Fronta vyčištěna"); });
on("upNextList", "click", (e) => {
  const rm = e.target.closest("[data-remove-q]");
  if (rm) { state.upNextQueue.splice(Number(rm.dataset.removeQ), 1); renderQueuePill(); renderUpNextList(); }
});

// Lyrics & Translate & Sync
on("npFindLyricsBtn", "click", () => { const id = state.playingId || state.selectedId; if (id) findLyricsForSong(id); });
[["syncLyricsBtn", startSyncMode], ["syncStampBtn", stampNextSyncLine], ["syncUndoBtn", undoSyncLine], ["syncSaveBtn", saveSyncMode], ["syncCancelBtn", cancelSyncMode], ["translateBtn", translateCurrentLyrics]].forEach(([id, fn]) => on(id, "click", fn));
onEnter("customLangInput", translateCurrentLyrics);
on("translateModes", "click", (e) => {
  const b = e.target.closest("[data-tr-mode]");
  if (!b) return;
  state.translationMode = b.dataset.trMode;
  const song = getSongById(state.playingId || state.selectedId);
  if (song) renderLyricsView(song, true);
  if (state.fsLyricsOpen) renderFsLyrics(true);
});

function seekToLyricIndex(idx) {
  const song = getSongById(state.playingId || state.selectedId);
  if (!song || !song.audioFile || !state.parsedLyrics) return;
  const line = state.parsedLyrics.lines[idx];
  let targetTime = null;
  if (state.parsedLyrics.mode === "lrc" && line && line.time !== null) targetTime = line.time;
  else if (isFinite(audioEl.duration) && audioEl.duration > 0) {
    const auto = computeAutoTimes(state.parsedLyrics.lines, audioEl.duration);
    if (auto && auto[idx] !== undefined) targetTime = auto[idx];
  }
  if (targetTime !== null) {
    audioEl.currentTime = targetTime;
    if (audioEl.paused) audioEl.play().catch(() => {});
    updateSeekbarUI();
    updateActiveLyric(true);
  }
}

on("detailLyrics", "click", (e) => {
  const el = e.target.closest(".lyric-line");
  if (!el) return;
  const idx = Number(el.dataset.lyricIdx);
  if (state.syncMode) { state.syncCursor = idx; stampNextSyncLine(); return; }
  seekToLyricIndex(idx);
});
on("fsLyricsContent", "click", (e) => {
  const el = e.target.closest(".fs-lyric-line[data-fs-idx]");
  if (el) seekToLyricIndex(Number(el.dataset.fsIdx));
});

// Action Sheet & Modals
on("actionSheet", "click", (e) => {
  if (e.target === $("actionSheet")) { closeActionSheet(); return; }
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = $("actionSheet").dataset.songId;
  const act = btn.dataset.act;
  closeActionSheet();
  if (act === "play") { togglePlaySong(id); openNowPlaying("player"); }
  if (act === "upnext") enqueueUpNext(id);
  if (act === "add-to-pl") openAddToPlaylistModal(id);
  if (act === "remove-from-pl" && state.activePlaylistId) { toggleSongInPlaylist(state.activePlaylistId, id, false); showToast("Odebráno z playlistu"); }
  if (act === "find-lyrics") findLyricsForSong(id);
  if (act === "edit") openEditModal(id);
  if (act === "delete") openDeleteModal(id);
});

["closeModalBtn", "cancelModalBtn"].forEach((id) => on(id, "click", closeSongModal));
on("songModal", "click", (e) => { if (e.target === $("songModal")) closeSongModal(); });
on("songForm", "submit", saveSong);
on("importUrlBtn", "click", importFromUrl);
onEnter("importUrlInput", importFromUrl);
on("audioInput", "change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  state.pendingAudioFile = f;
  $("audioFileLabel").textContent = f.name;
  if (!$("titleInput").value.trim()) $("titleInput").value = f.name.replace(/\.[^/.]+$/, "");
});
on("coverInput", "change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  state.pendingCoverFile = f;
  state.removeCoverFlag = false;
  $("coverFileLabel").textContent = f.name;
  $("coverPreviewBox").innerHTML = `<img src="${URL.createObjectURL(f)}" alt="" />`;
  $("clearCoverBtn").style.display = "inline-flex";
});
on("clearCoverBtn", "click", () => {
  state.pendingCoverFile = null;
  state.removeCoverFlag = true;
  $("coverInput").value = "";
  $("coverFileLabel").textContent = "Cover bude odebrán";
  $("coverPreviewBox").innerHTML = ICONS.image(20);
  $("clearCoverBtn").style.display = "none";
});
on("lrcFileInput", "change", async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  $("lyricsInput").value = await f.text();
  showToast(`Načteno: ${f.name}`);
  e.target.value = "";
});
on("modalFindLyricsBtn", "click", async () => {
  const title = $("titleInput").value.trim();
  if (!title) { showToast("Nejprve zadej název písničky.", true); return; }
  const btn = $("modalFindLyricsBtn");
  btn.disabled = true; btn.textContent = "Hledám...";
  try {
    const res = await fetch("/api/find-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist: $("artistInput").value.trim(), album: $("albumInput").value.trim() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Nenalezeno");
    $("lyricsInput").value = data.lyrics;
    showToast(`Načteny lyrics (${data.source})`);
  } catch (err) { showToast(err.message || "Nenalezeno", true); }
  finally { btn.disabled = false; btn.textContent = "Najít"; }
});

["closeAddToPlBtn", "doneAddToPlBtn"].forEach((id) => on(id, "click", () => $("addToPlaylistModal").classList.remove("open")));
on("playlistCheckList", "change", (e) => {
  const cb = e.target.closest("[data-pl-toggle]");
  if (cb && state.addToPlaylistSongId) toggleSongInPlaylist(cb.dataset.plToggle, state.addToPlaylistSongId, cb.checked);
});
on("quickNewPlaylistBtn", "click", createQuickPlaylist);
onEnter("quickNewPlaylistInput", createQuickPlaylist);

["closePlaylistModalBtn", "cancelPlaylistModalBtn"].forEach((id) => on(id, "click", () => $("playlistModal").classList.remove("open")));
on("playlistForm", "submit", savePlaylist);

["closeDeleteBtn", "cancelDeleteBtn"].forEach((id) => on(id, "click", closeConfirmSheet));
on("confirmDeleteBtn", "click", () => { if (pendingConfirmAction) pendingConfirmAction(); });

["addToPlaylistModal", "playlistModal", "deleteModal"].forEach((id) => {
  on(id, "click", (e) => {
    if (e.target === $(id)) {
      if (id === "deleteModal") closeConfirmSheet();
      else $(id).classList.remove("open");
    }
  });
});

// Settings Tab Listeners (immediate persist so settings survive restarts & updates)
function bindSetting(id, key, { event = "change", parse = (el) => (el.type === "checkbox" ? el.checked : el.value), onUpdate, immediate = true } = {}) {
  on(id, event, (e) => {
    const val = parse(e.target);
    state.settings[key] = val;
    if (onUpdate) onUpdate(val);
    saveSettings(immediate);
  });
}

bindSetting("setLightweightMode", "lightweightMode", {
  onUpdate: (v) => {
    applyLightweightMode();
    showToast(v ? "Lightweight režim zapnut" : "Lightweight režim vypnut");
  },
});
bindSetting("setDefaultVolume", "defaultVolume", {
  event: "input",
  immediate: false,
  parse: (el) => Number(el.value),
  onUpdate: (v) => { $("setDefaultVolLabel").textContent = `${v}%`; },
});
bindSetting("setMediaSession", "mediaSession", { onUpdate: () => updateMediaSession() });
bindSetting("setRememberVolume", "rememberVolume", { onUpdate: () => { state.settings.lastVolume = Math.round(audioEl.volume * 100); } });
bindSetting("setRememberAudioFx", "rememberAudioFx", { onUpdate: () => { state.settings.lastPitch = state.pitchSemitones; state.settings.lastReverb = state.reverbPercent; } });
bindSetting("setRememberPlaybackModes", "rememberPlaybackModes", { onUpdate: () => { state.settings.lastShuffle = state.shuffle; state.settings.lastRepeat = state.repeatMode; } });
bindSetting("setRememberPlaybackState", "rememberPlaybackState");
bindSetting("setAutoScrollLyrics", "autoScrollLyrics");
bindSetting("setCheckDuplicates", "checkDuplicates");
bindSetting("setConfirmDelete", "confirmDelete");
bindSetting("setGithubRepo", "githubRepo", { event: "input", immediate: false, parse: (el) => el.value.trim() });
bindSetting("setGithubToken", "githubToken", { event: "input", immediate: false, parse: (el) => el.value.trim() });
on("checkUpdateBtn", "click", checkForUpdates);
on("installUpdateBtn", "click", triggerApkInstall);

// Audio Element Events
audioEl.addEventListener("play", () => {
  ensureAudioGraph();
  applyPitchRate();
  renderAllSongLists();
  renderPlayer();
  updateMediaSession();
  notifyAndroidPlayback(true);
  startAnimationLoop();
});
audioEl.addEventListener("pause", () => {
  persistPlaybackPosition(true);
  renderAllSongLists();
  renderPlayer();
  updateMediaSession();
  notifyAndroidPlayback(false);
});
audioEl.addEventListener("ended", () => { if (!state.syncMode) playAdjacent(1, true); });
audioEl.addEventListener("loadedmetadata", () => {
  applyPitchRate();
  updateSeekbarUI();
  renderAbLoop();
  updateActiveLyric(false);
  notifyAndroidPlayback(!audioEl.paused);
});
audioEl.addEventListener("seeked", () => {
  updateSeekbarUI();
  updateActiveLyric(true);
  notifyAndroidPlayback(!audioEl.paused);
});

let lastLwTick = 0;
audioEl.addEventListener("timeupdate", () => {
  enforceAbLoop();
  persistPlaybackPosition(false);
  if (document.hidden || state.isBackground) return;
  if (state.settings.lightweightMode) {
    const now = performance.now();
    if (now - lastLwTick < 900) return;
    lastLwTick = now;
  }
  updateSeekbarUI();
  updateActiveLyric(true);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.handleAndroidBackgroundState(true);
  } else {
    window.handleAndroidBackgroundState(false);
  }
});

window.addEventListener("beforeunload", () => {
  setAndroidKeepScreenOn(false);
  persistPlaybackPosition(true);
  saveSettings(true);
});

loadAppData();
