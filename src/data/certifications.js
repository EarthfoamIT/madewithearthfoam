import fairForLifeLogo from '../assets/graphics/fair-for-life.webp'

// Certificates shown as logo tiles in the home page's
// "Standards & Certifications" section, grouped by heading.
//
// - Certificate PDFs live in public/assets/ under their original file names,
//   so these URLs match the ones on the original site. Leave `file` out and
//   the logo shows without a link.
// - Logos live in src/assets/graphics/certifications/, named after the `id`
//   (e.g. gols.svg, gots.png, oeko-tex.webp). Until a logo file is added,
//   the tile shows the label instead.

const logoFiles = import.meta.glob('../assets/graphics/certifications/*.{svg,png,webp,jpg}', {
  eager: true,
  import: 'default',
})
const logoFor = (id) =>
  Object.entries(logoFiles).find(([path]) => path.split('/').pop().replace(/\.\w+$/, '') === id)?.[1]

export const certificationGroups = [
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
      { id: 'fair-for-life', label: 'Fair for Life', file: 'FFL Certificate.pdf', logo: fairForLifeLogo },
      { id: 'for-life', label: 'For Life' },
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
      { id: 'wrap', label: 'WRAP' },
    ],
  },
].map((group) => ({
  ...group,
  certifications: group.certifications.map((cert) => ({
    ...cert,
    logo: cert.logo ?? logoFor(cert.id),
    href: cert.file ? `/assets/${encodeURIComponent(cert.file)}` : undefined,
  })),
}))

export const certifications = certificationGroups.flatMap((group) => group.certifications)
