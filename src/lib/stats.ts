import { createPublicClient } from './supabase'

export type Stats = {
  sentences_total: number
  characters_total: number
  writers_total: number
  countries_total: number
  sentences_24h: number
  reads_total: number
  standing_now: {
    id: number
    body: string
    author: string | null
    since: string
    seconds: number
    reads: number
  } | null
  longest_ever: {
    id: number
    body: string
    author: string | null
    ms: number
    reads: number
    on: string
  } | null
  shortest_ever: { id: number; body: string; ms: number } | null
  median_ms: number | null
  queue_now: number
  reading_now: number
  generated_at: string
}

export async function getStats(): Promise<Stats | null> {
  const sb = createPublicClient()
  const { data, error } = await sb.rpc('get_stats')
  if (error || !data) return null
  return data as Stats
}
