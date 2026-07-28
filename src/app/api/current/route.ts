import { NextResponse } from 'next/server'

import { getBoard } from '@/lib/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Wat er nu op de voorpagina staat.
 *
 * De browser roept dit aan om het gat te dichten tussen de server-render en het
 * moment dat de WebSocket luistert, na terugkeer uit een slapend tabblad, en
 * als de WebSocket het helemaal niet doet: dan is dit de terugval en wordt er
 * gepollt.
 *
 * Die laatste taak is de reden dat hier een cache op zit waar eerst `no-store`
 * stond. Ongecachet is elke aanroep een query, en dan schaalt dit lineair mee
 * met het aantal bezoekers: precies verkeerd om, want de terugval moet het juist
 * uithouden op het moment dat het druk is. Eén seconde is dezelfde versheid als
 * de voorpagina zelf aanhoudt, en daarmee bedient het CDN duizend tabbladen met
 * één query per seconde.
 *
 * `stale-while-revalidate` staat er ruim op: liever een seconde oude tekst dan
 * een lege terwijl de databank het even zwaar heeft.
 */
export async function GET() {
  const board = await getBoard()
  return NextResponse.json(board, {
    headers: {
      'cache-control': 'public, s-maxage=1, stale-while-revalidate=59',
      // De insluitbare zin draait op de site van iemand anders en haalt dit op
      // vanaf een ander domein. Zonder deze regel blokkeert de browser dat en
      // werkt de widget nergens. Het antwoord is toch al openbaar: het staat
      // ook gewoon op de voorpagina.
      'access-control-allow-origin': '*',
    },
  })
}
