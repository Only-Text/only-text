import { getBoard } from '@/lib/data'

export const runtime = 'nodejs'
export const revalidate = 1

/**
 * De hele site, zoals hij bedoeld is: alleen tekst.
 * Geen opmaak, geen JSON, geen omhulsel. Eén regel, wat er nu staat.
 */
export async function GET() {
  const board = await getBoard()
  const body = board.message?.body ?? ''

  return new Response(`${body}\n`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=1, stale-while-revalidate=30',
    },
  })
}
