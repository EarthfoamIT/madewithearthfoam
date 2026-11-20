import { certificationGroups } from '../data/certifications.js'

function Logo({ cert }) {
  const mark = cert.logo ? (
    <img className="certLogos__img" src={cert.logo} alt={`${cert.label} logo`} loading="lazy" />
  ) : (
    <span className="certLogos__fallback text-small">{cert.label}</span>
  )

  if (!cert.href) {
    return (
      <div className="certLogos__item" role="listitem" title={cert.label}>
        {mark}
      </div>
    )
  }

  return (
    <div className="certLogos__item" role="listitem">
      <a
        className="certLogos__link"
        href={cert.href}
        target="_blank"
        rel="noopener"
        title={`${cert.label} certificate`}
        aria-label={`${cert.label} certificate (PDF, opens in a new tab)`}
      >
        {mark}
      </a>
    </div>
  )
}

// Logos for one certification group (see src/data/certifications.js), each
// linking to its certificate PDF. Placed under that group's paragraph.
export default function CertificationLogos({ group }) {
  const { certifications } = certificationGroups.find((g) => g.id === group)

  return (
    <div className="certLogos" role="list">
      {certifications.map((cert) => (
        <Logo key={cert.id} cert={cert} />
      ))}
    </div>
  )
}
