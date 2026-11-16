// Long-form films, hosted on YouTube and embedded with YouTubeEmbed.
// To add one: upload it, copy the ID from its embed code
// (youtube.com/embed/<ID>), and add an entry here. Entries also appear under
// Videos in the Gallery (see src/data/media.js).
//
// The YouTube domains are allowed in the Content-Security-Policy in
// vercel.json (img-src i.ytimg.com, frame-src www.youtube-nocookie.com).

export const VIDEOS = {
  certifiedQuality: {
    youtubeId: 'z7v4qwvwb3U',
    title: 'Earthfoam, Certified Quality',
    // Day it was added to the site; change to the official release date if needed.
    date: '2026-11-16',
  },
}

export const youtubeThumbnail = (youtubeId, size = 'maxresdefault') => `https://i.ytimg.com/vi/${youtubeId}/${size}.jpg`

export const youtubeEmbedUrl = (youtubeId) =>
  `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`
