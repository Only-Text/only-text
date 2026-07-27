import Link from 'next/link'

import { LiveBoard } from '@/components/live-board'
import { Sheet } from '@/components/sheet'
import { getBoard } from '@/lib/data'

/**
 * Eén seconde.
 *
 * De reflex is `dynamic = 'force-dynamic'` zodat de tekst altijd vers is. Dat
 * zou hier de duurste regel van het project zijn: elke bezoeker wordt dan een
 * databasequery én een functie-aanroep, en honderdduizend bezoekers op één
 * virale dag zijn honderdduizend queries op een gedeelde instantie.
 *
 * Die versheid is bovendien niet nodig. De tekst uit de server is een
 * startwaarde die binnen milliseconden na het laden door de WebSocket wordt
 * gecorrigeerd. Eén seconde oude HTML is onzichtbaar, en zo bedient het CDN
 * honderdduizend bezoekers met ongeveer één query per seconde.
 */
export const revalidate = 1

export default async function Home() {
  const board = await getBoard()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">only-text.com</h1>
        </header>

        <LiveBoard initial={board} />
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <NavLink href="/archive">everything ever written</NavLink>
        <NavLink href="/records">records</NavLink>
        <NavLink href="/about">what is this</NavLink>
        <NavLink href="/raw">plain text</NavLink>
      </nav>
    </main>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="marginalia relative text-[0.9rem] transition-colors hover:text-(--ink)"
    >
      {children}
    </Link>
  )
}
