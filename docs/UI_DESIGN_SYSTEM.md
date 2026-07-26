# UI_DESIGN_SYSTEM.md — Aevnum

> ⚠️ This documentation must always reflect the current implementation. Whenever related code is added, removed, or modified, this document must be updated in the same pull request.

---

## Design Philosophy

Aevnum uses a **monochromatic, technical aesthetic** — minimalist zinc/neutral tones, monospace typography for metadata, and micro-animations for premium feel. The design language is inspired by developer tools and CDN dashboards. No bright colors. No gradients in the UI palette — only subtle blur and shadow depth.

**Brand identity**: High-tech extraction engine, stateless CDN interfaces, edge computing aesthetics.

---

## Styling Engine

- **Tailwind CSS v4** (imported via `@import "tailwindcss"` in `globals.css`)
- **PostCSS** via `postcss.config.mjs`
- **Dark mode**: Class-based (`dark` class on `<html>`), defined via `@variant dark (&:where(.dark, .dark *))`
- **Class utility**: `cn()` from `lib/utils.ts` — `clsx` + `tailwind-merge`

---

## Color Palette

The project uses Tailwind's built-in **zinc** and **neutral** scale exclusively.

### Light Mode

| Role | Tailwind Token | Hex (approx) |
|------|---------------|--------------|
| Page background | `bg-zinc-50` | `#fafafa` |
| Surface / card | `bg-white` | `#ffffff` |
| Elevated surface | `bg-zinc-50` | `#fafafa` |
| Primary border | `border-zinc-200` | `#e4e4e7` |
| Strong border | `border-zinc-300` | `#d4d4d8` |
| Primary text | `text-zinc-900` | `#18181b` |
| Body text | `text-zinc-800` | `#27272a` |
| Muted text | `text-zinc-500` | `#71717a` |
| Very muted | `text-zinc-400` | `#a1a1aa` |
| CTA / primary button bg | `bg-zinc-900` | `#18181b` |
| CTA button text | `text-white` | `#ffffff` |
| Success accent | `text-emerald-500` | `#10b981` |
| Error accent | `text-red-700` | `#b91c1c` |
| Ad inspector accent | `text-amber-500` | `#f59e0b` |
| Selection | `selection:bg-zinc-200` | `#e4e4e7` |

### Dark Mode

| Role | Tailwind Token | Hex (approx) |
|------|---------------|--------------|
| Page background | `dark:bg-black` | `#000000` |
| Surface / card | `dark:bg-zinc-900` | `#18181b` |
| Elevated surface | `dark:bg-zinc-950` | `#09090b` |
| Primary border | `dark:border-zinc-800` | `#27272a` |
| Muted border | `dark:border-neutral-900` | `#171717` |
| Primary text | `dark:text-neutral-100` | `#f5f5f5` |
| Body text | `dark:text-neutral-400` | `#a3a3a3` |
| Muted text | `dark:text-zinc-400` | `#a1a1aa` |
| Very muted | `dark:text-zinc-500` | `#71717a` |
| CTA / primary button bg | `dark:bg-zinc-100` | `#f4f4f5` |
| CTA button text | `dark:text-zinc-950` | `#09090b` |
| Success accent | `dark:text-emerald-400` | `#34d399` |
| Selection | `dark:selection:bg-neutral-800` | `#262626` |

### CSS Custom Properties (globals.css)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

---

## Typography

### Font Stack

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

No Google Fonts are loaded. The system font stack is used throughout.

### Type Scale Usage

| Use case | Class | Approx size |
|----------|-------|-------------|
| Page hero H1 | `text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight` | 30px → 60px |
| Section H1 | `text-2xl sm:text-4xl font-extrabold tracking-tight` | 24px → 36px |
| Section H3 | `text-2xl sm:text-3xl font-light tracking-tight` | 24px → 30px |
| Card title | `text-sm font-semibold tracking-tight` | 14px |
| Body copy | `text-xs leading-relaxed font-light` | 12px |
| Monospace labels | `text-[10px] font-mono tracking-wider uppercase` | 10px |
| Nano labels | `text-[9px] font-mono` | 9px |
| Badge text | `text-[10px] font-mono tracking-widest uppercase` | 10px |

### Font Weight Conventions

| Weight | Usage |
|--------|-------|
| `font-light` (300) | Hero titles, body copy, legal pages |
| `font-semibold` (600) | Card headings, FAQ questions |
| `font-bold` (700) | CTA buttons |
| `font-extrabold` (800) | Downloader H1 |
| `font-mono` | All metadata, timestamps, labels, badge text |

---

## Spacing System

Tailwind's default spacing scale. Common patterns:

| Context | Spacing |
|---------|---------|
| Card padding | `p-4 sm:p-6` or `p-4 sm:p-5` |
| Card inner spacing | `space-y-4`, `space-y-6` |
| Section padding | `py-12` |
| Page container | `max-w-6xl mx-auto px-6` |
| Legal page container | `max-w-3xl mx-auto px-6 py-16` |
| Gap between grid items | `gap-6 lg:gap-8` |
| Input padding | `px-4 py-3.5` |
| Button padding | `px-6 py-3.5` (CTA), `px-3 py-1.5` (small) |

---

## Border Radius

| Context | Class |
|---------|-------|
| Cards / panels | `rounded-2xl` |
| Inputs | `rounded-xl` |
| Buttons | `rounded-xl` (CTA), `rounded-lg` (small), `rounded-full` (badges) |
| Thumbnails | `rounded-xl` |
| Legal card | `rounded-3xl` |
| Icon containers | `rounded-lg` or `rounded-xl` |

---

## Shadows

| Usage | Class |
|-------|-------|
| Cards | `shadow-sm` |
| Notification toast | `shadow-2xl` |
| Modal dialogs | `shadow-2xl` |
| Ad inspector | `shadow-2xl` |
| CTA hover focus | `shadow-md` |

---

## Animations

All custom animations are defined in `app/globals.css`.

### Shimmer (Loading Skeleton)

Used on ad banner and sidebar containers while AdSense loads.

```css
@keyframes shimmer {
  0%   { background-position: -400% 0; }
  100% { background-position: 400% 0; }
}

.skeleton-shimmer-light { /* zinc gradient, 6s ease-in-out infinite */ }
.skeleton-shimmer-dark  { /* neutral/zinc dark gradient, 6s ease-in-out infinite */ }
```

**Classes**: `skeleton-shimmer-light`, `skeleton-shimmer-dark`

### Moving Blob (Background Glow)

Used in the hero background as a decorative radial blur element.

```css
@keyframes mooving_blob {
  0%   { translate: 0, 0; }
  50%  { translate: -30%, 80%; }
  100% { transform: translate(0, 0); }
}
.mooving_blob { animation: mooving_blob 10s infinite; }
```

### Tailwind Utility Animations

| Animation | Class | Usage |
|-----------|-------|-------|
| Spin | `animate-spin` | Loading spinners on buttons |
| Ping | `animate-ping` | Green online status dot in NavBar |
| Pulse | `animate-pulse` | SVG badge icon in hero, download CTA in interstitial |
| Fade-in | `animate-fade-in` | FormatSelector + VideoPlayer reveal |

> ⚠️ `animate-fade-in` is referenced in `FormatSelector` and `VideoPlayer` but is **not defined** in `globals.css` or Tailwind config. This is likely a custom animation that needs to be added, or it relies on a not-yet-configured Tailwind v4 plugin.

---

## Buttons

### Primary / CTA Button

Used for "Search", "Download Video", "Save" actions.

```
Light: bg-zinc-900 hover:bg-zinc-850 text-white
Dark:  dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950
```

### Ghost Button

Used for ThemeToggle and small actions.

```
bg-transparent text-zinc-600 hover:bg-zinc-100
```

Defined in `Button` component (`components/ui/button.tsx`) with `variant="ghost"`.

### State-Aware Button (FormatSelector download button)

```
Loading:    bg-zinc-300 text-zinc-500 cursor-wait dark:bg-zinc-800 dark:text-zinc-400
Blocked:    bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-850 dark:text-zinc-500
Available:  bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950
```

---

## Inputs

### Text Input (URL Input)

```
bg-zinc-55 text-zinc-800 placeholder:text-zinc-400 border-zinc-200 focus:border-zinc-300 rounded-xl px-4 py-3.5
dark: dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:border-zinc-800 dark:focus:border-zinc-700
```

### Contact Form Inputs

```
bg-neutral-950/70 border-neutral-900 focus:border-neutral-700 text-neutral-200 rounded-xl px-4 py-3
```

---

## Cards

All content cards follow this pattern:

```
rounded-2xl border overflow-hidden
Light: bg-white border-zinc-200 shadow-sm
Dark:  dark:bg-zinc-900 dark:border-zinc-800
```

Card header bars:

```
px-4 py-3 border-b flex items-center justify-between
Light: bg-zinc-50 border-zinc-200
Dark:  dark:bg-zinc-950 dark:border-zinc-850
```

---

## Dialogs / Modals

Only one full-screen modal exists: `InterstitialAd`.

```
fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4
bg-zinc-950/95 backdrop-blur-md
```

Inner card:

```
w-full max-w-lg rounded-2xl p-5 sm:p-8 relative shadow-2xl border
Light: bg-white border-zinc-200
Dark:  bg-zinc-900 border-zinc-800
```

---

## Toast Notifications

Component: `Notification` (`components/ui/notification.tsx`)

```
fixed top-4 right-4 z-50 animate-fade-in shadow-2xl rounded-xl p-3.5 border backdrop-blur-md
Light: bg-white border-zinc-200 text-zinc-800
Dark:  dark:bg-zinc-900/98 dark:border-zinc-800/80 dark:text-zinc-300
```

Auto-dismiss: 3.5 seconds (via `setTimeout` in `DownloaderWrapper`).

---

## Responsive Breakpoints

Using Tailwind v4 defaults:

| Breakpoint | Width |
|-----------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

Key layout changes:
- Downloader grid: `grid-cols-1 lg:grid-cols-12` (stacks on mobile, 8+4 on desktop)
- FormatSelector: `grid-cols-1 md:grid-cols-12` (5+7 split)
- StepGuide: `grid-cols-1 md:grid-cols-3`
- FeatureGrid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- PlatformGrid: `grid-cols-1 md:grid-cols-2`
- NavBar links: `hidden md:flex` (mobile: hidden)

---

## Grid System

Single container width: `max-w-6xl mx-auto px-6`  
Legal pages: `max-w-3xl mx-auto px-6`  
FAQ sections: `max-w-3xl mx-auto`

Main content grid (`DownloaderWrapper`):
- `grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8`
- Left column: `lg:col-span-8` (VideoDownloader)
- Right column: `lg:col-span-4` (Sidebar AdSense)

---

## Icons

Two icon libraries used:

### Lucide React (`lucide-react` v1.21)

Used for all action icons, status indicators, and UI icons:

| Icon | Usage |
|------|-------|
| `Download` | Download buttons |
| `Search` | Analyze button |
| `X` | Close buttons, dismiss ads |
| `Check` | Notification success icon, history copy state |
| `Copy` | Copy link button |
| `Moon` / `Sun` | Theme toggle |
| `AlertCircle` | Error messages |
| `ShieldCheck` | Security badge |
| `Lock` | Sandbox badge |
| `TrendingUp` | Platform parser badge |
| `ExternalLink` | Open in new tab |
| `RefreshCw` | Retry download |
| `Info` | Info notices |
| `ArrowLeft` | Legal page back button |
| `Settings` | Ad inspector icon |
| `Sparkles` | Interstitial header badge |
| `History` | Download history icon |
| `Sliders` | Platform "All Links" icon |
| `Flame` | TikTok icon (in PlatformSelector) |

### React Icons (`react-icons` v5.6)

Used specifically for platform brand icons:

| Icon | Platform |
|------|---------|
| `FaInstagram` | Instagram |
| `FaYoutube` | YouTube |
| `FaFacebook` | Facebook |

(TikTok uses Lucide's `Flame` instead of a brand icon.)

---

## Accessibility

| Rule | Implementation |
|------|---------------|
| ARIA labels | ThemeToggle has `aria-label` prop |
| Disabled state | Buttons use `disabled` attribute + `disabled:opacity-50` |
| Keyboard nav | Native `<button>` and `<a>` used throughout |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-offset-2` on Button component |
| Image alt text | All `<img>` tags have `alt` attributes |
| Semantic HTML | `<header>`, `<footer>`, `<main>`, `<section>`, `<h1>`-`<h4>` used correctly |
| Color contrast | Zinc 900 on white, neutral 100 on black (high contrast pairs) |

---

## Layout Rules

1. Pages have a single `<main>` with `max-w-6xl mx-auto px-6`
2. The sticky bottom ad adds `mb-20` to `<footer>` when visible
3. The NavBar is `sticky top-0 z-10` with `backdrop-blur-md`
4. The `InterstitialAd` uses `z-[100]` to sit above all other layers
5. The Ad Inspector panel uses `z-50 fixed bottom-14 right-2 sm:bottom-6 sm:right-6`
6. A decorative gradient div sits behind the hero (`z-0 pointer-events-none`)

*Related files: [`app/globals.css`](../app/globals.css), [`lib/utils.ts`](../lib/utils.ts), [`app/page.tsx`](../app/page.tsx)*
