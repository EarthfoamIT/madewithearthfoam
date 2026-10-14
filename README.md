# Made With Earthfoam: Vite + React

A React rebuild of **https://madewith.earthfoam.com/**, made from a full scrape of the live site. It matches the original page for page: same copy, layout, styles, assets, URLs and interactions. It also fixes a few bugs from the original (see [Changes from the original](#changes-from-the-original)).

The scrape and the audit of the original site are documented in **[ScrapeReadme.md](ScrapeReadme.md)**.

## Stack

| | |
|---|---|
| Runtime | **Node 24** (`.nvmrc` locally; `engines.node: 24.x` for Vercel) |
| Build tool | **Vite 8** with `@vitejs/plugin-react` |
| UI | **React 19** (JavaScript/JSX) |
| Routing | **React Router 8** (data router: `createBrowserRouter` + `RouterProvider`) |
| Styling | The original site's stylesheet, unchanged, as one global CSS file (`src/styles/global.css`). There's no CSS framework; class names like `lg:col-span-4` come from the site's own utility system. |
| Linting | ESLint 10 (flat config) with `react-hooks` and `react-refresh` |

No other runtime dependencies.

## Getting started

```bash
nvm use            # picks up Node 24 from .nvmrc
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Project structure

```
.
├── vercel.json             # Vercel: SPA rewrite, cache and security headers
├── index.html              # HTML shell: default meta/OG tags, favicons, LinkedIn Insight Tag
├── public/                 # Copied to the build as-is, at the same URLs
│   ├── assets/             # Videos (.mp4), certificate PDFs, captions (.vtt), share image
│   ├── favicon-*.png
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── main.jsx            # Entry: mounts the router, imports global CSS
│   ├── router.jsx          # Route table
│   ├── layouts/
│   │   └── RootLayout.jsx  # Header, <main>, carousel, newsletter, footer, scroll restoration
│   ├── pages/
│   │   ├── HomePage.jsx    # Hero + the six numbered sections
│   │   ├── ProjectPage.jsx # Fair-trade project pages (one component, data-driven)
│   │   └── NotFoundPage.jsx
│   ├── components/         # Header, Hero, VideoModal, IndexSection, GalleryVideo, Newsletter, Footer, ...
│   ├── data/               # All site copy and content lives here (see below)
│   ├── hooks/
│   │   └── usePageMeta.js  # Sets the document title, description and og:url per page
│   ├── lib/
│   │   └── jsonp.js        # Tiny JSONP helper for the Mailchimp signup
│   ├── assets/             # Bundled by Vite (hashed file names)
│   │   ├── images/         # WebP photos
│   │   ├── graphics/       # SVG logo, badge, play icon
│   │   └── fonts/          # GT America (300/400/500), Noto Sans Sinhala
│   └── styles/
│       └── global.css      # The original stylesheet; only the font URLs were changed
│
├── ScrapeReadme.md         # Documentation of the scrape and audit of the original site
├── site/                   # The raw scraped mirror (git-ignored, reference only; rebuild with tools/crawl.py)
├── tools/                  # Scraper and content-extraction scripts
├── CONTENT.md              # All original page text, extracted
└── site-manifest.json      # Checksums and headers for every scraped file
```

`site/` and `tools/` are excluded from Vite's dependency scan, Vite's file watcher and ESLint.

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | `HomePage` | Sections deep-link by hash and open automatically: `/#our-foam`, `/#our-forests`, `/#our-factory`, `/#standards-and-certifications`, `/#fair-trade-projects`, `/#working-together`. `/#newsletter` scrolls to the signup. |
| `/increasing-access-to-healthcare` | `ProjectPage` | |
| `/improving-productivity-and-working-conditions` | `ProjectPage` | |
| `/strengthening-the-community` | `ProjectPage` | |
| `/half-height-pillow` | `ProjectPage` | Unlisted placeholder carried over from the original site. Not linked from anywhere (`unlisted: true`). |
| `*` | `NotFoundPage` | |

Project routes are generated from `src/data/projects.js`. Adding an entry there creates both a new page and a new card in the home page's "Fair Trade Projects" section.

## Editing content

All copy is in `src/data/`. Components only handle layout.

| File | Contains |
|---|---|
| `site.js` | Contact details, address, tagline, Mailchimp IDs, hero video URLs |
| `homeSections.jsx` | The six home sections: title, subhead, gallery items, body text. Section numbers (00–05) come from the array order. |
| `projects.js` | Project pages: title, summary, card image, case studies |
| `certifications.js` | Certificate labels and PDF file names |

Gallery items in `homeSections.jsx` are `{ type: 'image' | 'video' | 'certificates', ... }`. Videos play on hover on desktop and autoplay in view on touch devices.

## Assets: what goes where

- **`src/assets/`**: images, SVGs and fonts. Import them in JS or CSS. Vite fingerprints the file names so they can be cached long-term. The photos were renamed to readable kebab-case (e.g. `EH ETU 01_640x480_q70.webp` → `healthcare-ambulance.webp`).
- **`public/assets/`**: large or externally-linked files: the 12 MP4s (~69 MB), 9 certificate PDFs, the caption file and the 1200×1200 share image. These keep their **original file names and URLs** (e.g. `/assets/GOTS%20New.pdf`), so existing links to them keep working.

Vite writes its own hashed build output to `dist/static/`, so `/assets/` contains only the original files.

## Theme

The design system is the original stylesheet, unchanged. Quick reference (full detail in [ScrapeReadme.md §4](ScrapeReadme.md#4-theme-and-design-system)):

- **Colours:** background `#141617`, text `#FFFFFF`, accent "sunset" `#E68276`, cream `#F8F7ED`, error `#E84848`, greys `#202122` / `#313131` / `#5E5E5E` / `#9C9A9B` / `#BAB8B8`. Use them through the utility classes `color-*`, `bg-*`, `b-*`, `bt1-*`, `bb1-*`.
- **Type:** GT America 300/400/500 and Noto Sans Sinhala. Scale classes: `.h1`–`.h4`, `.eyebrow-sm`, `.text-small`, `.text-caption`.
- **Layout:** one breakpoint at **1024px** (the `lg:` prefix). `.content` is max 1440px wide; `.contentgrid` is 1 column on mobile and 8 on desktop.
- **Spacing:** `p-*`, `m-*`, `gap-*` from `half` (5px) to `10` (100px), in 10px steps.

## Deployment (Vercel)

The site is set up for **Vercel**, configured in [`vercel.json`](vercel.json):

| Setting | Value | Why |
|---|---|---|
| Framework / build | `vite`, `npm run build` → `dist/` | Vercel would auto-detect these anyway. They're pinned so the settings are in the repo. |
| Node | `24.x` (from `package.json` `engines`) | Vercel reads the Node version from `engines`. |
| Rewrite | `/(.*)` → `/index.html` | Single-page-app fallback. Vercel serves real files first (videos, PDFs, `robots.txt`, …) and sends every other path to `index.html`, so deep links like `/strengthening-the-community` work. |
| `Cache-Control` on `/static/*` | `public, max-age=31536000, immutable` | Vite writes its hashed JS, CSS, images and fonts to `dist/static/` (`build.assetsDir` in `vite.config.js`), so they can be cached forever. |
| `/assets/*` | Vercel default caching | The original videos and PDFs aren't hashed. If a certificate PDF is replaced under the same name, visitors must get the new one, so these files are not marked immutable. |
| `X-Content-Type-Options`, `Referrer-Policy` | `nosniff`, `strict-origin-when-cross-origin` | Two security headers the original server was missing. They're safe with the third-party scripts. A CSP would need the LinkedIn and Mailchimp domains allow-listed, so it isn't included. |

### Deploying

1. Push the repo to GitHub, GitLab or Bitbucket and **Import Project** in Vercel. Or run `npx vercel` from the project root. No other settings are needed.
2. Add `madewith.earthfoam.com` under **Project → Settings → Domains** and update the DNS record Vercel shows you. DNS is currently on Linode, and `madewith` is a CNAME to `earthfoam.com`, which must change to point at Vercel. Vercel issues and renews the TLS certificate with the full chain, which fixes the incomplete-chain problem from the old server.

### Things to know

- **Unknown URLs return HTTP 200**, not 404. The rewrite sends them to the app, which renders the "Not Found" page. Search engines may treat these as "soft 404s".
- **Large media:** `public/assets/` holds ~69 MB of video. One "Watch Our Story" view in 1080p downloads up to 36 MB. Keep an eye on bandwidth against your Vercel plan's limits. If that becomes a problem, move the videos to a video host or blob storage and update the URLs in `src/data/`.
- `site/`, `tools/` and `site-manifest.json` (the scrape) are listed in `.vercelignore`, so they aren't uploaded to Vercel.

### SEO caveat

The original site sent fully rendered HTML for every page. This app renders in the browser:

- `usePageMeta` sets the correct title and description **once JavaScript runs**. Google runs JS and will see them.
- **Link-preview crawlers** (Slack, iMessage, LinkedIn, etc.) don't run JS. For every route they see the home page defaults from `index.html`.
- The LinkedIn Insight Tag is loaded once in `index.html`, so it records the first page load only, not client-side navigation.

If per-page previews matter, add pre-rendering at build time, e.g. React Router's framework mode with `prerender`, or a static pre-render step.

## Changes from the original

The goal was a faithful port. These are the only deliberate differences:

| Area | Original | Here |
|---|---|---|
| Newsletter signup | Sent the input *element* instead of its value, and used a cross-origin `fetch()` whose response the browser can't read, so it always showed an error | Posts the email to Mailchimp's `post-json` endpoint via JSONP and shows success or error from the actual response. *Not tested against the live audience (no real signup was submitted).* |
| Story video modal | Any click, **including on the video controls**, closed it. **Escape closed it but the video kept playing.** Both confirmed in headless Chrome. | Closes only on ×, a backdrop click, Escape or video end, and always pauses the video. |
| `robots.txt` / `sitemap.xml` | Broken base URL (`:///`) | `https://madewith.earthfoam.com/...` |
| Viewport meta | `user-scalable=no` (blocks pinch-zoom) | Removed |
| Invalid markup | `<p>` inside `<h1>`/`<p>`; empty `<h1></h1>` in the header; dead classes `pt1`, `mt-lg:col-start-2`, `xl:p-5` | Valid markup. The dead classes were dropped or corrected. None of them had a visual effect, so rendering is unchanged. |
| Accessibility | Empty `alt` on the client-logos image; duplicated carousel images announced twice | Alt text added; duplicate carousel images `aria-hidden` |
| Copy | "collect it's sap" | "collect its sap" |
| Section opened by URL hash | Animated open on load | Starts open (no animation) |

## Verification

The production build was compared with the original scrape in headless Chrome at 1440×900 and 390×844:

- **Every route** has the same rendered text (except the typo fix), image count, video sources, links, loaded fonts, header behaviour and **exact document height**.
- Project pages, the placeholder page and the newsletter error state are **pixel-identical**. On the home and 404 pages the only differences are video frames and the moving carousel.
- Interactions match: section open/close (heights, `data-open`, toggle text, subhead colour, URL hash), the header revealing after the hero, hover-to-play gallery videos, `/#section` deep links, and newsletter validation.
- No console errors or warnings in `vite preview` or `npm run dev` (StrictMode).
- `npm run lint` is clean.

## Licensing note

**GT America is a commercial font** (Grilli Type). The font files here are the ones licensed to the original website. Check that your Grilli Type licence covers this deployment before shipping it. Noto Sans Sinhala is SIL OFL. The certificate PDFs, photos and videos belong to Earthfoam.
