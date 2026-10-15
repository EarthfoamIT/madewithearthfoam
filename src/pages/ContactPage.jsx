import { Link } from 'react-router'
import { ADDRESS_LINES, CONTACT } from '../data/site.js'
import usePageMeta from '../hooks/usePageMeta.js'
import '../styles/contact.css'

// Same layout as the earthfoam.lk contact page, with this site's details.
export default function ContactPage() {
  usePageMeta({
    title: 'Contact | Made With Earthfoam',
    description: 'Get in touch with the Earthfoam factory about wholesale latex foam, custom projects and the Made with Earthfoam seal.',
    path: '/contact',
  })

  return (
    <section className="contactPage">
      <div className="content contentgrid pt-5 pb-6 lg:pt-10 lg:pb-10">
        <div className="lg:col-start-1 lg:col-span-3">
          <h1 className="pageTitle" data-animate="slide-up">
            Say hi
          </h1>
        </div>

        <div className="lg:col-start-5 lg:col-span-4 mt-4 lg:mt-0 contactPage__body">
          <p className="h3 contactPage__lede" data-animate="slide-up" data-delay="1">
            Whether it’s wholesale foam, a custom project or licensing the Made with Earthfoam seal, we’d love to hear
            from you. Call us or leave a message any time.
          </p>

          <div className="contactPage__actions" data-animate="slide-up" data-delay="2">
            <a href={`mailto:${CONTACT.email}`} className="button contactPage__button contactPage__button--primary">
              <span>Email</span>
              <span aria-hidden="true">/</span>
              <span>{CONTACT.email}</span>
            </a>
            <a href={CONTACT.phoneHref} className="button contactPage__button">
              <span>Call</span>
              <span aria-hidden="true">/</span>
              <span>{CONTACT.phone}</span>
            </a>
          </div>

          <div className="contactPage__details" data-animate="slide-up" data-delay="3">
            <div>
              <h2 className="weight-500 mb-1">Factory:</h2>
              <address className="color-gray8">
                {ADDRESS_LINES.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </div>
            <div>
              <h2 className="weight-500 mb-1">Checking on an order?</h2>
              <p className="color-gray8">
                <Link className="underline" to="/track-order">
                  Track it here
                </Link>{' '}
                with your order number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
