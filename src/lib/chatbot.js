// Client for the API's public POST /chatbot/* endpoints.

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const STARTER_PROMPTS = [
  {
    label: 'Track an order',
    prompt: 'I want to track my container order.',
  },
  {
    label: 'Mattresses & Pillows',
    prompt: 'Tell me about your mattresses, hybrid models, and pillows on earthfoam.lk.',
  },
  {
    label: 'Certifications & PDFs',
    prompt: 'What organic and fair trade certifications does Earthfoam hold?',
  },
  {
    label: 'Wholesale & White-Label',
    prompt: 'How can we source wholesale latex foam or partner for white-label manufacturing?',
  },
]

export class ChatbotError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function postJson(path, payload, { signal } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ChatbotError(0, 'We could not reach the Earthfoam assistant right now. Please try again in a moment.')
  }

  const body = await res.json().catch(() => null)
  if (res.ok && body) return body

  throw new ChatbotError(
    res.status,
    body?.message || 'Something went wrong on our side. Please try again shortly.',
  )
}

export function sendChatMessage(messages, options) {
  return postJson('/chatbot/message', { messages }, options)
}

export function sendChatInquiry(inquiry, options) {
  return postJson('/chatbot/inquiry', inquiry, options)
}

