'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Eén client op moduleniveau, nooit per render.
 *
 * `createClient()` tijdens een render aanroepen betekent een nieuwe WebSocket
 * per render. En in StrictMode draait elk effect twee keer, dus zonder deze
 * singleton krijg je twee kanalen op hetzelfde topic — waarvan er één als
 * spookkanaal blijft hangen tot je tegen de limiet van 100 kanalen per
 * verbinding aan loopt.
 */
let cached: SupabaseClient | undefined

export function browserClient(): SupabaseClient {
  cached ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Rem aan de clientkant: bij een piek liever berichten samenvoegen
      // dan de verbinding laten volstromen.
      realtime: { params: { eventsPerSecond: 10 } },
    },
  )
  return cached
}

/**
 * Een sessie-id dat één tabblad lang meegaat. Gebruikt voor de kijkersteller.
 * Bewust sessionStorage en niet localStorage: twee tabbladen zijn twee kijkers.
 */
export function sessionId(): string {
  const KEY = 'only-text:session'
  try {
    const existing = sessionStorage.getItem(KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    sessionStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    return crypto.randomUUID()
  }
}

/** Onthoudt de naam die iemand koos, zonder account. */
export function rememberedName(): string {
  try {
    return localStorage.getItem('only-text:naam') ?? ''
  } catch {
    return ''
  }
}

export function rememberName(name: string): void {
  try {
    if (name) localStorage.setItem('only-text:naam', name)
    else localStorage.removeItem('only-text:naam')
  } catch {
    /* privémodus: dan onthouden we het niet */
  }
}
