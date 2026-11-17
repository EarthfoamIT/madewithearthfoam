import { useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Carousel from '../components/Carousel.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import Newsletter from '../components/Newsletter.jsx'

// Shared page chrome. On the home page the fixed header is hidden
// (`delayedHeader`) until the hero scrolls out of view. Other pages use a
// sticky header (`stickyHeader`).
export default function RootLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [heroVisible, setHeroVisible] = useState(true)

  const headerStyle = isHome ? { transform: `translateY(${heroVisible ? '-100%' : '0%'})` } : undefined

  return (
    <div className={isHome ? 'delayedHeader' : 'stickyHeader'}>
      <Header style={headerStyle} />
      <main>
        <Outlet context={{ setHeroVisible }} />
      </main>
      <Carousel />
      <Newsletter />
      <Footer />
      {/* Every page loaded straight from the address bar gets the key
          "default", so without this a typed URL (often the 404) would jump
          to wherever the previously loaded page was scrolled. Keying those
          by path keeps reloads restoring and new pages starting at the top. */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname : location.key)} />
    </div>
  )
}
