# COMPONENTS.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Component Map

```
components/
├── sections/               # Page-level section components
│   ├── downloader-wrapper.tsx  ← Main orchestrator
│   ├── faq-accordion.tsx
│   ├── feature-grid.tsx
│   ├── footer.tsx
│   ├── hero-section.tsx
│   ├── nav-bar.tsx
│   ├── platform-grid.tsx
│   └── step-guide.tsx
└── ui/                     # Atomic reusable components
    ├── ad-Script.tsx
    ├── ad-banner.tsx
    ├── ad-inspector.tsx
    ├── adsense-slot.tsx
    ├── button.tsx
    ├── download-history.tsx
    ├── faq-section.tsx
    ├── format-selector.tsx
    ├── how-to-use-section.tsx
    ├── interstitial-ad.tsx
    ├── notification.tsx
    ├── platform-selector.tsx
    ├── theme-toggle.tsx
    ├── video-downloader.tsx
    ├── video-player.tsx
    ├── Footer/index.tsx
    └── LegalLayout/index.tsx
```

---

## Section Components

### `DownloaderWrapper`

**File**: [`components/sections/downloader-wrapper.tsx`](../components/sections/downloader-wrapper.tsx)  
**Type**: Client Component (`"use client"`)  
**Purpose**: The primary orchestrator of the entire download experience. All download state lives here.

**State** (via `useState`):

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `videoUrl` | `string` | `""` | Current input URL |
| `activePlatform` | `string` | `"all"` | Selected platform filter |
| `isLoading` | `boolean` | `false` | URL analysis in progress |
| `progress` | `number` | `0` | Progress bar value (0–100) |
| `errorMessage` | `string` | `""` | User-facing error string |
| `detectedPlatform` | `string \| null` | `null` | Auto-detected platform from URL |
| `parsedVideo` | `ParsedVideo \| null` | `null` | Analyzed video metadata |
| `downloadHistory` | `DownloadHistoryItem[]` | `[]` | Local session history |
| `notification` | `{message, type} \| null` | `null` | Toast notification |
| `showAdInspector` | `boolean` | `true` | Ad inspector panel visibility |
| `highlightAds` | `boolean` | `true` | Ad highlighting toggle |
| `activeInspectorTab` | `"overview" \| "adsense_code"` | `"overview"` | Current inspector tab |
| `selectedAdForCode` | `string` | `"leaderboard"` | Ad template selection |
| `streamToken` | `string \| null` | `null` | Current unlock token |
| `activeFormatId` | `string \| null` | `null` | Format currently being unlocked |
| `unlockCountdown` | `number` | `0` | Seconds remaining before unlock |
| `isDownloadingStream` | `boolean` | `false` | Stream download in progress |
| `streamProgress` | `{total, downloaded} \| null` | `null` | Byte-level progress |
| `downloadError` | `string \| null` | `null` | Download-specific error |

**Context consumed**: `useAdConfig()`, `useBottomAd()`

**Key methods**:
- `handleUrlChange` — sets URL, detects platform
- `handleAnalyze` — calls `analyzeUrl()`, sets `parsedVideo`
- `handleStartSession` — calls `startSession()`, starts countdown, polls unlock
- `handleDownload` — streams via `/api/video?streamToken=...&download=1`, tracks progress
- `handleCopyHistory` — copies URL to clipboard
- `handleReFetch` — pre-fills input with history URL
- `clearHistory` — clears localStorage + state

**Renders**:
- `Notification` (conditional)
- `AdBanner`
- `VideoDownloader` (8-col) + sidebar `AdSenseSlot` (4-col)
- `FormatSelector` (when `parsedVideo && !streamToken`)
- `VideoPlayer` (when `streamToken`)
- `PlatformSelector`
- Sticky bottom `AdSenseSlot` (conditional on `showStickyBottomAd`)

**Parent**: `app/page.tsx`

---

### `NavBar`

**File**: [`components/sections/nav-bar.tsx`](../components/sections/nav-bar.tsx)  
**Type**: Client Component  
**Purpose**: Sticky top navigation with brand, anchor links, and theme toggle.

**Context consumed**: `useTheme()` (for `isDark`, `toggleTheme`)

**Props**: None

**Renders**:
- Inline SVG logo (video camera icon)
- Brand name "Aether Downloader" + online status ping
- Anchor nav links: `#downloader-section`, `#platform-grid`, `#step-guide`, `#faq-accordion`
- `ThemeToggle`

**Sticky position**: `sticky top-0 z-10 backdrop-blur-md`

---

### `HeroSection`

**File**: [`components/sections/hero-section.tsx`](../components/sections/hero-section.tsx)  
**Type**: Server Component (no `"use client"`, no hooks)  
**Purpose**: Landing headline section.

**Props**: None  
**State**: None  

**Renders**: Badge with pulse SVG + H1 "Decentralized Media Stream Extraction" + subtitle paragraph.

---

### `PlatformGrid`

**File**: [`components/sections/platform-grid.tsx`](../components/sections/platform-grid.tsx)  
**Type**: Server Component  
**Purpose**: 2×2 grid showcasing supported platforms.

**Props**: None  
**State**: None  

**Platforms shown**: Instagram Reels, TikTok No-Watermark, YouTube Shorts, Facebook Watch  
**ID**: `#platform-grid`

---

### `StepGuide`

**File**: [`components/sections/step-guide.tsx`](../components/sections/step-guide.tsx)  
**Type**: Server Component  
**Purpose**: 3-step visual guide for using the downloader.

**Props**: None  
**State**: None  

**Steps**: Copy Source Link → Execute Processing Request → Verify and Export  
**ID**: `#step-guide`

---

### `FeatureGrid`

**File**: [`components/sections/feature-grid.tsx`](../components/sections/feature-grid.tsx)  
**Type**: Server Component  
**Purpose**: 4-feature marketing grid.

**Props**: None  
**State**: None  

**Features**: 10Gbps Extraction Pipe, Stateless Streaming Engine, Zero Local Logs Policy, SSL Inspected Tunneling

---

### `FAQAccordion`

**File**: [`components/sections/faq-accordion.tsx`](../components/sections/faq-accordion.tsx)  
**Type**: Client Component  
**Purpose**: Interactive accordion FAQ.

**State**: `openIndex: number | null` — which FAQ item is expanded

**FAQs** (hardcoded):
1. Does Aether store videos?
2. Is there a daily limit?
3. How to download on mobile?
4. Why is there a countdown screen?

**ID**: `#faq-accordion`

---

### `Footer` (sections)

**File**: [`components/sections/footer.tsx`](../components/sections/footer.tsx)  
**Type**: Client Component  
**Purpose**: Site footer with legal links and disclaimer.

**Context consumed**: `useBottomAd()` (for `showStickyBottomAd` — adds `mb-20` when ad is visible)

**Props**: None  

**Links**: `/terms`, `/privacy`, `/cookies`, `/contact`  
**Disclaimer**: "Independent extraction client interface. Not associated with Instagram, TikTok, YouTube, or Facebook."

---

## UI Components

### `VideoDownloader`

**File**: [`components/ui/video-downloader.tsx`](../components/ui/video-downloader.tsx)  
**Type**: Client Component  
**Purpose**: URL input panel with analyze form and loading progress.

**Props**:
```typescript
type VideoDownloaderProps = {
  videoUrl: string;
  detectedPlatform: string | null;
  isLoading: boolean;
  progress: number;               // 0–100
  errorMessage: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: (e: React.FormEvent<HTMLFormElement>) => void;
};
```

**State**: None (fully controlled)  
**Parent**: `DownloaderWrapper`  

**Renders**:
- Badge: "Decentralized Fast Link Parser"
- H1: "Extract Social Media Streams with Zero Compression"
- URL text input
- Submit button (spinner when loading, shows detected platform)
- Error message (red panel)
- Loading progress bar (when `isLoading`)
- Security badges: "SSL Inspected Node", "Client Sandbox"

---

### `FormatSelector`

**File**: [`components/ui/format-selector.tsx`](../components/ui/format-selector.tsx)  
**Type**: Client Component  
**Purpose**: Displays video thumbnail and format/quality selection list.

**Props**:
```typescript
type FormatSelectorProps = {
  parsedVideo: {
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
    formats: {
      quality: string;
      resolution: string;
      size: string;
      label: string;
      formatId: string;
      isAudioAvailable: boolean;
    }[];
  } | null;
  onDownload: (format: any, formatId: string, isAudioAvailable: boolean) => void;
  loadingFormatId?: string | null;
  countdown?: number;             // countdown seconds shown on button
};
```

**State**: None (fully controlled)  
**Parent**: `DownloaderWrapper`  

**Renders**:
- Video thumbnail with duration overlay
- Author attribution
- List of format rows (resolution, "No Watermark CDN Link" label, size badge, Save button)
- Save button: spinner + countdown seconds while locked

---

### `VideoPlayer`

**File**: [`components/ui/video-player.tsx`](../components/ui/video-player.tsx)  
**Type**: Client Component  
**Purpose**: Post-unlock panel showing download progress and actions.

**Props**:
```typescript
type VideoPlayerProps = {
  parsedVideo: { thumbnail: string } | null;
  streamToken: string | null;
  onOpenInNewTab: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  streamProgress?: StreamProgress | null; // { total: number, downloaded: number }
  downloadError?: string | null;
  onRetryDownload?: () => void;
};
```

**State**: None (fully controlled)  
**Parent**: `DownloaderWrapper`  

**Renders**:
- Status header: "Stream Token Generated" / "Downloading..." / "Download Failed"
- Video thumbnail preview
- (while downloading): Green progress bar with bytes transferred
- (idle): "Open in New Tab" + "Download Video" buttons
- (error): Red error panel + "Try Again" button
- Info notice: "Stream token expires in 5 minutes"

**Note**: This component renders an `<img>` thumbnail but NOT an HTML `<video>` element. Video playback happens in the browser natively via the "Open in New Tab" button pointing to the stream URL.

---

### `PlatformSelector`

**File**: [`components/ui/platform-selector.tsx`](../components/ui/platform-selector.tsx)  
**Type**: Client Component  
**Purpose**: Platform filter quick-select buttons.

**Props**:
```typescript
type PlatformSelectorProps = {
  activePlatform: string;
  onPlatformChange: (platform: string) => void;
};
```

**State**: None (fully controlled)  
**Parent**: `DownloaderWrapper`  

**Platforms**: All Links, Instagram, TikTok, YouTube, Facebook  
**Note**: This is a **visual filter UI only** — it does not actually filter the download or analysis. The `activePlatform` state is set but no filtering logic exists on it.

---

### `AdSenseSlot`

**File**: [`components/ui/adsense-slot.tsx`](../components/ui/adsense-slot.tsx)  
**Type**: Client Component  
**Purpose**: Renders a single Google AdSense `<ins>` element and triggers `adsbygoogle.push({})`.

**Props**:
```typescript
type AdSenseSlotProps = {
  slotId: string;
  clientId?: string;          // defaults to NEXT_PUBLIC_ADSENSE_CLIENT_ID
  format?: string;            // "auto", "rectangle, horizontal", etc.
  responsive?: boolean;
  layout?: string;            // "in-article" for in-feed ads
  style?: React.CSSProperties;
};
```

**State**: `initialized: useRef<boolean>` — prevents double push  
**Parent**: `AdBanner`, `DownloaderWrapper` (sidebar + bottom), `InterstitialAd`

---

### `AdBanner`

**File**: [`components/ui/ad-banner.tsx`](../components/ui/ad-banner.tsx)  
**Type**: Client Component  
**Purpose**: Leaderboard banner ad above the downloader grid.

**Props**:
```typescript
type AdBannerProps = {
  highlightAds: boolean;
  onHighlightToggle?: (highlight: boolean) => void;
  clientId: string;
  slotId?: string;            // defaults to "9876543210"
};
```

**Renders**: `AdSenseSlot` in a shimmer container  
**Parent**: `DownloaderWrapper`

---

### `AdInspector`

**File**: [`components/ui/ad-inspector.tsx`](../components/ui/ad-inspector.tsx)  
**Type**: Client Component  
**Purpose**: Developer/admin floating panel for configuring AdSense slots and copying code templates.

**Props**: See file for full interface (large prop surface — isDark, showAdInspector, onToggle, highlightAds, onHighlightToggle, activeInspectorTab, onTabChange, selectedAdForCode, onAdSelect, adTemplates, onCopyCode, clientId, onClientIdChange)

**State**: None (fully controlled)  
**Position**: `fixed bottom-14 right-2 sm:bottom-6 sm:right-6 z-50`

**Tabs**:
- "Responsive Setup": Ad highlight toggle + publisher ID input + responsive status
- "Get Code Snippet": Select ad type → show HTML code → Copy button

> ⚠️ Note: `AdInspector` is instantiated in the same file scope as `DownloaderWrapper` (imported but checked with `showAdInspector` flag which starts `true`), but it is **not rendered** in the current JSX of `DownloaderWrapper`. It is a development/admin tool.

---

### `InterstitialAd`

**File**: [`components/ui/interstitial-ad.tsx`](../components/ui/interstitial-ad.tsx)  
**Type**: Client Component  
**Purpose**: Full-screen overlay ad modal shown during download unlock countdown.

**Props**:
```typescript
type InterstitialAdProps = {
  isDark: boolean;
  showInterstitial: boolean;
  onClose: () => void;
  pendingDownloadItem: {
    chosenQuality: string;
    chosenSize: string;
    platform: string;
  } | null;
  countdown: number;
  onDownload: () => void;
  clientId: string;
  slotId?: string;            // defaults to "3456789012"
};
```

**State**: None (fully controlled)  
**Position**: `fixed inset-0 z-[100]`

> ⚠️ `InterstitialAd` is implemented and exported but **not currently used** in `DownloaderWrapper`. The session/unlock countdown is shown inline on the format button instead.

---

### `Notification`

**File**: [`components/ui/notification.tsx`](../components/ui/notification.tsx)  
**Type**: Client Component  
**Purpose**: Toast notification (top-right, auto-dismissed).

**Props**:
```typescript
type NotificationProps = {
  message: string;
  type: "success" | "info";
  onClose: () => void;
};
```

**Position**: `fixed top-4 right-4 z-50`  
**Auto-dismiss**: Parent (`DownloaderWrapper`) clears after 3.5s via `setTimeout`

---

### `DownloadHistory`

**File**: [`components/ui/download-history.tsx`](../components/ui/download-history.tsx)  
**Type**: Client Component  
**Purpose**: Displays recent local download history with copy/re-fetch actions.

**Props**:
```typescript
type DownloadHistoryProps = {
  downloadHistory: {
    id: string; title: string; platform: string;
    url: string; thumbnail: string; timestamp: string;
  }[];
  onCopyHistory: (url: string, index: number) => void;
  onReFetch: (url: string, platform: string) => void;
  onClearHistory: () => void;
  copiedIndex: number | null;
};
```

> ⚠️ `DownloadHistory` is exported from `index.ts` but **not rendered** in the current `DownloaderWrapper`. The history state exists in `DownloaderWrapper` but the display component is not mounted.

---

### `Button`

**File**: [`components/ui/button.tsx`](../components/ui/button.tsx)  
**Type**: Server Component (no hooks)  
**Purpose**: Base button with variant and size props.

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
  size?: "icon" | "default";
}
```

**Variants**:
- `default`: `bg-zinc-900 text-white hover:bg-zinc-800`
- `ghost`: `bg-transparent text-zinc-600 hover:bg-zinc-100`

**Sizes**:
- `icon`: `h-9 w-9`
- `default`: `h-10 px-4 py-2`

**Used by**: `ThemeToggle`

---

### `ThemeToggle`

**File**: [`components/ui/theme-toggle.tsx`](../components/ui/theme-toggle.tsx)  
**Type**: Client Component  
**Purpose**: Moon/Sun icon button for toggling dark/light mode.

**Props**:
```typescript
type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};
```

**Renders**: `Button` with `variant="ghost"` `size="icon"`. Shows `Sun` icon in dark mode, `Moon` in light.  
**Parent**: `NavBar`

---

### `AdsenseScript`

**File**: [`components/ui/ad-Script.tsx`](../components/ui/ad-Script.tsx)  
**Type**: Server Component  
**Purpose**: Injects the Google AdSense `<script>` tag using `next/script` with `strategy="afterInteractive"`.

**Props**: `adId: string`  
**Parent**: `app/layout.tsx` → `<head>`

---

### `LegalLayout`

**File**: [`components/ui/LegalLayout/index.tsx`](../components/ui/LegalLayout/index.tsx)  
**Type**: Server Component  
**Purpose**: Shared page wrapper for all legal pages.

**Props**: `title: string`, `children: React.ReactNode`  
**Renders**: Back link, page title H1, content wrapper with `prose` styling  
**Used by**: `/contact`, `/privacy`, `/cookies`, `/terms`, `/terms-and-conditions`

---

### `FAQSection`

**File**: [`components/ui/faq-section.tsx`](../components/ui/faq-section.tsx)  
**Type**: Client Component  
**Purpose**: Alternate static FAQ display (not animated, for use with isDark prop).

**Props**: `isDark: boolean`, `faqs: { q: string, a: string }[]`  
**Status**: Exported but not used in current page layout (`FAQAccordion` is used instead).

---

### `HowToUseSection`

**File**: [`components/ui/how-to-use-section.tsx`](../components/ui/how-to-use-section.tsx)  
**Type**: Client Component  
**Purpose**: 3-step guide component with isDark theming.

**Props**: `isDark: boolean`  
**Status**: Exported but not used in current page layout (`StepGuide` section is used instead).

---

### `Footer` (UI variant)

**File**: [`components/ui/Footer/index.tsx`](../components/ui/Footer/index.tsx)  
**Type**: Server Component  
**Purpose**: Alternate footer accepting `isDark` prop.

**Props**: `isDark: boolean`  
**Status**: Not used in current layout. `sections/footer.tsx` is used instead (which consumes Context).

*Related files: All files in [`components/`](../components/)*
