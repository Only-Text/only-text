import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'
import { formatDuration, formatNumber } from '@/lib/format'
import { Moment } from '@/components/moment'
import { getStats } from '@/lib/stats'

export const metadata: Metadata = {
  title: 'The numbers',
  description:
    'How many sentences have stood on only-text.com, who is holding the record, and how long the average one survives.',
  alternates: { canonical: '/stats' },
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

/**
 * De cijfers, ook als gegevensverzameling.
 *
 * Wie een getal van deze site overneemt wil weten hoe oud het is en of hij het
 * mag gebruiken. Dat staat hier allebei, met de JSON-versie als distributie
 * erbij, zodat het antwoord op "hoeveel zinnen heeft only-text gehad" ergens
 * vandaan komt in plaats van uit een gok.
 */
const datasetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  '@id': `${SITE}/stats#dataset`,
  name: 'only-text.com in numbers',
  description:
    'Public figures for only-text.com: sentences written, people who wrote them, countries they came from, the longest reign, and how long the average sentence survives.',
  url: `${SITE}/stats`,
  isAccessibleForFree: true,
  license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  creator: { '@id': `${SITE}#publisher` },
  distribution: [
    {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${SITE}/stats.json`,
    },
  ],
}

export const revalidate = 60

/**
 * Openbare cijfers.
 *
 * Dit is de pagina die het verschil maakt tussen een vermelding en een artikel:
 * wie erover schrijft heeft een getal nodig dat hij zelf kan nakijken, en gaat
 * daarvoor niemand mailen. Alles staat er ongerond bij, met het tijdstip van
 * meten erbij, en het is ook als JSON op te halen.
 */
export default async function StatsPage() {
  const s = await getStats()

  if (!s) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <Sheet>
          <p className="hand text-[1.05rem]">The numbers are not available right now.</p>
        </Sheet>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datasetJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <Sheet tilt={-0.4}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / the numbers
          </h1>
        </header>

        <p className="message text-[clamp(1.2rem,2.6vw,1.7rem)]">
          {formatNumber(s.sentences_total)} sentences, {formatNumber(s.writers_total)} writers,{' '}
          {formatNumber(s.countries_total)}{' '}
          {s.countries_total === 1 ? 'country' : 'countries'}.
        </p>

        {s.standing_now && (
          <>
            <p className="hand text-[1.02rem] font-bold">Standing right now</p>
            <p className="hand text-[1rem]">
              &ldquo;{s.standing_now.body}&rdquo;
            </p>
            <p className="meta text-[0.85rem]">
              {s.standing_now.author ? `by ${s.standing_now.author}` : 'by someone with no name'} ·
              up for {formatDuration(s.standing_now.seconds * 1000)} · read by{' '}
              {formatNumber(s.standing_now.reads)}
            </p>
          </>
        )}

        {s.longest_ever && (
          <>
            <p className="hand text-[1.02rem] font-bold">The record</p>
            <p className="hand text-[1rem]">&ldquo;{s.longest_ever.body}&rdquo;</p>
            <p className="meta text-[0.85rem]">
              Stood for {formatDuration(s.longest_ever.ms)}, written{' '}
              <Moment iso={s.longest_ever.on} />
              {s.longest_ever.author ? ` by ${s.longest_ever.author}` : ''}.{' '}
              <Link href={`/thoughts/${s.longest_ever.id}`} className="underline underline-offset-4">
                see it
              </Link>
            </p>
          </>
        )}

        <p className="hand text-[1.02rem] font-bold">Everything else</p>
        <Regel label="Characters typed in total" waarde={formatNumber(s.characters_total)} />
        <Regel label="Sentences in the last 24 hours" waarde={formatNumber(s.sentences_24h)} />
        <Regel label="Times a sentence has been read" waarde={formatNumber(s.reads_total)} />
        <Regel
          label="Median time a sentence survives"
          waarde={s.median_ms ? formatDuration(s.median_ms) : 'not set yet'}
        />
        {s.shortest_ever && (
          <Regel label="Shortest life ever" waarde={formatDuration(s.shortest_ever.ms)} />
        )}
        <Regel label="Waiting in the queue" waarde={formatNumber(s.queue_now)} />
        <Regel label="Reading at this moment" waarde={formatNumber(s.reading_now)} />

        <p className="meta text-[0.8rem]">
          Measured <Moment iso={s.generated_at} />. Nothing here is rounded up. The same numbers are
          available as{' '}
          <Link href="/stats.json" className="underline underline-offset-4">
            JSON
          </Link>
          , and anyone writing about this may use them without asking.
        </p>
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
        <Link href="/what-people-do" className="marginalia text-[0.9rem] hover:text-(--ink)">
          what people do
        </Link>
        <Link href="/press" className="marginalia text-[0.9rem] hover:text-(--ink)">
          for press
        </Link>
      </nav>
    </main>
  )
}

function Regel({ label, waarde }: { label: string; waarde: string }) {
  return (
    <p className="hand text-[1rem]">
      {label}: <span className="tabular-nums">{waarde}</span>
    </p>
  )
}
