import fairForLifeLogo from '../assets/graphics/fair-for-life.webp'
import { certificationGroupList } from './certificationList.js'

// Certificates shown as logo tiles in the home page's
// "Standards & Certifications" section, grouped by heading.
//
// - Names and PDF links live in certificationList.js.
// - Logos live in src/assets/graphics/certifications/, named after the `id`
//   (e.g. gols.svg, gots.png, oeko-tex.webp). Until a logo file is added,
//   the tile shows the label instead.

const logoFiles = import.meta.glob('../assets/graphics/certifications/*.{svg,png,webp,jpg}', {
  eager: true,
  import: 'default',
})
const logoFor = (id) =>
  Object.entries(logoFiles).find(([path]) => path.split('/').pop().replace(/\.\w+$/, '') === id)?.[1]

// Logos that don't follow the id-based file naming above.
const logoOverrides = { 'fair-for-life': fairForLifeLogo }

export const certificationGroups = certificationGroupList.map((group) => ({
  ...group,
  certifications: group.certifications.map((cert) => ({
    ...cert,
    logo: logoOverrides[cert.id] ?? logoFor(cert.id),
  })),
}))

export const certifications = certificationGroups.flatMap((group) => group.certifications)
