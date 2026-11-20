import { useImperativeHandle, useRef } from 'react'

// Screens where the 1080p copy is worth the extra download: wide desktops,
// or laptops/tablets with a high-density display.
const LARGE_SCREEN = '(min-width: 1440px), (min-width: 960px) and (min-resolution: 2dppx)'

// Full-screen <dialog> that plays the brand story video from the start.
// Exposes open() and close() through `ref`.
export default function VideoModal({ ref, source, captions }) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)

  const close = () => dialogRef.current?.close()

  useImperativeHandle(ref, () => ({
    open() {
      dialogRef.current.showModal()
      videoRef.current.currentTime = 0
      videoRef.current.play()
    },
    close,
  }))

  return (
    <dialog
      ref={dialogRef}
      className="modal modal--video p-0"
      // Only a click on the backdrop itself closes the dialog. Clicks on the
      // video controls must not close it.
      onClick={(e) => e.target === dialogRef.current && close()}
      // Covers the × button, the Escape key and backdrop clicks.
      onClose={() => videoRef.current?.pause()}
    >
      <div className="relative">
        <button onClick={close} className="cursor-pointer modal__close absolute r0 t0" aria-label="Close">
          &times;
        </button>
        <video ref={videoRef} controls preload="none" className="w-full h-auto" onEnded={close}>
          {/* The browser takes the first <source> whose media query matches. */}
          {source.large && <source src={source.large} type={source.type} media={LARGE_SCREEN} />}
          <source src={source.src} type={source.type} />
          {captions && <track default kind="captions" srcLang="en" src={captions} label="English" />}
        </video>
      </div>
    </dialog>
  )
}
