import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Download,
  FileText,
  ImageIcon,
  LayoutGrid,
  Newspaper,
  Play,
  Presentation,
} from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import MediaViewer from '../components/MediaViewer.jsx'
import { MEDIA_CATEGORIES, mediaItems } from '../data/media.js'
import usePageMeta from '../hooks/usePageMeta.js'
import '../styles/media.css'

const CATEGORY_ICONS = {
  awards: Award,
  exhibitions: Presentation,
  events: CalendarDays,
  press: Newspaper,
  articles: FileText,
  brochures: BookOpen,
  videos: CirclePlay,
}
const CATEGORY_LABELS = Object.fromEntries(MEDIA_CATEGORIES.map((c) => [c.key, c.label]))
const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2000, m, 1).toLocaleString('en-GB', { month: 'short' }))

// --- Dates. Entries use 'YYYY-MM-DD', which compares correctly as text. ---

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const yearOf = (item) => Number(item.date.slice(0, 4))
const monthOf = (item) => Number(item.date.slice(5, 7)) - 1

// "18 Sep 2026", "13–16 Jan 2027", "30 Sep – 2 Oct 2026"
function formatDate(item) {
  const start = parseDate(item.date)
  const full = { day: 'numeric', month: 'short', year: 'numeric' }
  if (!item.endDate || item.endDate === item.date) return start.toLocaleDateString('en-GB', full)
  const end = parseDate(item.endDate)
  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.toLocaleDateString('en-GB', full)} – ${end.toLocaleDateString('en-GB', full)}`
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', full)}`
  }
  return `${start.getDate()}–${end.toLocaleDateString('en-GB', full)}`
}

// Only things that happen on a date (events, exhibitions) can be upcoming.
// Videos, press, articles etc. are dated by release, so they never are.
const SCHEDULED = new Set(['events', 'exhibitions'])
const isUpcoming = (item, today) => SCHEDULED.has(item.category) && (item.endDate || item.date) >= today

// --- What an entry does when opened ---

function actionFor(item) {
  if (item.video || item.youtube) return { label: 'Watch', icon: Play }
  if (item.file) return { label: 'Open PDF', icon: Download, href: item.file }
  if (item.href) return { label: 'Read', icon: ArrowUpRight, href: item.href }
  if (item.image) return { label: 'View', icon: ImageIcon }
  return null
}

// The entry's title, as a link or a button depending on the action. Its
// ::after stretches over the whole card so the card is one click target.
function EntryTitle({ item, onView, className }) {
  const action = actionFor(item)
  if (!action) return <h3 className={className}>{item.title}</h3>
  return (
    <h3 className={className}>
      {action.href ? (
        <a className="mediaEntry__link" href={action.href} target="_blank" rel="noreferrer">
          {item.title}
        </a>
      ) : (
        <button type="button" className="mediaEntry__link" onClick={() => onView(item)}>
          {item.title}
        </button>
      )}
    </h3>
  )
}

function ActionHint({ item }) {
  const action = actionFor(item)
  if (!action) return null
  const Icon = action.icon
  return (
    <span className="mediaEntry__action text-14" aria-hidden="true">
      {action.label}
      <Icon size={14} strokeWidth={1.75} />
    </span>
  )
}

function CategoryTag({ item, today }) {
  const Icon = CATEGORY_ICONS[item.category]
  return (
    <p className="mediaEntry__tags eyebrow-sm">
      <span className="mediaEntry__tag">
        <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
        {CATEGORY_LABELS[item.category]}
      </span>
      {isUpcoming(item, today) && <span className="mediaEntry__tag mediaEntry__tag--soon">Upcoming</span>}
    </p>
  )
}

function Meta({ item }) {
  const parts = [item.source, item.location].filter(Boolean)
  if (!parts.length) return null
  return <p className="text-14 color-gray7">{parts.join(' · ')}</p>
}

// --- Cards ---

function GridCard({ item, onView, today }) {
  return (
    <li className="mediaCard mediaEntry">
      <div className="mediaCard__thumb">
        {item.image ? <img src={item.image} alt="" loading="lazy" /> : null}
        {(item.video || item.youtube) && (
          <span className="mediaCard__play" aria-hidden="true">
            <Play size={18} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="mediaCard__body">
        <CategoryTag item={item} today={today} />
        <EntryTitle item={item} onView={onView} className="h4" />
        <p className="text-14 color-gray7">{formatDate(item)}</p>
        <Meta item={item} />
        <ActionHint item={item} />
      </div>
    </li>
  )
}

function TimelineRow({ item, onView, today }) {
  const start = parseDate(item.date)
  return (
    <li className="mediaRow mediaEntry">
      <div className="mediaRow__date" aria-hidden="true">
        <span className="mediaRow__day">{start.getDate()}</span>
        <span className="eyebrow-sm color-gray7">{start.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
      </div>
      <div className="mediaRow__body">
        <CategoryTag item={item} today={today} />
        <EntryTitle item={item} onView={onView} className="h3" />
        <p className="text-14 color-gray7">
          {formatDate(item)}
          {(item.source || item.location) && ` · ${[item.source, item.location].filter(Boolean).join(' · ')}`}
        </p>
        {item.summary && <p className="mediaRow__summary color-gray8">{item.summary}</p>}
        <ActionHint item={item} />
      </div>
      {item.image && (
        <div className="mediaRow__thumb">
          <img src={item.image} alt="" loading="lazy" />
        </div>
      )}
    </li>
  )
}

// --- Page ---

export default function MediaPage() {
  usePageMeta({
    title: 'Media Gallery | Made With Earthfoam',
    description:
      'Awards, exhibitions, events, press coverage, brochures and videos from Earthfoam, the natural latex foam factory in Sri Lanka.',
    path: '/gallery',
  })

  const viewerRef = useRef(null)
  const openViewer = (item) => viewerRef.current.open(item)

  // Filters live in the URL so a filtered view can be shared.
  const [params, setParams] = useSearchParams()
  const type = CATEGORY_LABELS[params.get('type')] ? params.get('type') : null
  const view = params.get('view') === 'grid' ? 'grid' : 'calendar'
  const month = params.has('month') ? Number(params.get('month')) - 1 : null

  const update = (changes) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined) next.delete(key)
      else next.set(key, String(value))
    }
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const today = todayIso()
  const sorted = useMemo(() => [...mediaItems].sort((a, b) => b.date.localeCompare(a.date)), [])
  const filtered = type ? sorted.filter((item) => item.category === type) : sorted
  const upcoming = sorted.filter((item) => isUpcoming(item, today)).reverse()

  const counts = {}
  for (const item of sorted) counts[item.category] = (counts[item.category] ?? 0) + 1

  // Calendar: only years that have something in the current filter.
  const years = [...new Set(filtered.map(yearOf))].sort((a, b) => a - b)
  const thisYear = Number(today.slice(0, 4))
  const requestedYear = Number(params.get('year'))
  const year = years.includes(requestedYear)
    ? requestedYear
    : years.includes(thisYear)
      ? thisYear
      : (years.filter((y) => y <= thisYear).at(-1) ?? years.at(-1) ?? thisYear)
  const yearIndex = years.indexOf(year)
  const inYear = filtered.filter((item) => yearOf(item) === year)
  const monthCounts = MONTHS.map((_, m) => inYear.filter((item) => monthOf(item) === m).length)
  const shown = month === null || !monthCounts[month] ? inYear : inYear.filter((item) => monthOf(item) === month)

  // Group the timeline by month, newest first.
  const groups = []
  for (const item of shown) {
    const m = monthOf(item)
    if (groups.at(-1)?.month !== m) groups.push({ month: m, items: [] })
    groups.at(-1).items.push(item)
  }

  const goToYear = (y) => update({ year: y, month: null })
  const typeLabel = type ? CATEGORY_LABELS[type].toLowerCase() : null

  return (
    <section className="mediaPage">
      <div className="content pt-5 pb-6 lg:pt-10 lg:pb-10">
        {/* Intro */}
        <div className="contentgrid mb-6 lg:mb-8">
          <div className="lg:col-start-1 lg:col-span-4">
            <p className="eyebrow-sm color-gray7 mb-2" data-animate="slide-up">
              Media Gallery
            </p>
            <h1 className="pageTitle" data-animate="slide-up" data-delay="1">
              Moments worth keeping
            </h1>
          </div>
          <p className="h3 mediaPage__lede lg:col-start-5 lg:col-span-4 mt-3 lg:mt-0" data-animate="slide-up" data-delay="2">
            Awards, exhibitions, press and the days in between. Browse by type, or step back through the calendar to
            see where we’ve been.
          </p>
        </div>

        {/* Coming up */}
        {upcoming.length > 0 && (
          <div className="mediaUpcoming mb-6 lg:mb-8" data-animate="slide-up" data-delay="3">
            <h2 className="eyebrow-sm color-gray7 mb-2">Coming up</h2>
            <ul className="mediaUpcoming__list">
              {upcoming.map((item) => {
                const start = parseDate(item.date)
                const Icon = CATEGORY_ICONS[item.category]
                return (
                  <li key={item.id} className="mediaUpcoming__item mediaEntry">
                    <div className="mediaUpcoming__date" aria-hidden="true">
                      <span className="eyebrow-sm">{MONTHS[start.getMonth()]}</span>
                      <span className="mediaRow__day">{start.getDate()}</span>
                    </div>
                    <div>
                      <p className="eyebrow-sm color-gray7 mediaEntry__tag mb-1">
                        <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                        {CATEGORY_LABELS[item.category]}
                      </p>
                      <EntryTitle item={item} onView={openViewer} className="h4" />
                      <p className="text-14 color-gray7">
                        {formatDate(item)}
                        {item.location && ` · ${item.location}`}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Toolbar */}
        <div className="mediaToolbar" data-animate="slide-up" data-delay="4">
          <div className="mediaFilters" role="group" aria-label="Filter by type">
            <button
              type="button"
              className="mediaChip"
              aria-pressed={!type}
              onClick={() => update({ type: null, month: null })}
            >
              All <span className="mediaChip__count">{sorted.length}</span>
            </button>
            {MEDIA_CATEGORIES.filter((c) => counts[c.key]).map((c) => {
              const Icon = CATEGORY_ICONS[c.key]
              return (
                <button
                  key={c.key}
                  type="button"
                  className="mediaChip"
                  aria-pressed={type === c.key}
                  onClick={() => update({ type: type === c.key ? null : c.key, month: null })}
                >
                  <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                  {c.label} <span className="mediaChip__count">{counts[c.key]}</span>
                </button>
              )
            })}
          </div>
          <div className="mediaViewToggle" role="group" aria-label="View" data-view={view}>
            <span className="mediaViewToggle__thumb" aria-hidden="true" />
            <button type="button" aria-pressed={view === 'calendar'} onClick={() => update({ view: null })}>
              <CalendarRange size={16} strokeWidth={1.75} aria-hidden="true" />
              Calendar
            </button>
            <button type="button" aria-pressed={view === 'grid'} onClick={() => update({ view: 'grid', month: null })}>
              <LayoutGrid size={16} strokeWidth={1.75} aria-hidden="true" />
              Grid
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="h3 color-gray7 mt-6">Nothing here yet. Check back soon.</p>
        ) : view === 'grid' ? (
          <ul key="grid" className="mediaGrid mt-4 lg:mt-6" data-animate="slide-up">
            {filtered.map((item) => (
              <GridCard key={item.id} item={item} onView={openViewer} today={today} />
            ))}
          </ul>
        ) : (
          <div key="calendar" className="mediaCalendar mt-4 lg:mt-6" data-animate="slide-up">
            {/* Year switcher and month strip */}
            <div className="mediaCalendar__nav">
              <div className="mediaCalendar__year">
                <button
                  type="button"
                  className="mediaIconButton"
                  aria-label="Previous year"
                  disabled={yearIndex <= 0}
                  onClick={() => goToYear(years[yearIndex - 1])}
                >
                  <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <h2 className="h2" aria-live="polite">
                  {year}
                </h2>
                <button
                  type="button"
                  className="mediaIconButton"
                  aria-label="Next year"
                  disabled={yearIndex === -1 || yearIndex >= years.length - 1}
                  onClick={() => goToYear(years[yearIndex + 1])}
                >
                  <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              <ol className="mediaMonths" aria-label={`Months in ${year}`}>
                {MONTHS.map((label, m) => {
                  const count = monthCounts[m]
                  const selected = month === m && count > 0
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        className="mediaMonth"
                        disabled={!count}
                        aria-pressed={selected}
                        aria-label={`${label} ${year}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                        onClick={() => update({ year, month: selected ? null : m + 1 })}
                      >
                        <span>{label}</span>
                        <span className="mediaMonth__dots" aria-hidden="true">
                          {Array.from({ length: Math.min(count, 4) }, (_, i) => (
                            <i key={i} />
                          ))}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Timeline */}
            <div className="mediaTimeline">
              {month !== null && monthCounts[month] > 0 && (
                <button type="button" className="mediaClear text-14 mb-3" onClick={() => update({ month: null })}>
                  Showing {MONTHS[month]} only. Show all of {year}
                </button>
              )}
              {groups.length === 0 ? (
                <p className="h3 color-gray7">
                  Nothing {typeLabel ? `under ${typeLabel} ` : ''}in {year}.
                </p>
              ) : (
                groups.map((group) => (
                  <section key={group.month} className="mediaTimeline__group">
                    <h3 className="eyebrow-sm color-gray7 mediaTimeline__month">
                      {new Date(year, group.month, 1).toLocaleString('en-GB', { month: 'long' })} {year}
                    </h3>
                    <ul>
                      {group.items.map((item) => (
                        <TimelineRow key={item.id} item={item} onView={openViewer} today={today} />
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <MediaViewer ref={viewerRef} formatDate={formatDate} />
    </section>
  )
}
