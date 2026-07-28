/**
 * De namen van alles wat we meten, en verder niets.
 *
 * Dit bestand staat los van lib/analytics omdat het aan beide kanten van de
 * streep nodig is: de browser gebruikt het om te typen, de route handler om te
 * weigeren. lib/analytics is een clientmodule ('use client'), en zo'n module
 * importeren vanuit een route handler levert geen array op maar een verwijzing
 * naar een clientcomponent. Dat faalt niet met een foutmelding maar stilletjes,
 * en dan staat er een endpoint te draaien dat alles wegtikt.
 *
 * Wie een event toevoegt: hier erbij, en dan pas de aanroep. De volgorde is
 * geen formaliteit; andersom komt het event er nooit in.
 */
export const ANALYTICS_EVENTS = [
  /* Elk bezoek, op elke pagina */
  'page_open', // Een pagina geopend. Draagt herkomst en apparaat.
  'visit_end', // Het tabblad ging weg. Draagt de duur van het bezoek.
  /* Voorpagina */
  'board_view', // Voorpagina geladen, met de standen van dat moment.
  'takeover_watched', // Iemand anders nam over terwijl deze bezoeker keek.
  'sentence_lost', // Datzelfde moment, maar het was zijn eigen zin.
  /* De trechter van het schrijven */
  'write_start', // Eerste aanslag in het veld.
  'write_submit', // Op versturen gedrukt.
  'sentence_posted', // Meteen live.
  'sentence_queued', // In de wachtrij gezet.
  'sentence_promoted', // Vanuit de wachtrij alsnog live.
  'post_refused', // Server zei nee (filter, snelheidslimiet, te lang).
  'write_again', // Na afloop nog een keer.
  /* Wat er daarna mee gebeurt */
  'share_click', // Deelknop of deellink aangeklikt.
  'report_open', // Meldknop aangeklikt.
  'report_sent', // Melding daadwerkelijk verstuurd.
  /* Rondkijken */
  'sentence_view', // Permalink bekeken.
  'archive_search', // In het archief gezocht.
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>
