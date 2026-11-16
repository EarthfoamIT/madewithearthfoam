import { X } from 'lucide-react'
import { useImperativeHandle, useRef, useState } from 'react'
import { youtubeEmbedUrl } from '../data/videos.js'

// Full-screen <dialog> for the Gallery: plays an entry's video or shows
// its image (press clippings, award photos) full size. Exposes open(item).
export default function MediaViewer({ ref, formatDate }) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)
  const [item, setItem] = useState(null)

  const close = () => dialogRef.current?.close()

  useImperativeHandle(ref, () => ({
    open(next) {
      setItem(next)
      dialogRef.current.showModal()
    },
    close,
  }))

  const meta = item && [formatDate(item), item.source, item.location].filter(Boolean).join(' · ')

  return (
    <dialog
      ref={dialogRef}
      className="modal mediaViewer p-0"
      aria-label={item?.title}
      onClick={(e) => e.target === dialogRef.current && close()}
      onClose={() => {
        videoRef.current?.pause()
        setItem(null)
      }}
    >
      {item && (
        <figure className="mediaViewer__figure">
          <button onClick={close} className="mediaViewer__close cursor-pointer" aria-label="Close">
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
          {item.youtube ? (
            <div className="mediaViewer__media mediaViewer__media--youtube">
              <iframe
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
