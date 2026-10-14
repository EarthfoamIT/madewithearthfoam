import { ArrowUpRightIcon } from './icons.jsx'

export default function CertificateLink({ href, label }) {
  return (
    <div className="mt-2 mb-2">
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="contentFile inline-flex flex-row items-center justify-between gap-2 rounded pl-3 pr-3 pt-2 pb-2 b-gray2"
      >
        <span className="whitespace-nowrap">{label}</span>
        <ArrowUpRightIcon />
      </a>
    </div>
  )
}
