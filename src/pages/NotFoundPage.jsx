import { BadgeCheck, Images, Mail, Truck } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { ArrowRightIcon } from '../components/icons.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import '../styles/not-found.css'

// Where most lost visitors were probably headed.
const SUGGESTIONS = [
  { label: 'Media Gallery', note: 'Awards, events, press and video', to: '/gallery', icon: Images },
  { label: 'Fair for Life', note: 'How our foam is made fairly', to: '/fair-for-life', icon: BadgeCheck },
  { label: 'Track your order', note: 'Check where your foam is', to: '/track-order', icon: Truck },
  { label: 'Contact us', note: 'Ask us anything', to: '/contact', icon: Mail },
]

// Catch-all route (see router.jsx). Same two-column layout as the Contact page.
export default function NotFoundPage() {
  const { pathname } = useLocation()
  usePageMeta({
    title: 'Page not found | Made With Earthfoam',
    description: 'This page doesn’t exist. Head back to the Made with Earthfoam home page.',
    path: pathname,
  })

  return (
    <section className="notFoundPage">
      <div className="content contentgrid pt-5 pb-6 lg:pt-10 lg:pb-10">
        <div className="lg:col-start-1 lg:col-span-4">
          {/* The big numeral is what visitors see first, so nobody mistakes
              this for a real page; the h1 says it in words. */}
          <p className="notFoundPage__code" aria-hidden="true" data-animate="slide-up">
            404
          </p>
          <p className="eyebrow-sm color-sunset mt-3 mb-2" data-animate="slide-up" data-delay="1">
            Page not found
          </p>
          <h1 className="pageTitle notFoundPage__title" data-animate="slide-up" data-delay="1">
            <span className="sr-only">Error 404: </span>
            Nothing here but air.
          </h1>
        </div>

        <div className="lg:col-start-5 lg:col-span-4 mt-4 lg:mt-0 notFoundPage__body">
          <div className="notFoundPage__intro" data-animate="slide-up" data-delay="2">
            <p className="h3 notFoundPage__lede">
              Good latex foam is full of tiny pockets of air. This page turned out to be one of them.
            </p>
            <p className="color-gray7 notFoundPage__path">
              We couldn’t find <code>{pathname}</code>. It may have moved, or the link has a typo.
            </p>
          </div>

          <div className="notFoundPage__actions" data-animate="slide-up" data-delay="3">
            <Link to="/" className="button notFoundPage__button notFoundPage__button--primary">
              Back to home
            </Link>
          </div>

          <nav aria-labelledby="notFoundSuggestions" data-animate="slide-up" data-delay="4">
            <h2 id="notFoundSuggestions" className="eyebrow-sm color-gray7 mb-2">
              Or try one of these
            </h2>
            <ul className="notFoundPage__links">
              {SUGGESTIONS.map(({ label, note, to, icon: Icon }) => (
                <li key={to}>
                  <Link to={to} className="notFoundPage__link">
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" className="notFoundPage__icon" />
                    <span className="notFoundPage__label">
                      <span>{label}</span>
                      <span className="color-gray7 text-14">{note}</span>
                    </span>
                    <ArrowRightIcon />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  )
}
