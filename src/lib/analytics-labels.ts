import { ANALYTICS_EVENTS, type AnalyticsEvent } from './analytics-events'

/**
 * De codes uit de databank omgezet naar iets wat je kunt lezen.
 *
 * De namen die we opslaan zijn goede namen: kort, machineleesbaar en stabiel.
 * Precies daarom deugen ze niet op een pagina. "takeover_watched: 6" vraagt de
 * lezer om te bedenken wat dat betekende; "Watched someone else take over: 6"
 * niet. Op een site die verder helemaal uit lopende tekst bestaat is dat geen
 * detail.
 *
 * De vertaling gebeurt hier en niet in de databank, zodat de opgeslagen naam
 * kan blijven wat hij is terwijl de formulering mag veranderen. Wat we opslaan
 * is een feit; hoe we het opschrijven een keuze.
 *
 * Alles is in de derde persoon en in de verleden tijd, want dat is wat het is:
 * dingen die iemand heeft gedaan.
 */

const GEBEURTENISSEN: Record<AnalyticsEvent, string> = {
  page_open: 'Opened a page',
  visit_end: 'Closed the tab',
  board_view: 'Looked at the front page',
  takeover_watched: 'Watched someone else take over',
  sentence_lost: 'Watched their own sentence go',
  write_start: 'Started typing',
  write_submit: 'Pressed send',
  sentence_posted: 'Went straight to the front page',
  sentence_queued: 'Joined the queue',
  sentence_promoted: 'Came off the queue and went live',
  post_refused: 'Was turned down',
  write_again: 'Wrote another one',
  share_click: 'Clicked a share link',
  report_open: 'Opened the report box',
  report_sent: 'Reported a sentence',
  sentence_view: 'Opened a permanent link',
  archive_search: 'Searched the archive',
}

const KANALEN: Record<string, string> = {
  bluesky: 'Posted it on Bluesky',
  mastodon: 'Posted it on Mastodon',
  copy_text: 'Copied the words',
  copy_link: 'Copied the link',
}

const PLEKKEN: Record<string, string> = {
  after_post: 'right after writing',
  permalink: 'from a permanent link',
}

const WEIGERINGEN: Record<string, string> = {
  blocked_word: 'The filter caught a word',
  too_fast: 'Wrote again too soon',
  bad_request: 'Empty, or longer than the line allows',
  database: 'Something broke on our side',
  server_misconfigured: 'Something broke on our side',
  network: 'Their connection dropped',
  unknown: 'No reason came back',
}

/** Laatste redmiddel: van `some_code` iets als `Some code` maken. */
function netjes(code: string): string {
  const woorden = code.replace(/[_-]+/g, ' ').trim()
  return woorden.charAt(0).toUpperCase() + woorden.slice(1)
}

export function gebeurtenisLabel(naam: string): string {
  return (
    GEBEURTENISSEN[naam as AnalyticsEvent] ??
    (ANALYTICS_EVENTS.includes(naam as AnalyticsEvent) ? netjes(naam) : netjes(naam))
  )
}

export function deelLabel(kanaal: string, plek: string | null): string {
  const wat = KANALEN[kanaal] ?? netjes(kanaal)
  const waar = plek ? PLEKKEN[plek] : null
  return waar ? `${wat}, ${waar}` : wat
}

export function weigeringLabel(reden: string | null): string {
  return WEIGERINGEN[reden ?? 'unknown'] ?? netjes(reden ?? 'unknown')
}
