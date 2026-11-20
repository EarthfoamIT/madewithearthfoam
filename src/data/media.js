import carousel02 from '../assets/images/carousel-02.webp'
import carousel03 from '../assets/images/carousel-03.webp'
import foamBlock from '../assets/images/foam-block.webp'
import healthcareMedicalCamp from '../assets/images/healthcare-medical-camp.webp'
import halfHeightPillow01 from '../assets/images/half-height-pillow-01.webp'
import team from '../assets/images/team.webp'
import { HERO_VIDEOS } from './site.js'
import { VIDEOS, youtubeThumbnail } from './videos.js'

// Gallery (/gallery).
//
// !! SAMPLE CONTENT !! Apart from the videos and awards, every entry below is
// a placeholder that shows how the page lays out. Replace them with the real
// exhibitions, press etc. before launch.
//
// Fields:
//   id        unique slug
//   category  one of the MEDIA_CATEGORIES keys
//   title     headline
//   date      'YYYY-MM-DD'. Start date for multi-day events; publish date for
//             articles, press and brochures. Drives the calendar view.
//             Just 'YYYY' is allowed when only the year is known (awards so
//             far). It then shows as the year, sits under "Also in <year>"
//             in the calendar, and moves into its month once a full date is
//             filled in.
//   period    optional label shown instead of a year-only date, e.g. '2022/23'
//   achievement  awards only: the result, e.g. 'Winner', 'Bronze Award'
//   photos    awards only: [{ src, alt }], shown in order in the award card,
//             e.g. the trophy first, then our people at the ceremony. The
//             first one is also the thumbnail. Until they're added the card
//             shows two placeholder slides (award, people).
//   endDate   optional, for multi-day exhibitions and events
//   location  optional, for exhibitions, events and awards
//   source    optional, publication or awarding body
//   summary   optional, one or two sentences
//   image     optional thumbnail; also what the viewer shows if nothing else
//   Then at most one of these, which decides the card's action:
//   youtube   YouTube video ID  plays in the viewer (see src/data/videos.js)
//   video     { src, poster? }  self-hosted file, plays in the viewer
//   file      PDF url (brochures)  opens in a new tab
//   href      external url (articles)  opens in a new tab
//   (none)    the image opens in the viewer (press clippings, award photos)
//             With no image either, the entry just shows (awards for now).

// First-place results. Within a year these awards are listed first, then
// the rest (bronze, runner-up, merit) in the order they appear below.
export const TOP_ACHIEVEMENTS = new Set(['Winner', 'Best Exporter', 'People’s Pinnacle Award'])

export const MEDIA_CATEGORIES = [
  { key: 'awards', label: 'Awards' },
  { key: 'exhibitions', label: 'Exhibitions' },
  { key: 'events', label: 'Events' },
  { key: 'press', label: 'In the Press' },
  { key: 'articles', label: 'Articles' },
  { key: 'brochures', label: 'Brochures' },
  { key: 'videos', label: 'Videos' },
]

export const mediaItems = [
  // Real entries, from src/data/videos.js.
  ...Object.entries(VIDEOS).map(([key, v]) => ({
    id: key,
    category: 'videos',
    title: v.title,
    date: v.date,
    summary: v.summary,
    image: youtubeThumbnail(v.youtubeId),
    youtube: v.youtubeId,
  })),
  {
    id: 'sample-trade-fair-2027',
    category: 'exhibitions',
    title: 'Sample: International bedding trade fair',
    date: '2027-01-13',
    endDate: '2027-01-16',
    location: 'Cologne, Germany',
    summary: 'Placeholder for an upcoming exhibition. Shows in “Coming up” until the date passes.',
    image: foamBlock,
  },
  {
    id: 'sample-factory-open-day-2026',
    category: 'events',
    title: 'Sample: Factory open day',
    date: '2026-12-05',
    location: 'Horana, Sri Lanka',
    summary: 'Placeholder for an upcoming event.',
    image: team,
  },
  {
    id: 'sample-newspaper-2026',
    category: 'press',
    title: 'Sample: Newspaper feature on natural latex',
    date: '2026-08-02',
    source: 'Newspaper name',
    summary: 'Placeholder clipping. The scanned page opens full size in the viewer.',
    image: carousel02,
  },
  {
    id: 'sample-brochure-2026',
    category: 'brochures',
    title: 'Sample: Earthfoam product brochure 2026',
    date: '2026-06-01',
    summary: 'Placeholder brochure. Point `file` at the PDF in public/assets.',
    image: halfHeightPillow01,
    file: '/assets/2026-PVL-Cert-GOLS.pdf',
  },
  {
    id: 'sample-story-video',
    category: 'videos',
    title: 'Sample: Our story',
    date: '2026-04-22',
    summary: 'Placeholder video, using the brand story film from the home page.',
    image: HERO_VIDEOS.background.poster,
    video: { src: HERO_VIDEOS.story.src, poster: HERO_VIDEOS.background.poster },
  },
  {
    id: 'sample-expo-2026',
    category: 'exhibitions',
    title: 'Sample: Home and furniture expo',
    date: '2026-03-10',
    endDate: '2026-03-13',
    location: 'Dubai, UAE',
    image: carousel03,
  },
  {
    id: 'sample-article-2026',
    category: 'articles',
    title: 'Sample: Online article about fair trade rubber',
    date: '2026-02-14',
    source: 'Publication name',
    summary: 'Placeholder article. Set `href` to the article’s URL.',
    image: foamBlock,
    href: 'https://example.com',
  },
  {
    id: 'sample-community-event-2025',
    category: 'events',
    title: 'Sample: Community medical camp',
    date: '2025-11-08',
    location: 'Badalkumbura, Sri Lanka',
    image: healthcareMedicalCamp,
  },
  {
    id: 'sample-newspaper-2025',
    category: 'press',
    title: 'Sample: Business section interview',
    date: '2025-05-03',
    source: 'Newspaper name',
    image: carousel02,
  },
  {
    id: 'sample-exhibition-2024',
    category: 'exhibitions',
    title: 'Sample: Natural products exhibition',
    date: '2024-10-15',
    endDate: '2024-10-18',
    location: 'Frankfurt, Germany',
    image: carousel03,
  },
  // Awards, as sent by Earthfoam. Only the year is known so far, so dates are
  // 'YYYY' (the later year for split years like 2022/23). No photos yet;
  // add each one as image: when it arrives. Within a year, keep this order.
  {
    id: 'award-2023-presidential-export-25-lifestyle',
    category: 'awards',
    title: 'Lifestyle Products 2022/2023',
    achievement: 'Best Exporter',
    date: '2023',
    source: '25th Presidential Export Awards',
  },
  {
    id: 'award-2023-national-industry-excellence-rubber-plastics',
    category: 'awards',
    title: 'Large Scale – Rubber, Plastics and Allied Sector 2023',
    achievement: 'Bronze Winner',
    date: '2023',
    source: 'National Industry Excellence Awards',
  },
  {
    id: 'award-2024-presidential-export-26-lifestyle',
    category: 'awards',
    title: 'Lifestyle Products 2023/2024',
    achievement: 'Best Exporter',
    date: '2024',
    source: '26th Presidential Export Awards',
  },
  {
    id: 'award-2024-pinnacle-best-mattress-brand',
    category: 'awards',
    title: 'Best Mattress Brand 2024',
    achievement: 'People’s Pinnacle Award',
    date: '2024',
    source: 'Pinnacle Sri Lanka',
  },
  {
    id: 'award-2024-national-industry-brand-excellence-large-scale',
    category: 'awards',
    title: 'Large Scale 2024',
    achievement: 'Winner',
    date: '2024',
    source: 'National Industry Brand Excellence Awards',
  },
  {
    id: 'award-2025-ncc-agriculture-large-scale',
    category: 'awards',
    title: 'Agriculture, Livestock and Fisheries – Large Scale 2025',
    achievement: 'Winner',
    date: '2025',
    source: 'National Chamber of Commerce',
  },
  {
    id: 'award-2025-ncc-best-value-addition',
    category: 'awards',
    title: 'Best Value Addition Enterprise 2025',
    achievement: 'Winner',
    date: '2025',
    source: 'National Chamber of Commerce',
  },
  {
    id: 'award-2025-prisl-outstanding-exporter',
    category: 'awards',
    title: 'Most Outstanding Exporter of the Year 2025',
    achievement: 'Winner',
    date: '2025',
    source: 'Plastic and Rubber Institute of Sri Lanka (PRISL)',
  },
  {
    id: 'award-2025-prisl-sustainability',
    category: 'awards',
    title: 'Sustainability and Environmental Responsibilities 2025',
    achievement: '2nd Runner-up',
    date: '2025',
    source: 'Plastic and Rubber Institute of Sri Lanka (PRISL)',
  },
  {
    id: 'award-2025-presidential-export-27-dry-rubber',
    category: 'awards',
    title: 'Dry Rubber Product 2025',
    achievement: 'Merit Award',
    date: '2025',
    source: '27th Presidential Export Awards',
  },
  {
    id: 'award-2026-cnci-manufacturing-extra-large',
    category: 'awards',
    title: 'Manufacturing Sector – Extra Large Category 2026',
    achievement: 'Bronze Award',
    date: '2026',
    source: 'Ceylon National Chamber of Industries',
  },
  {
    id: 'award-2026-prisl-outstanding-exporter',
    category: 'awards',
    title: 'Most Outstanding Exporter of the Year 2026',
    achievement: 'Winner',
    date: '2026',
    source: 'Plastic and Rubber Institute of Sri Lanka (PRISL)',
  },
  {
    id: 'award-2026-prisl-outstanding-large-enterprise',
    category: 'awards',
    title: 'Most Outstanding Large Enterprise 2026',
    achievement: 'Winner',
    date: '2026',
    source: 'Plastic and Rubber Institute of Sri Lanka (PRISL)',
  },
]
