# ENVIRONMENT.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Environment Variables Matrix

Aether Downloader uses key configurations injected at build and runtime to manage ad networks, server base pointers, and API targeting.

| Variable Name | Required | Scope | Default Value | Target Component | Description |
|---------------|----------|-------|---------------|------------------|-------------|
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | **Yes** | Client & Server | `ca-pub-XXXXXXXXXXXXXXXX` | [`AppContext.tsx`](../context/AppContext.tsx), [`zustand/index.tsx`](../config/zustand/index.tsx), [`ad-Script.tsx`](../components/ui/ad-Script.tsx) | Google AdSense Publisher Identification code (e.g., `pub-3526896081279499`). |
| `NEXT_PUBLIC_TOP_BANNER_SLOT_ID` | **Yes** | Client | None | [`downloader-wrapper.tsx`](../components/sections/downloader-wrapper.tsx) | AdSense slot ID for the top leaderboard ad placement above the downloader card. |
| `NEXT_PUBLIC_SIDEBAR_SLOT_ID` | **Yes** | Client | None | [`downloader-wrapper.tsx`](../components/sections/downloader-wrapper.tsx) | AdSense slot ID for the sidebar skyscraper ad placement. |
| `NEXT_PUBLIC_BOTTOM_ANCHOR_SLOT_ID` | **Yes** | Client | None | [`downloader-wrapper.tsx`](../components/sections/downloader-wrapper.tsx) | AdSense slot ID for the persistent sticky bottom anchor ad placement. |
| `NEXT_PUBLIC_BACKEND_PUBLIC_API_URL` | **Yes** | Client & Server | `https://aether-backend-exrn.onrender.com` | [`api.ts`](../lib/api.ts), [`api/video/route.js`](../app/api/video/route.js) | Public API base domain hosting the external Node.js extraction engine. |
| `NEXT_BACKEND_PUBLIC_API_URL` | **Yes** | Client | None | [`download-manager.ts`](../lib/download-manager.ts) | Duplicate backend base URL string reserved specifically for the alternative chunked downloader. |

---

## Key Configurations Setup

### 1. Google AdSense Configurations
- The AdSense integration is bound to `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and specific ad slot IDs.
- Ensure that the domain matching your deployment is registered and approved in the Google AdSense dashboard, otherwise ads will fail to serve, and slots will render empty shimmer skeletons.

### 2. Backend URL Endpoint Configurations
- The application exposes **two** env keys targeting the backend API.
- Ensure both point to the same host:
  - `NEXT_PUBLIC_BACKEND_PUBLIC_API_URL` (Used by core `api.ts` clients and route handlers)
  - `NEXT_BACKEND_PUBLIC_API_URL` (Used specifically by the SSE chunk downloader inside `download-manager.ts`)

---

## Local Development `.env` Configuration File Example

To initialize environment configurations locally, create a `.env` file in the root directory:

```env
# Google AdSense Monetization Parameters
NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-3526896081279499"
NEXT_PUBLIC_TOP_BANNER_SLOT_ID="5397228100"
NEXT_PUBLIC_SIDEBAR_SLOT_ID="5397228100"
NEXT_PUBLIC_BOTTOM_ANCHOR_SLOT_ID="5397228100"

# Backend Connection Base Target (Production Host)
NEXT_PUBLIC_BACKEND_PUBLIC_API_URL="https://aether-backend-exrn.onrender.com"
NEXT_BACKEND_PUBLIC_API_URL="https://aether-backend-exrn.onrender.com"

# Optional local debugging targets:
# NEXT_PUBLIC_BACKEND_PUBLIC_API_URL="http://localhost:3000"
# NEXT_BACKEND_PUBLIC_API_URL="http://localhost:3000"
```

*Related files: [`.env`](../.env), [`config/zustand/index.tsx`](../config/zustand/index.tsx), [`lib/api.ts`](../lib/api.ts), [`lib/download-manager.ts`](../lib/download-manager.ts)*
