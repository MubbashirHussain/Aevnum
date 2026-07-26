# APPLICATION_FLOW.md — Aevnum

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Project Purpose

Aevnum is a **free social media video downloader**. Its business model is ad-supported: users get unlimited downloads in exchange for viewing an interstitial advertisement for a fixed countdown period before each download is granted. The frontend never exposes raw CDN URLs — all media access is gated through short-lived `streamToken`s issued by the backend.

---

## Complete User Journey

```mermaid
journey
    title Aevnum — Full User Journey
    section Arrival
      Open site: 5: User
      See hero + downloader: 5: User
    section Analysis
      Paste video URL: 5: User
      Platform auto-detected: 5: App
      Submit form: 5: User
      Loading state shown: 5: App
      Formats returned: 5: App
    section Format Selection
      FormatSelector appears: 5: App
      User picks resolution: 5: User
      Session starts: 5: App
    section Ad Gate
      Countdown begins: 5: App
      User views ad: 5: User
      Unlock called: 5: App
      StreamToken granted: 5: App
    section Download
      VideoPlayer appears: 5: App
      User opens or downloads: 5: User
      File saved to device: 5: User
```

---

## Application Flow (Full Detail)

### 1. Page Load Flow

```mermaid
sequenceDiagram
    participant Browser
    participant RootLayout
    participant AppProvider
    participant AdsenseScript

    Browser->>RootLayout: Page request
    RootLayout->>AdsenseScript: Load AdSense JS (afterInteractive)
    RootLayout->>AppProvider: Mount context provider
    AppProvider->>Browser: Read localStorage("up") + localStorage("vdl_theme")
    AppProvider->>Browser: Apply dark class to <html> if needed
    AppProvider-->>RootLayout: Children rendered
```

**Key files**: [`app/layout.tsx`](../app/layout.tsx), [`context/AppContext.tsx`](../context/AppContext.tsx), [`components/ui/ad-Script.tsx`](../components/ui/ad-Script.tsx)

---

### 2. URL Analysis Flow

```mermaid
sequenceDiagram
    participant User
    participant VideoDownloader
    participant DownloaderWrapper
    participant API as lib/api.ts
    participant Backend

    User->>VideoDownloader: Paste URL into input
    VideoDownloader->>DownloaderWrapper: onUrlChange (detects platform)
    User->>VideoDownloader: Submit form
    VideoDownloader->>DownloaderWrapper: onAnalyze
    DownloaderWrapper->>DownloaderWrapper: setIsLoading(true), setProgress(15)
    DownloaderWrapper->>API: analyzeUrl(videoUrl)
    API->>Backend: POST /api/download { url }
    Backend-->>API: { data: { platform, id, title, thumbnail, duration, author, formats[] } }
    API-->>DownloaderWrapper: SafeVideoMetadata
    DownloaderWrapper->>DownloaderWrapper: setProgress(100), setParsedVideo(...)
    DownloaderWrapper-->>User: FormatSelector renders
```

**Platform detection logic** (in `DownloaderWrapper`):
- URL contains `instagram.com` → `instagram`
- URL contains `tiktok.com` → `tiktok`
- URL contains `youtube.com` or `youtu.be` → `youtube`
- URL contains `facebook.com` or `fb.watch` → `facebook`
- Fallback: fuzzy keyword match (`insta`, `tik`/`tok`, `you`/`yt`, `face`/`fb`)

---

### 3. Session Flow (Ad Gate)

```mermaid
sequenceDiagram
    participant User
    participant FormatSelector
    participant DownloaderWrapper
    participant API as lib/api.ts
    participant Backend

    User->>FormatSelector: Click "Save" on format
    FormatSelector->>DownloaderWrapper: onDownload(format, formatId, isAudioAvailable)
    DownloaderWrapper->>API: startSession(videoUrl, formatId)
    API->>Backend: POST /api/download/session { url, formatId }
    Backend-->>API: { sessionId, unlockAfter }
    DownloaderWrapper->>DownloaderWrapper: setUnlockCountdown(unlockAfter)
    DownloaderWrapper->>DownloaderWrapper: Start 1s countdown interval
    note over DownloaderWrapper: Button shows "5s", "4s", "3s"... countdown
    DownloaderWrapper->>DownloaderWrapper: setTimeout(pollUnlock, unlockAfter * 1000)
```

---

### 4. Unlock Flow (Poll Until Token)

```mermaid
sequenceDiagram
    participant DownloaderWrapper
    participant API as lib/api.ts
    participant Backend

    DownloaderWrapper->>API: unlockSession(sessionId)
    API->>Backend: POST /api/download/unlock { sessionId }
    alt Still locked
        Backend-->>API: { unlocked: false, unlockAfter: N }
        API-->>DownloaderWrapper: { unlocked: false, unlockAfter }
        DownloaderWrapper->>DownloaderWrapper: setTimeout(pollUnlock, N * 1000)
    else Unlocked
        Backend-->>API: { streamToken, selectedFormat }
        API-->>DownloaderWrapper: UnlockData
        DownloaderWrapper->>DownloaderWrapper: setStreamToken(streamToken)
        DownloaderWrapper-->>User: VideoPlayer renders
    end
```

**Important**: The backend returns `{ unlocked: false, unlockAfter }` when the timer hasn't expired yet. The frontend polls recursively with the server-provided wait time. This handles clock drift between client and server.

---

### 5. Download Flow

```mermaid
sequenceDiagram
    participant User
    participant VideoPlayer
    participant DownloaderWrapper
    participant EdgeProxy as /api/video (Edge Route)
    participant Backend

    User->>VideoPlayer: Click "Download Video"
    VideoPlayer->>DownloaderWrapper: onDownload()
    DownloaderWrapper->>DownloaderWrapper: setIsDownloadingStream(true)
    DownloaderWrapper->>EdgeProxy: fetch /api/video?streamToken=...&download=1
    EdgeProxy->>Backend: GET /api/download/stream/:token?download=1
    Backend-->>EdgeProxy: Chunked video stream (Content-Type, Content-Length)
    EdgeProxy-->>DownloaderWrapper: Proxied response stream
    loop Read chunks
        DownloaderWrapper->>DownloaderWrapper: setStreamProgress({ total, downloaded })
    end
    DownloaderWrapper->>DownloaderWrapper: new Blob(chunks) → createObjectURL
    DownloaderWrapper->>Browser: Trigger anchor click (download)
    DownloaderWrapper->>DownloaderWrapper: Update downloadHistory + localStorage
    DownloaderWrapper->>DownloaderWrapper: triggerNotification("Download complete!")
```

---

### 6. Stream (Preview) Flow

The "Open in New Tab" button opens:
```
/api/video?streamToken=<token>
```
without `&download=1`. The Edge route sets `Content-Disposition: inline`, and the browser's native video player or OS handler takes over.

---

### 7. Error Flow

```mermaid
flowchart TD
    A[User action triggers API call] --> B{API call succeeds?}
    B -- No --> C{Error type?}
    C -- Network / unknown --> D[setErrorMessage from error.message]
    C -- Backend structured error --> E["setErrorMessage from err.errors[0].message"]
    C -- Download stream fails --> F[setDownloadError from error.message]
    D --> G[ErrorMessage rendered in VideoDownloader input card]
    E --> G
    F --> H[Error state in VideoPlayer with Retry button]
    H -->|"onRetryDownload"| A
```

---

### 8. Loading Flow

| Component | Loading state | UI representation |
|-----------|--------------|-------------------|
| `VideoDownloader` | `isLoading = true` | Spinner on submit button + progress bar (0→100%) |
| `FormatSelector` button | `loadingFormatId = formatId` | Spinner + countdown seconds (`5s`, `4s`...) |
| `VideoPlayer` | `isDownloading = true, !streamProgress` | "Starting download..." spinner panel |
| `VideoPlayer` | `isDownloading = true, streamProgress` | Green progress bar with bytes/percentage |

---

### 9. History Flow

```mermaid
flowchart LR
    DL[Download complete] --> AddEntry[Create DownloadHistoryItem]
    AddEntry --> Dedup["Dedup by URL (findIndex)"]
    Dedup --> Slice["Slice to max 6 entries"]
    Slice --> SetState[setDownloadHistory]
    Slice --> LS["localStorage.setItem('vdl_premium_history')"]
    LS -.->|"on page load (future)"| Restore["⚠️ Not currently restored on mount"]
```

> ⚠️ **Needs Verification**: The download history is written to `localStorage` (`vdl_premium_history`) on every download, but is **not restored from localStorage on page load**. The state starts empty on each session. This is likely intentional (session-only history) or a pending feature.

---

### 10. Cookie / Storage Flow

```mermaid
flowchart TD
    Mount[AppProvider mounts] --> ReadUP["Read localStorage('up')"]
    ReadUP -- "not set" --> ReadDevice["window.matchMedia('prefers-color-scheme')"]
    ReadUP -- "set to '1'" --> ReadTheme["Read localStorage('vdl_theme')"]
    ReadDevice --> ApplyTheme[setTheme(dark or light)]
    ReadTheme --> ApplyTheme
    ApplyTheme --> ClassSync["useEffect: toggle 'dark' class on html element"]

    Toggle[User clicks ThemeToggle] --> ToggleFn[toggleTheme()]
    ToggleFn --> WriteUP["localStorage.setItem('up', '1')"]
    ToggleFn --> WriteTheme["localStorage.setItem('vdl_theme', nextTheme)"]
    ToggleFn --> ClassSync
```

| Key | Type | Value | Purpose |
|-----|------|-------|---------|
| `up` | localStorage | `"1"` | Whether user has explicitly chosen a theme |
| `vdl_theme` | localStorage | `"light"` or `"dark"` | Stored theme preference |
| `vdl_premium_history` | localStorage | JSON array | Recent download history |
| `aether_resume_downloads` | localStorage | JSON array | Resume entries (from `download-manager.ts`) |

---

### 11. Theme Flow

```mermaid
stateDiagram-v2
    [*] --> CheckPreference: App mounts
    CheckPreference --> SystemDefault: No 'up' key in localStorage
    CheckPreference --> Saved: 'up' = '1' and 'vdl_theme' set
    SystemDefault --> Light: prefers-color-scheme = light
    SystemDefault --> Dark: prefers-color-scheme = dark
    Saved --> Light: vdl_theme = 'light'
    Saved --> Dark: vdl_theme = 'dark'
    Light --> Dark: toggleTheme()
    Dark --> Light: toggleTheme()
    Light --> [*]: html.class = '' (no dark)
    Dark --> [*]: html.class = 'dark'
```

---

### 12. Ad Flow

The ad system operates on three layers simultaneously:

1. **Header banner** (Leaderboard): `AdBanner` → `AdSenseSlot` at the top of the downloader section, always visible.
2. **Sidebar ad**: `AdSenseSlot` in the 4-column sidebar, always visible when `parsedVideo = null`.
3. **Sticky bottom anchor**: Fixed bar at `bottom-0`. Dismissible by user. Controls via `useBottomAd()` context hook. Footer adds `mb-20` padding when visible.

**Ad script injection**: Two mechanisms exist (the second duplicates the first):
- `app/layout.tsx` → `AdsenseScript` component (via `next/script` with `afterInteractive`)
- `downloader-wrapper.tsx` → Manual `document.createElement('script')` on mount

> ⚠️ The double AdSense script injection is a potential issue: the manual script in `DownloaderWrapper` removes any existing `pagead2.googlesyndication.com` script and re-adds it whenever `adsenseClientId` changes. This could cause ad reloads.

---

### 13. API Request Lifecycle

```mermaid
sequenceDiagram
    participant Caller
    participant fetchAPI as lib/api.ts fetchAPI()
    participant Backend

    Caller->>fetchAPI: fetchAPI(url, options)
    fetchAPI->>fetchAPI: Check API_BASE env var
    alt API_BASE missing
        fetchAPI-->>Caller: throw Error("Missing NEXT_PUBLIC_BACKEND_PUBLIC_API_URL")
    end
    fetchAPI->>Backend: fetch(API_BASE + url, { Content-Type: application/json, ...options })
    Backend-->>fetchAPI: Response
    fetchAPI-->>Caller: Raw Response object
    note over Caller: Caller checks res.ok and parses JSON
```

All API calls go through `fetchAPI()` which:
- Validates `NEXT_PUBLIC_BACKEND_PUBLIC_API_URL` is set
- Sets `Content-Type: application/json` automatically
- Returns the raw `Response` (callers handle `.ok` checks and `.json()` parsing)

---

### 14. State Transitions (DownloaderWrapper)

```mermaid
stateDiagram-v2
    [*] --> Idle: Page loads
    Idle --> Analyzing: handleAnalyze() called
    Analyzing --> Error: API error / network fail
    Analyzing --> FormatSelection: parsedVideo set
    Error --> Idle: User clears input / retries
    FormatSelection --> Locking: handleStartSession() called
    Locking --> Countdown: session returned
    Countdown --> Unlocking: unlockAfter expires
    Unlocking --> Countdown: still locked (retry)
    Unlocking --> Ready: streamToken set
    Ready --> Downloading: handleDownload() called
    Downloading --> Complete: Blob downloaded
    Downloading --> DownloadError: Error during fetch/stream
    DownloadError --> Downloading: onRetryDownload() called
    Complete --> FormatSelection: Another format (parsedVideo still set)
    Complete --> Idle: User clears URL
```

*Related files: [`components/sections/downloader-wrapper.tsx`](../components/sections/downloader-wrapper.tsx), [`lib/api.ts`](../lib/api.ts), [`context/AppContext.tsx`](../context/AppContext.tsx)*
