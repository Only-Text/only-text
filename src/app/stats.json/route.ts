import { NextResponse } from 'next/server'

import { getStats } from '@/lib/stats'

export const runtime = 'nodejs'
export const revalidate = 60

/**
 * De cijfers als JSON, zodat iemand die erover schrijft ze zelf kan
 * controleren zonder ons te hoeven mailen. Bewust zonder sleutel en zonder
 * limiet: het zijn geaggregeerde getallen en het hele punt is dat ze
 * naslaanbaar zijn.
 */
export async function GET() {
  const stats = await getStats()
  if (!stats) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
  return NextResponse.json(stats, {
    headers: {
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
      'access-control-allow-origin': '*',
    },
  })
}
