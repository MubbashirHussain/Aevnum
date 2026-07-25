# Aether Downloader — Documentation Index

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## What is Aether Downloader?

**Aether Downloader** is a high-performance, stateless social media video extraction web application. It enables users to download videos from Instagram, TikTok, YouTube, and Facebook directly from their browser — with zero compression, zero server-side storage, and zero accounts required.

The service is monetized via **Google AdSense** (banner, sidebar, sticky anchor, and interstitial ad placements). A session/unlock gate creates a controlled ad-view window before each download is granted, which is the core business mechanism.

---

## Tech Stack

| Layer        | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | Next.js `16.2.9` (App Router)                 |
| Runtime     | React `19.2.4`                                |
| Language    | TypeScript `^5`                               |
| Styling     | Tailwind CSS `^4` (via PostCSS)               |
| State       | React Context API + Zustand `^5`              |
| Icons       | Lucide React `^1.21` + React Icons `^5.6`    |
| Utilities   | clsx + tailwind-merge (`cn` helper)           |
| Backend API | External Node.js service (Render.com hosted)  |
| Ads         | Google AdSense (`ca-pub-3526896081279499`)    |

---

## Documentation Map

| File | Contents |
|------|----------|
| [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md) | High-level system design, layer map, data flow |
| [APPLICATION_FLOW.md](./APPLICATION_FLOW.md) | Full user journey, download/session/ad/error flows, state transitions |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | API endpoints, request/response lifecycle, streaming, auth |
| [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) | Full project tree with per-folder and per-file explanations |
| [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) | Colors, typography, spacing, animations, themes, components |
| [COMPONENTS.md](./COMPONENTS.md) | Every reusable component — props, state, dependencies, usage |
| [ROUTES.md](./ROUTES.md) | All application routes, metadata, SEO targets, navigation |
| [SEO.md](./SEO.md) | Metadata, ads.txt, OG tags, canonicals, robots, roadmap |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | Context, Zustand, local state, localStorage, theme |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Build commands, dev/prod environments, Vercel/Render setup |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Every environment variable, defaults, required flags |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Dev setup, PR rules, code standards, documentation sync policy |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build --webpack

# Start production server
npm start
```

---

## Key Architecture Decisions

1. **Stateless extraction**: The backend never stores video files. CDN URLs are resolved on-demand and streamed transiently.
2. **Session/unlock gate**: Users must wait through an ad-backed countdown before the `streamToken` is released.
3. **Edge-runtime stream proxy**: `/app/api/video/route.js` runs on the edge runtime and proxies the video stream from the Node.js backend to the browser, preserving `Range` headers for seeking.
4. **Download history is local-only**: Stored in `localStorage` under the key `vdl_premium_history`. Never sent to the server.
5. **Theme persistence**: Two localStorage keys — `up` (user has set a preference) and `vdl_theme` (`light`/`dark`).

---

## Repository Structure (Top Level)

```
client/
├── app/                  # Next.js App Router pages and API routes
├── components/           # UI and section components
│   ├── sections/         # Full-page layout sections
│   └── ui/               # Reusable atomic components
├── config/               # Zustand global store
├── context/              # React Context (theme, sticky ad)
├── docs/                 # You are here
├── lib/                  # API client, download manager, constants, utils
├── public/               # Static assets (ads.txt, SVGs)
└── .env                  # Environment variables (not committed)
```

---

*Last updated: July 2026 | Next.js 16 + React 19 + Tailwind CSS 4*
