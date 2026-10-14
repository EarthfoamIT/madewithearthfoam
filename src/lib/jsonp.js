let counter = 0

// Minimal JSONP request. Mailchimp's embedded-form endpoint doesn't send CORS
// headers, so fetch() can't read its response. Its `post-json` variant
// supports JSONP through the `c` (callback) parameter instead.
export default function jsonp(url, { callbackParam = 'c', timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const name = `__jsonp_${Date.now()}_${counter++}`
    const script = document.createElement('script')

    const cleanup = () => {
      clearTimeout(timer)
      delete window[name]
      script.remove()
    }

    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('JSONP request timed out'))
    }, timeout)

    window[name] = (data) => {
      cleanup()
      resolve(data)
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('JSONP request failed'))
    }

    const separator = url.includes('?') ? '&' : '?'
    script.src = `${url}${separator}${callbackParam}=${name}`
    document.body.appendChild(script)
  })
}
