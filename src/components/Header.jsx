import { Link } from 'react-router'
import badge from '../assets/graphics/badge.svg'
import fairForLife from '../assets/graphics/fair-for-life.webp'
import Tagline from './Tagline.jsx'

// `hero` is the transparent copy over the home page video. Its shortcuts
// (Track Order, Media) live in the hero's bottom-left stack instead, so the
// corner shows the Fair for Life seal, linking to /fair-for-life.
export default function Header({ style, hero = false }) {
  return (
    <header className="header bb1-gray1 bg-black w-full" style={style}>
      <div className="content header__content items-center">
        <Link to="/" aria-label="Made with Earthfoam home">
          <img src={badge} alt="" className="header__logo" width="161" height="216" />
        </Link>
        <div className="header__sinhala lg:col-start-5 lg:col-span-2 overflow-h hidden lg:flex flex-col lg:flex-row justify-between relative noselect">
          <Tagline />
        </div>
        <div className="header__actions">
          {hero ? (
            <Link to="/fair-for-life" className="fairForLifeIcon" aria-label="Fair for Life certified: see our work">
              <img src={fairForLife} alt="" width="128" height="151" />
            </Link>
          ) : (
            <>
              <Link className="button button--contact text-16 lg:text-18" to="/track-order">
                Track Order
              </Link>
              <Link className="button button--contact text-16 lg:text-18" to="/gallery">
                Gallery
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
