import { useEffect, useRef } from 'react'
import { HERO_VIDEOS, SITE_DESCRIPTION } from '../data/site.js'
import { ArrowRightIcon } from './icons.jsx'
import Header from './Header.jsx'
import VideoModal from './VideoModal.jsx'

// `onVisibilityChange(isVisible)` tells the layout whether the hero is on
// screen, so the fixed header can stay hidden until the hero scrolls away.
export default function Hero({ onVisibilityChange }) {
  const heroRef = useRef(null)
  const backgroundRef = useRef(null)
  const modalRef = useRef(null)

  // Slide the fixed site header in once the hero leaves the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => onVisibilityChange?.(entry.isIntersecting),
      { rootMargin: '-150px', threshold: 0 },
    )
    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [onVisibilityChange])

  // Pause the background video while it is off screen.
  useEffect(() => {
    const video = backgroundRef.current
    video.muted = true
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { rootMargin: '0px', threshold: 0 },
    )
    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="hero relative ml-a mr-a">
      {/* Transparent copy of the header that sits over the video
          (styled by `main .header` in global.css). */}
      <Header />

      <div
        className="flex flex-col items-center justify-center gap-4 lg:gap-5 text-center absolute t0 l0 r0 b0 p-2 lg:p-4"
        style={{ zIndex: 10 }}
      >
        <h1 className="h1">Good to the core.</h1>
        {/* Same as the meta description but ends with "!", as on the original. */}
        <p className="h3 hero__subhead">{SITE_DESCRIPTION.replace(/\.$/, '!')}</p>
        <div>
          <button className="h4 button button--white button--extended" onClick={() => modalRef.current.open()}>
            Watch Our Story
          </button>
        </div>
      </div>

      <div className="hero__notifications absolute b0 l0 flex items-start flex-col gap-1 p-1 lg:p-2" style={{ zIndex: 11 }}>
        <a href="#newsletter" className="hero__notification rounded inline-flex items-center gap-2 cursor-pointer text-14 lg:text-16">
          <span>Stay up to date with our newsletter</span>
          <ArrowRightIcon />
        </a>
      </div>

      <video ref={backgroundRef} muted playsInline autoPlay loop className="hero__background w-full h-full fit-cover">
        <source src={HERO_VIDEOS.background.large} type="video/mp4" media="(min-width: 1440px)" />
        <source src={HERO_VIDEOS.background.small} type="video/mp4" />
      </video>

      <VideoModal ref={modalRef} sources={HERO_VIDEOS.story} captions={HERO_VIDEOS.story.captions} />
    </section>
  )
}
