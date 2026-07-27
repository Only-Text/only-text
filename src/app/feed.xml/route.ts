import { getArchive } from '@/lib/data'
import { formatDuration } from '@/lib/format'

export const runtime = 'nodejs'
export const revalidate = 300

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

/** XML-escaping. Een zin met `&` of `<` erin sloopt anders de hele feed. */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const items = await getArchive({ limit: 50 })

  const entries = items
    .map((item) => {
      const link = `${SITE}/m/${item.id}`
      const duur = formatDuration(item.duration_ms)
      return `    <item>
      <title>${esc(item.body.length > 90 ? `${item.body.slice(0, 88)}…` : item.body)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(item.created_at).toUTCString()}</pubDate>
      <description>${esc(
        `${item.author_name ? `By ${item.author_name}. ` : ''}Stood for ${duur}.`,
      )}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>only-text.com</title>
    <link>${SITE}</link>
    <description>Every sentence that has stood on the front page.</description>
    <language>en</language>
${entries}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  })
}
