import { Ship } from 'lucide-react'
import {
  STAGES,
  buildTimeline,
  countryName,
  describeShipment,
  formatDate,
  shipName,
  stageIndex,
  titleCase,
} from '../lib/orderTracking.js'
import { STAGE_ICONS } from '../lib/stageIcons.js'

function Status({ shipment }) {
  const { title, lines } = describeShipment(shipment)
  const stage = STAGES[stageIndex(shipment.stage)]
  const Icon = STAGE_ICONS[stage.key]

  return (
    <div className="trackOrder__status" data-animate="slide-up" data-delay="1">
      <p className="trackOrder__eyebrow eyebrow-sm mb-2">
        <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
        {stage.label}
      </p>
      <h2 className="h2 mb-2">{title}</h2>
      {lines.map((line) => (
        <p key={line} className="color-gray8">
          {line}
        </p>
      ))}
    </div>
  )
}

function Steps({ stage }) {
  const current = stageIndex(stage)

  return (
    <ol className="trackOrder__steps" aria-label="Order progress" data-animate="slide-up" data-delay="2">
      {STAGES.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={step.key} className={`trackOrder__step trackOrder__step--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="trackOrder__stepLabel">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Voyage({ shipment }) {
  if (!shipment.destination?.name) return null

  const progress = shipment.progress
  const via = shipment.route.slice(1, -1).map((port) => titleCase(port.name))

  return (
    <div className="trackOrder__section" data-animate="slide-up" data-delay="3">
      <div className="trackOrder__ports">
        <div>
          <p className="eyebrow-sm trackOrder__muted mb-half">From</p>
          <p>{titleCase(shipment.origin?.name)}</p>
          {shipment.origin?.country && <p className="text-14 trackOrder__muted">{countryName(shipment.origin.country)}</p>}
        </div>
        <div className="text-right">
          <p className="eyebrow-sm trackOrder__muted mb-half">To</p>
          <p>{titleCase(shipment.destination.name)}</p>
          {shipment.destination.country && <p className="text-14 trackOrder__muted">{countryName(shipment.destination.country)}</p>}
        </div>
      </div>

      {progress !== null && (
        <div
          className="trackOrder__track"
          role="progressbar"
          aria-label="Voyage progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span className="trackOrder__trackFill" style={{ width: `${progress}%` }} />
          {shipment.stage === 'sailing' && (
            <span className="trackOrder__trackShip" style={{ left: `${progress}%` }} aria-hidden="true">
              <Ship size={18} strokeWidth={1.75} />
            </span>
          )}
        </div>
      )}

      {via.length > 0 && <p className="text-14 trackOrder__muted">Via {via.join(', ')}</p>}
    </div>
  )
}

function Details({ shipment }) {
  const arrival = shipment.arrivalDate
    ? ['Arrived', formatDate(shipment.arrivalDate)]
    : ['Expected', shipment.stage !== 'preparing' && formatDate(shipment.eta)]

  const items = [
    ['Container', shipment.containerNumber && `${shipment.containerNumber}${shipment.containerSize ? ` (${shipment.containerSize}ft)` : ''}`],
    ['Vessel', shipName(shipment.vesselName)],
    ['Shipping line', shipName(shipment.carrierName)],
    ['Left our factory', shipment.stage !== 'preparing' && formatDate(shipment.loadDate)],
    arrival,
  ].filter(([, value]) => value)

  if (!items.length) return null

  return (
    <dl className="trackOrder__details trackOrder__section" data-animate="slide-up" data-delay="4">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="eyebrow-sm trackOrder__muted mb-half">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Journey({ shipment }) {
  const events = buildTimeline(shipment)
  if (!events.length) return null

  return (
    <div className="trackOrder__section" data-animate="slide-up" data-delay="5">
      <h3 className="eyebrow-sm trackOrder__muted mb-2">Journey</h3>
      <ol className="trackOrder__journey">
        {events.map((event, i) => (
          <li key={`${event.date}-${i}`} className={event.estimated ? 'trackOrder__event trackOrder__event--expected' : 'trackOrder__event'}>
            <time className="text-14 trackOrder__muted" dateTime={event.date}>
              {formatDate(event.date)}
            </time>
            <div>
              <p>
                {event.label}
                {event.estimated && <span className="text-14 trackOrder__muted"> (expected)</span>}
              </p>
              {event.detail && <p className="text-14 trackOrder__muted">{event.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function ShipmentCard({ shipment, heading }) {
  const updated = formatDate(shipment.updatedAt)

  return (
    <article className="trackOrder__shipment">
      {heading && <p className="eyebrow-sm trackOrder__muted mb-3">{heading}</p>}
      <Status shipment={shipment} />
      <Steps stage={shipment.stage} />
      {shipment.stage !== 'preparing' && <Voyage shipment={shipment} />}
      <Details shipment={shipment} />
      <Journey shipment={shipment} />
      {updated && <p className="text-14 trackOrder__muted mt-3">Tracking last updated {updated}</p>}
    </article>
  )
}
