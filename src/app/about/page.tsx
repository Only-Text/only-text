import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'

export const metadata: Metadata = {
  title: 'What is this · only-text.com',
  description: 'The rules, the limits, and what happens to your words.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={-0.6}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / what is this
          </h1>
        </header>

        <p className="message text-[clamp(1.2rem,2.6vw,1.7rem)]">
          One sentence sits at the top of this website. It belongs to whoever typed last.
        </p>

        <p className="hand text-[1.02rem]">
          Type something and it is yours, until the next person comes along. What counts is not
          what you write but how long it survives, so the whole game is other people.
        </p>

        <p className="hand text-[1.02rem] font-bold">The rules</p>
        <p className="hand text-[1rem]">
          Every sentence gets a minimum time on the front page, so nobody can be wiped out before
          anyone has read them. When it is busy that minimum drops and a queue forms; you keep your
          place and you can watch it come up. One sentence per minute per person, twenty per hour.
          Two hundred and forty characters. No accounts, ever.
        </p>

        <p className="hand text-[1.02rem] font-bold">What is not allowed</p>
        <p className="hand text-[1rem]">
          Swearing is fine. Slurs about where someone is from, what they believe, who they love or
          what their body does are not, and neither are threats or links. That filter is plain
          logic, not a language model, which is why your sentence appears the instant you press
          enter instead of after a spinner.
        </p>

        <p className="hand text-[1.02rem] font-bold">Your words</p>
        <p className="hand text-[1rem]">
          Everything ever written stays in the{' '}
          <Link href="/archive" className="underline underline-offset-4">
            archive
          </Link>
          , with its own permanent link. That link is what you share, not the front page, because
          the front page belongs to someone else by the time your friend clicks it.
        </p>

        <p className="hand text-[1.02rem] font-bold">Privacy</p>
        <p className="hand text-[1rem]">
          No accounts, no advertising, no tracking cookies. Your IP address is never stored: what
          the database holds is a one-way hash of it with a server-side secret mixed in, used only
          to keep one person from taking the whole page. Country is kept as a two-letter code, so a
          sentence can say where in the world it came from. Visits are counted here, in the same
          database as the sentences, and nothing about you is handed to anyone else.
        </p>

        <p className="hand text-[1.02rem] font-bold">Something wrong</p>
        <p className="hand text-[1rem]">
          Every sentence can be reported. Three reports and it comes off the front page
          immediately, before anyone looks at it.
        </p>

        <p className="meta text-[0.85rem]">
          Made with a database, some paper, and no images at all. There is a{' '}
          <Link href="/raw" className="underline underline-offset-4">
            plain text version
          </Link>{' '}
          and an{' '}
          <Link href="/feed.xml" className="underline underline-offset-4">
            RSS feed
          </Link>
          .
        </p>
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
      </nav>
    </main>
  )
}
