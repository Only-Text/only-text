import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY moeten gezet zijn.',
  )
}

export const SUPABASE_URL = url
export const SUPABASE_ANON_KEY = anonKey

/**
 * Client voor de browser en voor server-side lezen. Mag alleen lezen:
 * RLS staat alleen `select` op zichtbare berichten toe, en kolomrechten
 * verbergen `client_hash` volledig.
 */
export function createPublicClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 20 } },
  })
}

/**
 * Alleen op de server. Omzeilt RLS, dus nooit naar de browser lekken.
 * Wordt uitsluitend gebruikt door de route handlers die schrijven.
 */
export function createServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ontbreekt.')
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Eén rij uit `messages`, zoals de browser hem mag zien. */
export type Message = {
  id: number
  body: string
  author_name: string | null
  created_at: string
  ended_at: string | null
  duration_ms: number | null
  char_count: number
  word_count: number
  country: string | null
  status: string
  report_count: number
}

export type SiteStats = {
  total_messages: number
  total_chars: number
  total_ms: number
  updated_at: string
}

/** Kolommen die we altijd expliciet opvragen — nooit `*`. */
export const MESSAGE_COLUMNS =
  'id, body, author_name, created_at, ended_at, duration_ms, char_count, word_count, country, status, report_count'

/** Het kanaal waarop de database elke overname uitzendt. */
export const LIVE_TOPIC = 'only-text:live'
export const TAKEOVER_EVENT = 'takeover'
