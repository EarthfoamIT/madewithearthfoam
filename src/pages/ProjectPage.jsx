import UseCase from '../components/UseCase.jsx'
import usePageMeta from '../hooks/usePageMeta.js'

export default function ProjectPage({ project }) {
  usePageMeta({
    title: project.title,
    description: project.summary ?? project.title,
    path: `/${project.slug}`,
  })

  return (
    <section className="contentLayout contentLayout--subpage pt-3 pb-6 lg:pt-8 lg:pb-10">
      <div className="content contentgrid">
        <h2 className="h2 lg:col-start-1 lg:col-span-3">{project.title}</h2>
        <div className="contentLayout__gallery lg:col-start-1 lg:col-span-3"></div>
        <div className="contentLayout__body lg:col-start-5 lg:col-span-4">
          {project.summary && (
            <div className="richtext">
              <p>{project.summary}</p>
            </div>
          )}
          {project.caseStudies.map((study, i) => (
            <UseCase key={study.title || i} {...study} />
          ))}
        </div>
      </div>
    </section>
  )
}
