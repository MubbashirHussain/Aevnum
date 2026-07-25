# FILE_STRUCTURE.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Complete Project Tree

```
client/
├── .env                                    # Environment variables (not committed)
├── .gitignore
├── AGENTS.md                               # AI agent rules (Next.js version notice)
├── CLAUDE.md                               # Claude AI agent config (minimal)
├── README.md                               # Minimal project readme
├── eslint.config.mjs                       # ESLint configuration
├── next.config.ts                          # Next.js config (currently empty options)
├── next-env.d.ts                           # Next.js TypeScript ambient declarations
├── package.json                            # Dependencies and scripts
├── postcss.config.mjs                      # PostCSS config (Tailwind v4)
├── tsconfig.json                           # TypeScript compiler config
│
├── app/                                    # Next.js App Router root
│   ├── layout.tsx                          # Root layout (AppProvider + AdsenseScript + JSON-LD)
│   ├── page.tsx                            # Home page (/)
│   ├── globals.css                         # Global CSS (Tailwind import + custom animations)
│   ├── constant.ts                         # [EMPTY] Reserved for app-level constants
│   ├── favicon.ico                         # Static favicon
│   ├── apple-icon.png                      # Static Apple touch icon
│   ├── icon.svg                            # Static SVG icon
│   ├── robots.ts                           # robots.txt generator (disallow /api/)
│   ├── sitemap.ts                          # Sitemap generator
│   ├── api/
│   │   └── video/
│   │       └── route.js                    # Edge proxy: /api/video?streamToken=...
│   ├── contact/
│   │   ├── layout.tsx                      # Contact page metadata
│   │   └── page.tsx                        # Contact form page (/contact)
│   ├── cookies/
│   │   └── page.tsx                        # Cookie Policy page (/cookies)
│   ├── privacy/
│   │   └── page.tsx                        # Privacy Policy page (/privacy)
│   ├── terms/
│   │   └── page.tsx                        # Terms of Service page (/terms)
│   └── terms-and-conditions/
│       └── page.tsx                        # Legacy/duplicate Terms page (/terms-and-conditions)
│
├── components/
│   ├── sections/                           # Full-page layout section components
│   │   ├── downloader-wrapper.tsx          # Main orchestrator — all download state
│   │   ├── faq-accordion.tsx               # Interactive FAQ with accordion animation
│   │   ├── feature-grid.tsx                # 4-feature highlight grid
│   │   ├── footer.tsx                      # Site footer (legal links, copyright, logo)
│   │   ├── hero-section.tsx                # Landing hero (title, subtitle, badge)
│   │   ├── nav-bar.tsx                     # Sticky top navigation bar (logo)
│   │   ├── platform-grid.tsx               # Platform compatibility 2x2 grid
│   │   └── step-guide.tsx                  # 3-step how-to guide
│   │
│   ├── seo/                                # SEO utilities
│   │   └── json-ld.tsx                     # JSON-LD structured data components
│   │
│   └── ui/                                 # Reusable atomic UI components
│       ├── index.ts                        # Barrel export of all UI components
│       ├── ad-Script.tsx                   # AdSense <script> loader (via next/script)
│       ├── ad-banner.tsx                   # Top leaderboard AdSense banner
│       ├── ad-inspector.tsx                # Dev tool: Ad Revenue Control Hub panel
│       ├── adsense-slot.tsx                # <ins> AdSense slot renderer
│       ├── button.tsx                      # Base Button component (variant + size)
│       ├── download-history.tsx            # Local download history display
│       ├── faq-section.tsx                 # Static FAQ display (used in older flow)
│       ├── format-selector.tsx             # Video format/quality selection panel
│       ├── how-to-use-section.tsx          # 3-step guide component (alternate)
│       ├── interstitial-ad.tsx             # Full-screen interstitial ad modal
│       ├── notification.tsx                # Toast notification (top-right)
│       ├── platform-selector.tsx           # Platform quick-filter buttons
│       ├── theme-toggle.tsx                # Moon/Sun theme toggle button
│       ├── video-downloader.tsx            # URL input + analyze form + progress bar
│       ├── video-player.tsx                # Stream token player + download progress
│       ├── Footer/
│       │   └── index.tsx                   # Alternate Footer (accepts isDark prop)
│       └── LegalLayout/
│           └── index.tsx                   # Wrapper for all legal/info pages
│
├── config/
│   ├── seo.ts                              # Shared SEO constants (SITE_NAME, SITE_URL, OG_IMAGE)
│   └── zustand/
│       └── index.tsx                       # Zustand store: AdSense slot IDs
│
├── context/
│   ├── AppContext.tsx                       # Theme + sticky ad Context + hooks
│   └── stickeyAds.tsx                      # [EMPTY] Reserved/placeholder file
│
├── lib/
│   ├── api.ts                              # HTTP client: analyzeUrl, startSession, unlock, stream
│   ├── constants.ts                        # PLATFORMS array, FAQS, ADSENSE_CODE_TEMPLATES
│   ├── download-manager.ts                 # Alternative download flow: SSE, resume, chunked
│   └── utils.ts                            # cn() utility: clsx + tailwind-merge
│
├── docs/                                   # Project documentation (this folder)
│   ├── README.md
│   ├── APP_ARCHITECTURE.md
│   ├── APPLICATION_FLOW.md
│   ├── BACKEND_INTEGRATION.md
│   ├── FILE_STRUCTURE.md
│   ├── UI_DESIGN_SYSTEM.md
│   ├── COMPONENTS.md
│   ├── ROUTES.md
│   ├── SEO.md
│   ├── DEPLOYMENT.md
│   ├── ENVIRONMENT.md
│   ├── STATE_MANAGEMENT.md
│   ├── CONTRIBUTING.md
│   └── frond_end-guide.md                  # Original backend integration guide
│
└── public/
    ├── ads.txt                             # AdSense publisher verification
    ├── favicon.ico                         # Static favicon
    ├── apple-icon.png                      # Apple touch icon
    ├── icon-192.png                        # PWA icon (192×192)
    ├── icon-512.png                        # PWA icon (512×512)
    ├── icon.svg                            # SVG icon
    └── images/
        ├── logo.svg                        # Full logo (light fill)
        ├── logo-dark.svg                   # Full logo (dark fill)
        ├── logo-icon.svg                   # Compact logo mark (light fill)
        ├── og-image.png                    # Open Graph preview image (1200×630)
        └── twitter-image.png               # Twitter card preview image
```

---

## Folder Explanations

### `app/`
**Purpose**: Next.js 16 App Router root. Contains all page routes and the single API route.  
**Responsibility**: Routing, page-level metadata (`export const metadata`), root layout.  
**Dependencies**: `components/`, `context/`, `lib/`  
**Used by**: Next.js framework  

### `app/api/video/`
**Purpose**: The **only** Next.js API route in the project. Acts as an edge-runtime streaming proxy.  
**Responsibility**: Takes `?streamToken=` from browser, fetches from backend, re-streams with correct headers.  
**Important**: Runs on Edge Runtime (`export const runtime = "edge"`). Handles HTTP `Range` headers for video seeking.

### `components/sections/`
**Purpose**: Large, self-contained page sections used directly in `app/page.tsx`.  
**Responsibility**: Layout, section-level state, composition of UI primitives.  
**Dependencies**: `components/ui/`, `lib/`, `context/`, `config/zustand/`

### `components/ui/`
**Purpose**: Atomic, reusable UI primitives.  
**Responsibility**: Presentation only — no business logic. Receive props, render UI.  
**Exported via**: `components/ui/index.ts` barrel

### `config/zustand/`
**Purpose**: Global Zustand store for cross-component shared state not suitable for Context.  
**Responsibility**: Stores AdSense client ID and slot IDs, initialized from env vars.  
**Used by**: `components/sections/downloader-wrapper.tsx`

### `context/`
**Purpose**: React Context for app-wide state.  
**Responsibility**: Theme management and sticky bottom ad visibility.  
**Used by**: NavBar, Footer, DownloaderWrapper

### `lib/`
**Purpose**: Non-component business logic, API calls, utilities.  
**Responsibility**: All HTTP communication with the backend; download orchestration; constants.

### `public/`
**Purpose**: Statically served files.  
**Responsibility**: `ads.txt` for AdSense verification; favicon, icons, logos, OG/Twitter images.

---

## Key File Explanations

### `app/layout.tsx`
- **Purpose**: Root HTML shell — wraps entire app.
- **Responsibilities**: Mounts `AppProvider`, injects AdSense `<Script>` in `<head>`.
- **Exports**: Default `RootLayout` component.
- **Note**: Metadata here is minimal placeholder (`"Create Next App"`) — overridden per-page.

### `app/page.tsx`
- **Purpose**: Home page route (`/`).
- **Responsibilities**: Composes all section components in order. Sets page-level metadata.
- **Metadata**: `title: "Aether Downloader | Free Social Media Video Downloader"`.
- **Exports**: Default `App` component.

### `app/api/video/route.js`
- **Purpose**: Edge streaming proxy.
- **Responsibilities**: Validate `streamToken`, proxy request to backend, re-emit headers.
- **Runtime**: Edge (`export const runtime = "edge"`).
- **Exports**: `GET` handler.

### `components/sections/downloader-wrapper.tsx`
- **Purpose**: The core of the application — the main download orchestrator.
- **Responsibilities**: Owns all download-related state (URL, loading, formats, session, stream token, history, ads, notifications). Coordinates `VideoDownloader`, `FormatSelector`, `VideoPlayer`, `PlatformSelector`, `AdBanner`, `AdSenseSlot`, `Notification`.
- **State**: ~15 `useState` hooks.
- **Exports**: Default `DownloaderWrapper` component.

### `lib/api.ts`
- **Purpose**: HTTP client for all backend calls.
- **Responsibilities**: `fetchAPI` wrapper, `analyzeUrl`, `startSession`, `unlockSession`, `getStreamUrl`, `downloadFormat`.
- **Exports**: All named exports; `UnlockData` interface.

### `lib/download-manager.ts`
- **Purpose**: Alternative chunked download flow with SSE progress + resume support.
- **Responsibilities**: `initDownload`, `waitForDownload` (SSE), `downloadFile` (Range requests), `triggerDownload`, resume state management.
- **Note**: This module is **fully implemented but not currently used in the active UI**. It provides a more granular download experience.

### `lib/constants.ts`
- **Purpose**: Shared static data.
- **Exports**: `PLATFORMS` (platform definitions with icons), `FAQS`, `ADSENSE_CODE_TEMPLATES`.

### `context/AppContext.tsx`
- **Purpose**: Global app state via React Context.
- **Exports**: `AppProvider`, `useTheme()`, `useBottomAd()`.
- **State**: `theme` (`light`/`dark`), `showStickyBottomAd`.

### `config/zustand/index.tsx`
- **Purpose**: Zustand global store for AdSense configuration.
- **Exports**: `useAdConfig` hook.
- **State**: `adsenseClientId`, `topBannerSlotId`, `sidebarSlotId`, `bottomAnchorSlotId`.

### `lib/utils.ts`
- **Purpose**: className utility.
- **Exports**: `cn(...inputs)` — combines `clsx` + `tailwind-merge`.

### `app/globals.css`
- **Purpose**: Global CSS entry point.
- **Contents**: Tailwind v4 import, dark variant definition, CSS custom properties (background/foreground), custom animations (`shimmer`, `mooving_blob`), utility classes (`skeleton-shimmer-dark`, `skeleton-shimmer-light`, `mooving_blob`).

### `components/ui/index.ts`
- **Purpose**: Barrel export for all UI components.
- **Exports**: ThemeToggle, Notification, AdBanner, AdInspector, InterstitialAd, VideoDownloader, FormatSelector, VideoPlayer, DownloadHistory, PlatformSelector, FAQSection, HowToUseSection, AdSenseSlot.

### `components/ui/LegalLayout/index.tsx`
- **Purpose**: Shared layout wrapper for all legal pages.
- **Exports**: Default `LegalLayout` (accepts `title` + `children`).

---

## Files of Note (Quirks & Observations)

| File | Observation |
|------|-------------|
| `app/constant.ts` | Empty file — likely placeholder for future constants |
| `context/stickeyAds.tsx` | Empty file — superseded by AppContext |
| `app/terms-and-conditions/page.tsx` | Older, shorter version of Terms; `/terms` is the current one |
| `components/ui/Footer/index.tsx` | Alternate Footer accepting `isDark` prop; not used in current page layout (sections/footer.tsx is used) |
| `lib/download-manager.ts` | Fully built but not currently wired to UI |
| `lib/constants.ts` | `FAQS` and `PLATFORMS` defined but imported differently (DownloaderWrapper uses inline `PLATFORMS`) |

*Related files: All source files in the project.*
