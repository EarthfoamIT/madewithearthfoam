import { useState } from 'react'
import jsonp from '../lib/jsonp.js'
import { MAILCHIMP } from '../data/site.js'
import { ArrowRightIcon } from './icons.jsx'

const INVALID_EMAIL = 'Please enter a valid email address'
const GENERIC_ERROR = 'An error has occurred. Please try again.'

function subscribeUrl(email) {
  const params = new URLSearchParams({
    u: MAILCHIMP.u,
    id: MAILCHIMP.id,
    f_id: MAILCHIMP.fId,
    EMAIL: email,
    tags: MAILCHIMP.tags,
  })
  return `${MAILCHIMP.host}/subscribe/post-json?${params}`
}

export default function Newsletter() {
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [error, setError] = useState('')

  const handleBlur = (e) => {
    const { valid } = e.target.validity
    setError(valid ? '' : INVALID_EMAIL)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = e.currentTarget.elements.EMAIL.value
    setStatus('submitting')
    setError('')

    try {
      const res = await jsonp(subscribeUrl(email))
      if (res?.result === 'success') {
        setStatus('success')
        return
      }
      console.error('Mailchimp error:', res?.msg)
    } catch (err) {
      console.error(err)
    }
    setError(GENERIC_ERROR)
    setStatus('idle')
  }

  const busy = status !== 'idle'

  return (
    <section id="newsletter" className="bt1-gray1 pt-5 pb-5 lg:pt-10 lg:pb-10">
      <div className="content">
        <h2 className="h2 whitespace-pre-wrap text-center lg:text-left mb-3 lg:mb-4">
          <span className="block">We’re always innovating.</span>
          <span className="block">Stay up to date with our newsletter.</span>
        </h2>
        <form
          className={`flex flex-row gap-1 rounded items-center bg-gray1 pl-4 pr-4 newsletter__inputContainer relative${error ? ' newsletter__inputContainer--error' : ''}`}
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            name="EMAIL"
            required
            aria-label="Email address"
            placeholder="Enter your email address"
            className="pt-3 pb-3 grow h3 newsletter__input"
            disabled={busy}
            onBlur={handleBlur}
            onInput={() => setError('')}
          />
          <button className="cursor-pointer" aria-label="Submit" disabled={busy}>
            <ArrowRightIcon />
          </button>
          <span
            className={`newsletter__successLabel color-white bg-sunset absolute t0 l0 r0 b0 items-center justify-center rounded ${status === 'success' ? 'flex' : 'hidden'}`}
          >
            Thank you! We will be in touch.
          </span>
        </form>
        <p className="newsletter__error text-center lg:text-right color-red mt-1" aria-live="polite">
          {error}
        </p>
      </div>
    </section>
  )
}
