# Made With Earthfoam: Website Snapshot

> **Note:** The project root is now a Vite + React rebuild of this site (see [README.md](README.md)). This file documents the original scrape. The scrape files it describes (`site/`, `tools/`, `CONTENT.md`, `site-manifest.json`) haven't changed and are kept for reference.

A full offline mirror of **https://madewith.earthfoam.com/**, with documentation of its technology stack, theme/design system, behaviour, assets and known issues.

| | |
|---|---|
| **Snapshot taken** | 2026-10-14 |
| **Site last deployed** | 2026-09-11 21:50 GMT (`Last-Modified` header on every HTML/CSS file) |
| **Resources captured** | 65 URLs → 64 files, 78,409,544 bytes (~75 MB). Two URLs, `/js/main.js` and `/js/main.js?v=232099835`, are the same file. |
| **HTTP status** | Every captured URL returned `200`. |
| **Integrity** | Every saved file matches the byte length and SHA-256 of what the server sent (see `site-manifest.json`). |
| **Site credits** (from the site's own console log) | Web design: **Michael Mitzman** (https://mitz.nyc) · Web development: **Sensor Station** (https://www.sensorstation.co) |

---

## 1. Repository layout

```
.
├── ScrapeReadme.md         ← this file
├── CONTENT.md              ← all page text, image alt text and links, extracted page by page
├── site-manifest.json      ← every crawled URL: status, content-type, bytes, sha256, Last-Modified, ETag, Cache-Control
├── tools/
│   ├── crawl.py            ← the crawler used to make this mirror
│   └── extract_content.py  ← generates CONTENT.md from site/
└── site/                   ← the mirror, using the same URL paths as the live site
    ├── index.html                                         → /
    ├── increasing-access-to-healthcare/index.html         → /increasing-access-to-healthcare
    ├── improving-productivity-and-working-conditions/index.html
    ├── strengthening-the-community/index.html
    ├── half-height-pillow/index.html                      → unlisted page (see §3)
    ├── 404.html
    ├── robots.txt, sitemap.xml
    ├── stylesheet.css                                     ← the only stylesheet
    ├── js/main.js                                         ← the only external script
    ├── fonts/        (8)  GT America ×3 weights + Noto Sans Sinhala, woff + woff2
    ├── graphics/     (3)  SVG logo monogram, "Made with Earthfoam" badge, play icon
    ├── assets/      (39)  WebP images, MP4 videos, VTT captions, certificate PDFs
    └── favicon-16/32/48/180.png
```

The HTML files are byte-for-byte what the server sent; nothing was rewritten. All links in them are root-relative (`/assets/...`), so serve `site/` from a web root instead of opening the files with `file://`.

### View it locally

```bash
python3 -m http.server 8000 --directory site
# open http://localhost:8000/
```

Tested: `/`, the extensionless subpages, CSS, fonts, images (including file names with spaces), JS and the VTT all return `200` with correct MIME types.

### Re-run the scrape

The server sends an incomplete TLS chain (§9, issue 4), so a plain `curl` or Python request fails certificate checks. Build a CA bundle that adds the missing intermediates instead of turning verification off:

```bash
curl -s http://ye1.i.lencr.org/ | openssl x509 -inform der > ye1.pem   # Let's Encrypt YE1 intermediate
curl -s http://ye.i.lencr.org/  | openssl x509 -inform der > ye.pem    # "Root YE", cross-signed by ISRG Root X2
cat /etc/ssl/certs/ca-certificates.crt ye1.pem ye.pem > bundle.pem
python3 -I tools/crawl.py bundle.pem site site-manifest.json
python3 -I tools/extract_content.py site > CONTENT.md
```

The crawler starts from `/`, the sitemap URLs, `robots.txt`, `404.html`, the CSS and the JS. It follows every same-origin reference in HTML (`src`, `href`, `srcset`, `poster`, `<source>`, `<track>`, form `action`, inline `style`/`<script>`), CSS (`url()`, `@import`), JS (imports and string paths) and XML (`<loc>`), and records third-party URLs without fetching them. Large files already on disk are only re-downloaded if their size differs from the server's `Content-Length`.

---

## 2. Technology stack

| Layer | What it uses | Evidence |
|---|---|---|
| **Site type** | Fully **static, pre-rendered HTML**. No client-side framework, no API calls except the newsletter form. | Every page is a complete HTML document; ETags have nginx's static-file format (`"<mtime-hex>-<size-hex>"`, e.g. `"6aa477ab-b310"`). |
| **Generator** | A **Go `html/template`-based static build**, most likely Hugo or a custom Go generator. No `<meta name="generator">` tag, so the exact tool can't be confirmed. | Go's template escaping shows up as `&#43;94` for "+94" and `&#39;` in text. Image and video file names follow a build-pipeline pattern (`<name>_<W>x<H>_q70.webp`, `<name>.<res>_<W>x<H>_crf20.mp4`). |
| **Web server** | **nginx** | `Server: nginx`. HTTP/2 enabled. `http://` → `301` → `https://` (same path). Extensionless URLs and trailing-slash URLs both serve the page. |
| **Hosting** | **Linode (Akamai Cloud)** VPS, single origin, **no CDN** | A `172.232.26.30`, AAAA `2600:3c06::2000:f9ff:fe63:1043` (Linode range); reverse DNS `madewith.earthfoam.com`. |
| **DNS** | **Linode DNS** (`ns1`–`ns5.linode.com`). `madewith.earthfoam.com` is a **CNAME → `earthfoam.com`**. | `dig` |
| **TLS** | **Let's Encrypt** cert (issuer `YE1`), CN `sleeponlatex.com`, SANs `earthfoam.com`, `*.earthfoam.com`, `madewithearthfoam.com`, `*.madewithearthfoam.com`, `sleeponlatex.com`, `*.sleeponlatex.com`. Valid 2026-08-16 → **2026-11-14**. | `openssl s_client` (the same server/cert also hosts the sister domains) |
| **Caching** | `Cache-Control: no-cache` on HTML/CSS. Cache-busting only on JS (`/js/main.js?v=232099835`). | Response headers |
| **Security headers** | None: no HSTS, CSP, X-Frame-Options, X-Content-Type-Options or Referrer-Policy. | Response headers |
| **CSS** | One hand-written **Sass (SCSS) → compiled CSS** file, `/stylesheet.css` (41 KB, unminified, no source map). Contains an Eric Meyer-style reset, a **custom atomic utility system** with Tailwind-like names (`lg:col-span-4`, `pt-3`, `bg-gray1`) that is **not Tailwind**, plus BEM component classes. | `prop: value; }` closing style is Sass's "nested" output; utility names are generated from a colour and spacing map (e.g. every colour × `b-`/`bt1-`/`bb1-`/`bl1-`/`br1-`/`color-`/`bg-`). |
| **JavaScript** | **Vanilla JS, no libraries, no bundler.** One ES module (`/js/main.js`, 1.4 KB) defining two Custom Elements (Web Components), plus inline IIFE `<script>` blocks for page behaviour. | No jQuery, React, etc. anywhere. |
| **Fonts** | **Self-hosted** (no Google Fonts or Typekit calls): **GT America Standard** (Grilli Type, commercial) and **Noto Sans Sinhala** (Google, SIL OFL). | `@font-face` in CSS; font `name` tables. |
| **Media** | Images: **WebP** only (q70). Video: **H.264 Main profile MP4**, 29.97 fps, CRF 20, AAC-LC audio on the story video only. Captions: **WebVTT**. | `ffprobe`, file headers |
| **Newsletter** | **Mailchimp** embedded form, posted from JS with `fetch()` to `https://madewithearthfoam.us18.list-manage.com/subscribe/post?u=59d937ed7407709a25bb8a787&id=3a6867dde0&f_id=00cfb1e7f0`, hidden field `tags=1089046`. | Footer form on every page |
| **Analytics / ads** | **LinkedIn Insight Tag** (partner ID `5717906`): loads `https://snap.licdn.com/li.lms-analytics/insight.min.js`, `<noscript>` pixel `https://px.ads.linkedin.com/collect/?pid=5717906&fmt=gif`. No Google Analytics, GTM or Meta pixel. **No cookie-consent banner.** | End of `<body>` on every page |
| **Other third parties** | None. These three URLs (Mailchimp, 2× LinkedIn) are the only off-site references in the whole site. | `site-manifest.json` → `external_references` |
| **Related DNS on the `earthfoam.com` apex** | Email: **Google Workspace** (MX `aspmx.l.google.com` …). SPF: `include:_spf.google.com include:mailgun.org ~all` (**Mailgun**). Verification TXT records for **Google Search Console** and **Klaviyo**. These belong to the wider company domain, not to this site's code. | `dig TXT/MX` |

---

## 3. Pages / sitemap

| URL | `<title>` | Body class | Notes |
|---|---|---|---|
| `/` | Made With Earthfoam | `delayedHeader` | Single long page: hero, 6 numbered sections (00–05), carousel, newsletter, footer. |
| `/increasing-access-to-healthcare` | Increasing Access to Healthcare | `stickyHeader` | Fair-trade project subpage, 3 case studies. |
| `/improving-productivity-and-working-conditions` | Improving Productivity and Working Conditions | `stickyHeader` | Subpage. |
| `/strengthening-the-community` | Strengthening the Community | `stickyHeader` | Subpage, 2 case studies. |
| `/half-height-pillow` | Half Height Pillow | `stickyHeader` | **Unlisted placeholder.** Listed in `sitemap.xml` but not linked from any page. Only a heading, two images (`image0`, `image1`) with empty alt text, and empty `<h3>`/`<p>` captions. |
| `/404.html` | Not Found | `stickyHeader subpage` | "404 / Not Found / Home" button. nginx serves it for every missing path. |

Home-page section anchors (deep-linkable, see §6): `#our-foam` (00), `#our-forests` (01), `#our-factory` (02), `#standards-and-certifications` (03), `#fair-trade-projects` (04), `#working-together` (05), plus `#newsletter`.

`/favicon.ico`, `/manifest.json`, `/site.webmanifest`, `/humans.txt` and `/index.xml` don't exist (404). There are no directory listings and no exposed `.git` or `.env`.

All page text is in **[CONTENT.md](CONTENT.md)**.

### Global metadata (every page)

```
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<meta name="language" content="en">                      <html lang="en">
og:site_name   = Made with Earthfoam
og:email       = foamfactory@earthfoam.com
og:phone_number= +94 77 227 2731
twitter:site   = earthfoam
twitter:card   = summary_large_image
og:image / twitter:image = /assets/09_B_1200x1200_q70.webp (1200×1200), alt "Person lays on Earthfoam mattress and pillow."
og:url / twitter:url and description: per page
```

Icons: `apple-touch-icon` 180×180 plus PNG icons at 48, 32 and 16 px. There is no `.ico` and no web manifest.

### Business details shown on the site

- **Earthfoam Private Limited**, Div. S4, HEPZ BOI, Poruwadanda, Horana, Sri Lanka
- **+94 77 227 2731** · **foamfactory@earthfoam.com**
- Tagline: "Good to the core." · Header ticker: "Harvested in Sri Lanka." / "ශ්‍රී ලංකාවේ අස්වනු නෙලනු ලැබේ."

---

## 4. Theme and design system

The site uses a **dark theme**: near-black background, white text, one warm "sunset" accent.

### 4.1 Colour palette

These are all the colours in `stylesheet.css`. The names come from the utility classes (`color-*`, `bg-*`, `b-*`, `bt1-*`, `bb1-*`, `bl1-*`, `br1-*`, each also with an `lg:` variant).

| Token | Hex | Role |
|---|---|---|
| `black` | `#141617` | Page background, modal and backdrop, text on white buttons |
| `white` | `#FFFFFF` | Body text, white button |
| `cream` | `#F8F7ED` | Icons (monogram, play icon, PDF arrow icon) |
| `sunset` | `#E68276` | **Accent**: button hover, newsletter success banner |
| `red` | `#E84848` | Form error state |
| `gray1` | `#202122` | Section dividers (`bt1-gray1`), newsletter input background, "Read More" toggle |
| `gray2` | `#313131` | Toggle hover, certificate pill border |
| `gray3` | `#5E5E5E` | Default button border |
| `gray7` | `#9C9A9B` | Section subheads (turns white when the section opens) |
| `gray8` | `#BAB8B8` | Body copy inside sections and case-study captions |

Translucent values: `rgba(0,0,0,.12)` (hero notification pill), `rgba(32,33,34,.2)` (gallery caption pill, both with `backdrop-filter: blur(50px)`), `rgba(0,0,0,.3)` (hero text-shadow), `rgba(0,0,0,.2)` (hero button shadow). Text selection is inverted: white background, `#141617` text.

`graphics/badge.svg` uses `#F9F7EC`, which is close to but not exactly `cream`.

### 4.2 Typography

| Family | Weights | Files | Licence |
|---|---|---|---|
| **GT America** (Standard width), by Noel Leu / Grilli Type, v1.007, © 2016 | 300 Light, 400 Regular, 500 Medium | `fonts/GT-America-Standard-{Light,Regular,Medium}.woff2/.woff` | **Commercial.** These files are licensed to the website owner. Reusing them in another project needs your own Grilli Type licence. |
| **Noto Sans Sinhala**, by Google, v2.001 | 400 | `fonts/noto-sans-sinhala-regular.woff2/.woff` | SIL Open Font License |

All `@font-face` rules use `font-display: swap` and `src: local(""), url(woff2), url(woff)`.

Base: `font-size: 16px` (**18px** at ≥1024px), `line-height: 140%`, `letter-spacing: -0.04em`, antialiased.

| Class | Mobile | ≥1024px | Line-height | Other |
|---|---|---|---|---|
| `.h1` | 40px | **130px** | 90% (80% on desktop) | weight 400, -0.04em |
| `.h2` | 20px | 46px | 110% | |
| `.h3` | 18px | 24px | 130% | Also used for `.richtext h3` |
| `.h4` | 16px | 20px | 130% | |
| `.eyebrow-sm` | 10px | 10px | 110% | uppercase, **+0.1em** tracking, weight 500 |
| `.text-small` | 14px | | 100% | |
| `.text-caption` | 12px | | 150% | |
| `.text-12/14/16/18` | utility sizes (with `lg:` variants) | | | |
| `.weight-300/400/500` | (with `lg:` variants) | | | |

### 4.3 Layout

- **One breakpoint: `min-width: 1024px`**, used by all `lg:` utilities. The only other media query is `(any-hover: none)`, for touch devices.
- `.content` container: `max-width: 1440px`, centred, side padding **15px** (40px on desktop).
- `.contentgrid`: **1 column on mobile, 8 columns on desktop**, 10px gaps. Placement uses `lg:col-start-N` / `lg:col-span-N`.
- Hero: `100vh`, max **1920×1080**, min height 450px, 16px rounded bottom corners.
- **Spacing scale** (`p/m/pt/pb/pl/pr/mt/mb/ml/mr/gap-N`, each with an `lg:` variant): `0`=0, `half`=5px, `1`=10px, `2`=20px … `10`=100px (10px steps).
- **Radii:** `brad-1` = 16px (images and videos), `.rounded` = 1000px (pills and buttons).
- Aspect utilities: `aspect-square`, `aspect-16x9`, `aspect-rect`. Media uses `object-fit: cover` (`fit-cover`).
- Scroll offsets for anchors: `scroll-margin-top` 72px (116px on desktop). `html { scroll-behavior: smooth }`.

### 4.4 Components

| Component | Details |
|---|---|
| **Header** (`.header`) | Fixed, black, gray1 bottom border. Monogram logo (30px, 36px on desktop), animated EN/Sinhala tagline ticker (desktop only), **"Contact Us"** pill (`mailto:`). On the home page a second, transparent copy sits inside the hero, and the fixed header slides down (`translateY`, 0.4s) only after the hero scrolls out of view. Subpages use a sticky header. |
| **Buttons** (`.button`) | Pill shape, 1px `#5E5E5E` border, black background, padding 15×20. **Hover/active: sunset fill and border**, 0.3s transition. `.button--white` inverts to white, hovering to black. Modifiers: `--contact` (8×22 padding), `--extended` (40px horizontal padding). |
| **Hero** | Autoplaying, muted, looping background video (paused when off-screen), "Good to the core." H1, subhead, **"Watch Our Story"** button, and a glass-blur "Stay up to date with our newsletter" pill linking to `#newsletter`. |
| **Video modal** (`<mwef-video-modal>`) | Native `<dialog>` + `showModal()`. Plays the 67.7s story video with English captions from the start. Closes on ×, when the video ends, or on **any** mouse-down that doesn't land on the `<mwef-video-modal>` element itself, which includes clicks on the video and its controls (see issue 2). |
| **Index sections** (`.indexSection`) | Number (00–05), title, grey subhead, and a 2-column body: gallery on the left (cols 2–3), rich text on the right (cols 5–8). Collapsed by default, with a **"+ Read More" / "– Read Less"** toggle (see §6). |
| **Gallery video** (`<mwef-gallery-video>`) | Square 512×512 clips with a play icon and a glass caption pill. **Desktop: play on hover. Touch: autoplay when in view.** Uses `preload="none"`; clips only load when their section first opens. |
| **Certificate pills** (`.contentFile`) | 320px pill links with a gray2 border and a cream ↗ arrow icon. Open the PDF in a new tab. |
| **Case-study cards** (`.useCase`) | 16:9 image, H3 title, gray8 paragraph. |
| **Carousel** | Footer strip of 4 images, duplicated so it can loop. CSS animation `carousel-scroll` moves `translateX(0 → -33.3333%)`, linear, infinite, duration `calc(8s * 4)` = **32s**. Images are 160px tall (260px on desktop). |
| **Tagline ticker** | "Harvested in Sri Lanka." and its Sinhala translation swap every 5s (10s cycle) behind a gradient wipe (`@keyframes tagline` / `tagline-overlay`). |
| **Newsletter** | Large H2 "We're always innovating. / Stay up to date with our newsletter.", a pill input on gray1 with an arrow submit button, a red error state, and a sunset "Thank you! We will be in touch." success overlay. |
| **Footer** | "Made with Earthfoam" badge SVG, "Feel the difference, look for the proof." with the seal-licensing text, Contact column, Address column, and the mobile tagline ticker. |
| **Modal** | Background and backdrop `#141617`. Video modal width 90vw (75vw on desktop), 16px video radius, 34px × close button. |

---

## 5. JavaScript inventory

| Where | What it does |
|---|---|
| `js/main.js` (ES module) | Defines `customElements` **`mwef-video-modal`** (`open()`, `close()`, closes on outside `mousedown`) and **`mwef-gallery-video`** (uses `matchMedia("(any-hover: none)")` to choose IntersectionObserver autoplay on touch or mouseenter/mouseleave play on desktop, and toggles `.galleryVideoRollover--playing` to fade out the poster image). |
| Inline `<head>` | `console.groupCollapsed('Site Credits')` with the designer and developer credits. |
| Inline, home hero | IntersectionObserver (rootMargin -150px) that slides the fixed header in and out. A second observer pauses the background video when the hero is off-screen. |
| Inline, home sections | Accordion: sets heights to 0, then animates to the measured height over 0.8s via CSS transition. Calls `video.load()` on first open, writes `#section-id` to the URL with `history.replaceState`, and opens the matching section automatically if the page loads with that hash. |
| Inline, newsletter | Client-side email validation and error text. Submits with `fetch()` (see §9, issue 1). |
| Inline, end of body | LinkedIn Insight Tag loader (`window.lintrk`). |

---

## 6. Behaviour notes

- Despite the class name `indexSection--open`, all six home sections start **collapsed**. JS sets their gallery and body height to 0. Clicking **+ Read More** expands the section and scrolls it into view. Visiting `/#our-factory` (etc.) auto-expands that section.
- Videos load lazily: gallery clips use `preload="none"` and only load when their section opens. The story video uses `preload="none"` and only loads when you click "Watch Our Story". Only the hero background video (≈3 MB) loads with the page.
- The hero and story videos use `<source media="(min-width: 1440px)">` to serve **1920×1080** on wide screens and **1280×720** otherwise.

---

## 7. Asset inventory

Totals: **MP4** 12 files / 68.95 MB · **PDF** 9 / 4.59 MB · **WebP** 17 / 0.64 MB · **WOFF** 4 / 0.23 MB · **WOFF2** 4 / 0.20 MB · **HTML** 6 / 0.10 MB · **CSS** 1 / 41 KB · **SVG** 3 / 9 KB · **PNG** 4 / 3 KB · **JS** 1 / 1.4 KB · **VTT** 1 · **XML** 1 · **TXT** 1.

Naming convention from the build pipeline: images `<source-name>_<W>x<H>_q70.webp` (WebP quality 70). Video `<source-name>.<source-res>_<W>x<H>_crf20.mp4` (H.264, CRF 20). Every `srcset` lists only one candidate, so no responsive image variants exist on the server.

#### assets/

| File | Size | Dims / length | Used on |
|---|---:|---|---|
| `07a_450x337_q70.webp` | 33.3 KB | 450×337 | `/` (Working Together: team photo) |
| `09_B_1200x1200_q70.webp` | 57.6 KB | 1200×1200 | all pages (Open Graph/Twitter share image only) |
| `2022 03 23 Raincoat and PPE kit distribution Halpe_640x480_q70.webp` | 60.3 KB | 640×480 | `/improving-productivity-and-working-conditions` |
| `2023 01 26 Badalkumbura HP waiting area4_640x480_q70.webp` | 87.3 KB | 640×480 | `/increasing-access-to-healthcare` |
| `Bikes for workers 01_640x480_q70.webp` | 62.0 KB | 640×480 | `/`, `/improving-productivity-and-working-conditions` |
| `Deharagoda Water07_640x480_q70.webp` | 71.6 KB | 640×480 | `/`, `/strengthening-the-community` |
| `EH ETU 01_640x480_q70.webp` | 41.7 KB | 640×480 | `/` |
| `EH ETU 03_640x480_q70.webp` | 45.6 KB | 640×480 | `/increasing-access-to-healthcare` |
| `FoamBlock_450x450_q70.webp` | 16.9 KB | 450×450 | `/` (Our Foam) |
| `logos-grey-full_450x450_q70.webp` | 15.5 KB | 450×450 | `/` (client logos, **empty alt text**) |
| `MWE-Footer01–04_640x428_q70.webp` | 11.8 / 22.6 / 18.1 / 22.4 KB | 640×428 | all pages (carousel) |
| `image0_640x480_q70.webp`, `image1_640x480_q70.webp` | 14.6 / 20.4 KB | 640×480 | `/half-height-pillow` |
| `madewith.hero_bg.1080_1920x1080_crf20.mp4` | 3.39 MB | 1920×1080, 12.0s, no audio | `/` hero background (≥1440px) |
| `madewith.hero_bg.1080_1280x720_crf20.mp4` | 3.00 MB | 1280×720, 12.0s, no audio | `/` hero background |
| `madewith.hero.1080_1920x1080_crf20.mp4` | 35.90 MB | 1920×1080, 67.7s, AAC | `/` "Watch Our Story" (≥1440px) |
| `madewith.hero.1080_1280x720_crf20.mp4` | 23.63 MB | 1280×720, 67.7s, AAC | `/` "Watch Our Story" |
| `madewith.hero.vtt` | 1.2 KB | 17 cues, English | captions for the story video |
| `Foam01`, `Foam02` `.512_512x512_crf20.mp4` | 307 / 486 KB | 512×512, 5.0s | `/` Our Foam |
| `Forests01`, `Forests04`, `Forests02` `.512_512x512_crf20.mp4` | 396 / 56 / 708 KB | 512×512, 4.0 / 3.0 / 3.0s | `/` Our Forests |
| `Factory01`, `Factory03`, `Factory02` `.512_512x512_crf20.mp4` | 411 / 464 / 268 KB | 512×512, 5.0s | `/` Our Factory |

**Certificate PDFs** (all linked from `/` → Standards & Certifications):

| Link label | File | Size | Pages | PDF metadata |
|---|---|---:|---:|---|
| GOTS Certification | `GOTS New.pdf` | 606 KB | 3 | PDFKit, created 2026-02-22 |
| GOLS Certification | `2026-PVL-Cert-GOLS.pdf` | 89 KB | 2 | mPDF 7.1.9, created 2025-08-19, modified 2026-04-06 |
| Eco-Institut Certification | `Eco Certificate.pdf` | 143 KB | 3 | MS Reporting Services, 2025-07-22 |
| FSC Certification | `FSC Certificate.pdf` | 256 KB | 2 | Scanned on a Canon iR-ADV C3520, 2024-01-26 |
| Fair For Life | `FFL Certificate.pdf` | 174 KB | 1 | Excel for M365, 2025-07-08 |
| Oeko Tex | `2026-PVL-Cert-OekoTex.pdf` | 1.46 MB | 1 | Antenna House / Ghostscript, 2026-01-22 |
| Organic Content Standard | `OCS_Scope_Certificate_2025-04-02 08_49_57 UTC.pdf` | 671 KB | 3 | BIRT / iText, 2025-04-02 |
| ISO 9001 | `ISO 90012015 Certificate.pdf` | 631 KB | 1 | Word → Distiller, 2025-03-22 |
| ISO 14001 | `Earthfoam (Private) Limited -14k 2025.pdf` | 632 KB | 1 | Word → Distiller, 2025-10-26 |

#### graphics/

| File | Size | Dims | Notes |
|---|---:|---|---|
| `monogram.svg` | 2.4 KB | 34×36 | Header logo, cream `#F8F7ED` |
| `badge.svg` | 6.5 KB | 161×216 | "Made with Earthfoam" seal (footer), `#141617` + `#F9F7EC` |
| `video_play.svg` | 0.2 KB | 32×32 | Circle + triangle, cream stroke and fill |

#### fonts/ and favicons

See §4.2 for fonts (8 files, 444 KB total). Favicons: `favicon-16.png` (16×16), `favicon-32.png`, `favicon-48.png`, `favicon-180.png` (apple-touch-icon).

---

## 8. SEO files

`robots.txt`:
```
User-agent: *
Sitemap: :///sitemap.xml
```
`sitemap.xml` lists `/`, `/strengthening-the-community`, `/improving-productivity-and-working-conditions`, `/increasing-access-to-healthcare` and `/half-height-pillow`, but **every `<loc>` is written as `:///…`** (see issues).

---

## 9. Issues found during the audit

All of these were checked against the captured files or live responses.

| # | Severity | Issue | Where |
|---|---|---|---|
| 1 | **High** | **The newsletter signup probably doesn't work.** (a) The script sends `'EMAIL': e.target.elements['EMAIL']`, which is the `<input>` element, not its `.value`, so the request body contains `EMAIL=[object HTMLInputElement]`; the same applies to `tags`. (b) It posts with `fetch()` cross-origin to Mailchimp, whose endpoint sends no `Access-Control-Allow-Origin` header, so the browser can't read the response and the code always shows "An error has occurred". Both points come from reading the code and checking headers; no real signup was submitted. | inline script after `#newsletter`, every page |
| 2 | **High** | **The story video's controls close the modal.** `mwef-video-modal` adds a `window` `mousedown` listener that calls `close()` whenever `e.target != this`. A click on the `<video>` (play/pause, scrub, captions toggle) targets the video element, so the modal closes. Mouse users can only watch passively. **Confirmed in headless Chrome:** a click on the playing video closes the dialog. | `js/main.js` |
| 3 | **High** | **Pressing Escape leaves the story video playing.** The native `<dialog>` closes on Escape, but nothing pauses the video, so its audio keeps playing with the modal gone. Confirmed in headless Chrome (after Escape: `dialog.open=false`, `video.paused=false`). | `js/main.js` |
| 4 | **High** | **Incomplete TLS chain.** The server sends only the leaf certificate, without the Let's Encrypt `YE1` intermediate. Browsers usually recover through AIA fetching or cached intermediates, but `curl`, Python, many bots and link-preview crawlers fail with "unable to get local issuer certificate". Fix: point nginx `ssl_certificate` at `fullchain.pem`, not `cert.pem`. | server config |
| 5 | Medium | **Broken base URL in `robots.txt` and `sitemap.xml`** (`:///` with no scheme or host), so search engines can't use the sitemap. This looks like an empty `baseURL` in the generator config. | `/robots.txt`, `/sitemap.xml` |
| 6 | Medium | **Unlisted placeholder page `/half-height-pillow`** is published and in the sitemap, with empty titles, captions and alt text. | `/half-height-pillow` |
| 7 | Medium | No security headers (HSTS, CSP, X-Content-Type-Options, Referrer-Policy, frame options). | nginx |
| 8 | Medium | LinkedIn Insight Tag loads with **no cookie or consent mechanism**, which matters for EU/UK visitors. | every page |
| 9 | Low | Undefined or typo'd CSS classes that do nothing: `pt1` (should be `pt-1`) in the tagline, `mt-lg:col-start-2` (should be `lg:col-start-2`) in the footer, `xl:p-5` in the hero (there is no `xl` breakpoint). | header, footer, hero |
| 10 | Low | Invalid HTML nesting: `<p>` inside `<h1>` (newsletter heading) and `<p>` inside `<p>` (footer address). The home page has 4 `<h1>` elements, two of them empty (the duplicated header). | every page |
| 11 | Low | `user-scalable=no` in the viewport meta blocks pinch-zoom (accessibility, WCAG 1.4.4). | every page |
| 12 | Low | Empty `alt=""` on the client-logo image `logos-grey-full`, which carries content. | `/` Working Together |
| 13 | Low | Typo in a caption: "collect **it's** sap" should be "its". | `/` Our Forests |
| 14 | Low | No `/favicon.ico` (404), so some clients that request it directly see an error. | root |
| 15 | Info | TLS certificate **expires 2026-11-14**. Let's Encrypt auto-renewal should handle it; worth confirming. | server |
| 16 | Info | The story video is 36 MB at 1080p (24 MB at 720p) with no adaptive streaming. | `/` |
