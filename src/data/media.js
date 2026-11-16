import carousel01 from '../assets/images/carousel-01.webp'
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
// !! SAMPLE CONTENT !! Every entry below is a placeholder that shows how the
// page lays out. Replace them with the real awards, press etc. before launch.
//
// Fields:
//   id        unique slug
//   category  one of the MEDIA_CATEGORIES keys
//   title     headline
//   date      'YYYY-MM-DD'. Start date for multi-day events; publish date for
//             articles, press and brochures. Drives the calendar view.
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
    id: 'sample-export-award-2026',
    category: 'awards',
    title: 'Sample: Export excellence award',
    date: '2026-09-18',
    location: 'Colombo, Sri Lanka',
    source: 'Awarding body name',
    summary: 'Placeholder award. Add a photo of the trophy or ceremony as the image.',
    image: carousel01,
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
    video: { src: HERO_VIDEOS.story.small, poster: HERO_VIDEOS.background.poster },
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
    id: 'sample-sustainability-award-2025',
    category: 'awards',
    title: 'Sample: Sustainability award',
    date: '2025-07-24',
    source: 'Awarding body name',
    image: carousel01,
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
]
