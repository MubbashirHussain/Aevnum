# APP_ARCHITECTURE.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## System Overview

Aether Downloader is a **Next.js 16 App Router** application paired with an **external Node.js backend**. The frontend acts as a thin orchestration layer: it accepts URLs from the user, calls the backend API to resolve CDN stream tokens, and then streams the media file directly from the backend to the user's browser.

No video data is ever stored on the frontend server. All media resolution happens transiently on the backend (hosted on Render.com).

---

## Architecture Layers

```mermaid
graph TD
    Browser["User Browser"]
    NextFE["Next.js 16 Frontend\n(App Router / Vercel)"]
    EdgeProxy["Edge API Route\n/app/api/video/route.js\n(Edge Runtime)"]
    NodeBE["Node.js Backend\n(Render.com)\nyt-dlp + ffmpeg"]
    CDN["Social Platform CDNs\n(Instagram / TikTok / YouTube / Facebook)"]

    Browser -->|"Paste URL → Analyze"| NextFE
    NextFE -->|"POST /api/download"| NodeBE
    NodeBE -->|"CDN resolution"| CDN
    NodeBE -->|"Video metadata + formats"| NextFE
    NextFE -->|"User selects format → Session"| NodeBE
    NodeBE -->|"sessionId + unlockAfter"| NextFE
    NextFE -->|"Ad shown for unlockAfter seconds"| Browser
    NextFE -->|"POST /api/download/unlock"| NodeBE
    NodeBE -->|"streamToken (5-min TTL)"| NextFE
    Browser -->|"GET /api/video?streamToken=..."| EdgeProxy
    EdgeProxy -->|"GET /api/download/stream/:token"| NodeBE
    NodeBE -->|"Chunked video stream"| EdgeProxy
    EdgeProxy -->|"Proxied stream (Range-aware)"| Browser
```

---

## Component Architecture

```mermaid
graph TD
    RootLayout["app/layout.tsx\n(AppProvider + AdsenseScript)"]
    HomePage["app/page.tsx\n(Home Page)"]
    NavBar["sections/nav-bar.tsx"]
    Hero["sections/hero-section.tsx"]
    DW["sections/downloader-wrapper.tsx\n(Main orchestrator — all state lives here)"]
    PGrid["sections/platform-grid.tsx"]
    SGuide["sections/step-guide.tsx"]
    FGrid["sections/feature-grid.tsx"]
    FAQ["sections/faq-accordion.tsx"]
    Footer["sections/footer.tsx"]

    RootLayout --> HomePage
    HomePage --> NavBar
    HomePage --> Hero
    HomePage --> DW
    HomePage --> PGrid
    HomePage --> SGuide
    HomePage --> FGrid
    HomePage --> FAQ
    HomePage --> Footer

    DW --> VideoDownloader["ui/video-downloader.tsx"]
    DW --> FormatSelector["ui/format-selector.tsx"]
    DW --> VideoPlayer["ui/video-player.tsx"]
    DW --> PlatformSelector["ui/platform-selector.tsx"]
    DW --> AdBanner["ui/ad-banner.tsx"]
    DW --> AdSenseSlot["ui/adsense-slot.tsx"]
    DW --> Notification["ui/notification.tsx"]
```

---

## State Architecture

```mermaid
graph LR
    AppContext["context/AppContext.tsx\n(theme, sticky ad visibility)"]
    ZustandStore["config/zustand/index.tsx\n(AdSense slot IDs)"]
    LocalState["downloader-wrapper.tsx\nlocal useState\n(videoUrl, parsedVideo,\nstreamToken, history...)"]
    LocalStorage["localStorage\nvdl_theme, up,\nvdl_premium_history"]

    AppContext -->|"useTheme()"| NavBar2["NavBar, Footer, ThemeToggle"]
    AppContext -->|"useBottomAd()"| DW2["DownloaderWrapper, Footer"]
    ZustandStore -->|"useAdConfig()"| DW3["DownloaderWrapper"]
    LocalState -->|"renders"| DW4["All downloader UI"]
    LocalStorage <-->|"read/write"| AppContext
    LocalStorage <-->|"read/write"| LocalState
```

---

## Data Flow Summary

### Analyze Flow
1. User pastes URL → `handleUrlChange` detects platform
2. Form submit → `handleAnalyze` → `analyzeUrl()` in `lib/api.ts`
3. `POST /api/download` → backend returns metadata + formats
4. `parsedVideo` state set → `FormatSelector` renders

### Session/Unlock Flow
1. User clicks "Save" on a format → `handleStartSession`
2. `POST /api/download/session` → returns `{ sessionId, unlockAfter }`
3. Countdown timer starts; ad is shown simultaneously
4. After `unlockAfter` seconds → `POST /api/download/unlock`
5. If locked, response contains `{ unlocked: false, unlockAfter }` → retry
6. If unlocked → `{ streamToken }` is set in state

### Stream/Download Flow
1. `streamToken` in state → `VideoPlayer` renders
2. "Open in New Tab" → opens `/api/video?streamToken=...`
3. "Download" → fetches `/api/video?streamToken=...&download=1`
4. Edge route proxies request to backend stream endpoint
5. Bytes streamed to browser → `Blob` created → anchor tag clicked

---

## Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| Stateless media | Backend resolves CDN URLs on-demand; no file storage |
| Privacy-first | No server-side user profiles; history lives in browser |
| Ad-monetized unlock | Session gate enforces ad view before token release |
| Edge proxying | `/app/api/video/route.js` on edge for low-latency streaming |
| No login required | Fully anonymous, no authentication layer |

---

## External Dependencies

| Service | Purpose | Config |
|---------|---------|--------|
| Render.com (Node.js) | Backend API host | `NEXT_PUBLIC_BACKEND_PUBLIC_API_URL` |
| Google AdSense | Ad revenue | `NEXT_PUBLIC_ADSENSE_CLIENT_ID` |
| Vercel (assumed) | Frontend deploy | N/A |

*Related files: [`app/layout.tsx`](../app/layout.tsx), [`app/page.tsx`](../app/page.tsx), [`context/AppContext.tsx`](../context/AppContext.tsx), [`config/zustand/index.tsx`](../config/zustand/index.tsx), [`lib/api.ts`](../lib/api.ts)*
