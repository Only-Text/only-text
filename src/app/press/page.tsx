import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'
import { formatDuration, formatNumber } from '@/lib/format'
import { getStats } from '@/lib/stats'

export const metadata: Metadata = {
  title: 'For press',
  description:
    'What only-text.com is, in a paragraph you can paste, with numbers you can check and permission to use anything on the site.',
}

export const revalidate = 300

/**
 * De perspagina.
 *
 * Journalisten die hierover schrijven werken 's avonds en mailen niet. Alles
 * wat ze nodig hebben staat hier: een plakbare beschrijving, cijfers die ze
 * kunnen nakijken, en expliciete toestemming om alles te gebruiken. Die laatste
 * regel scheelt een mailwisseling en verhoogt de kans op plaatsing meetbaar.
 *
 * NOG IN TE VULLEN door Lorenzo: het contactadres en het ontstaansverhaal.
 * Die twee horen van hem te komen, niet van mij — een adres publiceren is zijn
 * beslissing, en een verzonnen motief is precies wat er in vijf artikelen
 * verkeerd terechtkomt.
 */
export default async function PressPage() {
  const s = await getStats()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={0.35}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / for press
          </h1>
        </header>

        <p className="hand text-[1.02rem] font-bold">In one paragraph</p>
        <p className="hand text-[1rem]">
          only-text.com is a website that holds exactly one sentence at a time. Whoever typed last
          owns the page, and anyone can take it from them without making an account. What counts is
          not what you write but how long it survives before somebody replaces it. Every sentence
          gets a guaranteed minimum time on the front page, so nobody can be wiped out before they
          have been read, and when it is busy a queue forms with a visible position. Everything ever
          typed stays in a public archive, each with its own permanent link.
        </p>

        <p className="hand text-[1.02rem] font-bold">In forty words</p>
        <p className="hand text-[1rem]">
          A website that is one sentence long. It belongs to whoever typed last, anyone can take it,
          and the only score is how long yours survives. No accounts, no advertising, no images at
          all.
        </p>

        <p className="hand text-[1.02rem] font-bold">Numbers you can check yourself</p>
        {s ? (
          <p className="hand text-[1rem]">
            {formatNumber(s.sentences_total)} sentences from {formatNumber(s.writers_total)} writers
            so far. The longest any sentence has survived is{' '}
            {s.longest_ever ? formatDuration(s.longest_ever.ms) : 'not set yet'}; the median is{' '}
            {s.median_ms ? formatDuration(s.median_ms) : 'not set yet'}. Live figures are on{' '}
            <Link href="/stats" className="underline underline-offset-4">
              the numbers page
            </Link>{' '}
            and as{' '}
            <Link href="/stats.json" className="underline underline-offset-4">
              JSON
            </Link>
            . Nothing is rounded up.
          </p>
        ) : (
          <p className="hand text-[1rem]">
            Live figures are on{' '}
            <Link href="/stats" className="underline underline-offset-4">
              the numbers page
            </Link>
            .
          </p>
        )}

        <p className="hand text-[1.02rem] font-bold">You may use all of it</p>
        <p className="hand text-[1rem]">
          Every screenshot, every share card and every archived sentence on this site may be
          reproduced without asking, including commercially. No embargo, no approval, no request to
          be sent a link afterwards. If you want a specific sentence rendered as an image, every
          permanent link has one at only-text.com/api/og/&lt;id&gt;.
        </p>

        <p className="hand text-[1.02rem] font-bold">How it is moderated</p>
        <p className="hand text-[1rem]">
          Slurs aimed at where someone is from, what they believe, who they love or what their body
          does are blocked, along with threats and links. Ordinary swearing is not. The filter is
          plain logic rather than a language model, so a sentence appears the instant you press
          enter. Every sentence can be reported and three reports take it off the front page
          immediately, before anyone reviews it. Nothing is ever deleted from the archive except by
          moderation.
        </p>

        <p className="hand text-[1.02rem] font-bold">What is logged</p>
        <p className="hand text-[1rem]">
          No advertising and no tracking cookies. IP addresses are never stored: the database holds
          a one-way hash of the address with a server-side secret mixed in, used only to stop one
          person from holding the page. Country is kept as a two-letter code so a sentence can say
          where it came from. Visits are counted in that same database, by this site, and there is
          no third-party analytics anywhere on it.
        </p>

        <p className="hand text-[1.02rem] font-bold">Who made it</p>
        <p className="hand text-[1rem] text-(--flame)">
          [ nog in te vullen: je naam, je stad, en een e-mailadres dat je binnen een uur leest ]
        </p>
        <p className="hand text-[1rem] text-(--flame)">
          [ nog in te vullen: waarom je het gemaakt hebt, in maximaal 150 woorden, één keer goed
          geschreven zodat het in elk artikel hetzelfde staat ]
        </p>
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
        <Link href="/stats" className="marginalia text-[0.9rem] hover:text-(--ink)">
          the numbers
        </Link>
        <Link href="/archive" className="marginalia text-[0.9rem] hover:text-(--ink)">
          everything ever written
        </Link>
      </nav>
    </main>
  )
}
