/**
 * Meten wat mensen hier doen.
 *
 * De site heeft één scherm en één handeling, dus "hoeveel bezoekers" zegt bijna
 * niets. Wat iets zegt is de trechter eromheen: hoeveel mensen beginnen te
 * typen, hoeveel drukken door, hoeveel worden geweigerd, en hoeveel zien hun
 * eigen zin sneuvelen terwijl ze kijken. Dat laatste is het moment waarop
 * iemand deelt, dus dat is het getal dat groei verklaart.
 *
 * Alle namen staan hieronder in één unie. Dat is geen bureaucratie: GA4 maakt
 * van elke typefout een nieuw event dat nooit meer weggaat, en een rapport met
 * `share_click` naast `shareClick` is stiller kapot dan een foutmelding.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-ZQB4HB9DJJ'

/**
 * Alleen in productie.
 *
 * Zonder deze grens komt elke `npm run dev` in dezelfde property terecht, en dan
 * meet je vooral jezelf: ontwikkelen betekent honderd keer herladen, formulier
 * invullen en versturen. Op een site die nog geen duizend echte bezoekers per
 * dag heeft, verdrinkt het signaal daar volledig in.
 */
export const analyticsEnabled = GA_ID !== '' && process.env.NODE_ENV === 'production'

/** Elke naam die de site mag versturen. Nieuw event? Eerst hier erbij. */
export type AnalyticsEvent =
  /* Voorpagina */
  | 'board_view' // Voorpagina geladen, met de standen van dat moment.
  | 'takeover_watched' // Iemand anders nam over terwijl deze bezoeker keek.
  | 'sentence_lost' // Datzelfde moment, maar het was zijn eigen zin.
  /* De trechter van het schrijven */
  | 'write_start' // Eerste aanslag in het veld.
  | 'write_submit' // Op versturen gedrukt.
  | 'sentence_posted' // Meteen live.
  | 'sentence_queued' // In de wachtrij gezet.
  | 'sentence_promoted' // Vanuit de wachtrij alsnog live.
  | 'post_refused' // Server zei nee (filter, snelheidslimiet, te lang).
  | 'write_again' // Na afloop nog een keer.
  /* Wat er daarna mee gebeurt */
  | 'share_click' // Deelknop of deellink aangeklikt.
  | 'report_open' // Meldknop aangeklikt.
  | 'report_sent' // Melding daadwerkelijk verstuurd.
  /* Rondkijken */
  | 'sentence_view' // Permalink bekeken.
  | 'archive_search' // In het archief gezocht.

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Eén event versturen. Doet niets als gtag er niet is.
 *
 * Dat laatste is de normale situatie, niet de uitzondering: op de server, in
 * ontwikkeling, en bij iedere bezoeker met een adblocker bestaat `window.gtag`
 * niet. Meten mag nooit een reden zijn dat er iets stukgaat, dus hier geen
 * `throw` en geen `await`.
 */
export function track(name: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  // GA4 maakt van `null` en `undefined` de tekst "null" in het rapport. Weglaten
  // is beter: een lege kolom is af te lezen, een kolom vol "null" niet.
  const schoon: Record<string, string | number | boolean> = {}
  for (const [sleutel, waarde] of Object.entries(params)) {
    if (waarde !== null && waarde !== undefined) schoon[sleutel] = waarde
  }

  window.gtag('event', name, schoon)
}
