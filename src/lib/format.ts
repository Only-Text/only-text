/**
 * Duur- en tijdweergave.
 *
 * De duur is de kern van het spel (hoe lang bleef jouw zin staan), dus die moet
 * op elke schaal kloppen: van een halve seconde tot een paar weken.
 *
 * De interface is Engels. Niet omdat Nederlands niet kan, maar omdat het domein
 * .com is en het publiek internationaal; en taal kiezen op basis van het IP is
 * een bekende valkuil (VPN's, reizigers, expats). De zinnen die bezoekers zelf
 * typen zijn sowieso in hun eigen taal, dus de site is vanzelf meertalig waar
 * het telt.
 */

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Compact, voor lijsten: `4m 12s`, `1h 03m`, `2d 5h`. */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—'
  if (ms < SECOND) return `${Math.max(ms, 0)}ms`
  if (ms < MINUTE) {
    const s = ms / SECOND
    return s < 10 ? `${s.toFixed(1)}s` : `${Math.floor(s)}s`
  }
  if (ms < HOUR) {
    const m = Math.floor(ms / MINUTE)
    const s = Math.floor((ms % MINUTE) / SECOND)
    return `${m}m ${String(s).padStart(2, '0')}s`
  }
  if (ms < DAY) {
    const h = Math.floor(ms / HOUR)
    const m = Math.floor((ms % HOUR) / MINUTE)
    return `${h}h ${String(m).padStart(2, '0')}m`
  }
  const d = Math.floor(ms / DAY)
  const h = Math.floor((ms % DAY) / HOUR)
  return `${d}d ${h}h`
}

/** Voluit, voor de regel onder het levende bericht. */
export function formatDurationLong(ms: number | null | undefined): string {
  if (ms == null) return 'an unknown time'
  if (ms < SECOND) return `${Math.max(ms, 0)} milliseconds`

  const parts: string[] = []
  let rest = ms

  const d = Math.floor(rest / DAY)
  rest -= d * DAY
  const h = Math.floor(rest / HOUR)
  rest -= h * HOUR
  const m = Math.floor(rest / MINUTE)
  rest -= m * MINUTE
  const s = Math.floor(rest / SECOND)

  if (d) parts.push(d === 1 ? '1 day' : `${d} days`)
  if (h) parts.push(h === 1 ? '1 hour' : `${h} hours`)
  if (m) parts.push(m === 1 ? '1 minute' : `${m} minutes`)
  if (s || parts.length === 0) parts.push(s === 1 ? '1 second' : `${s} seconds`)

  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' })

export function countryName(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null
  try {
    return COUNTRY_NAMES.of(code.toUpperCase()) ?? null
  } catch {
    return null
  }
}

/** `27 July 2026, 14:03` */
export function formatMoment(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
