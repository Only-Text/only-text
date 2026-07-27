import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'
import { Track } from '@/components/track'
import { formatDuration, formatMoment } from '@/lib/format'
import { getArchive } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Everything ever written · only-text.com',
  description: 'Every sentence that has ever stood on the front page, and how long it lasted.',
}

export const revalidate = 30

/**
 * Het archief.
 *
 * Dit is het enige deel van de site dat met de tijd rijker wordt, en het is de
 * reden om terug te komen als de nieuwigheid eraf is. Paginering gaat op id en
 * niet op OFFSET: een OFFSET van 100.000 moet honderdduizend rijen doorlopen en
 * weggooien, en dat wordt langzamer naarmate het archief groeit.
 */
export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ before?: string; q?: string }>
}) {
  const { before, q } = await searchParams
  const items = await getArchive({
    before: before ? Number(before) : null,
    limit: 50,
    search: q ?? null,
  })

  const laatste = items.at(-1)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      {/* De zoekterm zelf gaat er bewust niet in. Mensen zoeken in dit archief
          naar hun eigen naam en naar wat ze zelf hebben getypt, en dat is niets
          voor Google. Hoe vaak er gezocht wordt en of er iets gevonden werd is
          genoeg om te weten of de zoekfunctie iets doet. */}
      {q && <Track event="archive_search" params={{ results: items.length, term_length: q.length }} />}

      <Sheet tilt={-0.3}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / everything ever written
          </h1>
        </header>

        <form action="/archive" method="get" className="on-rule">
          <label htmlFor="q" className="sr-only">
            Search the archive
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ''}
            placeholder="search…"
            className="hand w-full border-0 bg-transparent p-0 text-[1.05rem] leading-(--line-h) outline-none placeholder:text-(--ink-faint)"
          />
        </form>

        {items.length === 0 ? (
          <p className="hand text-[1.05rem]">
            {q ? 'Nothing matches that.' : 'Nothing has been replaced yet.'}
          </p>
        ) : (
          <ol className="list-none p-0">
            {items.map((item) => (
              <li key={item.id} className="mt-0">
                <Link
                  href={`/m/${item.id}`}
                  className="hand block text-[1.05rem] leading-(--line-h) hover:text-(--flame)"
                >
                  {item.body}
                </Link>
                <span className="meta block text-[0.8rem] leading-(--line-h)">
                  {item.author_name ?? 'anonymous'} · {formatMoment(item.created_at)} · stood{' '}
                  {formatDuration(item.duration_ms)}
                </span>
              </li>
            ))}
          </ol>
        )}

        {laatste && items.length === 50 && (
          <p className="hand text-[0.95rem]">
            <Link
              href={`/archive?before=${laatste.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className="underline underline-offset-4"
            >
              further back
            </Link>
          </p>
        )}
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
        <Link href="/records" className="marginalia text-[0.9rem] hover:text-(--ink)">
          records
        </Link>
      </nav>
    </main>
  )
}
