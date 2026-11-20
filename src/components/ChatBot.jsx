import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  FileText,
  LoaderCircle,
  Mail,
  MessageSquare,
  RotateCcw,
  SendHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import monogram from '../assets/graphics/monogram.svg'
import {
  STARTER_PROMPTS,
  sendChatInquiry,
  sendChatMessage,
} from '../lib/chatbot.js'
import {
  ORDER_NUMBER_EXAMPLE,
  STAGES,
  describeShipment,
  formatDate,
  shipName,
  stageIndex,
} from '../lib/orderTracking.js'
import { STAGE_ICONS } from '../lib/stageIcons.js'
import '../styles/chatbot.css'

let messageCounter = 1
const nextMsgId = (prefix) => `${prefix}-${messageCounter++}`

const REVEAL_STEP_CHARS = 4
const REVEAL_INTERVAL_MS = 18

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function nextRevealIndex(content, current) {
  let next = Math.min(content.length, current + REVEAL_STEP_CHARS)
  const linkRegex = /\[[^\]]+\]\([^)]+\)/g
  for (const match of content.matchAll(linkRegex)) {
    const start = match.index
    const end = start + match[0].length
    if (start < next && next < end) {
      next = end
      break
    }
  }
  return next
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    `Hello — ask me about our Sri Lankan latex foam factory, organic & fair trade certifications, consumer mattresses and pillows on **earthfoam.lk**, or share your order number (e.g. \`${ORDER_NUMBER_EXAMPLE}\`) to check live shipping status.`,
  actions: [],
}

function isSafeHref(href) {
  return (
    typeof href === 'string' &&
    (href.startsWith('/') ||
      href.startsWith('https://') ||
      href.startsWith('http://'))
  )
}

function stripDanglingRevealTokens(text) {
  return `${text || ''}`
    .replace(/\n[ \t]*[#*_-]{1,6}[ \t]*$/g, '')
    .replace(/(?:\*\*|`|#|---)$/, '')
}

function renderInlineTokens(text, onNavigateInternal) {
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|https?:\/\/[^\s)]+)/g
  const parts = text.split(tokenRegex)

  return parts.map((part, idx) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={idx}>{part.slice(1, -1)}</code>
    }
    if (/^https?:\/\/[^\s)]+$/.test(part)) {
      const cleanUrl = part.replace(/[.,;!?]+$/, '')
      const trailing = part.slice(cleanUrl.length)
      return (
        <span key={idx}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chatbot__inlineLink"
          >
            {cleanUrl.replace(/^https?:\/\//, '')}
          </a>
          {trailing}
        </span>
      )
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      if (!isSafeHref(href)) return label
      if (href.startsWith('/') && !href.startsWith('/assets/')) {
        return (
          <Link
            key={idx}
            to={href}
            className="chatbot__inlineLink"
            onClick={onNavigateInternal}
          >
            {label}
          </Link>
        )
      }
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="chatbot__inlineLink"
        >
          {label}
        </a>
      )
    }
    return part
  })
}

function FormattedText({ content, onNavigateInternal, showCaret }) {
  const lines = `${content || ''}`.split('\n')
  const blocks = []
  let listItems = []

  const flushList = () => {
    if (!listItems.length) return
    blocks.push({ type: 'list', items: listItems })
    listItems = []
  }

  for (const rawLine of lines) {
    let line = rawLine.trim().replace(/^>\s?/, '')
    if (!line) {
      flushList()
      continue
    }
    // Omit markdown horizontal rules (---, ***, ___, ===) and empty heading markers
    if (/^(?:([-*_])\1{2,}|={3,}|#{1,6})$/.test(line)) {
      flushList()
      continue
    }
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/)
    if (headingMatch) {
      flushList()
      blocks.push({ type: 'heading', text: headingMatch[1].trim() })
      continue
    }
    if (/^(?:[-*•]|\d+[.)])\s+/.test(line)) {
      listItems.push(line.replace(/^(?:[-*•]|\d+[.)])\s+/, ''))
    } else {
      flushList()
      blocks.push({ type: 'p', text: line })
    }
  }
  flushList()

  if (!blocks.length && showCaret) {
    return (
      <p>
        <span className="chatbot__caret" aria-hidden="true" />
      </p>
    )
  }

  return (
    <>
      {blocks.map((block, i) => {
        const isLastBlock = i === blocks.length - 1
        if (block.type === 'list') {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>
                  {renderInlineTokens(item, onNavigateInternal)}
                  {showCaret && isLastBlock && j === block.items.length - 1 && (
                    <span className="chatbot__caret" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p
            key={i}
            className={block.type === 'heading' ? 'chatbot__heading' : undefined}
          >
            {renderInlineTokens(block.text, onNavigateInternal)}
            {showCaret && isLastBlock && (
              <span className="chatbot__caret" aria-hidden="true" />
            )}
          </p>
        )
      })}
    </>
  )
}

function TrackingMiniCard({ tracking }) {
  const shipment = tracking?.shipments?.[0]
  if (!shipment) return null

  const { title, lines } = describeShipment(shipment)
  const current = stageIndex(shipment.stage)
  const stage = STAGES[current]
  const StageIcon = STAGE_ICONS[stage.key]
  const arrivalValue = shipment.arrivalDate
    ? formatDate(shipment.arrivalDate)
    : shipment.stage !== 'preparing'
      ? formatDate(shipment.eta)
      : null

  return (
    <div className="chatbot__trackCard">
      <p className="chatbot__trackEyebrow">
        <StageIcon size={14} strokeWidth={1.75} aria-hidden="true" />
        Order {tracking.orderNumber} · {stage.label}
        {tracking.shipments.length > 1
          ? ` (${tracking.shipments.length} containers)`
          : ''}
      </p>
      <p className="chatbot__trackTitle">{title}</p>
      {lines[0] && <p className="chatbot__trackLine">{lines[0]}</p>}

      <ol className="chatbot__trackSteps" aria-label="Order progress">
        {STAGES.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li
              key={step.key}
              className={`chatbot__trackStep chatbot__trackStep--${state}`}
            >
              {step.label}
            </li>
          )
        })}
      </ol>

      {(shipment.vesselName || shipment.containerNumber || arrivalValue) && (
        <dl className="chatbot__trackMeta">
          {shipment.containerNumber && (
            <div>
              <dt>Container</dt>
              <dd>{shipment.containerNumber}</dd>
            </div>
          )}
          {shipment.vesselName && (
            <div>
              <dt>Vessel</dt>
              <dd>{shipName(shipment.vesselName)}</dd>
            </div>
          )}
          {arrivalValue && (
            <div>
              <dt>{shipment.arrivalDate ? 'Arrived' : 'Expected'}</dt>
              <dd>{arrivalValue}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  )
}

function ActionPills({ actions, onOpenInquiry, onNavigateInternal }) {
  if (!actions?.length) return null

  return (
    <div className="chatbot__actions">
      {actions.map((action, idx) => {
        if (action.kind === 'inquiry' || !action.href) {
          return (
            <button
              key={`${action.label}-${idx}`}
              type="button"
              className="chatbot__action"
              onClick={onOpenInquiry}
            >
              <Mail size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>{action.label}</span>
            </button>
          )
        }

        if (!isSafeHref(action.href)) return null

        const isExternal = action.external || action.href.startsWith('http')
        const isAssetPdf = action.href.startsWith('/assets/')

        if (isExternal || isAssetPdf) {
          const Icon = action.kind === 'pdf' ? FileText : ExternalLink
          return (
            <a
              key={`${action.label}-${idx}`}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`chatbot__action${action.kind === 'retail' ? ' chatbot__action--retail' : ''}`}
            >
              <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>{action.label}</span>
            </a>
          )
        }

        return (
          <Link
            key={`${action.label}-${idx}`}
            to={action.href}
            className="chatbot__action"
            onClick={onNavigateInternal}
          >
            <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            <span>{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

function InquiryForm({ onClose, onSubmitted }) {
  const [inquiryType, setInquiryType] = useState('b2b')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [productOrProject, setProductOrProject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const res = await sendChatInquiry({
        inquiryType,
        name,
        company,
        email,
        phone,
        productOrProject,
        message,
      })
      onSubmitted(res)
    } catch (err) {
      setError(err.message || 'Could not send inquiry. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="chatbot__inquiry" onSubmit={handleSubmit}>
      <div className="chatbot__inquiryHead">
        <div>
          <p className="eyebrow-sm color-sunset">Direct Inquiry</p>
          <p className="text-12 color-gray7">
            {inquiryType === 'b2b'
              ? 'Sent to foamfactory@earthfoam.com'
              : 'Sent to info@earthfoam.lk'}
          </p>
        </div>
        <button
          type="button"
          className="chatbot__iconBtn"
          onClick={onClose}
          aria-label="Close inquiry form"
        >
          <X size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>Back</span>
        </button>
      </div>

      <div className="chatbot__inquiryType" role="group" aria-label="Inquiry type">
        <button
          type="button"
          className={`chatbot__typeBtn${inquiryType === 'b2b' ? ' is-active' : ''}`}
          onClick={() => setInquiryType('b2b')}
        >
          B2B / Wholesale
        </button>
        <button
          type="button"
          className={`chatbot__typeBtn${inquiryType === 'retail' ? ' is-active' : ''}`}
          onClick={() => setInquiryType('retail')}
        >
          Mattresses / earthfoam.lk
        </button>
      </div>

      <div className="chatbot__fieldGrid chatbot__fieldGrid--two">
        <input
          className="chatbot__field"
          type="text"
          placeholder="Your name *"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="chatbot__field"
          type="email"
          placeholder="Email address *"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="chatbot__field"
          type="text"
          placeholder={inquiryType === 'b2b' ? 'Company name' : 'City (e.g. Colombo)'}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="chatbot__field"
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="chatbot__fieldGrid mt-1">
        <input
          className="chatbot__field"
          type="text"
          placeholder={
            inquiryType === 'b2b'
              ? 'Interest (Wholesale foam, White-label, Collab, Seal license)'
              : 'Product (Organic Mattress, Hybrid, Topper, Pillow)'
          }
          value={productOrProject}
          onChange={(e) => setProductOrProject(e.target.value)}
        />
        <textarea
          className="chatbot__field"
          placeholder="Tell us what you need (sizes, quantities, questions) *"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && <p className="chatbot__inquiryError">{error}</p>}

      <button type="submit" className="button chatbot__submitBtn" disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle size={15} strokeWidth={1.75} className="chatbot__spin" aria-hidden="true" />
            <span>Sending…</span>
          </>
        ) : (
          <>
            <span>Send inquiry</span>
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [revealingId, setRevealingId] = useState(null)
  const [revealedChars, setRevealedChars] = useState(0)

  const dialogTitleId = useId()
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const lastScrolledIdRef = useRef(WELCOME_MESSAGE.id)

  const revealingContent =
    (revealingId && messages.find((m) => m.id === revealingId)?.content) || ''

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!revealingId || !revealingContent) return
    const timer = window.setInterval(() => {
      setRevealedChars((prev) => {
        const next = nextRevealIndex(revealingContent, prev)
        if (next >= revealingContent.length) {
          window.clearInterval(timer)
          setRevealingId(null)
          return revealingContent.length
        }
        return next
      })
    }, REVEAL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [revealingId, revealingContent])

  // Keep the newest message anchored near the top of the scroll area so the
  // user never has to scroll back up while a long reply types downward.
  useEffect(() => {
    const listEl = listRef.current
    const latest = messages[messages.length - 1]
    if (!open || !listEl || !latest) return
    if (lastScrolledIdRef.current === latest.id) return
    lastScrolledIdRef.current = latest.id

    const target = [...listEl.querySelectorAll('[data-msg-id]')].find(
      (el) => el.getAttribute('data-msg-id') === latest.id,
    )
    if (!target) return

    listEl.scrollTo({
      top: Math.max(0, target.offsetTop - 12),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [open, messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  function handleNavigateInternal() {
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }

  function appendAssistantMessage({ content, actions = [], tracking = null }) {
    const id = nextMsgId('a')
    setMessages((prev) => [
      ...prev,
      { id, role: 'assistant', content, actions, tracking },
    ])
    if (content && !prefersReducedMotion()) {
      setRevealedChars(0)
      setRevealingId(id)
    } else {
      setRevealingId(null)
    }
  }

  function finishReveal() {
    setRevealingId(null)
    setRevealedChars(0)
  }

  async function submitPrompt(rawText) {
    const text = rawText.trim()
    if (!text || loading) return

    setError('')
    setInquiryOpen(false)
    setRevealingId(null)
    const userMsg = { id: nextMsgId('u'), role: 'user', content: text }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    setLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const apiTurns = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      const data = await sendChatMessage(apiTurns, { signal: controller.signal })
      appendAssistantMessage({
        content: data.reply,
        actions: data.actions || [],
        tracking: data.tracking || null,
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Unable to send message right now.')
    } finally {
      setLoading(false)
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    submitPrompt(input)
  }

  function handleReset() {
    abortRef.current?.abort()
    lastScrolledIdRef.current = WELCOME_MESSAGE.id
    setMessages([WELCOME_MESSAGE])
    setError('')
    setLoading(false)
    setInquiryOpen(false)
    setRevealingId(null)
    setRevealedChars(0)
  }

  function handleInquirySubmitted(res) {
    setInquiryOpen(false)
    appendAssistantMessage({ content: res.message })
  }

  const showStarters = messages.length === 1 && !loading && !inquiryOpen

  return (
    <div className="chatbot">
      {!open && (
        <button
          type="button"
          className="button chatbot__launcher"
          onClick={() => setOpen(true)}
          aria-label="Open Earthfoam AI Assistant"
        >
          <span className="chatbot__dot" aria-hidden="true" />
          <MessageSquare size={17} strokeWidth={1.75} aria-hidden="true" />
          <span>Ask Earthfoam</span>
        </button>
      )}

      {open && (
        <section
          className="chatbot__panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={dialogTitleId}
        >
          <header className="chatbot__header">
            <div className="chatbot__brand">
              <span className="chatbot__logoWrap">
                <img src={monogram} alt="" width="18" height="19" />
              </span>
              <div>
                <h2 id={dialogTitleId} className="chatbot__title">
                  Earthfoam Assistant
                </h2>
                <p className="chatbot__subtitle">
                  Orders · Factory & Certs · earthfoam.lk
                </p>
              </div>
            </div>

            <div className="chatbot__headerActions">
              <button
                type="button"
                className={`chatbot__iconBtn${inquiryOpen ? ' chatbot__iconBtn--active' : ''}`}
                onClick={() => setInquiryOpen((v) => !v)}
                title="Send an inquiry"
              >
                <Mail size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Inquire</span>
              </button>
              <button
                type="button"
                className="chatbot__iconBtn"
                onClick={handleReset}
                aria-label="Reset conversation"
                title="New chat"
              >
                <RotateCcw size={13} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="chatbot__iconBtn"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X size={15} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            className={`chatbot__messages${messages.length > 1 ? ' chatbot__messages--conversation' : ''}`}
            ref={listRef}
            aria-live="polite"
          >
            {messages.map((msg) => {
              const isRevealing = msg.id === revealingId
              const visibleText = isRevealing
                ? stripDanglingRevealTokens(msg.content.slice(0, revealedChars))
                : msg.content

              return (
                <div
                  key={msg.id}
                  data-msg-id={msg.id}
                  className={`chatbot__msg chatbot__msg--${msg.role}`}
                >
                  <span className="chatbot__msgRole">
                    {msg.role === 'user' ? 'You' : 'Earthfoam'}
                  </span>
                  <div
                    className={`chatbot__bubble${isRevealing ? ' chatbot__bubble--revealing' : ''}`}
                    onClick={isRevealing ? finishReveal : undefined}
                    title={isRevealing ? 'Click to show full reply' : undefined}
                  >
                    <FormattedText
                      content={visibleText}
                      onNavigateInternal={handleNavigateInternal}
                      showCaret={isRevealing}
                    />
                  </div>
                  {!isRevealing && msg.tracking && (
                    <TrackingMiniCard tracking={msg.tracking} />
                  )}
                  {!isRevealing && msg.actions?.length > 0 && (
                    <ActionPills
                      actions={msg.actions}
                      onOpenInquiry={() => setInquiryOpen(true)}
                      onNavigateInternal={handleNavigateInternal}
                    />
                  )}
                </div>
              )
            })}

            {showStarters && (
              <div className="chatbot__starters">
                {STARTER_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="chatbot__chip"
                    onClick={() => submitPrompt(item.prompt)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="chatbot__typing">
                <LoaderCircle size={15} strokeWidth={1.75} className="chatbot__spin" aria-hidden="true" />
                <span>Checking Earthfoam records…</span>
              </div>
            )}

            {error && (
              <div className="chatbot__error" role="alert">
                {error}
              </div>
            )}
          </div>

          {inquiryOpen && (
            <InquiryForm
              onClose={() => setInquiryOpen(false)}
              onSubmitted={handleInquirySubmitted}
            />
          )}

          <div className="chatbot__composer">
            <form className="chatbot__form" onSubmit={handleFormSubmit}>
              <label htmlFor="earthfoam-chatbot-input" className="visually-hidden">
                Ask a question or enter an order number
              </label>
              <input
                ref={inputRef}
                id="earthfoam-chatbot-input"
                type="text"
                className="chatbot__input"
                placeholder={`Ask about foam, mattresses, or order e.g. ${ORDER_NUMBER_EXAMPLE}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="chatbot__send"
                aria-label="Send message"
                disabled={loading || !input.trim()}
              >
                <SendHorizontal size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </form>
            <p className="chatbot__disclaimer">
              Order lookups are live · Retail mattresses link to earthfoam.lk
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
