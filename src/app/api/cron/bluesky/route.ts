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
    ended_today: number
    median_ms: number | null
    ranked_of: number
    candidates: {
      id: number
      body: string
      author: string | null
      duration_ms: number
      rank: number
      reads: number
      words: number
      is_record: boolean
      permalink: string
      image: string
    }[]
  }

  if (!d.worth_posting || d.candidates.length === 0) {
    return NextResponse.json({ posted: false, reason: 'nothing came off the page today' })
  }

  const dag = { endedToday: d.ended_today, medianMs: d.median_ms, rankedOf: d.ranked_of }

  // Het model kiest de zin én de invalshoek, de feiten liggen vast en worden
  // achteraf gecontroleerd. Klopt er iets niet, dan komt hier de vaste tekst uit.
  const { id, tekst, door } = await schrijfPost(
    d.candidates.map((c) => ({
      id: c.id,
      body: c.body,
      author: c.author,
      durationMs: c.duration_ms,
      rank: c.rank,
      reads: c.reads,
      words: c.words,
      isRecord: c.is_record,
    })),
    dag,
  )

  const c = d.candidates.find((k) => k.id === id)
  if (!c) {
    return NextResponse.json({ posted: false, error: 'chosen_id_unknown' }, { status: 500 })
  }

  try {
    const geplaatst = await post({
      text: tekst,
      url: c.permalink,
      title: c.body.length > 90 ? `${c.body.slice(0, 88)}…` : c.body,
      description: `Stood for ${formatDuration(c.duration_ms)} on only-text.com. Rank #${c.rank} of ${d.ranked_of}.`,
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
