import { useImperativeHandle, useRef } from 'react'

// Full-screen <dialog> that plays the brand story video from the start.
// Exposes open() and close() through `ref`.
export default function VideoModal({ ref, sources, captions }) {
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
          <source src={sources.large} type="video/mp4" media="(min-width: 1440px)" />
          <source src={sources.small} type="video/mp4" />
          <track default kind="captions" srcLang="en" src={captions} label="English" />
        </video>
      </div>
    </dialog>
  )
}
