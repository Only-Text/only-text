import { NextResponse } from 'next/server'

import { getBoard } from '@/lib/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * De waarheid, ongecachet. De pagina zelf wordt een seconde gecachet; deze
 * route is wat de browser aanroept om het gat tussen de server-render en het
 * moment dat de WebSocket luistert te dichten, en na terugkeer uit een
 * slapend tabblad.
 */
export async function GET() {
  const board = await getBoard()
  return NextResponse.json(board, {
    headers: { 'cache-control': 'no-store' },
  })
}
