import { useLayoutEffect, useRef, useState } from 'react'
import { certifications } from '../data/certifications.js'
import CertificateLink from './CertificateLink.jsx'
import GalleryImage from './GalleryImage.jsx'
import GalleryVideo from './GalleryVideo.jsx'

const ANIMATION_MS = 800 // matches the `transition: height 0.8s` in global.css

function GalleryItem({ item }) {
  switch (item.type) {
    case 'image':
      return <GalleryImage {...item} />
    case 'video':
      return <GalleryVideo src={item.src} caption={item.caption} />
    case 'certificates':
      return certifications.map((cert) => <CertificateLink key={cert.file} href={cert.href} label={cert.label} />)
    default:
      return null
  }
}

// Numbered, collapsible home-page section. Collapsed by default; opens
// automatically when the URL hash matches its id (e.g. /#our-factory).
export default function IndexSection({ id, number, title, subhead, bordered, gallery, body }) {
  const sectionRef = useRef(null)
  const galleryRef = useRef(null)
  const bodyRef = useRef(null)
  const timeoutRef = useRef(null)
  const videosLoadedRef = useRef(false)
  const [open, setOpen] = useState(() => window.location.hash.slice(1) === id)

  // The gallery videos use preload="none". Load them the first time the
  // section opens.
  const loadVideos = () => {
    if (videosLoadedRef.current) return
    sectionRef.current.querySelectorAll('video').forEach((video) => video.load())
    videosLoadedRef.current = true
  }

  useLayoutEffect(() => {
    if (open) {
      loadVideos()
      sectionRef.current.scrollIntoView()
    } else {
      galleryRef.current.style.height = '0px'
      bodyRef.current.style.height = '0px'
    }
    return () => clearTimeout(timeoutRef.current)
    // Mount only: later toggles are handled imperatively in the click handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expand = () => {
    const gallery = galleryRef.current
    const content = bodyRef.current
    loadVideos()
    window.history.replaceState(window.history.state, '', `#${id}`)

    // Measure the natural heights, collapse again, then animate to them.
    content.style.height = 'auto'
    gallery.style.height = 'auto'
    const bodyTarget = content.offsetHeight
    const galleryTarget = gallery.offsetHeight
    content.style.height = '0px'
    gallery.style.height = '0px'
    void content.offsetHeight // force a reflow so the transition runs
    content.style.height = `${bodyTarget}px`
    gallery.style.height = `${galleryTarget}px`

    sectionRef.current.scrollIntoView()

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      content.style.height = 'auto'
      gallery.style.height = 'auto'
    }, ANIMATION_MS)
  }

  const collapse = () => {
    const gallery = galleryRef.current
    const content = bodyRef.current
    clearTimeout(timeoutRef.current)
    content.style.height = `${content.offsetHeight}px`
    gallery.style.height = `${gallery.offsetHeight}px`
    void content.offsetHeight
    content.style.height = '0px'
    gallery.style.height = '0px'
  }

  const toggle = () => {
    if (open) collapse()
    else expand()
    setOpen(!open)
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      data-open={open ? 'true' : undefined}
      className={`indexSection indexSection--open contentLayout pt-3 pb-6 lg:pt-8 lg:pb-10${bordered ? ' bt1-gray1' : ''}`}
    >
      <div className="content contentgrid mb-4 lg:mb-8">
        <div className="indexSection__number h2 hidden lg:block lg:col-start-1 lg:col-span-1">{number}</div>
        <h2 className="indexSection__title h2 lg:col-start-2 lg:col-span-2">{title}</h2>
        <p className="indexSection__subhead color-gray7 h2 lg:col-start-5 lg:col-span-4">{subhead}</p>
      </div>
      <div className="content contentgrid indexSection__expansion">
        <div ref={galleryRef} className="contentLayout__gallery overflow-h lg:col-start-2 lg:col-span-2">
          {gallery.map((item, i) => (
            <GalleryItem key={item.src ?? `${item.type}-${i}`} item={item} />
          ))}
          <div className="mb-4 lg:mb-0"></div>
        </div>
        <div ref={bodyRef} className="contentLayout__body overflow-h lg:col-start-5 lg:col-span-4">
          {body}
          <div className="mt-3 lg:mt-8"></div>
        </div>
        <div className="indexSection__toggleContainer lg:col-start-5 lg:col-span-4">
          <button className="indexSection__toggle rounded text-small" onClick={toggle} aria-expanded={open}>
            <span className="indexSection__toggleOpen">+&nbsp;&nbsp;Read More</span>
            <span className="indexSection__toggleClose hidden">&ndash;&nbsp;&nbsp;Read Less</span>
          </button>
        </div>
      </div>
    </section>
  )
}
