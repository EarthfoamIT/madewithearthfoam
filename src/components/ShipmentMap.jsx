import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { titleCase } from '../lib/orderTracking.js'

// Esri Dark Gray Canvas (same provider as the ERP's vessel dashboard map),
// with its label layer on top. Esri's terms apply to public use.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'
const BASE_TILES = `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
const LABEL_TILES = `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`
const TILE_ATTRIBUTION = 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community'

const SUNSET = '#E68276'

// Lucide "ship" icon (ISC), inlined because Leaflet markers take HTML.
const SHIP_ICON = L.divIcon({
  className: 'trackOrder__mapShip',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 2v2"/><path d="M12 9.189V13"/><path d="M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6"/>
    <path d="M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76"/>
    <path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </svg>`,
})

function FitToRoute({ map: data }) {
  const map = useMap()

  useEffect(() => {
    const points = [
      ...data.lines.flatMap((line) => line.path),
      ...data.ports.map((port) => port.position),
      ...(data.position ? [data.position] : []),
    ]
    if (points.length > 1) map.fitBounds(points, { padding: [32, 32] })
    else if (points.length === 1) map.setView(points[0], 5)
  }, [data, map])

  return null
}

const IS_APPLE = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
const IS_MOBILE = L.Browser.mobile

// Zoom without trapping the page's scroll:
// - Ctrl/⌘ + scroll zooms. Chrome, Edge and Firefox also report trackpad pinch
//   as Ctrl + scroll, so laptop pinch works through the same path.
// - Safari on Mac sends trackpad pinch as gesture events instead.
// - On phones one finger scrolls the page and two fingers pan and pinch-zoom.
// A plain scroll or one-finger drag shows a short hint instead.
function MapGestures({ onHint }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()

    // Runs before Leaflet's own wheel handler (which sits on the container).
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) return
      e.stopPropagation()
      onHint(IS_APPLE ? 'Hold ⌘ and scroll to zoom the map' : 'Hold Ctrl and scroll to zoom the map')
    }
    container.addEventListener('wheel', onWheel, { capture: true })

    let gestureStartZoom = null
    const onGestureStart = (e) => {
      e.preventDefault()
      gestureStartZoom = map.getZoom()
    }
    const onGestureChange = (e) => {
      e.preventDefault()
      if (gestureStartZoom !== null) map.setZoom(gestureStartZoom + Math.log2(e.scale), { animate: false })
    }
    const onGestureEnd = (e) => {
      e.preventDefault()
      gestureStartZoom = null
    }
    if (!IS_MOBILE) {
      container.addEventListener('gesturestart', onGestureStart)
      container.addEventListener('gesturechange', onGestureChange)
      container.addEventListener('gestureend', onGestureEnd)
    }

    const onTouchMove = (e) => {
      if (e.touches.length === 1) onHint('Use two fingers to move the map')
    }
    if (IS_MOBILE) {
      // Without one-finger dragging, Leaflet leaves `touch-action: pan-x pan-y`
      // on the map so the page scrolls; two-finger pinch still pans and zooms.
      map.dragging.disable()
      container.addEventListener('touchmove', onTouchMove, { passive: true })
    }

    return () => {
      container.removeEventListener('wheel', onWheel, { capture: true })
      container.removeEventListener('gesturestart', onGestureStart)
      container.removeEventListener('gesturechange', onGestureChange)
      container.removeEventListener('gestureend', onGestureEnd)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [map, onHint])

  return null
}

// Route and ship position from the API's `map` field ([lat, lon] pairs).
export default function ShipmentMap({ map, vesselName }) {
  const [hint, setHint] = useState('')
  const hintTimer = useRef(null)
  const showHint = useCallback((text) => {
    setHint(text)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(''), 1500)
  }, [])
  useEffect(() => () => clearTimeout(hintTimer.current), [])

  return (
    <div className="trackOrder__mapFrame">
      <MapContainer className="trackOrder__map" center={[7.87, 80.77]} zoom={3} scrollWheelZoom touchZoom worldCopyJump>
        <MapGestures onHint={showHint} />
        <TileLayer url={BASE_TILES} attribution={TILE_ATTRIBUTION} maxZoom={16} />
        <TileLayer url={LABEL_TILES} maxZoom={16} />
        <FitToRoute map={map} />

        {map.lines.map((line, i) => (
          <Polyline
            key={i}
            positions={line.path}
            pathOptions={
              line.sailed
                ? { color: SUNSET, weight: 3, opacity: 0.95 }
                : { color: '#9C9A9B', weight: 2, opacity: 0.8, dashArray: '4 8' }
            }
          />
        ))}

        {map.ports.map((port) => {
          const past = `${port.status || ''}`.toUpperCase() === 'PAST'
          return (
            <CircleMarker
              key={`${port.name}-${port.position.join(',')}`}
              center={port.position}
              radius={5}
              pathOptions={{ color: past ? SUNSET : '#FFFFFF', weight: 2, fillColor: '#141617', fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                {[titleCase(port.name), port.country].filter(Boolean).join(', ')}
              </Tooltip>
            </CircleMarker>
          )
        })}

        {map.position && (
          <Marker position={map.position} icon={SHIP_ICON} keyboard={false}>
            {vesselName && (
              <Tooltip direction="top" offset={[0, -18]}>
                {vesselName}
              </Tooltip>
            )}
          </Marker>
        )}
      </MapContainer>
      <div className={`trackOrder__mapHint${hint ? ' is-visible' : ''}`} aria-hidden="true">
        {hint}
      </div>
    </div>
  )
}
