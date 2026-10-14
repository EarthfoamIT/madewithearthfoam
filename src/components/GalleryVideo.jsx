import { useEffect, useRef, useState } from 'react'
import videoPlayIcon from '../assets/graphics/video-play.svg'

// Square looping clip. On hover-capable devices it plays while the pointer
// is over it; on touch devices it plays whenever it is in view.
export default function GalleryVideo({ src, caption }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    video.muted = true

    if (window.matchMedia('(any-hover: none)').matches) {
      const observer = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
        { rootMargin: '0px', threshold: 0 },
      )
      observer.observe(video)
      return () => observer.disconnect()
    }

    const onEnter = () => {
      video.play().catch(() => {})
      setPlaying(true)
    }
    const onLeave = () => {
      video.pause()
      setPlaying(false)
    }
    video.addEventListener('mouseenter', onEnter)
    video.addEventListener('mouseleave', onLeave)
    return () => {
      video.removeEventListener('mouseenter', onEnter)
      video.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <figure
      className={`contentLayout__galleryMedia galleryVideoRollover relative mt-2 mb-2${playing ? ' galleryVideoRollover--playing' : ''}`}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        className="w-full h-auto fit-cover aspect-square brad-1"
        width="512"
        height="512"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="p-2 absolute t0 l0">
        <img src={videoPlayIcon} width="31" height="31" alt="Play" />
      </div>
      <div className="w-full p-2 absolute b0 l0 r0 flex justify-center">
        <figcaption className="rounded text-caption text-center inline-block">{caption}</figcaption>
      </div>
    </figure>
  )
}
