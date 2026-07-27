import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase'
import { formatDuration, formatNumber } from '@/lib/format'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Wat valt er vandaag te melden?
 *
 * Dit is de voeding voor een agent die één keer per dag één bericht plaatst.
 * Twee dingen zijn hier bewust anders dan je zou verwachten.
 *
 * Ten eerste bepaalt de database wat er te melden valt, niet het model. Een
 * model dat zelf mag kiezen wat interessant is, verzint op een stille dag iets.
 * Op een site die volledig draait om echte zinnen van echte mensen is dat de
 * ene fout die je nooit meer terugdraait, dus `worth_posting: false` is een
 * geldig antwoord en betekent letterlijk: vandaag niets posten.
 *
 * Ten tweede staat de posttekst er al in, kant en klaar per platform. Niet om
 * het model werk te besparen maar om te voorkomen dat het gaat schrijven: alles
 * wat eruit komt is samengesteld uit velden die uit de database komen, dus er
 * kan geen cijfer of citaat in staan dat er niet is.
 */
export async function GET(request: Request) {
  const sleutel = process.env.AGENT_KEY
  if (!sleutel) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const opgegeven =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    new URL(request.url).searchParams.get('key')

  if (opgegeven !== sleutel) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_digest')
  if (error || !data) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  const d = data as {
    worth_posting: boolean
    record_broken: boolean
    ended_today: number
    candidate: {
      id: number
      body: string
      author: string | null
      duration_ms: number
      rank: number
      reads: number
      permalink: string
      image: string
    } | null
    standing_now: { id: number; body: string; seconds: number; reads: number } | null
    totals: { sentences: number; writers: number; reads: number }
  }

  const c = d.candidate
  const posts =
    c && d.worth_posting
      ? {
          bluesky: samenstellen(c, d.record_broken),
          mastodon: samenstellen(c, d.record_broken),
          // Zonder link, voor plekken waar een link het bereik kost. Een
          // vermelding in lopende tekst weegt volgens het onderzoek sowieso
          // zwaarder dan een link.
          plain: samenstellen(c, d.record_broken, false),
        }
      : null

  return NextResponse.json(
    {
      ...d,
      // Expliciet, zodat een agent hier op kan sturen zonder te interpreteren.
      action: d.worth_posting ? 'post' : 'hold',
      reason: d.worth_posting
        ? d.record_broken
          ? 'a record was broken in the last 24 hours'
          : 'a sentence worth showing came off the front page'
        : 'nothing stood long enough or was read enough to be worth a post today',
      posts,
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}

function samenstellen(
  c: {
    body: string
    author: string | null
    duration_ms: number
    rank: number
    reads: number
    permalink: string
  },
  record: boolean,
  metLink = true,
): string {
  const wie = c.author ? `by @${c.author}` : 'by nobody in particular'
  const kop = record ? 'A new record on only-text.com.' : 'This one just came off the front page.'

  const regels = [
    kop,
    '',
    `"${c.body}"`,
    '',
    `Held it for ${formatDuration(c.duration_ms)} ${wie}. Rank #${c.rank} of all time, read by ${formatNumber(c.reads)}.`,
  ]

  if (metLink) regels.push('', c.permalink)
  return regels.join('\n')
}
