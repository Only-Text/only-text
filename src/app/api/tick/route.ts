import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Haalt de wachtrij in: als het lopende bericht zijn gegarandeerde tijd heeft
 * uitgezeten en er staat iemand te wachten, komt die nu op de voorpagina.
 *
 * De functie is idempotent en neemt dezelfde advisory lock als het plaatsen,
 * dus twee gelijktijdige aanroepen kunnen niet allebei promoveren.
 */
async function tick() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('tick')

  if (error) {
    console.error('tick faalde', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json(data, { headers: { 'cache-control': 'no-store' } })
}

/**
 * De browser roept dit aan op het moment dat de minimumduur afloopt, met een
 * beetje spreiding zodat niet elk tabblad tegelijk aanklopt.
 */
export async function POST() {
  return tick()
}

/**
 * En de cron uit `vercel.json` roept hetzelfde aan, elke minuut, zodat de rij
 * ook doorloopt als er even niemand kijkt.
 *
 * Dat die aanroep hier langskomt en niet in de database gebeurt is geen keuze
 * maar een gegeven: `pg_cron` is op dit plan niet beschikbaar, dus de taak die
 * migratie 0002 probeert in te plannen bestaat niet. Zonder deze route zou de
 * rij stilstaan zodra het laatste tabblad dichtgaat, en dat is precies het
 * moment waarop niemand het merkt.
 *
 * Cron stuurt een GET, dus dit moet een GET zijn. De sleutel houdt de route
 * dicht voor de rest: promoveren is idempotent en dus niet gevaarlijk, maar
 * het schrijft wel, en een schrijfroute die iedereen in een lus kan zetten is
 * er een te veel.
 */
export async function GET(request: Request) {
  const geheim = process.env.CRON_SECRET
  if (geheim) {
    const meegestuurd = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (meegestuurd !== geheim) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  return tick()
}
