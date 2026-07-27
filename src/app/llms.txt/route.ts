import { getBoard } from '@/lib/data'

export const runtime = 'nodejs'
export const revalidate = 60

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

/**
 * Voor de helft van het verkeer dat geen mens is.
 *
 * Sinds juni 2026 is meer dan de helft van alle webverzoeken niet-menselijk.
 * Op een site die letterlijk alleen tekst is, is het onbeleefd om die helft
 * door HTML te laten spitten voor één zin.
 */
export async function GET() {
  const board = await getBoard()

  const text = `# only-text.com

> One sentence sits at the top of this website. It belongs to whoever typed
> last. Anyone can replace it, and what counts is how long it survives.

## Right now

${board.message?.body ?? '(nothing)'}

Standing since: ${board.message?.created_at ?? 'unknown'}
People waiting to replace it: ${board.queue_length}
Sentences ever written: ${board.stats?.total_messages ?? 0}

## Endpoints

- ${SITE}/raw: the current sentence, nothing else, as text/plain
- ${SITE}/api/current: the current sentence as JSON, plus counts
- ${SITE}/feed.xml: the last fifty sentences as RSS
- ${SITE}/m/<id>: one sentence, permanent, with how long it lasted
- ${SITE}/archive: every sentence ever written
- ${SITE}/records: longest and shortest reigns
- ${SITE}/stats.json: public figures, no key needed
- ${SITE}/press: description, numbers and permission to reproduce anything here

## Rules for writing

Posting is a POST to /api/post and is rate limited to one sentence per minute
per address, twenty per hour. Every sentence is guaranteed a minimum time on
the front page, so a queue forms when it is busy. Automated posting to the
front page is not welcome; reading is.
`

  return new Response(text, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=60, stale-while-revalidate=600',
    },
  })
}
