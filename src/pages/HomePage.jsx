import { useOutletContext } from 'react-router'
import Hero from '../components/Hero.jsx'
import IndexSection from '../components/IndexSection.jsx'
import { homeSections } from '../data/homeSections.jsx'
import { SITE_DESCRIPTION, SITE_NAME } from '../data/site.js'
import usePageMeta from '../hooks/usePageMeta.js'

export default function HomePage() {
  const { setHeroVisible } = useOutletContext()
  usePageMeta({ title: SITE_NAME, description: SITE_DESCRIPTION, path: '/' })

  return (
    <>
      <Hero onVisibilityChange={setHeroVisible} />
      {homeSections.map((section, i) => (
        <IndexSection key={section.id} number={String(i).padStart(2, '0')} {...section} />
      ))}
    </>
  )
}
