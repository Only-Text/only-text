import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Haalt de wachtrij in: als het lopende bericht zijn gegarandeerde tijd heeft
 * uitgezeten en er staat iemand te wachten, komt die nu op de voorpagina.
 *
 * De browser roept dit aan op het moment dat de minimumduur afloopt, met een
 * beetje spreiding zodat niet elk tabblad tegelijk aanklopt. In de database
 * staat daarnaast een cron-taak die hetzelfde elke tien seconden doet, zodat
 * de rij ook doorloopt als er even niemand kijkt.
 *
 * De functie is idempotent en neemt dezelfde advisory lock als het plaatsen,
 * dus twee gelijktijdige aanroepen kunnen niet allebei promoveren.
 */
export async function POST() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('tick')

  if (error) {
    console.error('tick faalde', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json(data, { headers: { 'cache-control': 'no-store' } })
}
