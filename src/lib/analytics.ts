'use client'

import { sessionId } from './session'
import type { AnalyticsEvent, AnalyticsParams } from './analytics-events'

/**
 * Meten wat mensen hier doen, zonder derde partij en zonder cookies.
 *
 * De site heeft één scherm en één handeling, dus "hoeveel bezoekers" zegt bijna
 * niets. Wat iets zegt is de trechter eromheen: hoeveel mensen beginnen te
 * typen, hoeveel drukken door, hoeveel worden geweigerd, en hoeveel zien hun
 * eigen zin sneuvelen terwijl ze kijken. Dat laatste is het moment waarop
 * iemand deelt, dus dat is het getal dat groei verklaart.
 *
 * De events gaan naar onze eigen database, via /api/event. Dat is gratis, er
 * komt geen cookie aan te pas, en de belofte in SPEC.md blijft staan.
 *
 * De namen staan in lib/analytics-events, apart van dit bestand, omdat de route
 * handler ze ook nodig heeft en een clientmodule daar niet te importeren is.
 */

export type { AnalyticsEvent, AnalyticsParams } from './analytics-events'

/**
 * Alleen in productie.
 *
 * Zonder deze grens komt elke `npm run dev` in dezelfde tabel terecht, en dan
 * meet je vooral jezelf: ontwikkelen betekent honderd keer herladen, formulier
 * invullen en versturen. Op een site die nog geen duizend echte bezoekers per
 * dag heeft, verdrinkt het signaal daar volledig in.
 */
export const analyticsEnabled = process.env.NODE_ENV === 'production'

type Uitgaand = { name: string; path: string; props: Record<string, string | number | boolean> }

/** Maximaal per verzoek; hetzelfde getal staat als `limit` in de RPC. */
const BUNDEL = 20

/**
 * Twee seconden wachten voordat we versturen.
 *
 * Wie een zin plaatst maakt binnen een paar tellen drie events (`write_submit`,
 * `sentence_posted`, soms meteen `share_click`). Drie losse verzoeken daarvoor
 * is zonde op een gratis plan met zestig databaseverbindingen, en niemand kijkt
 * ondertussen naar de cijfers.
 */
const WACHT_MS = 2000

const wachtrij: Uitgaand[] = []
let timer: ReturnType<typeof setTimeout> | undefined

/* -------------------------------------------------------------------- */
/* Het bezoek als geheel                                                 */
/* -------------------------------------------------------------------- */

const begonnen = Date.now()
let paginas = 0
let heeftGeschreven = false
let afgesloten = false

/**
 * Waar komt deze bezoeker vandaan?
 *
 * Alleen de hostnaam, nooit de hele verwijzende URL. Die bevat op zoeksites de
 * zoekterm en op sociale platformen soms een gebruikersnaam, en dat hoeft hier
 * niet te liggen om te weten dat er verkeer van Bluesky komt.
 */
function herkomst(): string {
  try {
    const verwijzer = document.referrer
    if (!verwijzer) return 'direct'
    const host = new URL(verwijzer).hostname.replace(/^www\./, '')
    return host === window.location.hostname ? 'internal' : host.slice(0, 60)
  } catch {
    return 'direct'
  }
}

/**
 * Grof apparaat, uit de breedte van het venster.
 *
 * Bewust niet uit de user agent. Die is een lange, unieke tekenreeks waarmee je
 * bezoekers kunt herkennen, en dat is precies wat deze meting niet wil kunnen.
 * Een venster is drie hokjes breed en verder niets.
 */
function apparaat(): 'phone' | 'tablet' | 'desktop' {
  const breedte = window.innerWidth
  if (breedte < 640) return 'phone'
  if (breedte < 1024) return 'tablet'
  return 'desktop'
}

/** De pagina's die echt bestaan. Zie `find src/app -name page.tsx`. */
const ECHTE_PADEN = new Set([
  '/',
  '/about',
  '/archive',
  '/design',
  '/press',
  '/records',
  '/stats',
  '/what-people-do',
])

/**
 * Alles wat geen bestaande pagina is wordt `/404`.
 *
 * De 404-pagina zit onder dezelfde layout, dus zonder deze filter telt elke bot
 * die /wp-admin of /ai-summarizer probeert mee in "drukste pagina's". Dat
 * gebeurde meteen op de eerste dag. Erger: het pad komt rechtstreeks uit de
 * adresbalk, dus iedereen kon er zelf regels mee in het rapport zetten.
 *
 * Eén `/404`-emmer in plaats van weggooien, want hoeveel er misgetast wordt is
 * zelf ook een getal dat iets zegt.
 *
 * Dit hoort hier en niet in de VisitTracker: het pad dat in de database belandt
 * komt uit `track()` hieronder, niet uit wat de aanroeper meegeeft. Filteren op
 * de plek van de aanroep raakt alleen een eigenschap en laat de kolom ongemoeid.
 */
function bekendPad(pad: string): string {
  if (ECHTE_PADEN.has(pad)) return pad
  // De permalink houdt zijn nummer: welke zin wordt bekeken is het punt.
  if (/^\/thoughts\/\d{1,12}$/.test(pad)) return pad
  if (/^\/design\/[a-z0-9-]{1,40}$/.test(pad)) return pad
  return '/404'
}

/** Elke geopende pagina, ook na navigatie binnen de site. */
export function trackPageOpen(): void {
  paginas += 1
  track('page_open', {
    // De herkomst hoort bij het bezoek en niet bij de pagina: bij de tweede
    // pagina is de verwijzer de site zelf, en dan zou "internal" het echte
    // kanaal overschreeuwen in het rapport.
    referrer: paginas === 1 ? herkomst() : undefined,
    device: apparaat(),
    page: paginas,
  })
}

/**
 * Het einde van het bezoek, één keer.
 *
 * Het eerste van `pagehide` of "tabblad naar de achtergrond" telt. Op mobiel
 * vuurt `pagehide` niet altijd, en wie terugkomt na tien minuten in een andere
 * app was er ondertussen niet. Liever een duur die aan de korte kant klopt dan
 * een die alleen op desktop bestaat.
 */
function bezoekAfsluiten(): void {
  if (afgesloten) return
  afgesloten = true
  track('visit_end', {
    seconds: Math.min(Math.round((Date.now() - begonnen) / 1000), 7200),
    pages: paginas,
    wrote: heeftGeschreven,
  })
}

function versturen(): void {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
  if (wachtrij.length === 0) return

  const bundel = wachtrij.splice(0, BUNDEL)
  const lading = JSON.stringify({ session: sessionId(), events: bundel })

  // sendBeacon is de enige manier die overleeft als het tabblad sluit: een
  // gewone fetch wordt op dat moment afgebroken, en juist het laatste event
  // (iemand verliest zijn zin en klikt weg) is het interessantste.
  try {
    if (navigator.sendBeacon?.('/api/event', new Blob([lading], { type: 'application/json' }))) {
      return
    }
  } catch {
    /* valt hieronder terug op fetch */
  }

  void fetch('/api/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: lading,
    keepalive: true,
  }).catch(() => {
    /* Meten mag nooit een reden zijn dat er iets stukgaat. */
  })
}

/**
 * Eén event in de wachtrij zetten.
 *
 * Doet niets op de server en niets in ontwikkeling. Gooit nooit: een meting die
 * mislukt hoort de pagina niet mee te nemen.
 */
export function track(name: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (!analyticsEnabled || typeof window === 'undefined') return

  // `null` en `undefined` worden in een rapport de tekst "null". Weglaten is
  // beter: een lege kolom is af te lezen, een kolom vol "null" niet.
  const props: Record<string, string | number | boolean> = {}
  for (const [sleutel, waarde] of Object.entries(params)) {
    if (waarde === null || waarde === undefined) continue
    props[sleutel] = typeof waarde === 'string' ? waarde.slice(0, 100) : waarde
  }

  // Wie tijdens dit bezoek iets op de voorpagina kreeg, telt als schrijver.
  // Dat is de noemer onder "hoeveel procent schrijft er iets".
  if (name === 'sentence_posted' || name === 'sentence_promoted') heeftGeschreven = true

  wachtrij.push({ name, path: bekendPad(window.location.pathname), props })

  if (wachtrij.length >= BUNDEL) {
    versturen()
    return
  }
  timer ??= setTimeout(versturen, WACHT_MS)
}

if (typeof window !== 'undefined' && analyticsEnabled) {
  // `pagehide` en niet `beforeunload`: die laatste vuurt op mobiel Safari niet
  // betrouwbaar, en dat is precies waar de meeste bezoekers vandaan komen.
  // Eerst het slotevent in de wachtrij, dan pas legen, anders vertrekt de
  // bundel zonder de duur van het bezoek erin.
  window.addEventListener('pagehide', () => {
    bezoekAfsluiten()
    versturen()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return
    bezoekAfsluiten()
    versturen()
  })
}
