import { Link } from 'react-router'
import monogram from '../assets/graphics/monogram.svg'
import Tagline from './Tagline.jsx'

export default function Header({ style }) {
  return (
    <header className="header bb1-gray1 bg-black w-full" style={style}>
      <div className="content header__content items-center pt-2 pb-2 lg:pt-4 lg:pb-4">
        <Link to="/">
          <img src={monogram} alt="Earthfoam" className="header__logo" width="34" height="36" />
        </Link>
        <div className="header__sinhala lg:col-start-5 lg:col-span-2 overflow-h hidden lg:flex flex-col lg:flex-row justify-between relative noselect">
          <Tagline />
        </div>
        <div className="header__actions">
          <Link className="button button--contact text-16 lg:text-18" to="/track-order">
            Track Order
          </Link>
          <Link className="button button--contact text-16 lg:text-18" to="/contact">
            Contact Us
          </Link>
        </div>
      </div>
    </header>
  )
}
