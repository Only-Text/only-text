import type { Metadata } from 'next'
import Link from 'next/link'

import { Demo } from './demo'

export const metadata: Metadata = {
  title: 'Het gummetje',
  robots: { index: false, follow: false },
}

/**
 * Een werkbank voor één animatie. Staat niet in het menu en niet in de
 * sitemap, en mag weg zodra het gommen goed staat.
 */
export default function GumPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <p className="marginalia mb-2 text-[0.9rem]">
        Het uitgommen, in een lus, bij vier zinlengtes. Elk vel schrijft de zin,
        laat hem even staan, gomt hem uit en begint opnieuw.
      </p>
      <p className="marginalia mb-8 text-[0.85rem] text-(--ink-faint)">
        Waar het om gaat: begint de gum op de eerste letter en stopt hij op de laatste, gaat hij
        onderweg echt heen en weer, en tilt hij netjes op tussen twee regels.
      </p>

      <Demo />

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          terug naar de voorpagina
        </Link>
        <Link href="/design" className="marginalia text-[0.9rem] hover:text-(--ink)">
          de vijf indelingen
        </Link>
      </nav>
    </main>
  )
}
