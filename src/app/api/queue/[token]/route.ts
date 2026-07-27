import { NextResponse } from 'next/server'

import { createPublicClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Je plek in de rij. Het token is willekeurig en alleen bekend bij wie de
 * inzending deed, dus niemand kan de rij van een ander uitlezen.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  if (!UUID.test(token)) {
    return NextResponse.json({ found: false }, { status: 400 })
  }

  const supabase = createPublicClient()
  const { data, error } = await supabase.rpc('get_queue_status', { p_claim_token: token })

  if (error) {
    return NextResponse.json({ found: false }, { status: 500 })
  }

  return NextResponse.json(data, { headers: { 'cache-control': 'no-store' } })
}
