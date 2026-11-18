import { useEffect, useRef } from 'react'
import { YOUTUBE_ORIGIN } from '../data/videos.js'

const ENDED = 0
const PLAYING = 1

// Calls onEnded when the YouTube player in `iframeRef` finishes, and turns
// captions off when it first starts playing (YouTube switches them on by
// default for some viewers; the CC button still turns them back on). Uses the
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

    const send = (message) =>
      iframe.contentWindow?.postMessage(JSON.stringify({ id: 1, channel: 'widget', ...message }), YOUTUBE_ORIGIN)

    // Ask the player to start sending events once it has loaded.
    const listen = () => send({ event: 'listening' })

    // The captions module only loads once playback starts, so unload it on the
    // first PLAYING state, and once more shortly after in case it loaded late.
    // Only on the first play, so a viewer who turns CC on keeps it on.
    let captionsHandled = false
    let captionsTimer
    const captionsOff = () => {
      send({ event: 'command', func: 'unloadModule', args: ['captions'] })
      send({ event: 'command', func: 'unloadModule', args: ['cc'] })
    }

    const onMessage = (e) => {
      if (e.origin !== YOUTUBE_ORIGIN || e.source !== iframe.contentWindow) return
      let data
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch {
        return
      }
      const state = data?.event === 'onStateChange' ? data.info : data?.info?.playerState
      if (state === PLAYING && !captionsHandled) {
        captionsHandled = true
        captionsOff()
        captionsTimer = setTimeout(captionsOff, 1000)
      }
      if (state === ENDED) onEndedRef.current()
    }

    iframe.addEventListener('load', listen)
    window.addEventListener('message', onMessage)
    return () => {
      iframe.removeEventListener('load', listen)
      window.removeEventListener('message', onMessage)
      clearTimeout(captionsTimer)
    }
  }, [iframeRef, active])
}
