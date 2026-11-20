# Earthfoam AI Assistant (`chatbot` Branch) — Phase 2 Plan

## 1. Overview & Goals

This plan specifies the **Phase 2 production AI Assistant** ("Earthfoam Assistant") for **`madewith.earthfoam.com`** (`/home/ubuntu/madewithearthfoam`), powered by a dedicated NestJS module in **`/home/ubuntu/api`** (`api.earthfoam.lk`) and Google Gemini (`gemini-3.5-flash-lite` via a Google Workspace / Google AI Studio API key).

### Core Capabilities

1. **B2B Manufacturing, Factory, Forest & Fair-Trade Q&A** — Answers questions about Earthfoam's natural Dunlop latex foam, Sri Lankan supply chain, Horana factory, Fair for Life community projects, and downloadable certifications from `madewith.earthfoam.com`.
2. **Retail Mattress, Hybrid, Topper & Pillow Guide + `earthfoam.lk` Redirections** — Answers consumer/retail sleep product questions using verified product data from `/home/ubuntu/earthfoamLk` and renders direct links redirecting visitors to the corresponding pages on **`https://earthfoam.lk`**.
3. **Live Container & Order Tracking (Tool-Calling)** — Calls the existing read-only `OrdertrackingService` in `/home/ubuntu/api/src/ordertracking` when a user supplies an order number (format like `ABC/012/26`), summarizes the shipment status, vessel, location, and ETA, and links to `/track-order?order=...` for the interactive map.
4. **Automated Lead Capture & Email Handoff (Tool-Calling)** — Collects B2B or retail inquiry details in-chat and dispatches an Outlook-safe HTML email via `MailService.sendMailAdvanced` (`/home/ubuntu/api/src/mail`), strictly following `/home/ubuntu/api/AGENTS.md` email rules.

---

## 2. Data Sources Inventory (Where Every Piece of Data Comes From)

All bot responses are grounded strictly in **three existing repositories**—no external web scraping or speculative answers. Because the combined text across `madewith.earthfoam.com` and `earthfoam.lk` fits comfortably inside a single Gemini cached system prompt (~12k–18k tokens), **no vector database is required**.

### A. `/home/ubuntu/madewithearthfoam` (`madewith.earthfoam.com` — B2B, Factory, Certifications & Fair Trade)

| Source File | Data Extracted | Information Shown by the Bot |
|---|---|---|
| `src/data/site.js` | Company name, factory address, B2B contact details, tagline | - **Factory:** Earthfoam Private Limited, Div. S4, HEPZ BOI, Poruwadanda, Horana, Sri Lanka<br>- **B2B Email:** `foamfactory@earthfoam.com`<br>- **B2B Phone:** `+94 77 227 2731`<br>- **Tagline:** *Harvested in Sri Lanka.* |
| `src/data/homeSections.jsx` & `CONTENT.md` | **00 Our Foam**, **01 Our Forests**, **02 Our Factory**, **03 Standards & Certifications**, **05 Working Together** | - **Foam properties:** Natural Dunlop latex; instant pressure recovery, breathable airy structure, high-density stability, zero fillers or synthetic latex; applications in bedding, furniture, upholstery, footwear.<br>- **Forests & traceability:** Traceable to the tree; Fair for Life certified network of **323 small GOLS-certified organic farms** in Sri Lanka employing **1,700+ workers**; **20+ year** tapping lifespan; high CO₂ absorption; spent rubberwood heats vulcanization boilers; forest biodiversity crops (tea, honey, kithul syrup).<br>- **Factory:** Horana / outside Colombo, Sri Lanka; technicians averaging **15 years** of latex experience; proprietary recipe; living wages.<br>- **B2B Services:** Wholesale Latex Foam (custom sizes, densities including hard rubber, custom mold adjustments, *Made with Earthfoam* seal licensing), Product Collaboration (*Your Brand x Earthfoam* with in-house design team), and White Label Manufacturing (foam factory + design + sewing). |
| `src/data/certifications.js` & `public/assets/*.pdf` | 9 official certificate labels and PDF URLs | Direct clickable PDF download links under `https://madewith.earthfoam.com/assets/...`:<br>1. **GOTS Certification** (`GOTS%20New.pdf`)<br>2. **GOLS Certification** (`2026-PVL-Cert-GOLS.pdf`)<br>3. **Eco-Institut Certification** (`Eco%20Certificate.pdf`)<br>4. **FSC Certification** (`FSC%20Certificate.pdf`)<br>5. **Fair For Life** (`FFL%20Certificate.pdf`)<br>6. **Oeko Tex** (`2026-PVL-Cert-OekoTex.pdf`)<br>7. **Organic Content Standard** (`OCS_Scope_Certificate_2025-04-02%2008_49_57%20UTC.pdf`)<br>8. **ISO 9001** (`ISO%2090012015%20Certificate.pdf`)<br>9. **ISO 14001** (`Earthfoam%20(Private)%20Limited%20-14k%202025.pdf`) |
| `src/data/projects.js` | **04 Fair Trade Projects** (3 public categories, 7 case studies) | Worker-directed Fair for Life Development Fund projects and links to `/increasing-access-to-healthcare`, `/improving-productivity-and-working-conditions`, and `/strengthening-the-community` (e.g., Eheliyagoda Base Hospital privacy curtains, Badalkumbura Hospital waiting area serving ~800 patients/day, free medical clinics, shared worker bicycle fleet, PPE kits for 350 farmers & 1,100 tappers, Ellawala Deheragoda Primary College clean water well for 400+ students, Kanuggalla Community Hall preschool wall). *(Note: `/half-height-pillow` has `unlisted: true` and is excluded.)* |

---

### B. `/home/ubuntu/earthfoamLk` (`https://earthfoam.lk` — Retail Products, Specs, Showroom & Policies)

When a visitor asks about consumer mattresses, toppers, pillows, showroom visits, or retail policies, the bot surfaces verified facts from `/home/ubuntu/earthfoamLk` and provides **direct redirect links to `https://earthfoam.lk`**.

| Source File | Product / Topic | Information Shown & `earthfoam.lk` Redirect Target |
|---|---|---|
| `src/data/productsData.js`, `src/data/catalogueProductData.json`, `src/components/ProductsPage.jsx` | **Earthfoam Organic Mattress** | - **5-layer construction:** Earthfoam Base, Earthfoam Comfort Layer, Organic Cotton Batting, Organic Wool Batting (natural flame barrier, no chemical retardants), 100% GOTS Organic Cotton Knit Face.<br>- **Sizes:** Widths `36"` (Single), `42"` (Super Single), `48"` (Double), `60"` (Queen), `72"` (King); Lengths `72"`, `75"`, `78"`; Heights `6"`, `8"`, `10"`.<br>- **Redirect:** `https://earthfoam.lk/products/mattress` |
| `src/data/galleryCategories.js`, `src/data/productsData.js`, `src/data/catalogueProductData.json` | **Earthfoam Hybrid Mattresses (8 Models)** | Overview & comparison across all 8 active models (all available in Widths `36"`–`72"`, Lengths `72"`–`78"`):<br>- **Osaka** (`4"`, `6"`, `8"`, `10"` heights) — High-density compressed hybrid latex core + sheep wool & organic cotton (`https://earthfoam.lk/products/hybrid-mattress/osaka`)<br>- **Ventura** (`8"` height) — Orthopaedic plush pressure-relief hybrid with pocket spring base (`https://earthfoam.lk/products/hybrid-mattress/ventura`)<br>- **Brandford** (`10"` height) — Medium-soft feel / firmest pocket-coil hybrid for back & stomach sleepers (`https://earthfoam.lk/products/hybrid-mattress/brandford`)<br>- **Meriden** (`12"` height) — Soft pillow-top hybrid with generous latex comfort layer (`https://earthfoam.lk/products/hybrid-mattress/meriden`)<br>- **Aurora** (`14"` height) — Soft euro-top hybrid built to sleep cool (`https://earthfoam.lk/products/hybrid-mattress/aurora`)<br>- **Athens Euro Top** (`16"` height) — Tall hotel-style orthopaedic euro-top hybrid (`https://earthfoam.lk/products/hybrid-mattress/athens-euro-top`)<br>- **Athens Signature** (`16"` height) — Elevated Athens soft pillow-top with hand-tied wool rosettes (`https://earthfoam.lk/products/hybrid-mattress/athens-signature`)<br>- **Athens Legacy** (`18"` height) — Classic dual-sided Athens soft pillow-top (`https://earthfoam.lk/products/hybrid-mattress/athens-legacy`)<br>- **Gallery redirect:** `https://earthfoam.lk/products/hybrid-mattress` |
| `src/data/productsData.js`, `src/data/catalogueProductData.json` | **Earthfoam Organic Mattress Topper** | - **4-layer construction:** Soft natural latex base, organic wool batting, organic cotton quilt backing, organic cotton knit face with elastic holders.<br>- **Sizes:** Widths `36"`–`72"`, Lengths `72"`–`78"`, Heights `1"` & `2"`.<br>- **Redirect:** `https://earthfoam.lk/products/topper` |
| `src/data/galleryCategories.js`, `src/data/productsData.js`, `src/data/catalogueProductData.json` | **Earthfoam Natural Latex Pillows (4 Models)** | - **Standard Profile - 2 Zone** (`60×40×15cm` US Standard, `70×40×15cm` Queen, `84×40×15cm` King) — Pin-pattern 2-zone alignment, helps reduce snoring (`https://earthfoam.lk/products/pillow/standard-2zone`)<br>- **Contour Profile - Mono Zone** (`60cm`/`70cm` × `40cm`, heights `12/10cm` or `10/8cm`, codes `D2`/`D3`/`T2`/`T3`, Soft or Medium firmness) — Ergonomic neck/shoulder support (`https://earthfoam.lk/products/pillow/contour`)<br>- **Standard Profile - Mono Zone** (`60×40×12.5cm`, E Standard) — Uniform latex core (`https://earthfoam.lk/products/pillow/standard-monozone`)<br>- **Knobby Pillow** (`59×36×13cm`, Standard) — Textured massage-like surface (`https://earthfoam.lk/products/pillow/knobby`)<br>- **Gallery redirect:** `https://earthfoam.lk/products/pillow` |
| `src/components/ContactPage.jsx` | **Sri Lanka Flagship Store & Retail Contact** | - **Showroom:** No 45, Dharmapala Mawatha, Colombo 03, Sri Lanka (Open 7 days, 10:00 AM – 6:00 PM)<br>- **Email:** `info@earthfoam.lk` \| **Phone:** `+94 114 245 245`<br>- **Redirect:** `https://earthfoam.lk/contact` |
| `src/components/HelpPage.jsx` | **Shipping, Sleep Trials, Warranties & Care FAQs** | - **Delivery:** Free delivery to most parts of Sri Lanka (2 working days dispatch / within 4 working days in Colombo via in-house fleet; worldwide shipping available).<br>- **Sleep Trials:** 100-day trial on mattresses & toppers; 30-day trial on pillows.<br>- **Warranties:** 10-year limited mattress warranty (`/help/mattress-warranty`), 5-year mattress topper limited warranty (`/help/mattress-topper-warranty` — note `/help/shipping-and-returns` references 10-year), 5-year pillow warranty (`/help/pillow-warranty`).<br>- **Care & Base:** Slatted foundation `<= 3"` apart; mattress covers spot-clean or dry-clean only (not machine washable), topper & pillow outer covers machine washable; cash, debit/credit card, Scan & Go, bank transfer, and installments accepted.<br>- **Redirects:** `https://earthfoam.lk/help/common-questions`, `https://earthfoam.lk/help/shipping-and-returns` |

> **Pricing note:** On `earthfoam.lk` (`ProductsPage.jsx` and `CatalogueProducts.jsx`), retail prices are intentionally hidden/commented out and product CTAs link to *"Inquire price"*. Accordingly, **the chatbot will never quote or invent retail prices**; it shares specs/sizes, links to the product page on `https://earthfoam.lk`, and offers to collect an inquiry for `info@earthfoam.lk`.

---

### C. `/home/ubuntu/api` (`OrdertrackingService` — Live ERP & ShipsGo Data)

| Source File | Database Tables | Information Shown vs. Strictly Hidden |
|---|---|---|
| `src/ordertracking/ordertracking.service.ts` | `loadingdet` (filtered to `companyId = 3` and `UPPER(ordernum) = ?`) LEFT JOIN `vessel_tracking_snapshot` | **Shown (same vetted public fields as `/track-order`):**<br>- Order number, stage (`preparing` / `at_port` / `sailing` / `arrived` / `delivered`), basis (`carrier` / `schedule` / `plan`)<br>- Container number & size (`40ft`), cleaned vessel name (voyage codes stripped), carrier name<br>- Factory load date / estimated load date, Colombo ETD, ETA, arrival date, current location, transit percentage (`progress`), port route (`origin` → `via` → `destination`), and timeline `events`<br>- Direct link to `/track-order?order=<ORDER_NUMBER>` for the interactive Leaflet route map.<br><br>**Strictly Hidden (never queried or exposed to the AI or user):**<br>- `consignee`, `bookingno`, `invoiceno`, `lcno`, unit/order prices, customer account details, internal cost columns, or any rows outside `companyId = 3`. |

---

## 3. Technical Architecture (Phase 2)

```text
Visitor on madewith.earthfoam.com
  │
  ▼  POST /chatbot/message  (history + user message)
┌────────────────────────────────────────────────────────────────┐
│ NestJS API (/home/ubuntu/api) — ChatbotModule                  │
│  ├── ChatbotRateLimit (IP-based sliding window)                │
│  ├── Grounded System Prompt (madewith.earthfoam.com +          │
│  │   earthfoam.lk product/FAQ/showroom knowledge + links)      │
│  ├── Gemini 3.5 Flash-Lite API (GEMINI_API_KEY)                │
│  │     ├── Tool 1: track_order(orderNumber)                    │
│  │     │     └──► OrdertrackingService + ordertracking limiter │
│  │     └── Tool 2: submit_inquiry(type, contact, details)      │
│  │           └──► MailService.sendMailAdvanced()               │
│  │                 ├── B2B/Wholesale/OEM ► foamfactory@earthfoam.com
│  │                 └── Retail/Showroom   ► info@earthfoam.lk   │
│  └── Returns { reply, actions[] } (links, PDFs, order cards)   │
└────────────────────────────────────────────────────────────────┘
```

### Guardrails & Security

1. **API Key Protection:** `GEMINI_API_KEY` lives exclusively in `/home/ubuntu/api/.env`—never exposed in the React bundle.
2. **Order Enumeration Protection:** `track_order` calls the same `takeLookup` / `recordMiss` rate limiter (`src/ordertracking/ordertracking.rate-limit.ts`) as `GET /ordertracking` so the chat interface cannot bypass miss caps.
3. **Chat Flood Protection:** Dedicated per-IP rate limit in `src/chatbot/chatbot.rate-limit.ts` (e.g., max 20 messages per 10 minutes per IP, bounded conversation history & message length).
4. **Strict Grounding:** System instructions forbid fabricating prices, MOQs, foam densities, custom lead times, or unverified product claims. When pricing or custom specs are requested, the bot transitions to `submit_inquiry`.
5. **Email Compliance (`/home/ubuntu/api/AGENTS.md`):** Lead notification emails sent through `MailService.sendMailAdvanced()` will use Outlook-safe table-based HTML with `<!--[if mso]>` wrappers, `<td>`-level styles, `mso-line-height-rule: exactly;`, HTML fallback attributes (`bgcolor`, `cellpadding="0"`, `cellspacing="0"`, `border="0"`), and full HTML escaping of user-supplied fields.

---

## 4. Exact Implementation Scope (When Approved)

### A. Backend Changes in `/home/ubuntu/api`

- **Export `OrdertrackingService`** from `src/ordertracking/ordertracking.module.ts`.
- **Create `src/chatbot/`:**
  - `chatbot.module.ts` — Imports `OrdertrackingModule` (and uses global `MailModule` + `ConfigService`).
  - `chatbot.controller.ts` — `POST /chatbot/message` with payload validation (`messages` capped to last 12 turns, max message length 1,000 chars) and `Cache-Control: no-store`.
  - `chatbot.rate-limit.ts` — Per-IP rate limiter using the same `clientKey(req)` proxy-aware IP logic as `ordertracking.rate-limit.ts`.
  - `chatbot.knowledge.ts` — Structured, curated knowledge prompt compiled from `madewith.earthfoam.com` and `earthfoam.lk` (`productsData.js`, `catalogueProductData.json`, `HelpPage.jsx`, `ContactPage.jsx`, `certifications.js`, `projects.js`).
  - `chatbot.service.ts` — Calls Gemini `generateContent` REST API (using `axios`, already in `api/package.json`) with function declarations for `track_order` and `submit_inquiry`, executes tool calls server-side, returns `{ reply, links, orderNumbers }` (plus Outlook-safe MSO table email template helper for leads).
- **Register `ChatbotModule`** in `src/app.module.ts`.
- **Configure `.env`** in `/home/ubuntu/api/.env`:
  - `GEMINI_API_KEY=...`
  - `GEMINI_MODEL=gemini-3.5-flash-lite`
  - `CHATBOT_B2B_LEAD_EMAIL=foamfactory@earthfoam.com`
  - `CHATBOT_RETAIL_LEAD_EMAIL=info@earthfoam.lk`

### B. Frontend Changes in `/home/ubuntu/madewithearthfoam` (on `chatbot` branch)

- **`src/lib/chatbot.js`** — API client calling `${API_URL}/chatbot/message` (following the `VITE_API_URL` pattern in `src/lib/orderTracking.js`) plus structured error handling.
- **`src/components/ChatBot.jsx` & `src/styles/chatbot.css`** —
  - Floating bottom-right launcher pill/button and expandable drawer styled with the site's exact palette (`#141617` background, `#202122` surfaces, `#E68276` sunset accent, `#F8F7ED` cream highlights, GT America typography) and `lucide-react` icons.
  - Starter prompt chips: *"Track an order"*, *"Mattresses & Pillows (earthfoam.lk)"*, *"Wholesale & White-Label"*, *"Certifications & PDFs"*.
  - Safe Markdown/structured rendering for clickable redirect buttons (`https://earthfoam.lk/...` opening in a new tab with clear label), internal links (`/track-order?order=...`, `/#standards-and-certifications`), and certificate PDF pills.
  - Optional inline quick-inquiry form or conversational lead capture flow.
- **`src/layouts/RootLayout.jsx`** — Mount `<ChatBot />` globally across all pages (`/` home, project pages, `/track-order`, `/contact`).
- **`dev/` dev-server support** — Local dev proxy or sample handler in `vite.config.js` / `dev/` pointing to local NestJS (`http://localhost:5000`) when testing locally.

---

## 5. Verification Checklist (After Implementation)

- **Branch & Diff Checks:** Verify `madewithearthfoam` is on `chatbot` branch and `npm run lint` + `npm run build` succeed cleanly.
- **API Build & Tests:** Verify `npm run build` in `/home/ubuntu/api` passes with TypeScript strictness and verify the Outlook HTML email template against the `/home/ubuntu/api/AGENTS.md` checklist.
- **End-to-End Functional Scenarios:**
  1. **B2B / Supply Chain:** Ask *"Are your farms organic and what certifications do you have?"* → Returns Sri Lankan 323-farm / 1,700+ worker details + clickable GOLS, GOTS, Fair for Life, Eco-Institut, FSC, OEKO-TEX, OCS, ISO 9001/14001 PDF links.
  2. **Retail Mattress / Pillow + Redirect:** Ask *"What mattresses or contour pillows do you sell and where is your showroom?"* → Summarizes Organic Mattress, Hybrid line (Osaka, Ventura, Brandford, Meriden, Aurora, Athens series), Topper, and 4 Pillow models + Colombo 03 showroom hours + direct redirect links to `https://earthfoam.lk/products/...` without inventing prices.
  3. **Live Order Tracking:** Ask *"Track order <real order number>"* → Triggers `track_order` tool, prints stage/vessel/location/ETA, and provides a `/track-order?order=<ORDER_NUMBER>` map link; verify no consignee/invoice/pricing fields are returned (and never expose real customer order numbers in UI placeholders/prompts—use `ABC/012/26` as the format example).
  4. **Lead Capture:** Submit a wholesale or retail inquiry in chat → Triggers `submit_inquiry` tool and delivers an Outlook-safe HTML summary email to `foamfactory@earthfoam.com` (B2B) or `info@earthfoam.lk` (Retail).

