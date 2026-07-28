import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase'
import { inbox, antwoordOp } from '@/lib/bluesky'
import { schrijfAntwoord } from '@/lib/write-reply'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Nooit meer dan dit per draai. De rem die niet van een model afhangt. */
const MAX_PER_DRAAI = 5

/** Ouder dan dit en het moment is voorbij; dan is stil zijn beter. */
const MAX_LEEFTIJD_UUR = 24

/**
 * Antwoorden op wat er binnenkomt.
 *
 * Waarom dit bestaat: op Bluesky telt antwoorden zwaarder dan zenden. Een
 * account dat reageert wordt vaker getoond dan een account dat elke dag zijn
 * eigen bericht plaatst en verder zwijgt, en dit account zweeg verder.
 *
 * De drie remmen, want een zelfstandig antwoordend account is het makkelijkste
 * dat er is om jezelf mee voor schut te zetten:
 *
 *   1. Elk bericht wordt eerst geclaimd in de databank. Lukt dat niet, dan is
 *      er al eens naar gekeken en gebeurt er niets. Dit staat vóór het
 *      antwoorden, zodat een fout halverwege een gemist antwoord oplevert en
 *      geen tweede.
 *   2. Hoogstens vijf per draai, hoeveel er ook binnenkomt. Gaat er iets mis in
 *      het oordeel, dan gaat het vijf keer mis en niet vijftig.
 *   3. Het model mag zwijgen en doet dat standaard. Alles wat naar ruzie riekt
 *      of alleen maar aardig is wordt overgeslagen.
 *
 * Privéberichten blijven met rust. Wie de moeite neemt om een DM te sturen
 * verwacht een mens, en die krijgt hij hier niet.
 */
export async function GET(request: Request) {
  const geheim = process.env.CRON_SECRET
  if (geheim) {
    const meegestuurd = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (meegestuurd !== geheim) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  if (process.env.BLUESKY_POSTING === 'off') {
    return NextResponse.json({ replied: 0, reason: 'posting is switched off' })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_digest')
  if (error || !data) {
    return NextResponse.json({ error: 'digest_unavailable' }, { status: 503 })
  }

  const d = data as {
    standing_now: { body: string } | null
    totals: { sentences: number; writers: number }
  }

  const feiten = {
    huidigeZin: d.standing_now?.body ?? '',
    zinnenTotaal: d.totals.sentences,
    schrijversTotaal: d.totals.writers,
  }
  if (!feiten.huidigeZin) {
    return NextResponse.json({ replied: 0, reason: 'no sentence on the page' })
  }

  let binnen
  try {
    binnen = await inbox(40)
  } catch (e) {
    console.error('inbox lezen faalde', e)
    return NextResponse.json({ error: 'inbox_unavailable' }, { status: 502 })
  }

  const grens = Date.now() - MAX_LEEFTIJD_UUR * 3600_000
  const kandidaten = binnen.filter(
    (b) =>
      b.soort !== 'dm' &&
      b.uri &&
      b.cid &&
      b.tekst.trim().length > 0 &&
      new Date(b.wanneer).getTime() > grens,
  )

  let geantwoord = 0
  let overgeslagen = 0

  for (const b of kandidaten) {
    if (geantwoord >= MAX_PER_DRAAI) break

    // Claimen gaat vóór alles. Vanaf hier kijkt geen enkele volgende draai er
    // nog naar, ook niet als het hieronder misgaat.
    const { data: nieuw, error: claimFout } = await supabase.rpc('bsky_claim', {
      p_uri: b.uri,
      p_action: 'seen',
    })
    if (claimFout) {
      console.error('bsky_claim faalde', claimFout)
      break
    }
    if (!nieuw) continue

    const tekst = await schrijfAntwoord(
      { van: b.van, tekst: b.tekst, soort: b.soort as 'mention' | 'reply' | 'quote' },
      feiten,
    )
    if (!tekst) {
      overgeslagen += 1
      continue
    }

    try {
      await antwoordOp({
        text: tekst,
        parent: { uri: b.uri!, cid: b.cid! },
        root: { uri: b.rootUri ?? b.uri!, cid: b.rootCid ?? b.cid! },
      })
      geantwoord += 1
    } catch (e) {
      console.error('antwoord plaatsen faalde', e)
    }
  }

  return NextResponse.json({
    replied: geantwoord,
    skipped: overgeslagen,
    considered: kandidaten.length,
  })
}
