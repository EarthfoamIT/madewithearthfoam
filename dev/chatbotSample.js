import { certificationList as certifications } from '../src/data/certificationList.js'
import { createOrderLookup } from './orderTrackingSample.js'

const ORDER_NUMBER_MATCH = /\b[A-Z0-9]{2,12}(?:[/-][A-Z0-9]{1,12}){1,4}\b/i

const STAGE_LABELS = {
  preparing: 'Being made',
  at_port: 'At the port',
  sailing: 'At sea',
  arrived: 'Arrived',
  delivered: 'Delivered',
}

const EARTHFOAMLK_LINKS = {
  products: 'https://earthfoam.lk/products',
  mattress: 'https://earthfoam.lk/products/mattress',
  hybridGallery: 'https://earthfoam.lk/products/hybrid-mattress',
  hybridModels: {
    osaka: 'https://earthfoam.lk/products/hybrid-mattress/osaka',
    ventura: 'https://earthfoam.lk/products/hybrid-mattress/ventura',
    brandford: 'https://earthfoam.lk/products/hybrid-mattress/brandford',
    meriden: 'https://earthfoam.lk/products/hybrid-mattress/meriden',
    aurora: 'https://earthfoam.lk/products/hybrid-mattress/aurora',
    'athens-euro-top': 'https://earthfoam.lk/products/hybrid-mattress/athens-euro-top',
    'athens-signature': 'https://earthfoam.lk/products/hybrid-mattress/athens-signature',
    'athens-legacy': 'https://earthfoam.lk/products/hybrid-mattress/athens-legacy',
  },
  topper: 'https://earthfoam.lk/products/topper',
  pillowGallery: 'https://earthfoam.lk/products/pillow',
  pillowModels: {
    'standard-2zone': 'https://earthfoam.lk/products/pillow/standard-2zone',
    contour: 'https://earthfoam.lk/products/pillow/contour',
    'standard-monozone': 'https://earthfoam.lk/products/pillow/standard-monozone',
    knobby: 'https://earthfoam.lk/products/pillow/knobby',
  },
  contact: 'https://earthfoam.lk/contact',
  shipping: 'https://earthfoam.lk/help/shipping-and-returns',
}

const SAMPLE_SYSTEM_PROMPT = `You are the official Earthfoam AI Assistant on madewith.earthfoam.com — the B2B manufacturing, supply-chain, certification, and container-tracking portal for Earthfoam Private Limited (Div. S4, HEPZ BOI, Poruwadanda, Horana, Sri Lanka | foamfactory@earthfoam.com | +94 77 227 2731).

Rules:
1. Never invent prices, MOQs, or lead times not stated here. Retail products on earthfoam.lk use "Inquire price".
2. Always call track_order ONLY when the user explicitly provides an order number from their confirmation/invoice. Never suggest or invent real customer order numbers; if asked for an example format, use the placeholder ABC/012/26 and never look up ABC/012/26.
3. For consumer mattresses, toppers, pillows, or showroom visits, use the verified earthfoam.lk details below and include direct https://earthfoam.lk/... links.
4. Formatting: Write like a natural, polished chat assistant. NEVER use Markdown headings (#, ##, ###) or horizontal dividers (---). Use short paragraphs, bold labels (**...**), and concise bullet points (- ). Always respond in clean English using standard ASCII/Latin characters (never emit stray CJK/Katakana characters), and write inch measurements clearly (e.g. 10" or 10 inches).

Made With Earthfoam (madewith.earthfoam.com):
- Natural Dunlop latex foam (zero fillers, zero synthetics) for bedding, furniture, upholstery, footwear.
- Fair For Life certified network of 323 small GOLS-certified organic farms in Sri Lanka, 1,700+ workers, 20+ year tree lifespan, rubberwood heats vulcanization boilers, Horana factory technicians average 15 years experience; farm biodiversity includes tea, honey, cocoa, black pepper, and kithul syrup.
- 11 certifications across 4 groups (organic, fair-trade, sustainable, safe; PDF certificates under /assets/): GOLS (/assets/2026-PVL-Cert-GOLS.pdf), GOTS (/assets/GOTS%20New.pdf), Organic Content Standard (/assets/OCS_Scope_Certificate_2025-04-02%2008_49_57%20UTC.pdf), Fair for Life (/assets/FFL%20Certificate.pdf), For Life (/assets/FL_Certificate_Earthfoam%20Private%20Limited_20260515.pdf), ISO 14001 (/assets/Earthfoam%20(Private)%20Limited%20-14k%202025.pdf), FSC (/assets/FSC%20Certificate.pdf), Oeko-Tex (/assets/2026-PVL-Cert-OekoTex.pdf), Eco-Institut (/assets/Eco%20Certificate.pdf), ISO 9001 (/assets/ISO%2090012015%20Certificate.pdf), and WRAP (/assets/WRAP-Certificate-2026-10-26.pdf).
- Organic & Fair Trade Program (/fair-for-life and /#fair-trade-projects) with 3-step Development Fund: Healthcare (/increasing-access-to-healthcare), Productivity & Working Conditions (/improving-productivity-and-working-conditions), Community (/strengthening-the-community).
- Working With Us / B2B services: Wholesale Latex Foam (custom sizes/densities including hard rubber, adjustable molds, Made with Earthfoam seal licensing), Product Collaboration, OEM / White-Label Manufacturing.
- Media Gallery & Awards (/gallery and /gallery?type=awards): features the film "Earthfoam, Certified Quality" and 13 awards (2023-2026) including the 25th, 26th, and 27th Presidential Export Awards, PRISL (2025, 2026), National Chamber of Commerce (2025), CNCI (2026), People's Pinnacle Best Mattress Brand (2024), National Industry Brand Excellence (2024), and National Industry Excellence (2023). Never invent or cite placeholder sample items.

Earthfoam Sri Lanka Retail (https://earthfoam.lk):
- Organic Mattress (https://earthfoam.lk/products/mattress): 5-layer build (latex base & comfort layer, organic cotton batting, organic wool fire barrier, GOTS cotton cover), widths 36", 42", 48", 60", 72"; lengths 72", 75", 78"; heights 6", 8", 10" (inches).
- 8 Hybrid Mattresses (https://earthfoam.lk/products/hybrid-mattress): Osaka (4", 6", 8", 10" heights), Ventura (8" height, orthopaedic), Brandford (10" height, medium-soft/firmest coil), Meriden (12" height, pillow-top), Aurora (14" height, cool euro-top), Athens Euro Top (16" height), Athens Signature (16" height), Athens Legacy (18" height).
- Organic Mattress Topper (https://earthfoam.lk/products/topper): 4-layer latex/wool/cotton, heights 1" and 2" (inches).
- 4 Natural Latex Pillows (https://earthfoam.lk/products/pillow): Standard 2-Zone (60/70/84x40x15cm), Contour Mono-Zone (60/70x40cm, 12/10cm or 10/8cm, Soft/Medium), Standard Mono-Zone (60x40x12.5cm), Knobby (59x36x13cm).
- Showroom: No 45, Dharmapala Mawatha, Colombo 03 (open 7 days, 10 AM - 6 PM | info@earthfoam.lk | +94 114 245 245 | https://earthfoam.lk/contact).
- Trials & Warranties: 100-day mattress/topper trial, 30-day pillow trial, 10-year mattress warranty, 5-year pillow warranty, free delivery to most of Sri Lanka (2 working days dispatch; 4 working days in Colombo).`

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 64_000) reject(new Error('Payload too large'))
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function sanitizeAssistantText(text, userText = '') {
  let out = `${text || ''}`
  if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(userText)) {
    out = out
      .replace(/(\d)\s*[\u3040-\u30ff\u3400-\u9fff]+/g, '$1"')
      .replace(/[\u3040-\u30ff\u3400-\u9fff]+/g, '')
  }
  return out.trim()
}

function collectActions(userText, replyText, tracking) {
  const actions = []
  const seen = new Set()
  const add = (action) => {
    const key = `${action.href || ''}:${action.label}`
    if (seen.has(key)) return
    seen.add(key)
    actions.push(action)
  }

  if (tracking?.orderNumber) {
    add({
      label: `View ${tracking.orderNumber} map & timeline`,
      href: `/track-order?order=${encodeURIComponent(tracking.orderNumber)}`,
      kind: 'track',
    })
  }

  const userLower = `${userText || ''}`.toLowerCase()
  const replyLower = `${replyText || ''}`.toLowerCase()

  if (/\b(mattress\w*|bed\w*|sleep\w*|organic mattress)\b/.test(userLower) && !/\bawards?\b/.test(userLower)) {
    add({ label: 'Organic Mattress (earthfoam.lk)', href: EARTHFOAMLK_LINKS.mattress, external: true, kind: 'retail' })
  }
  if (/\b(hybrid\w*|osaka|ventura|brandford|meriden|aurora|athens)\b/.test(userLower)) {
    add({ label: 'Hybrid Mattresses (earthfoam.lk)', href: EARTHFOAMLK_LINKS.hybridGallery, external: true, kind: 'retail' })
    const hybridScope = `${userLower}\n${replyLower}`
    for (const [model, url] of Object.entries(EARTHFOAMLK_LINKS.hybridModels)) {
      if (hybridScope.includes(model.replace(/-/g, ' ')) || hybridScope.includes(model)) {
        add({
          label: `${model.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} (earthfoam.lk)`,
          href: url,
          external: true,
          kind: 'retail',
        })
      }
    }
  }
  if (/\btopper\w*\b/.test(userLower)) {
    add({ label: 'Mattress Topper (earthfoam.lk)', href: EARTHFOAMLK_LINKS.topper, external: true, kind: 'retail' })
  }
  if (/\b(pillow\w*|contour|knobby|2-zone|2 zone)\b/.test(userLower)) {
    add({ label: 'Natural Latex Pillows (earthfoam.lk)', href: EARTHFOAMLK_LINKS.pillowGallery, external: true, kind: 'retail' })
  }
  if (/\b(showroom\w*|dharmapala|colombo|store|visit|info@earthfoam\.lk)\b/.test(userLower)) {
    add({ label: 'Colombo Showroom (earthfoam.lk)', href: EARTHFOAMLK_LINKS.contact, external: true, kind: 'retail' })
  }

  const wantsCertProof = /\b(certif\w*|certs?|pdfs?|standard\w*|downloads?|compliance)\b/.test(userLower)
  const certMatchers = {
    GOLS: /\bgols\b/,
    GOTS: /\bgots\b/,
    'Organic Content Standard': /\b(ocs|organic content standard)\b/,
    FSC: /\bfsc\b/,
    'Oeko-Tex': /\boeko[-\s]*tex\b/,
    'Eco-Institut': /\beco[-\s]*institut\b/,
    WRAP: /\bwrap\b/,
  }
  const hasGenericIso = /\biso\b/.test(userLower)
  const hasIso9001 = /\biso\s*9001\b/.test(userLower)
  const hasIso14001 = /\biso\s*14001\b/.test(userLower)

  const matchedCerts = certifications.filter((cert) => {
    if (cert.label === 'Fair for Life') {
      return /\bfair\s+for\s+life\b/.test(userLower) && wantsCertProof
    }
    if (cert.label === 'For Life') {
      return /(?<!fair\s)\bfor\s+life\b/.test(userLower) && wantsCertProof
    }
    if (cert.label === 'ISO 14001') {
      return hasIso14001 || (hasGenericIso && !hasIso9001)
    }
    if (cert.label === 'ISO 9001') {
      return hasIso9001 || (hasGenericIso && !hasIso14001)
    }
    const matcher = certMatchers[cert.label]
    return Boolean(matcher && matcher.test(userLower))
  })

  const asksAllCerts =
    /\b(all\s+(?:9|11)|certifications?|certificates?|certs?|compliance)\b/.test(userLower) ||
    (/\b(certified|standards?)\b/.test(userLower) &&
      !/\b(pillow\w*|mattress\w*|topper\w*|hybrid\w*|award\w*|video\w*|film)\b/.test(userLower))

  if (matchedCerts.length > 0 && !/\ball\b/.test(userLower)) {
    for (const cert of matchedCerts) {
      add({ label: cert.label, href: cert.href, external: true, kind: 'pdf' })
    }
  } else if (asksAllCerts) {
    for (const cert of certifications) {
      add({ label: cert.label, href: cert.href, external: true, kind: 'pdf' })
    }
  }

  if (/\b(fair\s+for\s+life|fair\s*trade|development fund|323|farm\w*|forest\w*|tapper\w*|project\w*|community|healthcare)\b/.test(userLower)) {
    add({ label: 'Fair for Life', href: '/fair-for-life' })
  }
  if (/\b(awards?|export awards?|prisl|cnci|pinnacle|excellence)\b/.test(userLower)) {
    add({ label: 'Awards & Gallery', href: '/gallery?type=awards' })
  }
  if (/\b(awards?|video\w*|film|certified quality|media|gallery)\b/.test(userLower)) {
    add({ label: 'Media Gallery', href: '/gallery' })
  }
  if (/\b(wholesale|white label|white-label|oem|working with us|working together|seal|inquir\w*|quot\w*|collab\w*|partner\w*|b2b|pric\w*)\b/.test(userLower)) {
    add({ label: 'Send an inquiry', kind: 'inquiry' })
  }

  return actions.slice(0, 12)
}

async function buildGroundedReply(userMessage, lookupOrder, logger) {
  const q = userMessage.toLowerCase()
  const orderMatch = userMessage.match(ORDER_NUMBER_MATCH)

  if (orderMatch) {
    if (orderMatch[0].toUpperCase() === 'ABC/012/26') {
      return {
        reply: '`ABC/012/26` is just an example format. Please enter your own order number from your order confirmation or invoice.',
        actions: [{ label: 'Open Track Order page', href: '/track-order', kind: 'track' }],
        mode: 'grounded',
      }
    }
    try {
      const result = await lookupOrder(orderMatch[0])
      if (result.status === 200) {
        const data = result.body
        const primary = data.shipments?.[0]
        const stageLabel = STAGE_LABELS[primary?.stage] || primary?.stage || 'In progress'
        const lines = [
          `Order **${data.orderNumber}** (${data.shipments.length} container${data.shipments.length > 1 ? 's' : ''}): **${stageLabel}**.`,
        ]
        if (primary?.vesselName) lines.push(`Vessel: ${primary.vesselName}.`)
        if (primary?.currentLocation) lines.push(`Last reported location: ${primary.currentLocation}.`)
        if (primary?.arrivalDate) lines.push(`Arrived: ${primary.arrivalDate}.`)
        else if (primary?.eta) lines.push(`Expected arrival (ETA): ${primary.eta}.`)

        return {
          reply: lines.join('\n'),
          actions: [
            {
              label: `View ${data.orderNumber} map & timeline`,
              href: `/track-order?order=${encodeURIComponent(data.orderNumber)}`,
              kind: 'track',
            },
          ],
          tracking: data,
          mode: 'grounded',
        }
      }
      return {
        reply: result.body?.message || `We could not look up order ${orderMatch[0]}.`,
        actions: [{ label: 'Open Track Order page', href: '/track-order', kind: 'track' }],
        mode: 'grounded',
      }
    } catch (err) {
      logger.error(`[chatbot-sample] Order lookup error: ${err.message}`)
      return {
        reply: 'Our sample order tracking database is unavailable in dev mode. Check ORDER_TRACKING_SAMPLE_DB in .env.local or run the NestJS API on port 5000.',
        actions: [{ label: 'Open Track Order page', href: '/track-order', kind: 'track' }],
        mode: 'grounded',
      }
    }
  }

  if (/\b(track\w*|shipment\w*|container\w*|vessel\w*|eta|order status|where is my order)\b/.test(q)) {
    return {
      reply:
        'Share the order number from your order confirmation or invoice (formatted like `ABC/012/26`) and I will fetch live manufacturing and vessel tracking details for you.',
      actions: [{ label: 'Open Track Order page', href: '/track-order', kind: 'track' }],
      mode: 'grounded',
    }
  }

  if (/\b(certif\w*|certs?|standards?|gols|gots|ocs|organic content standard|fair\s+for\s+life|for\s+life|iso(?:\s*\d+)?|fsc|oeko[-\s]*tex|eco[-\s]*institut|wrap)\b/.test(q)) {
    return {
      reply: [
        'Earthfoam holds **11 third-party certifications** across four pillars:',
        '- **Organic:** GOLS, GOTS, Organic Content Standard (OCS)',
        '- **Fair Trade:** Fair for Life, For Life',
        '- **Sustainable:** ISO 14001, FSC',
        '- **Safe:** Oeko-Tex, Eco-Institut, ISO 9001, WRAP',
        'Download the official certificates below:',
      ].join('\n'),
      actions: certifications.map((c) => ({
        label: c.label,
        href: c.href,
        external: true,
        kind: 'pdf',
      })),
      mode: 'grounded',
    }
  }

  const asksPillow = /\b(pillow\w*|2-zone|2 zone|contour|monozone|mono zone|knobby)\b/.test(q)
  const asksHybrid = /\b(hybrid\w*|osaka|ventura|brandford|meriden|aurora|athens)\b/.test(q)
  const asksMattressOrRetail = /\b(mattress\w*|bed\w*|sleep\w*|showroom\w*|colombo|warrant\w*|trial\w*|return\w*|pric\w*|buy|earthfoam\.lk)\b/.test(q)

  if (asksPillow && !asksHybrid && !/\bmattress\w*\b/.test(q)) {
    return {
      reply:
        'On **earthfoam.lk**, Earthfoam offers four natural latex pillows (with a 30-day sleep trial and 5-year warranty):\n- **Standard Profile - 2 Zone** (`60/70/84 × 40 × 15cm`): Pin-pattern alignment to help reduce snoring.\n- **Contour Profile - Mono Zone** (`60/70 × 40cm`, heights `12/10cm` or `10/8cm`, Soft or Medium).\n- **Standard Profile - Mono Zone** (`60 × 40 × 12.5cm`).\n- **Knobby Pillow** (`59 × 36 × 13cm`): Textured pressure-point relief.',
      actions: [
        { label: 'Explore Pillows on earthfoam.lk', href: EARTHFOAMLK_LINKS.pillowGallery, external: true, kind: 'retail' },
        { label: 'Contour Pillow', href: EARTHFOAMLK_LINKS.pillowModels.contour, external: true, kind: 'retail' },
        { label: '2-Zone Standard Pillow', href: EARTHFOAMLK_LINKS.pillowModels['standard-2zone'], external: true, kind: 'retail' },
        { label: 'Inquire price', kind: 'inquiry' },
      ],
      mode: 'grounded',
    }
  }

  if (/\btopper\w*\b/.test(q) && !asksMattressOrRetail && !asksHybrid) {
    return {
      reply:
        'The **Earthfoam Organic Mattress Topper** on **earthfoam.lk** features a 4-layer latex and organic cotton/wool build in `1"` and `2"` heights (`36"` Single through `72"` King, lengths `72"`–`78"`), with a 100-day trial and machine-washable outer cover.',
      actions: [
        { label: 'View Topper on earthfoam.lk', href: EARTHFOAMLK_LINKS.topper, external: true, kind: 'retail' },
        { label: 'Inquire price', kind: 'inquiry' },
      ],
      mode: 'grounded',
    }
  }

  if (asksMattressOrRetail || asksHybrid || asksPillow) {
    return {
      reply:
        'Earthfoam’s consumer sleep range lives on **earthfoam.lk**:\n- **Earthfoam Organic Mattress:** 5-layer natural latex & organic wool/cotton build (`6"`, `8"`, `10"` heights, Single `36"` to King `72"`).\n- **8 Hybrid Mattresses:** Osaka, Ventura, Brandford, Meriden, Aurora, Athens Euro Top, Athens Signature, and Athens Legacy.\n- **Pillows & Toppers:** 4 natural latex pillows (2-Zone Standard, Contour, Mono-Zone Standard, Knobby) and `1"`/`2"` Organic Toppers.\n- **Showroom:** No 45, Dharmapala Mawatha, Colombo 03 (open 7 days, 10 AM – 6 PM | `+94 114 245 245` | `info@earthfoam.lk`).\n- **Trials & Warranties:** 100-day mattress/topper trial, 30-day pillow trial, 10-year mattress warranty, and free Sri Lanka delivery (2 working days dispatch; within 4 working days in Colombo).',
      actions: [
        { label: 'Organic Mattress (earthfoam.lk)', href: EARTHFOAMLK_LINKS.mattress, external: true, kind: 'retail' },
        { label: 'Hybrid Mattresses (earthfoam.lk)', href: EARTHFOAMLK_LINKS.hybridGallery, external: true, kind: 'retail' },
        { label: 'Natural Latex Pillows (earthfoam.lk)', href: EARTHFOAMLK_LINKS.pillowGallery, external: true, kind: 'retail' },
        { label: 'Showroom & Contact (earthfoam.lk)', href: EARTHFOAMLK_LINKS.contact, external: true, kind: 'retail' },
        { label: 'Inquire price', kind: 'inquiry' },
      ],
      mode: 'grounded',
    }
  }

  if (/\b(wholesale|white label|white-label|oem|collab\w*|seal|licens\w*|sourc\w*|quot\w*|inquir\w*|contact)\b/.test(q)) {
    return {
      reply:
        'Partner with our Horana, Sri Lanka factory via **Wholesale Latex Foam** (custom sizes, densities including hard rubber, adjustable molds, *Made with Earthfoam* seal licensing), **Product Collaboration**, or **OEM / White-Label Manufacturing**. Click **Send an inquiry** below to reach `foamfactory@earthfoam.com`.',
      actions: [
        { label: 'Send an inquiry', kind: 'inquiry' },
        { label: 'Working With Us', href: '/#working-together', kind: 'link' },
        { label: 'Contact Page', href: '/contact', kind: 'link' },
      ],
      mode: 'grounded',
    }
  }

  if (/\b(award\w*|gallery|media|video\w*|youtube|press|exhibit\w*|pinnacle|prisl|presidential export)\b/.test(q)) {
    return {
      reply:
        'Earthfoam’s **Media Gallery** highlights **13 industry & export awards (2023–2026)**—including Presidential Export Awards (*Best Exporter* 2022/2023 & 2023/2024), *People’s Pinnacle Award* (Best Mattress Brand 2024), National Chamber of Commerce 2025 awards, and PRISL *Most Outstanding Exporter* (2025 & 2026)—plus our *Earthfoam, Certified Quality* video.',
      actions: [
        { label: 'Awards Timeline', href: '/gallery?type=awards', kind: 'link' },
        { label: 'Media Gallery', href: '/gallery', kind: 'link' },
      ],
      mode: 'grounded',
    }
  }

  return {
    reply:
      'I can help with:\n- **Live order tracking** (enter your order number from your confirmation/invoice, e.g. `ABC/012/26`)\n- **Mattresses, hybrids, toppers & pillows** from `earthfoam.lk`\n- **11 Certifications & PDFs** (GOLS, GOTS, Fair for Life, For Life, WRAP, ISO 9001/14001, Eco-Institut, Oeko-Tex, FSC, OCS)\n- **Fair for Life projects, Awards & OEM / Wholesale inquiries** (`foamfactory@earthfoam.com`)',
    actions: [
      { label: 'Track an order', href: '/track-order', kind: 'track' },
      { label: 'Shop Mattresses on earthfoam.lk', href: EARTHFOAMLK_LINKS.products, external: true, kind: 'retail' },
      { label: 'Media Gallery & Awards', href: '/gallery', kind: 'link' },
      { label: 'Send an inquiry', kind: 'inquiry' },
    ],
    mode: 'grounded',
  }
}

export default function chatbotSample(env = {}) {
  const lookupOrder = createOrderLookup(env.ORDER_TRACKING_SAMPLE_DB)

  return {
    name: 'chatbot-sample',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/sample-api/chatbot/message', async (req, res) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { message: 'Method not allowed.' })
        }
        try {
          const body = await readJsonBody(req)
          const turns = Array.isArray(body.messages) ? body.messages : []
          const lastUser = [...turns].reverse().find((m) => m?.role === 'user' && m?.content)
          if (!lastUser) {
            return sendJson(res, 400, { message: 'Please include at least one chat message.' })
          }

          if (env.GEMINI_API_KEY && !env.GEMINI_API_KEY.startsWith('YOUR_')) {
            try {
              const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
              const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`
              const contents = turns.slice(-12).map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: `${m.content}`.slice(0, 1200) }],
              }))
              const tools = [{
                functionDeclarations: [{
                  name: 'track_order',
                  description: 'Look up live factory and shipping status for an Earthfoam order number.',
                  parameters: {
                    type: 'OBJECT',
                    properties: { orderNumber: { type: 'STRING' } },
                    required: ['orderNumber'],
                  },
                }],
              }]
              let trackingData = null
              let text = ''
              for (let step = 0; step < 3; step += 1) {
                const geminiRes = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SAMPLE_SYSTEM_PROMPT }] },
                    contents,
                    tools,
                    generationConfig: { temperature: 0.25, maxOutputTokens: 900 },
                  }),
                })
                if (!geminiRes.ok) break
                const payload = await geminiRes.json()
                const modelContent = payload?.candidates?.[0]?.content
                const parts = modelContent?.parts || []
                const calls = parts.filter((p) => p.functionCall)
                if (!calls.length) {
                  text = sanitizeAssistantText(parts.map((p) => p.text || '').join('\n'), lastUser.content)
                  break
                }
                contents.push(modelContent)
                const fnResponses = []
                for (const p of calls) {
                  if (p.functionCall.name === 'track_order') {
                    const reqNum = `${p.functionCall.args?.orderNumber || ''}`.trim().toUpperCase()
                    if (reqNum === 'ABC/012/26') {
                      fnResponses.push({
                        functionResponse: {
                          name: 'track_order',
                          response: { ok: false, error: 'ABC/012/26 is an example placeholder format. Ask the user for their own order number.' },
                        },
                      })
                    } else {
                      const lookup = await lookupOrder(reqNum)
                      if (lookup.status === 200) trackingData = lookup.body
                      fnResponses.push({
                        functionResponse: {
                          name: 'track_order',
                          response: lookup.status === 200
                            ? { ok: true, tracking: lookup.body }
                            : { ok: false, error: lookup.body?.message || 'Order not found.' },
                        },
                      })
                    }
                  }
                }
                contents.push({ role: 'user', parts: fnResponses })
              }
              if (text) {
                return sendJson(res, 200, {
                  reply: text,
                  actions: collectActions(lastUser.content, text, trackingData),
                  tracking: trackingData || undefined,
                  mode: 'gemini',
                })
              }
            } catch (err) {
              server.config.logger.warn(`[chatbot-sample] Gemini dev fallback: ${err.message}`)
            }
          }

          const reply = await buildGroundedReply(lastUser.content, lookupOrder, server.config.logger)
          return sendJson(res, 200, reply)
        } catch (err) {
          return sendJson(res, 400, { message: err.message || 'Invalid request.' })
        }
      })

      server.middlewares.use('/sample-api/chatbot/inquiry', async (req, res) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { message: 'Method not allowed.' })
        }
        try {
          const body = await readJsonBody(req)
          const name = `${body.name || ''}`.trim()
          const email = `${body.email || ''}`.trim()
          const message = `${body.message || ''}`.trim()
          if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
            return sendJson(res, 400, { message: 'Please provide your name, a valid email, and a message.' })
          }
          const recipient = body.inquiryType === 'retail' ? 'info@earthfoam.lk' : 'foamfactory@earthfoam.com'
          server.config.logger.info(`[chatbot-sample] Dev inquiry captured for ${recipient} from ${name} <${email}>`)
          return sendJson(res, 200, {
            ok: true,
            recipient,
            message: `Thank you, ${name}. In production this inquiry goes directly to ${recipient} (captured in dev log).`,
          })
        } catch (err) {
          return sendJson(res, 400, { message: err.message || 'Invalid inquiry.' })
        }
      })
    },
  }
}
