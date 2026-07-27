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

  wachtrij.push({ name, path: window.location.pathname, props })

  if (wachtrij.length >= BUNDEL) {
    versturen()
    return
  }
  timer ??= setTimeout(versturen, WACHT_MS)
}

if (typeof window !== 'undefined' && analyticsEnabled) {
  // `pagehide` en niet `beforeunload`: die laatste vuurt op mobiel Safari niet
  // betrouwbaar, en dat is precies waar de meeste bezoekers vandaan komen.
  window.addEventListener('pagehide', versturen)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') versturen()
  })
}
