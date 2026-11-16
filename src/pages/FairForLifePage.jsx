import { ArrowRight, HandCoins, Hammer, Users } from 'lucide-react'
import { Link } from 'react-router'
import fairForLife from '../assets/graphics/fair-for-life.webp'
import { certifications } from '../data/certifications.js'
import { listedProjects } from '../data/projects.js'
import usePageMeta from '../hooks/usePageMeta.js'
import { ArrowUpRightIcon } from '../components/icons.jsx'
import '../styles/fair-for-life.css'

const fairForLifeCert = certifications.find((cert) => cert.label === 'Fair For Life')

// Figures as stated in the home page's "Our Forests" section.
const STATS = [
  { value: '323', label: 'small organic farms in our fair trade network' },
  { value: '1,700+', label: 'workers employed across the network, and counting' },
  { value: 'No. 1', label: 'the largest fair trade network in Sri Lanka' },
]

const STEPS = [
  {
    icon: HandCoins,
    title: 'We pay into the fund',
    text: 'As a Fair for Life certified company, we contribute to a Development Fund on top of fair wages and the organic premium.',
  },
  {
    icon: Users,
    title: 'Our people decide',
    text: 'Factory workers, farmers and tappers choose how the money is spent, on the things that matter most to them.',
  },
  {
    icon: Hammer,
    title: 'The work gets done',
    text: 'Hospitals, schools and community spaces near our farms and factory, used by everyone who lives there.',
  },
]

export default function FairForLifePage() {
  usePageMeta({
    title: 'Fair for Life | Made With Earthfoam',
    description:
      'How Earthfoam’s Fair for Life Development Fund supports factory workers, farmers and tappers in Sri Lanka, and the projects they have chosen to build.',
    path: '/fair-for-life',
  })

  return (
    <section className="fflPage">
      <div className="content pt-5 pb-6 lg:pt-10 lg:pb-10">
        {/* Intro */}
        <div className="contentgrid">
          <div className="lg:col-start-1 lg:col-span-4">
            <img
              src={fairForLife}
              alt="Fair for Life certified"
              width="128"
              height="151"
              className="fflPage__seal mb-4"
              data-animate="slide-up"
            />
            <h1 className="pageTitle" data-animate="slide-up" data-delay="1">
              Fair for Life
            </h1>
          </div>
          <div className="lg:col-start-5 lg:col-span-4 mt-3 lg:mt-0 fflPage__intro">
            <p className="h3" data-animate="slide-up" data-delay="2">
              Fair for Life is the most stringent fair trade certification, and the most impactful one we hold. It
              covers everyone in our supply chain, from the farmers and tappers in the forest to the team in our
              factory.
            </p>
            <p className="color-gray8" data-animate="slide-up" data-delay="3">
              Caring for our planet would mean next to nothing if we didn’t care for our people. This is where we show
              what that looks like on the ground.
            </p>
            <a
              href={fairForLifeCert.href}
              target="_blank"
              rel="noopener"
              className="fflPage__cert inline-flex items-center gap-2 rounded pl-3 pr-3 pt-2 pb-2 b-gray2"
              data-animate="slide-up"
              data-delay="4"
            >
              <span>View our certificate</span>
              <ArrowUpRightIcon />
            </a>
          </div>
        </div>

        {/* Numbers */}
        <ul className="fflStats mt-8 lg:mt-10">
          {STATS.map((stat, i) => (
            <li key={stat.label} data-animate="slide-up" data-delay={i + 1}>
              <p className="fflStats__value">{stat.value}</p>
              <p className="color-gray7">{stat.label}</p>
            </li>
          ))}
        </ul>

        {/* How the fund works */}
        <div className="fflSection">
          <h2 className="eyebrow-sm color-gray7 mb-4">How the Development Fund works</h2>
          <ol className="fflSteps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <span className="fflSteps__num eyebrow-sm color-gray7">0{i + 1}</span>
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" className="fflSteps__icon" />
                <h3 className="h3 mb-1">{title}</h3>
                <p className="color-gray8">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* The work */}
        <div className="fflSection">
          <h2 className="eyebrow-sm color-gray7 mb-2">What the fund has built</h2>
          <p className="h2 fflSection__lede mb-6 lg:mb-8">Chosen by our people, for their communities.</p>

          {listedProjects.map((project) => (
            <article key={project.slug} className="fflProject">
              <header className="fflProject__head">
                <h3 className="h2">{project.title}</h3>
                <p className="color-gray8 fflProject__summary">{project.summary}</p>
                <Link to={`/${project.slug}`} className="fflProject__more text-14">
                  Read the full story <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </header>
              <ul className="fflWork">
                {project.caseStudies.map((study) => (
                  <li key={study.title} className="fflWork__item">
                    <img src={study.image} alt={study.alt} width="640" height="480" loading="lazy" />
                    <h4 className="h4 mt-3 mb-1">{study.title}</h4>
                    <p className="text-14 color-gray8">{study.text}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Next steps */}
        <div className="fflSection fflOutro">
          <p className="h2">Want to source fair trade foam?</p>
          <div className="flex flex-wrap gap-1">
            <Link to="/contact" className="button">
              Contact us
            </Link>
            <Link to="/gallery" className="button">
              Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
