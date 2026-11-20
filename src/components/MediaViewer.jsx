import { Award, ChevronLeft, ChevronRight, Users, X } from 'lucide-react'
import { useImperativeHandle, useRef, useState } from 'react'
import { youtubeEmbedUrl } from '../data/videos.js'
import useYouTubeEnded from '../hooks/useYouTubeEnded.js'

// Stand-ins until an award's photos arrive: the award, then our people.
const PLACEHOLDER_PHOTOS = [
  { placeholder: Award, alt: 'Photo of the award' },
  { placeholder: Users, alt: 'Photo of our team at the ceremony' },
]

// Award card: photos on one side (award, then our people), the details on
// the other, laid out like the case-study cards on the project pages.
function AwardCard({ item, meta, close }) {
  const photos = item.photos?.length ? item.photos : PLACEHOLDER_PHOTOS
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState('next')
  const photo = photos[index]
  const go = (next) => {
    setDir(next < index ? 'prev' : 'next')
    setIndex(next)
  }
  const step = (by) => {
    setDir(by < 0 ? 'prev' : 'next')
    setIndex((i) => (i + by + photos.length) % photos.length)
  }

  // Swipe: a mostly-sideways drag of 40px or more changes photo. Works for
  // touch, pen and mouse drags alike.
  const swipe = useRef(null)
  const swipeHandlers =
    photos.length > 1
      ? {
          onPointerDown: (e) => {
            if (e.target.closest('button')) return
            swipe.current = { x: e.clientX, y: e.clientY }
          },
          onPointerUp: (e) => {
            const start = swipe.current
            swipe.current = null
            if (!start) return
            const dx = e.clientX - start.x
            const dy = e.clientY - start.y
            if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1)
          },
          onPointerCancel: () => {
            swipe.current = null
          },
        }
      : {}

  return (
    <article
      className="awardCard"
      onKeyDown={(e) => {
        if (photos.length < 2) return
        if (e.key === 'ArrowLeft') step(-1)
        if (e.key === 'ArrowRight') step(1)
      }}
    >
      <button onClick={close} className="mediaViewer__close cursor-pointer" aria-label="Close">
        <X size={22} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div className="awardCard__media">
        <div className="awardCard__photo" {...swipeHandlers}>
          <div key={index} className="awardCard__slide" data-dir={dir}>
            {photo.placeholder ? (
              <span className="mediaThumb__placeholder" role="img" aria-label={photo.alt}>
                <photo.placeholder size={40} strokeWidth={1.25} aria-hidden="true" />
              </span>
            ) : (
              <img src={photo.src} alt={photo.alt ?? ''} draggable="false" />
            )}
          </div>
          {photos.length > 1 && (
            <div className="awardCard__controls">
              <button type="button" className="mediaIconButton" aria-label="Previous photo" onClick={() => step(-1)}>
                <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <span className="text-14" aria-live="polite">
                {index + 1} / {photos.length}
              </span>
              <button type="button" className="mediaIconButton" aria-label="Next photo" onClick={() => step(1)}>
                <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <ol className="awardCard__thumbs" aria-label="Photos">
            {photos.map((p, i) => (
              <li key={p.src ?? i}>
                <button
                  type="button"
                  aria-label={`Photo ${i + 1}: ${p.alt}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  {p.placeholder ? (
                    <span className="mediaThumb__placeholder" aria-hidden="true">
                      <p.placeholder size={18} strokeWidth={1.25} />
                    </span>
                  ) : (
                    <img src={p.src} alt="" />
                  )}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="awardCard__body">
        {item.achievement && (
          <p className="eyebrow-sm awardEntry__achievement mb-3">
            <Award size={13} strokeWidth={1.75} aria-hidden="true" />
            {item.achievement}
          </p>
        )}
        <h2 className="h3 mb-3">{item.title}</h2>
        {meta && <p className="text-14 color-gray7">{meta}</p>}
        {item.summary && <p className="color-gray8 mt-4">{item.summary}</p>}
      </div>
    </article>
  )
}

// Full-screen <dialog> for the Gallery: plays an entry's video, shows its
// image (press clippings) full size, or opens an award's card. Exposes
// open(item).
export default function MediaViewer({ ref, formatDate }) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)
  const iframeRef = useRef(null)
  const [item, setItem] = useState(null)

  const close = () => dialogRef.current?.close()

  // Close when a YouTube video ends, before YouTube's end-screen grid shows.
  useYouTubeEnded(iframeRef, close, Boolean(item?.youtube))

  useImperativeHandle(ref, () => ({
    open(next) {
      setItem(next)
      dialogRef.current.showModal()
    },
    close,
  }))

  const meta = item && [formatDate(item), item.source, item.location].filter(Boolean).join(' · ')
  const isAward = item?.category === 'awards'

  return (
    <dialog
      ref={dialogRef}
      className={`modal mediaViewer p-0${isAward ? ' mediaViewer--card' : ''}`}
      aria-label={item?.title}
      onClick={(e) => e.target === dialogRef.current && close()}
      onClose={() => {
        videoRef.current?.pause()
        setItem(null)
      }}
    >
      {item && isAward && <AwardCard key={item.id} item={item} meta={meta} close={close} />}
      {item && !isAward && (
        <figure className="mediaViewer__figure">
          <button onClick={close} className="mediaViewer__close cursor-pointer" aria-label="Close">
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
          {item.youtube ? (
            <div className="mediaViewer__media mediaViewer__media--youtube">
              <iframe
                ref={iframeRef}
                key={item.id}
                src={youtubeEmbedUrl(item.youtube)}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : item.video ? (
            <video
              ref={videoRef}
              key={item.id}
              src={item.video.src}
              poster={item.video.poster}
              controls
              autoPlay
              playsInline
              className="mediaViewer__media"
              onEnded={close}
            />
          ) : (
            <img src={item.image} alt={item.title} className="mediaViewer__media" />
          )}
          <figcaption className="mediaViewer__caption">
            <p className="h4">{item.title}</p>
            {meta && <p className="text-14 color-gray7 mt-1">{meta}</p>}
          </figcaption>
        </figure>
      )}
    </dialog>
  )
}
