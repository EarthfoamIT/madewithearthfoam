// Certificate names and PDF links, grouped by heading. Plain data with no
// image imports, so Node can load it too (the dev chatbot stub in dev/ reads
// it from vite.config.js). certifications.js adds the logos on top.
//
// Certificate PDFs live in public/assets/ under their original file names,
// so these URLs match the ones on the original site. Leave `file` out and
// the logo shows without a link.

export const certificationGroupList = [
  {
    id: 'organic',
    title: 'Organic',
    certifications: [
      { id: 'gols', label: 'GOLS', file: '2026-PVL-Cert-GOLS.pdf' },
      { id: 'gots', label: 'GOTS', file: 'GOTS New.pdf' },
      { id: 'organic-content-standard', label: 'Organic Content Standard', file: 'OCS_Scope_Certificate_2025-04-02 08_49_57 UTC.pdf' },
    ],
  },
  {
    id: 'fair-trade',
    title: 'Fair Trade',
    certifications: [
      { id: 'fair-for-life', label: 'Fair for Life', file: 'FFL Certificate.pdf' },
      { id: 'for-life', label: 'For Life', file: 'FL_Certificate_Earthfoam Private Limited_20260515.pdf' },
    ],
  },
  {
    id: 'sustainable',
    title: 'Sustainable',
    certifications: [
      { id: 'iso-14001', label: 'ISO 14001', file: 'Earthfoam (Private) Limited -14k 2025.pdf' },
      { id: 'fsc', label: 'FSC', file: 'FSC Certificate.pdf' },
    ],
  },
  {
    id: 'safe',
    title: 'Safe',
    certifications: [
      { id: 'oeko-tex', label: 'Oeko-Tex', file: '2026-PVL-Cert-OekoTex.pdf' },
      { id: 'eco-institut', label: 'Eco-Institut', file: 'Eco Certificate.pdf' },
      { id: 'iso-9001', label: 'ISO 9001', file: 'ISO 90012015 Certificate.pdf' },
      { id: 'wrap', label: 'WRAP', file: 'WRAP-Certificate-2026-10-26.pdf' },
    ],
  },
].map((group) => ({
  ...group,
  certifications: group.certifications.map((cert) => ({
    ...cert,
    href: cert.file ? `/assets/${encodeURIComponent(cert.file)}` : undefined,
  })),
}))

export const certificationList = certificationGroupList.flatMap((group) => group.certifications)
