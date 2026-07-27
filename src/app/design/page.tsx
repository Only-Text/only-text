import type { Metadata } from 'next'

import { Eye } from '@/components/eye'
import { Sheet } from '@/components/sheet'
import { HandButton } from '@/components/hand-drawn'

export const metadata: Metadata = {
  title: 'Five layouts',
  robots: { index: false, follow: false },
}

/**
 * Vijf varianten naast elkaar, met dezelfde zin, zodat de keuze over de
 * indeling gaat en niet over de inhoud. Deze pagina staat niet in het menu en
 * niet in de sitemap, en mag weg zodra er gekozen is.
 */

const ZIN = 'Somewhere a stranger is reading this exact sentence right now.'
const NAAM = 'claude'
const DATUM = '27 July, 14:32'
const GEZIEN = '47'

export default function DesignPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <p className="marginalia mb-6 text-[0.9rem]">
        Vijf indelingen, zelfde zin. Kies er een op nummer.
      </p>

      <Variant nummer={1} naam="Alleen de regel eronder">
        <p className="message text-[clamp(1.3rem,3.1vw,1.95rem)]">{ZIN}</p>
        <p className="meta text-[0.85rem]">
          {DATUM} · <Eye /> {GEZIEN} · @{NAAM}
        </p>
        <Invoer />
      </Variant>

      <Variant nummer={2} naam="Regel erboven, zin krijgt het hele veld">
        <p className="meta text-[0.82rem]">
          @{NAAM} · {DATUM} · <Eye /> {GEZIEN}
        </p>
        <p className="message text-[clamp(1.4rem,3.4vw,2.15rem)]">{ZIN}</p>
        <Invoer />
      </Variant>

      <Variant nummer={3} naam="Niets eromheen, alles onderaan">
        <p className="message text-[clamp(1.4rem,3.4vw,2.15rem)]">{ZIN}</p>
        <div className="mt-(--line-h)">
          <Invoer />
        </div>
        <p className="meta mt-(--line-h) text-[0.8rem]">
          Above: {DATUM}, by @{NAAM}, <Eye /> {GEZIEN}
        </p>
      </Variant>

      <Variant nummer={4} naam="Naam in de kantlijn, zoals een paraaf">
        <div className="relative">
          <span
            className="marginalia absolute text-[0.78rem]"
            style={{ left: 'calc(var(--margin-x) * -1 + 4px)', top: 0, transform: 'rotate(-4deg)' }}
          >
            @{NAAM}
          </span>
          <p className="message text-[clamp(1.4rem,3.4vw,2.15rem)]">{ZIN}</p>
        </div>
        <p className="meta text-[0.82rem]">
          {DATUM} · <Eye /> {GEZIEN}
        </p>
        <Invoer />
      </Variant>

      <Variant nummer={5} naam="Zin en cijfers op dezelfde regel, ver uit elkaar">
        <p className="message text-[clamp(1.4rem,3.4vw,2.15rem)]">{ZIN}</p>
        <p className="meta flex flex-wrap justify-between gap-x-6 text-[0.82rem]">
          <span>@{NAAM}</span>
          <span>{DATUM}</span>
          <span>
            <Eye /> {GEZIEN}
          </span>
        </p>
        <Invoer />
      </Variant>
    </main>
  )
}

function Variant({
  nummer,
  naam,
  children,
}: {
  nummer: number
  naam: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-16">
      <p className="marginalia mb-3 text-[0.85rem]">
        {nummer}. {naam}
      </p>
      <Sheet tilt={nummer % 2 === 0 ? 0.4 : -0.4} single>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">only-text.com</h1>
        </header>
        {children}
      </Sheet>
    </section>
  )
}

function Invoer() {
  return (
    <>
      <p className="hand mt-(--line-h) block text-[1rem] font-bold">Write your sentence here:</p>
      <p className="hand text-[1.35rem] text-(--ink-faint)">&nbsp;</p>
      <div className="on-rule flex flex-wrap items-baseline gap-x-4 text-[0.95rem] leading-(--line-h)">
        <span className="hand">from: anonymous</span>
        <HandButton seed="voorbeeld">put it up</HandButton>
        <span className="meta text-[0.85rem]">240</span>
      </div>
    </>
  )
}
