# DEPLOYMENT.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Deployment Architectures

Aether Downloader is optimized for automated cloud deployments. It divides responsibilities into a static/Edge-based client application and a dynamic processing backend.

```
+------------------------------------+      +-----------------------------------+
|       Vercel (or equivalent)       |      |             Render.com            |
|       Next.js 16 Edge App          |      |         Node.js Backend           |
|                                    |      |                                   |
|   /           --> Static Web Assets|      |   /api/download --> Parser API    |
|   /api/video  --> Edge Stream Proxy| <--> |   /api/stream   --> Stream Source |
+------------------------------------+      +-----------------------------------+
```

---

## 1. Local Development Execution

To test the application locally:

### Installation
Ensure Node.js 18+ is installed on the local system.
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```
Starts the Next.js local development process at `http://localhost:3000`.

### Local Build & Run
To simulate production compilation behaviors locally:
```bash
npm run build --webpack
npm start
```

---

## 2. Next.js Client Compilation Flow

The compilation process is managed by `next build` with a custom flag in `package.json`:

```json
"build": "next build --webpack"
```

### Static Output vs. Edge Routes
- The frontend framework determines page delivery models during compilation.
- Routes like `/`, `/terms`, `/privacy`, `/cookies`, and `/contact` compile into static pages or static-regenerated assets.
- The stream router [`app/api/video/route.js`](../app/api/video/route.js) is compiled with an Edge target:
  - `export const runtime = "edge";`
  - This ensures that proxy requests are handled at the CDN edge network layer rather than spinning up server runtimes.

---

## 3. Production Deployment (Vercel)

This application is designed to be hosted on Vercel or equivalent static/edge delivery platforms.

### Integration Steps
1. Connect the GitHub repository containing the frontend to your Vercel Dashboard.
2. Select **Next.js** as the Project Framework.
3. Configure the Build settings:
   - **Build Command**: `next build --webpack`
   - **Output Directory**: `.next`
4. Set up the environment variables (see [ENVIRONMENT.md](./ENVIRONMENT.md) for full parameters).

---

## 4. Backend Deployment (Render.com)

The API operations, URL parses, and stream connections are processed on an external Node.js backend. This service must run on a platform supporting system binaries (such as `yt-dlp` and `ffmpeg` installations).

### Setup Prerequisites
- Host instance size: Needs sufficient RAM to load node streams and buffer file merges.
- Base dependencies:
  - Node.js environment
  - `ffmpeg` library binaries
  - Up-to-date `yt-dlp` system installations (frequently updated to prevent platform API breakage).

---

## 5. Verification Checkpoints

Post-deployment, always test the following flows on the live instance:
1. Verify the `/ads.txt` route is correctly served at `https://yourdomain.com/ads.txt`.
2. Check that the `/api/video?streamToken=...` endpoint handles range request seek operations in mobile Safari/Chrome.
3. Confirm that the dynamic countdown timer acts correctly according to server-provided session structures.

*Related files: [`package.json`](../package.json), [`app/api/video/route.js`](../app/api/video/route.js), [`next.config.ts`](../next.config.ts)*
