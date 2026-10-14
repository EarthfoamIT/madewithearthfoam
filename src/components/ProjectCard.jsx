import { Link } from 'react-router'
import UseCase from './UseCase.jsx'

// Teaser linking to a project page. Opens in a new tab, as on the original site.
export default function ProjectCard({ project }) {
  return (
    <Link to={`/${project.slug}`} target="_blank">
      <UseCase image={project.card.image} alt={project.card.alt} title={project.title} text={project.summary} showArrow />
    </Link>
  )
}
