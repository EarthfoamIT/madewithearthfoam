// Certificate PDFs live in public/assets/ under their original file names,
// so these URLs match the ones on the original site.
export const certifications = [
  { label: 'GOTS Certification', file: 'GOTS New.pdf' },
  { label: 'GOLS Certification', file: '2026-PVL-Cert-GOLS.pdf' },
  { label: 'Eco-Institut Certification', file: 'Eco Certificate.pdf' },
  { label: 'FSC Certification', file: 'FSC Certificate.pdf' },
  { label: 'Fair For Life', file: 'FFL Certificate.pdf' },
  { label: 'Oeko Tex', file: '2026-PVL-Cert-OekoTex.pdf' },
  { label: 'Organic Content Standard', file: 'OCS_Scope_Certificate_2025-04-02 08_49_57 UTC.pdf' },
  { label: 'ISO 9001', file: 'ISO 90012015 Certificate.pdf' },
  { label: 'ISO 14001', file: 'Earthfoam (Private) Limited -14k 2025.pdf' },
].map((cert) => ({ ...cert, href: `/assets/${encodeURIComponent(cert.file)}` }))
