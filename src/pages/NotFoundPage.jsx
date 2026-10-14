import { Link, useLocation } from 'react-router'
import usePageMeta from '../hooks/usePageMeta.js'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  usePageMeta({ title: 'Not Found', description: '', path: pathname })

  return (
    <section className="text-center flex flex-col items-center justify-center gap-2 pt-5 pb-5">
      <h1 className="h1">404</h1>
      <h2 className="eyebrow-sm">Not Found</h2>
      <Link to="/" className="mt-3 lg:mt-5 button button--extended">
        Home
      </Link>
    </section>
  )
}
