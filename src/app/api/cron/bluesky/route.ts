import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase'
import { formatDuration } from '@/lib/format'
import { post } from '@/lib/bluesky'
import { schrijfPost, naschriftVoor } from '@/lib/write-post'

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

  // Harde schakelaar, los van de drempel in de databank. Die drempel doet het
  // werk, maar tijdens het testen wil je een knop die niet van data afhangt.
  if (process.env.BLUESKY_POSTING === 'off') {
    return NextResponse.json({ posted: false, reason: 'posting is switched off' })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_digest')
  if (error || !data) {
    return NextResponse.json({ error: 'digest_unavailable' }, { status: 503 })
  }

  const d = data as {
    worth_posting: boolean
    record_broken: boolean
    ended_today: number
    median_others_ms: number | null
    candidate: {
      id: number
      body: string
      author: string | null
      duration_ms: number
      rank: number
      ranked_of: number
      reads: number
      permalink: string
      image: string
    } | null
  }

  if (!d.worth_posting || !d.candidate) {
    return NextResponse.json({ posted: false, reason: 'nothing worth posting today' })
  }

  const c = d.candidate

  // Het model kiest de invalshoek, de feiten liggen vast en worden achteraf
  // gecontroleerd. Klopt er iets niet, dan komt hier de vaste tekst uit.
  const { tekst, door } = await schrijfPost({
    body: c.body,
    author: c.author,
    durationMs: c.duration_ms,
    rank: c.rank,
    rankedOf: c.ranked_of,
    reads: c.reads,
    recordBroken: d.record_broken,
    endedToday: d.ended_today,
    medianOthersMs: d.median_others_ms,
  })

  try {
    const geplaatst = await post({
      text: tekst,
      url: c.permalink,
      title: c.body.length > 90 ? `${c.body.slice(0, 88)}…` : c.body,
      description: `Stood for ${formatDuration(c.duration_ms)} on only-text.com. Rank #${c.rank} of all time.`,
      imageUrl: c.image,
      naschrift: naschriftVoor(c.id),
    })

    return NextResponse.json({ posted: true, uri: geplaatst.uri, message_id: c.id, written_by: door })
  } catch (e) {
    console.error('bluesky-post faalde', e)
    return NextResponse.json(
      { posted: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 502 },
    )
  }
}
