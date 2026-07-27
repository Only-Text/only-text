import { createPublicClient } from './supabase'
import type { BoardState, LiveMessage } from '@/components/live-board'

/**
 * Leesfuncties voor de server.
 *
 * Alles loopt via PostgREST (supabase-js), niet via een directe Postgres-
 * verbinding. Serverless functies schalen horizontaal, Postgres-verbindingen
 * niet: bij een piek start Vercel honderden instanties die elk een eigen pool
 * zouden openen en de database binnen seconden leegtrekken.
 */

export type ArchiveItem = {
  id: number
  body: string
  author_name: string | null
  created_at: string
  ended_at: string | null
  duration_ms: number | null
  char_count: number
  country: string | null
  peak_viewers: number
  waited_ms: number | null
}

export async function getBoard(): Promise<BoardState> {
  const sb = createPublicClient()
  const { data, error } = await sb.rpc('get_current')
  if (error || !data) {
    return { message: null, queue_length: 0, viewers: 0, stats: null }
  }
  return data as BoardState
}

export async function getMessage(id: number): Promise<{
  message: LiveMessage & { duration_ms: number | null; ended_at: string | null; peak_viewers: number }
  previous: ArchiveItem | null
  next: ArchiveItem | null
} | null> {
  const sb = createPublicClient()
  const { data, error } = await sb.rpc('get_message', { p_id: id })
  if (error || !data) return null
  const shaped = data as { message: unknown; previous: unknown; next: unknown }
  if (!shaped.message) return null
  return shaped as never
}

export async function getArchive(opts: {
  before?: number | null
  limit?: number
  search?: string | null
}): Promise<ArchiveItem[]> {
  const sb = createPublicClient()
  const { data, error } = await sb.rpc('get_archive', {
    p_before: opts.before ?? null,
    p_limit: opts.limit ?? 50,
    p_search: opts.search ?? null,
  })
  if (error || !data) return []
  return data as ArchiveItem[]
}

export type Records = {
  longest: ArchiveItem[]
  shortest: ArchiveItem[]
  most_seen: ArchiveItem[]
  stats: { total_messages: number; total_chars: number; total_ms: number } | null
  viewers: number
}

export async function getRecords(limit = 50): Promise<Records> {
  const sb = createPublicClient()
  const { data, error } = await sb.rpc('get_records', { p_limit: limit })
  if (error || !data) {
    return { longest: [], shortest: [], most_seen: [], stats: null, viewers: 0 }
  }
  return data as Records
}
