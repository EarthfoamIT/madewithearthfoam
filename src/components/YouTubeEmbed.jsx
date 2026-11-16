import { Play } from 'lucide-react'
import { useState } from 'react'
import { youtubeEmbedUrl, youtubeThumbnail } from '../data/videos.js'

// Click-to-load YouTube player. Shows the thumbnail and a play button, and
// only loads YouTube (privacy-enhanced domain) once someone presses play, so
// pages stay fast and nothing is sent to YouTube until then.
export default function YouTubeEmbed({ youtubeId, title, caption, className = '' }) {
  const [playing, setPlaying] = useState(false)
  const [thumb, setThumb] = useState(() => youtubeThumbnail(youtubeId))

  return (
    <figure className={`ytEmbed ${className}`}>
      <div className="ytEmbed__frame">
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(youtubeId)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button type="button" className="ytEmbed__poster" onClick={() => setPlaying(true)} aria-label={`Play: ${title}`}>
            <img
              src={thumb}
              alt=""
              loading="lazy"
              // Videos without an HD thumbnail get a 120px-wide placeholder
              // instead; fall back to the standard one.
              onLoad={(e) => e.currentTarget.naturalWidth <= 120 && setThumb(youtubeThumbnail(youtubeId, 'hqdefault'))}
              onError={() => setThumb(youtubeThumbnail(youtubeId, 'hqdefault'))}
            />
            <span className="ytEmbed__play" aria-hidden="true">
              <Play size={22} strokeWidth={1.75} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      {caption && <figcaption className="text-14 color-gray7 mt-2">{caption}</figcaption>}
    </figure>
  )
}
