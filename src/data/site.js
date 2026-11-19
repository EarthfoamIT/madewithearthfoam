export const SITE_URL = 'https://madewith.earthfoam.com'
export const SITE_NAME = 'Made With Earthfoam'
export const SITE_DESCRIPTION =
  'Earthfoam is organic, fair trade, high-performance natural latex foam made from the best rubber in the world.'

export const CONTACT = {
  email: 'foamfactory@earthfoam.com',
  phone: '+94 77 227 2731',
  phoneHref: 'tel:+94%2077%20227%202731',
}

export const ADDRESS_LINES = [
  'Earthfoam Private Limited',
  'Div. S4, HEPZ BOI,',
  'Poruwadanda, Horana',
  'Sri Lanka',
]

export const TAGLINE = {
  english: 'Harvested in Sri Lanka.',
  sinhala: 'ශ්‍රී ලංකාවේ අස්වනු නෙලනු ලැබේ.',
}

// Mailchimp audience used by the newsletter form.
export const MAILCHIMP = {
  host: 'https://madewithearthfoam.us18.list-manage.com',
  u: '59d937ed7407709a25bb8a787',
  id: '3a6867dde0',
  fId: '00cfb1e7f0',
  tags: '1089046',
}

// Served from public/assets/ under the same URLs as the original site.
export const HERO_VIDEOS = {
  background: {
    large: '/assets/madewith.hero_bg.1080p.webm',
    small: '/assets/madewith.hero_bg.720p.webm',
    // First frame of the video, shown until it can play.
    poster: '/assets/madewith.hero_bg.poster.webp',
  },
  // "Watch Our Story" film: the corporate video, VP9/Opus WebM.
  // `src` is the 720p copy everyone gets; `large` (1080p) is used on wide or
  // high-density screens when set. Leave `large` out to serve 720p only.
  story: {
    src: '/assets/corporate-video.720p.webm',
    large: '/assets/corporate-video.1080p.webm',
    type: 'video/webm',
  },
}
