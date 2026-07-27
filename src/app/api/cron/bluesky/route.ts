import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase'
import { formatDuration, formatNumber } from '@/lib/format'
import { post } from '@/lib/bluesky'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Eén bericht per dag, en alleen als er iets te melden valt.
 *
 * Vercel roept dit aan volgens het schema in vercel.json. De databank bepaalt
 * of er gepost wordt, niet dit bestand en al helemaal geen model: staat
 * `worth_posting` op false, dan gebeurt er niets en dat is de bedoeling. Een
 * account dat elke dag iets plaatst omdat het nu eenmaal elke dag draait, is
 * binnen een week een spamaccount.
 */
export async function GET(request: Request) {
  // Vercel stuurt bij een cron-aanroep zelf een Authorization-header mee met
  // CRON_SECRET. Handmatig aanroepen kan met dezelfde sleutel.
  const geheim = process.env.CRON_SECRET
  if (geheim) {
    const meegestuurd = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (meegestuurd !== geheim) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_digest')
  if (error || !data) {
    return NextResponse.json({ error: 'digest_unavailable' }, { status: 503 })
  }

  const d = data as {
    worth_posting: boolean
    record_broken: boolean
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
  }

  if (!d.worth_posting || !d.candidate) {
    return NextResponse.json({ posted: false, reason: 'nothing worth posting today' })
  }

  const c = d.candidate
  const wie = c.author ? `by @${c.author}` : 'by nobody in particular'
  const kop = d.record_broken
    ? 'A new record on only-text.com.'
    : 'This one just came off the front page.'

  // De tekst wordt samengesteld uit databasevelden, niet geschreven. Er kan dus
  // geen cijfer of citaat in staan dat er niet is.
  const tekst = [
    kop,
    '',
    `"${c.body}"`,
    '',
    `Held it for ${formatDuration(c.duration_ms)} ${wie}. Rank #${c.rank} of all time, read by ${formatNumber(c.reads)}.`,
  ].join('\n')

  try {
    const geplaatst = await post({
      text: tekst,
      url: c.permalink,
      title: c.body.length > 90 ? `${c.body.slice(0, 88)}…` : c.body,
      description: `Stood for ${formatDuration(c.duration_ms)} on only-text.com. Rank #${c.rank} of all time.`,
      imageUrl: c.image,
    })

    return NextResponse.json({ posted: true, uri: geplaatst.uri, message_id: c.id })
  } catch (e) {
    console.error('bluesky-post faalde', e)
    return NextResponse.json(
      { posted: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 502 },
    )
  }
}
