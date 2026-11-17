import { useEffect, useRef } from 'react'
import { YOUTUBE_ORIGIN } from '../data/videos.js'

const ENDED = 0

// Calls onEnded when the YouTube player in `iframeRef` finishes. Uses the
// player's postMessage protocol directly (embed URL needs enablejsapi=1), so
// no YouTube script is loaded on the page.
export default function useYouTubeEnded(iframeRef, onEnded, active = true) {
  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  })

  useEffect(() => {
    const iframe = iframeRef.current
    if (!active || !iframe) return

    // Ask the player to start sending events once it has loaded.
    const listen = () =>
      iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), YOUTUBE_ORIGIN)

    const onMessage = (e) => {
      if (e.origin !== YOUTUBE_ORIGIN || e.source !== iframe.contentWindow) return
      let data
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch {
        return
      }
      const state = data?.event === 'onStateChange' ? data.info : data?.info?.playerState
      if (state === ENDED) onEndedRef.current()
    }

    iframe.addEventListener('load', listen)
    window.addEventListener('message', onMessage)
    return () => {
      iframe.removeEventListener('load', listen)
      window.removeEventListener('message', onMessage)
    }
  }, [iframeRef, active])
}
