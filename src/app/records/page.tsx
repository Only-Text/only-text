import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'
import { formatDuration, formatNumber } from '@/lib/format'
import { getRecords, type ArchiveItem } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Records · only-text.com',
  description: 'The sentences that lasted longest, the ones that lasted least, and the totals.',
}

export const revalidate = 60

/**
 * De ranglijst staat bewust op duur, niet op aantal berichten.
 *
 * "Meeste berichten" is een uitnodiging aan botfarms en beloont spam. "Langst
 * blijven staan" is schaars, betwistbaar door iedereen, en levert vanzelf een
 * tweede spel op: mensen die elkaar oproepen om even niets te typen zodat een
 * record blijft staan.
 */
export default async function RecordsPage() {
  const records = await getRecords(25)
  const stats = records.stats

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={0.3}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / records
          </h1>
        </header>

        {stats && (
          <p className="hand text-[1.05rem]">
            {formatNumber(stats.total_messages)} sentences,{' '}
            {formatNumber(stats.total_chars)} characters, and{' '}
            {formatDuration(stats.total_ms)} of standing time in total.
            {records.viewers > 1 && <> Right now {formatNumber(records.viewers)} people are here.</>}
          </p>
        )}

        <Lijst titel="Held the longest" items={records.longest} />
        <Lijst titel="Gone in a blink" items={records.shortest} />
        {records.most_seen.length > 0 && (
          <Lijst titel="Read by the most people" items={records.most_seen} kijkers />
        )}
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
        <Link href="/archive" className="marginalia text-[0.9rem] hover:text-(--ink)">
          everything ever written
        </Link>
      </nav>
    </main>
  )
}

function Lijst({
  titel,
  items,
  kijkers = false,
}: {
  titel: string
  items: ArchiveItem[]
  kijkers?: boolean
}) {
  if (items.length === 0) return null
  return (
    <>
      <p className="hand text-[1.05rem] font-bold">{titel}</p>
      <ol className="list-none p-0">
        {items.map((item, i) => (
          <li key={item.id}>
            <Link
              href={`/m/${item.id}`}
              className="hand block text-[1rem] leading-(--line-h) hover:text-(--flame)"
            >
              <span className="meta mr-3 tabular-nums">{i + 1}.</span>
              {item.body.length > 68 ? `${item.body.slice(0, 66)}…` : item.body}
            </Link>
            <span className="meta block text-[0.8rem] leading-(--line-h)">
              {item.author_name ?? 'anonymous'} ·{' '}
              {kijkers
                ? `${formatNumber(item.views)} readers`
                : formatDuration(item.duration_ms)}
            </span>
          </li>
        ))}
      </ol>
    </>
  )
}
