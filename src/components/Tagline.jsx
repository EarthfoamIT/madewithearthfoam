import { TAGLINE } from '../data/site.js'

// "Harvested in Sri Lanka." alternating with its Sinhala translation.
// The hidden first copy sizes the container; the other two are absolutely
// positioned and swapped by the `tagline` keyframes in global.css.
export default function Tagline() {
  return (
    <>
      <div className="font-sinhala" style={{ visibility: 'hidden' }}>{TAGLINE.sinhala}</div>
      <div className="h-full flex items-center eyebrow-sm tagline">{TAGLINE.english}</div>
      <div className="font-sinhala tagline tagline--delay">{TAGLINE.sinhala}</div>
    </>
  )
}
