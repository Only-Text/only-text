import { NextResponse } from 'next/server'
import { z } from 'zod'

import { clientIpFrom, countryFrom, hashClient } from '@/lib/client-hash'
import { checkContent, dutchBlocklist, funnyRejection } from '@/lib/moderation'
import { MAX_AUTHOR_LENGTH, MAX_BODY_LENGTH, validateAuthor, validateBody } from '@/lib/sanitize'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PayloadSchema = z.object({
  body: z.string().max(MAX_BODY_LENGTH * 4),
  author: z.string().max(MAX_AUTHOR_LENGTH * 4).nullish(),
  /** Honeypot: onzichtbaar veld dat alleen een bot invult. */
  website: z.string().max(200).optional(),
  /** Tijdstip waarop het formulier werd getoond, in ms. */
  shownAt: z.number().int().positive().optional(),
})

/** Een mens doet er meer dan anderhalve seconde over om iets te typen en te versturen. */
const MIN_HUMAN_MS = 1500

const blocklist = dutchBlocklist()

export async function POST(request: Request) {
  let payload: z.infer<typeof PayloadSchema>
  try {
    payload = PayloadSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }

  // Bots vullen elk veld in dat ze tegenkomen, ook het veld dat voor mensen
  // onzichtbaar is. We doen alsof het gelukt is, zodat ze niet gaan zoeken.
  if (payload.website && payload.website.length > 0) {
    return NextResponse.json({ ok: true, message: null, silent: true })
  }

  if (payload.shownAt && Date.now() - payload.shownAt < MIN_HUMAN_MS) {
    return NextResponse.json(
      { ok: false, error: 'too_fast', hint: 'Slow down a little.' },
      { status: 429 },
    )
  }

  const validation = validateBody(payload.body, blocklist)
  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.reason,
        hint: funnyRejection(validation.reason, payload.body),
      },
      { status: 422 },
    )
  }

  const verdict = checkContent(validation.body)
  if (verdict.blocked) {
    return NextResponse.json(
      { ok: false, error: 'blocked_word', hint: funnyRejection('blocked_word', validation.body) },
      { status: 422 },
    )
  }

  const author = validateAuthor(payload.author, blocklist)

  const ip = clientIpFrom(request.headers)
  const country = countryFrom(request.headers)

  let clientHash: string
  try {
    clientHash = hashClient(ip)
  } catch {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('post_message', {
    p_body: validation.body,
    p_author: author,
    p_client_hash: clientHash,
    p_country: country,
  })

  if (error) {
    console.error('post_message faalde', error)
    return NextResponse.json({ ok: false, error: 'database' }, { status: 500 })
  }

  const result = data as {
    ok: boolean
    error?: string
    retry_after?: number
    message?: unknown
    previous?: unknown
  }

  if (!result.ok) {
    const status =
      result.error === 'cooldown' || result.error === 'hourly_limit' || result.error === 'blocked'
        ? 429
        : 422
    return NextResponse.json(
      { ...result, hint: hintFor(result.error, result.retry_after) },
      { status, headers: result.retry_after ? { 'Retry-After': String(result.retry_after) } : {} },
    )
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

function hintFor(error: string | undefined, retryAfter?: number): string {
  switch (error) {
    case 'cooldown':
      return `${retryAfter ?? 60} more seconds. Everyone gets the same room.`
    case 'hourly_limit':
      return 'You have said enough this hour. Let someone else have a go.'
    case 'blocked':
      return 'You are blocked for now.'
    case 'duplicate':
      return 'That is already up there.'
    case 'empty':
      return 'There is nothing here yet.'
    case 'too_long':
      return `${MAX_BODY_LENGTH} characters at most.`
    default:
      return 'That did not work.'
  }
}
