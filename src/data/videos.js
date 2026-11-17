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

export const YOUTUBE_ORIGIN = 'https://www.youtube-nocookie.com'

export const youtubeThumbnail = (youtubeId, size = 'maxresdefault') => `https://i.ytimg.com/vi/${youtubeId}/${size}.jpg`

// Keeps the player as plain as YouTube allows:
//   rel=0             suggestions only from our own channel
//   iv_load_policy=3  no annotation / card pop-ups
//   enablejsapi=1     lets us hear when the video ends (useYouTubeEnded), so
//                     we can close it before YouTube's end-screen grid shows
// YouTube no longer lets sites hide the title bar, share/copy link button,
// logo or the "More videos" panel on pause (showinfo and modestbranding were
// retired), and covering them breaks YouTube's embed terms. The quality
// selector stays in the settings menu.
export const youtubeEmbedUrl = (youtubeId) => {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    iv_load_policy: '3',
    playsinline: '1',
    enablejsapi: '1',
    origin: window.location.origin,
  })
  return `${YOUTUBE_ORIGIN}/embed/${youtubeId}?${params}`
}
