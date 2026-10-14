import badge from '../assets/graphics/badge.svg'
import { ADDRESS_LINES, CONTACT } from '../data/site.js'
import Tagline from './Tagline.jsx'

export default function Footer() {
  return (
    <footer className="pt-5 pb-5 lg:pt-10 lg:pb-10 bt1-gray1">
      <div className="content contentgrid">
        <img
          src={badge}
          width="161"
          height="216"
          alt="Made with Earthfoam"
          className="col-start-1 col-span-1 lg:w-full h-auto ml-a mr-a"
        />

        <div className="lg:col-start-2 lg:col-span-2 lg:pl-3 text-center lg:text-left mb-5 lg:mb-0">
          <h2 className="mb-4 lg:mb-3 whitespace-pre-wrap weight-500">{'Feel the difference,\nlook for the proof.'}</h2>
          <p className="whitespace-pre-wrap weight-300 lg:weight-400">
            When customers see this seal, they know it’s good to the core. Contact us for details on the licensed use
            of the Made with Earthfoam seal.
          </p>
        </div>

        <div className="lg:col-start-5 lg:col-span-2 pt-5 lg:pt-0 bt1-gray1 lg:bt0 mb-8 lg:mb-0">
          <h2 className="mb-3 weight-500">Contact</h2>
          <p>
            <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          </p>
          <p>
            <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
        </div>

        <div className="lg:col-start-7 lg:col-span-2 mb-8 lg:mb-0">
          <h2 className="mb-3 weight-500">Address</h2>
          <address>
            {ADDRESS_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </address>
        </div>

        <div className="overflow-h flex relative noselect lg:hidden">
          <Tagline />
        </div>
      </div>
    </footer>
  )
}
