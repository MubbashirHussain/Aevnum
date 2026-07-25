# SEO.md — Aether Downloader

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Current SEO Implementation

All SEO features have been implemented according to the roadmap below. The implementation uses Next.js App Router conventions throughout.

---

## Page Metadata

All pages use Next.js App Router's `export const metadata` pattern. The root layout provides defaults via a title template, so child pages only need to specify their unique title segment.

### Shared Configuration

**File**: [`config/seo.ts`](../config/seo.ts)

```typescript
export const SITE_NAME = "Aether Downloader";
export const SITE_DESCRIPTION =
  "Extract uncompressed source media streams directly from Instagram, TikTok, YouTube, and Facebook. Zero compression, high speed.";
export const SITE_URL = "https://downloadreels.site";
export const OG_IMAGE = `${SITE_URL}/images/og-image.png`;
export const TWITTER_IMAGE = `${SITE_URL}/images/twitter-image.png`;
```

### Root Layout (`app/layout.tsx`)

**File**: [`app/layout.tsx`](../app/layout.tsx)

```typescript
export const metadata: Metadata = {
  title: {
    default: "Aether Downloader | Free Social Media Video Downloader",
    template: "%s | Aether Downloader",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [TWITTER_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};
```

The root layout also renders a `WebApplication` JSON-LD schema script and static `icon`/`apple-icon` routes.

### All Pages Metadata

| Route                   | Title                                            | Canonical                           | Description                                                                                                                       |
| ----------------------- | ------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | "Free Social Media Video Downloader \| Aether..." | `SITE_URL`                          | Extract uncompressed source media streams directly from Instagram, TikTok, YouTube, and Facebook. Zero compression, high speed.  |
| `/terms`                | "Terms of Service \| Aether Downloader"          | `SITE_URL + "/terms"`               | Terms and conditions of using Aether Downloader stateless extraction service.                                                     |
| `/privacy`              | "Privacy Policy \| Aether Downloader"            | `SITE_URL + "/privacy"`             | Privacy Policy for Aether Downloader, explaining our stateless processing and third-party advertising cookies.                    |
| `/cookies`              | "Cookie Policy \| Aether Downloader"             | `SITE_URL + "/cookies"`             | Cookie Policy and settings matrix for Aether Downloader service, explaining how advertising and preference cookies are handled.   |
| `/contact`              | "Contact \| Aether Downloader"                   | `SITE_URL + "/contact"`             | Contact the Aether Downloader webmaster team for API access inquiries, DMCA notifications, and operational errors.                |
| `/terms-and-conditions` | "Terms and Conditions \| Aether Downloader"      | `SITE_URL + "/terms"` (canonical)   | Terms and conditions of using Aether Downloader stateless extraction service.                                                     |
| All other pages         | Inherits root layout default                     | `SITE_URL` (root layout default)    | Inherits root layout description                                                                                                  |

---

## HTML Heading Structure

### Home Page (`/`)

```
<h1> — "Decentralized Media Stream Extraction" (HeroSection)
<h2> — "Extract Social Media Streams with Zero Compression" (VideoDownloader)
```

- Single `<h1>` on home page, rendered by `HeroSection`.
- `VideoDownloader` uses `<h2>` (fixed from duplicate `<h1>`).

### Legal Pages

- Single `<h1>` rendered by `LegalLayout` (the `title` prop)
- Section headings use `<h2>` correctly

---

## ads.txt

**File**: [`public/ads.txt`](../public/ads.txt)

```
google.com, pub-3526896081279499, DIRECT, f08c47fec0942fa0
```

This authorizes Google AdSense publisher `pub-3526896081279499` as a **DIRECT** seller. Served statically at `/ads.txt`. Required for AdSense compliance and brand protection.

---

## robots.txt

**File**: [`app/robots.ts`](../app/robots.ts)

Generated via Next.js `MetadataRoute.Robots`:

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://downloadreels.site/sitemap.xml
```

Blocks crawlers from indexing `/api/` endpoints.

---

## Sitemap

**File**: [`app/sitemap.ts`](../app/sitemap.ts)

Generated via Next.js `MetadataRoute.Sitemap`. Includes all public routes with appropriate priorities:

| URL                       | Change Frequency | Priority |
| ------------------------- | ---------------- | -------- |
| `/`                       | weekly           | 1.0      |
| `/terms`                  | yearly           | 0.3      |
| `/privacy`                | yearly           | 0.3      |
| `/cookies`                | yearly           | 0.3      |
| `/contact`                | yearly           | 0.2      |

---

## Open Graph (OG) Tags

OG tags are set on two levels:

1. **Root layout** (`app/layout.tsx`): Sets `og:type`, `og:siteName`, `og:url`, `og:image` as defaults for all pages.
2. **Home page** (`app/page.tsx`): Extends with page-specific `og:title`, `og:description`.

All pages inherit OG defaults from the root layout.

```typescript
// Home page
openGraph: {
  title: "Aether Downloader | Free Social Media Video Downloader",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  siteName: SITE_NAME,
  images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  type: "website",
},
twitter: {
  card: "summary_large_image",
  title: "Aether Downloader | Free Social Media Video Downloader",
  description: SITE_DESCRIPTION,
  images: [TWITTER_IMAGE],
},
```

---

## Canonical URLs

Every page now explicitly sets its canonical URL via `alternates.canonical`:

- **`/terms`** → `https://downloadreels.site/terms`
- **`/privacy`** → `https://downloadreels.site/privacy`
- **`/cookies`** → `https://downloadreels.site/cookies`
- **`/contact`** → `https://downloadreels.site/contact`
- **`/terms-and-conditions`** → `https://downloadreels.site/terms` (canonical to `/terms` to prevent duplicate content)
- **Home** → `https://downloadreels.site`

---

## Structured Data (Schema.org)

**File**: [`components/seo/json-ld.tsx`](../components/seo/json-ld.tsx)

A `WebApplication` JSON-LD schema is rendered in the root layout's `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Aether Downloader",
  "url": "https://downloadreels.site",
  "description": "Free social media video downloader for Instagram, TikTok, YouTube, and Facebook.",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

---

## Icons & Favicon

Static files placed in `app/` — Next.js auto-links them:

- [`app/favicon.ico`](../app/favicon.ico) — Browser tab favicon
- [`app/icon.svg`](../app/icon.svg) — SVG icon (`<link rel="icon">`)
- [`app/apple-icon.png`](../app/apple-icon.png) — Apple touch icon
- [`public/icon-192.png`](../public/icon-192.png) — PWA icon (192×192)
- [`public/icon-512.png`](../public/icon-512.png) — PWA icon (512×512)

Next.js automatically adds the appropriate `<link>` tags to `<head>`.

## Brand Logos

- **NavBar**: Uses `/images/logo-icon.svg` (light mode) and `/images/logo-dark.svg` (dark mode), theme-aware via `useTheme()`.
- **Footer**: Uses `/images/logo-icon.svg` (light mode) and `/images/logo-dark.svg` (dark mode), theme-aware via `useTheme()`.

---

## On-Page SEO

### Home Page Content

| Element               | Content                                                       | Notes                                       |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| Hero H1               | "Decentralized Media Stream Extraction"                       | Present but generic — not keyword-optimized |
| VideoDownloader H2    | "Extract Social Media Streams with Zero Compression"          | Better keywords, now `<h2>`                |
| Hero subtitle         | "Retrieve uncompressed source media files directly..."        | Contains platform keywords                  |
| FAQ section           | 4 questions about the service                                 | Good for long-tail keywords                 |
| Platform descriptions | "Instagram Reels & Posts", "TikTok No-Watermark", etc.        | Good keyword coverage                       |
| Footer disclaimer     | "Not associated with Instagram, TikTok, YouTube, or Facebook" | Good brand safety disclaimer                |

### Internal Linking

| From            | To                    | Anchor text         |
| -----------------| -----------------------| ---------------------|
| NavBar          | `#downloader-section` | "PARSER"            |
| NavBar          | `#platform-grid`      | "COMPATIBILITY"     |
| NavBar          | `#step-guide`         | "WORKFLOW"          |
| NavBar          | `#faq-accordion`      | "FAQS"              |
| Footer          | `/terms`              | "TERMS & SERVICE"   |
| Footer          | `/privacy`            | "PRIVACY SETTINGS"  |
| Footer          | `/cookies`            | "COOKIE MATRIX"     |
| Footer          | `/contact`            | "CONTACT WEBMASTER" |
| All legal pages | `/`                   | "BACK TO ENGINE"    |

---

## Performance SEO Factors

| Factor                 | Status                | Notes                                                      |
| ---------------------- | --------------------- | ---------------------------------------------------------- |
| AdSense script loading | ✅ `afterInteractive` | Good — non-blocking                                        |
| Fonts                  | ✅ System fonts only  | No font layout shift                                       |
| Images                 | ⚠️ External CDN URLs  | Thumbnails from social platform CDNs — may fail or timeout |
| LCP                    | ⚠️ Needs measurement  | Hero section should load fast                              |
| CLS                    | ⚠️ Ad slots           | Shimmer skeleton reduces CLS from ad slots loading         |

---

## SEO Implementation Summary

| Priority    | Item                      | Status  | Implementation                                                                |
| ----------- | ------------------------- | ------- | ----------------------------------------------------------------------------- |
| 🔴 Critical | Fix root layout metadata  | ✅ Done | Replaced "Create Next App" with real brand title + template                   |
| 🔴 Critical | Fix duplicate `<h1>`      | ✅ Done | Changed `VideoDownloader` H1 to `<h2>`                                        |
| 🔴 Critical | Add `robots.txt`          | ✅ Done | `app/robots.ts` — blocks `/api/`                                              |
| 🔴 Critical | Add contact page metadata | ✅ Done | Added `app/contact/layout.tsx` with metadata export                           |
| 🟠 High     | Add `sitemap.xml`         | ✅ Done | `app/sitemap.ts` — includes all public routes                                 |
| 🟠 High     | Add Open Graph tags       | ✅ Done | Root layout + home page — `og:title`, `og:description`, `og:image`, etc.     |
| 🟠 High     | Add canonical URLs        | ✅ Done | Every page has `alternates.canonical` — `/terms-and-conditions` → `/terms`   |
| 🟡 Medium   | Add JSON-LD schema        | ✅ Done | `WebApplication` via `components/seo/json-ld.tsx` in root layout             |
| 🟡 Medium   | Twitter card metadata     | ✅ Done | `summary_large_image` on root layout + home page                             |
| 🟢 Low      | Keyword-optimize H1       | ⚠️ Open  | Hero H1 "Decentralized Media Stream Extraction" still generic                 |
| 🟢 Low      | Add favicon metadata      | ✅ Done | `app/icon.tsx` + `app/apple-icon.tsx` — auto-linked by Next.js               |

_Related files: [`config/seo.ts`](../config/seo.ts), [`app/layout.tsx`](../app/layout.tsx), [`app/page.tsx`](../app/page.tsx), [`app/robots.ts`](../app/robots.ts), [`app/sitemap.ts`](../app/sitemap.ts), [`components/seo/json-ld.tsx`](../components/seo/json-ld.tsx), [`components/ui/video-downloader.tsx`](../components/ui/video-downloader.tsx), [`components/sections/nav-bar.tsx`](../components/sections/nav-bar.tsx), [`components/sections/footer.tsx`](../components/sections/footer.tsx), [`app/contact/layout.tsx`](../app/contact/layout.tsx), [`app/terms-and-conditions/page.tsx`](../app/terms-and-conditions/page.tsx), [`app/terms/page.tsx`](../app/terms/page.tsx), [`app/privacy/page.tsx`](../app/privacy/page.tsx), [`app/cookies/page.tsx`](../app/cookies/page.tsx), [`public/ads.txt`](../public/ads.txt), [`public/favicon.ico`](../public/favicon.ico), [`public/apple-icon.png`](../public/apple-icon.png), [`public/icon.svg`](../public/icon.svg), [`public/images/`](../public/images/)_
