import { ArrowRight, CloudOff, LoaderCircle, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import ShipmentCard from '../components/ShipmentCard.jsx'
import { CONTACT } from '../data/site.js'
import usePageMeta from '../hooks/usePageMeta.js'
import { ORDER_NUMBER_EXAMPLE, STAGES, fetchOrderTracking } from '../lib/orderTracking.js'
import { STAGE_ICONS } from '../lib/stageIcons.js'
import '../styles/track-order.css'

function Notice({ icon: Icon, title, children, spin }) {
  return (
    <div className="trackOrder__notice" role="status" data-animate="slide-up">
      <Icon size={28} strokeWidth={1.5} className={spin ? 'trackOrder__spin' : undefined} aria-hidden="true" />
      <div>
        <h2 className="h3 mb-1">{title}</h2>
        {children && <p className="trackOrder__muted">{children}</p>}
      </div>
    </div>
  )
}

function HowItWorks() {
  return (
    <div>
      <h2 className="eyebrow-sm trackOrder__muted mb-2" data-animate="slide-up" data-delay="2">
        From our factory to you
      </h2>
      <ol className="trackOrder__stages">
        {STAGES.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.key]
          return (
            <li key={stage.key} data-animate="slide-up" data-delay={i + 3}>
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p>{stage.label}</p>
                <p className="text-14 trackOrder__muted">{stage.about}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function TrackOrderPage() {
  usePageMeta({
    title: 'Track Your Order | Made With Earthfoam',
    description: 'Follow your Earthfoam order from our factory in Sri Lanka to your door.',
    path: '/track-order',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const orderNumber = (searchParams.get('order') || '').trim()
  const [input, setInput] = useState(orderNumber)
  const [result, setResult] = useState({ status: 'idle' })
  const [attempt, setAttempt] = useState(0)

  // Keep the field in sync when the order in the URL changes (back/forward).
  const [lastOrderNumber, setLastOrderNumber] = useState(orderNumber)
  if (orderNumber !== lastOrderNumber) {
    setLastOrderNumber(orderNumber)
    setInput(orderNumber)
  }

  useEffect(() => {
    if (!orderNumber) return

    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show loading before the request starts
    setResult({ status: 'loading' })
    fetchOrderTracking(orderNumber, { signal: controller.signal })
      .then((data) => setResult({ status: 'success', data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ status: 'error', error })
      })

    return () => controller.abort()
  }, [orderNumber, attempt])

  function handleSubmit(e) {
    e.preventDefault()
    const value = input.trim().toUpperCase()
    if (!value) return
    if (value === orderNumber) setAttempt((n) => n + 1)
    else setSearchParams({ order: value })
  }

  const status = orderNumber ? result.status : 'idle'
  const shipments = result.data?.shipments || []

  return (
    <section className="trackOrder">
      <div className="content contentgrid pt-5 pb-6 lg:pt-10 lg:pb-10">
        <div className="lg:col-start-1 lg:col-span-3 trackOrder__intro">
          <h1 className="pageTitle mb-3 lg:mb-4" data-animate="slide-up">Track your order</h1>
          <p className="h4 color-gray8 mb-4 lg:mb-5" data-animate="slide-up" data-delay="1">
            Every order starts as latex from Sri Lankan rubber trees. Enter your order number to see how far yours has
            come.
          </p>

          <form className="trackOrder__form rounded bg-gray1" onSubmit={handleSubmit} data-animate="slide-up" data-delay="2">
            <label htmlFor="order-number" className="visually-hidden">
              Order number
            </label>
            <input
              id="order-number"
              name="order"
              className="trackOrder__input"
              placeholder={`e.g. ${ORDER_NUMBER_EXAMPLE}`}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="button trackOrder__submit" disabled={status === 'loading'}>
              Track
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </form>
          <p className="text-14 trackOrder__muted mt-1 pl-3" data-animate="slide-up" data-delay="3">You’ll find it on your order confirmation or invoice.</p>
        </div>

        <div className="lg:col-start-5 lg:col-span-4 mt-5 lg:mt-0" aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'idle' && <HowItWorks />}

          {status === 'loading' && <Notice icon={LoaderCircle} spin title="Finding your order…" />}

          {status === 'error' && result.error.kind === 'not-found' && (
            <Notice icon={SearchX} title="We couldn’t find that order.">
              Check the number and try again. It should look like {ORDER_NUMBER_EXAMPLE}. Still stuck? Email{' '}
              <a className="underline" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>{' '}
              and we’ll look it up for you.
            </Notice>
          )}

          {status === 'error' && result.error.kind !== 'not-found' && (
            <Notice icon={CloudOff} title="Tracking is unavailable right now.">
              {result.error.message}
            </Notice>
          )}

          {status === 'success' && (
            <>
              <p className="eyebrow-sm trackOrder__muted mb-3" data-animate="slide-up">
                Order {result.data.orderNumber}
                {shipments.length > 1 && ` · ${shipments.length} containers`}
              </p>
              <div className="trackOrder__shipments">
                {shipments.map((shipment, i) => (
                  <ShipmentCard
                    key={shipment.containerNumber || i}
                    shipment={shipment}
                    heading={shipments.length > 1 ? `Container ${i + 1} of ${shipments.length}` : null}
                  />
                ))}
              </div>
              <p className="text-14 trackOrder__muted mt-5">
                Questions about your order?{' '}
                <Link className="underline" to="/contact">
                  Get in touch
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
