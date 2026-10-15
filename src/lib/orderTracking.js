// Client for the API's public GET /ordertracking endpoint, plus the
// customer-facing wording for each tracking stage.

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const ORDER_NUMBER_EXAMPLE = 'ABC/012/26'

export class TrackingError extends Error {
  constructor(kind, message) {
    super(message)
    this.kind = kind
  }
}

export async function fetchOrderTracking(orderNumber, { signal } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}/ordertracking?ordernum=${encodeURIComponent(orderNumber)}`, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new TrackingError('network', 'We couldn’t reach our tracking service. Please try again in a moment.')
  }

  const body = await res.json().catch(() => null)
  if (res.ok && body) return body
  if (res.status === 404) throw new TrackingError('not-found', body?.message)
  if (res.status === 400) throw new TrackingError('invalid', body?.message)
  throw new TrackingError('server', 'Something went wrong on our side. Please try again shortly.')
}

export const STAGES = [
  { key: 'preparing', label: 'Being made', about: 'Fresh Sri Lankan latex is turned into your Earthfoam at our factory in Horana.' },
  { key: 'at_port', label: 'At the port', about: 'Packed into its container and waiting at Colombo to board its ship.' },
  { key: 'sailing', label: 'At sea', about: 'Crossing the ocean. We follow the ship and update its position for you.' },
  { key: 'arrived', label: 'Arrived', about: 'Docked at the destination port and being unloaded.' },
  { key: 'delivered', label: 'Delivered', about: 'Off the ship and ready for you.' },
]

export function stageIndex(stage) {
  return Math.max(0, STAGES.findIndex((s) => s.key === stage))
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

// Dates arrive as YYYY-MM-DD (or a datetime starting with one). Format them as
// calendar dates so they don't shift with the viewer's timezone.
export function formatDate(value) {
  const match = `${value || ''}`.match(/^\d{4}-\d{2}-\d{2}/)
  if (!match) return null
  return dateFormat.format(new Date(`${match[0]}T00:00:00Z`))
}

export function isPast(value) {
  const match = `${value || ''}`.match(/^\d{4}-\d{2}-\d{2}/)
  return !!match && match[0] <= new Date().toISOString().slice(0, 10)
}

// "SHEKOU (SHENZHEN)" -> "Shekou (Shenzhen)"
export function titleCase(value) {
  if (!value) return null
  return `${value}`.toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())
}

// Shipping line and vessel brands that are written in capitals.
const SHIPPING_ACRONYMS = new Set(['APL', 'CMA', 'CGM', 'COSCO', 'ESL', 'HMM', 'KMTC', 'MOL', 'MSC', 'NYK', 'ONE', 'OOCL', 'PIL', 'RCL', 'SITC', 'YM', 'ZIM'])

// "CMA CGM TAORMINA" -> "CMA CGM Taormina"
export function shipName(value) {
  const name = titleCase(value)
  return name && name.replace(/\p{L}+/gu, (word) => (SHIPPING_ACRONYMS.has(word.toUpperCase()) ? word.toUpperCase() : word))
}

// "KENYA" -> "Kenya"; short codes like "USA" and already-cased names stay.
export function countryName(value) {
  if (!value) return null
  return value === value.toUpperCase() && value.length > 3 ? titleCase(value) : value
}

export function placeName(place) {
  if (!place?.name) return null
  const name = titleCase(place.name)
  const country = countryName(place.country)
  return country ? `${name}, ${country}` : name
}

function dayNumber(value) {
  const match = `${value || ''}`.match(/^\d{4}-\d{2}-\d{2}/)
  return match ? Date.parse(`${match[0]}T00:00:00Z`) / 86400000 : null
}

function today() {
  return dayNumber(new Date().toISOString())
}

function daysPhrase(days) {
  return days === 1 ? '1 day' : `${days} days`
}

// Headline and supporting lines for the status block. Kept conversational:
// how far along the order is, and what happens next.
export function describeShipment(shipment) {
  const destination = placeName(shipment.destination) || 'its destination'
  const destinationName = titleCase(shipment.destination?.name) || 'its destination'
  const origin = titleCase(shipment.origin?.name) || 'Colombo'
  const eta = formatDate(shipment.eta)
  const arrivedOn = formatDate(shipment.arrivalDate)
  const loadDate = shipment.loadDate || shipment.estimatedLoadDate
  const now = today()
  const left = dayNumber(shipment.departureDate) ?? dayNumber(shipment.loadDate)
  const due = dayNumber(shipment.eta)
  const reached = dayNumber(shipment.arrivalDate)
  const vessel = shipName(shipment.vesselName)

  switch (shipment.stage) {
    case 'preparing': {
      const until = dayNumber(loadDate) !== null ? dayNumber(loadDate) - now : null
      // The planned load date has passed, but no container or sailing has
      // been booked yet, so don't claim it has left.
      if (until !== null && until < 0) {
        return {
          title: 'Your order is getting ready to ship.',
          lines: [
            `It was scheduled to leave our factory in Horana on ${formatDate(loadDate)}.`,
            'We’ll share its container and sailing details as soon as it’s booked onto a ship.',
          ],
        }
      }
      return {
        title: 'Your order is being made.',
        lines: [
          'Our team in Horana is turning fresh Sri Lankan latex into your Earthfoam.',
          until === null
            ? 'We’ll have shipping details for you as soon as it’s scheduled.'
            : until > 0
              ? `It’s scheduled to leave the factory on ${formatDate(loadDate)}, ${until === 1 ? 'tomorrow' : `in ${daysPhrase(until)}`}.`
              : 'It’s due to leave the factory today.',
        ],
      }
    }
    case 'at_port':
      return {
        title: 'Your order is at the port.',
        lines: [
          `It’s packed into its container and waiting at ${origin}${vessel ? ` to board the ${vessel}` : ' to set sail'}.`,
          eta ? `It should reach ${destinationName} around ${eta}.` : 'We’ll share an arrival date once it sets sail.',
        ],
      }
    case 'sailing': {
      const day = left !== null ? now - left + 1 : null
      const toGo = due !== null ? due - now : null
      return {
        title: 'Your order is at sea.',
        lines: [
          `${day && day > 0 ? `Day ${day} of its journey to ${destination}.` : `On its way to ${destination}.`}${
            shipment.currentLocation ? ` Last seen near ${titleCase(shipment.currentLocation)}.` : ''
          }`,
          toGo === null
            ? 'We’ll share an arrival date as soon as the shipping line confirms it.'
            : toGo > 0
              ? `About ${daysPhrase(toGo)} to go. It’s expected on ${eta}.`
              : `It’s running a little behind. It was expected on ${eta}, and we’re keeping an eye on it.`,
        ],
      }
    }
    case 'arrived':
      // Estimated from the schedule only: the shipping line hasn't confirmed it.
      if (shipment.basis === 'schedule' && !shipment.arrivalDate) {
        return {
          title: 'Your order should have arrived.',
          lines: [
            `It was due to reach ${destination}${eta ? ` on ${eta}` : ''}.`,
            'We’re waiting for the shipping line to confirm. If you need it urgently, get in touch and we’ll check for you.',
          ],
        }
      }
      return {
        title: 'Your order has arrived.',
        lines: [
          `It reached ${destination}${arrivedOn ? ` on ${arrivedOn}` : eta ? ` around ${eta}` : ''}.`,
          'It’s being unloaded now and will be ready to collect soon.',
        ],
      }
    case 'delivered': {
      const factory = dayNumber(shipment.loadDate)
      const took = reached !== null && factory !== null ? reached - factory : null
      return {
        title: 'Your order has been delivered.',
        lines: [
          `It reached ${destination}${arrivedOn ? ` on ${arrivedOn}` : ''}${
            took && took > 0 ? `, ${daysPhrase(took)} after leaving our factory in Horana` : ''
          }.`,
          'We hope you love it as much as we loved making it.',
        ],
      }
    }
    default:
      return { title: 'Tracking your order.', lines: [] }
  }
}

// Journey log, oldest first. Adds the factory departure (and an expected
// arrival when the carrier hasn't reported any events yet).
export function buildTimeline(shipment) {
  const events = (shipment.events || [])
    .filter((event) => event.date)
    .map((event) => ({
      label: event.label,
      detail: [titleCase(event.location), event.vesselName && shipName(event.vesselName)].filter(Boolean).join(' · '),
      date: event.date,
      estimated: event.estimated,
    }))

  if (shipment.loadDate) {
    // Only a plan until a shipment is booked (basis "plan").
    const left = isPast(shipment.loadDate) && shipment.basis !== 'plan'
    events.push({
      label: left ? 'Left our factory' : 'Scheduled to leave our factory',
      detail: 'Horana, Sri Lanka',
      date: shipment.loadDate,
      estimated: !left,
      factory: true,
    })
  }

  if (!shipment.events?.length && shipment.eta && shipment.stage !== 'preparing') {
    const reached = shipment.arrivalDate || isPast(shipment.eta)
    events.push({
      label: reached ? 'Arrived at destination port' : 'Expected arrival',
      detail: titleCase(shipment.destination?.name),
      date: shipment.arrivalDate || shipment.eta,
      estimated: !shipment.arrivalDate,
    })
  }

  // Stable sort keeps the factory step ahead of same-day carrier events.
  return events
    .map((event, i) => ({ event, i, rank: event.factory ? 0 : 1 }))
    .sort((a, b) => a.event.date.localeCompare(b.event.date) || a.rank - b.rank || a.i - b.i)
    .map(({ event }) => event)
}
