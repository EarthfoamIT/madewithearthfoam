import { useEffect } from 'react'
import { SITE_URL } from '../data/site.js'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Updates the document title and the per-page meta tags that index.html
// starts with.
export default function usePageMeta({ title, description, path }) {
  useEffect(() => {
    document.title = title
    setMeta('name', 'description', description ?? '')
    const url = `${SITE_URL}${path}`
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:url', url)
  }, [title, description, path])
}
