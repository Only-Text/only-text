import { NextResponse } from 'next/server'

import { inbox } from '@/lib/bluesky'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Wat mensen naar ons gestuurd hebben: vermeldingen, antwoorden, citaten en
 * privéberichten.
 *
 * Bewust alleen lezen. Er zit hier geen route om te antwoorden, en dat is een
 * keuze en geen tekortkoming: een agent die zelfstandig vreemden antwoordt op
 * een publiek account praat in jouw naam tegen mensen die dat niet weten, en
 * één ongelukkig antwoord is precies wat er gescreenshot wordt. Voor het
 * dagelijkse bericht is dat risico er niet, want dat is samengesteld uit
 * databasevelden en kan niets zeggen wat er niet staat.
 *
 * Laat een agent dit dus lezen, samenvatten en signaleren wat aandacht nodig
 * heeft. Het antwoord zelf tikt een mens.
 */
export async function GET(request: Request) {
  const sleutel = process.env.AGENT_KEY
  if (!sleutel) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const opgegeven =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    new URL(request.url).searchParams.get('key')

  if (opgegeven !== sleutel) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const berichten = await inbox(40)
    const onbeantwoord = berichten.filter((b) => !b.gelezen)

    return NextResponse.json(
      {
        generated_at: new Date().toISOString(),
        total: berichten.length,
        unread: onbeantwoord.length,
        needs_a_human: onbeantwoord.length > 0,
        messages: berichten,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown' },
      { status: 502 },
    )
  }
}
