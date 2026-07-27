import { NextResponse } from 'next/server'
import { z } from 'zod'

import { clientIpFrom, hashClient } from '@/lib/client-hash'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Payload = z.object({
  id: z.number().int().positive(),
  reason: z.string().max(200).optional(),
})

/**
 * Melden.
 *
 * Loopt bewust via de server en niet rechtstreeks vanuit de browser: anders kan
 * iemand een willekeurige melder-hash meesturen en in zijn eentje elk bericht
 * van de voorpagina halen. Nu telt één persoon één keer.
 *
 * Bij drie meldingen gaat het bericht er meteen af, vóórdat iemand ernaar kijkt.
 * Bij dit product ís de tekst de hele website plus de linkvoorbeelden die
 * dagenlang gecached blijven; dan is te snel weghalen minder erg dan te laat.
 */
export async function POST(request: Request) {
  let payload: z.infer<typeof Payload>
  try {
    payload = Payload.parse(await request.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  let reporterHash: string
  try {
    reporterHash = hashClient(clientIpFrom(request.headers), 'report')
  } catch {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('report_message', {
    p_message_id: payload.id,
    p_reporter_hash: reporterHash,
    p_reason: payload.reason ?? null,
  })

  if (error) {
    console.error('report_message faalde', error)
    return NextResponse.json({ ok: false, error: 'database' }, { status: 500 })
  }

  // Bewust geen tellerstand terug: dan kan iemand niet aftasten hoeveel
  // meldingen er nog nodig zijn om iets weg te krijgen.
  return NextResponse.json({ ok: (data as { ok?: boolean })?.ok ?? true })
}
