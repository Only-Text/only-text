import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Architects_Daughter,
  Cabin_Sketch,
  Delicious_Handrawn,
  Just_Me_Again_Down_Here,
  Rock_Salt,
  Sedgwick_Ave_Display,
  Waiting_for_the_Sunrise,
} from 'next/font/google'

import { Sheet } from '@/components/sheet'

export const metadata: Metadata = {
  title: 'Welke hand',
  robots: { index: false, follow: false },
}

/**
 * Acht letters, hetzelfde vel.
 *
 * Shantell Sans is een viltstift: dikke, egale, volledig gesloten streken. Geen
 * kleur of gewicht maakt daar een potlood van, want het verschil zit in de vorm
 * van de streek zelf. Dus staan hier de letters die het wél zijn.
 *
 * De vraag is niet welke het mooist is. Het is welke er om half elf 's avonds
 * op een telefoon nog te lezen is in een bijschrift van dertien pixels, want
 * dat is waar een geschetste letter uit elkaar valt. Elk vel toont daarom
 * dezelfde drie maten, plus een regel met accenten — zie de waarschuwing
 * daaronder.
 */

const architects = Architects_Daughter({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--f-architects',
})
const justme = Just_Me_Again_Down_Here({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--f-justme',
})
const sunrise = Waiting_for_the_Sunrise({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--f-sunrise',
})
const delicious = Delicious_Handrawn({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--f-delicious',
})
const sedgwick = Sedgwick_Ave_Display({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--f-sedgwick',
})
// Deze twee hebben géén latin-ext. Zie de waarschuwing bij hun vel.
const rocksalt = Rock_Salt({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-rocksalt',
})
const cabin = Cabin_Sketch({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-cabin',
})

const ZIN = 'Somewhere a stranger is reading this exact sentence right now.'
const ACCENTEN = 'café · naïve · größer · Łukasz · Ømar · señor'

/** De korrel uit /design/potlood, om te zien of textuur een gladde letter redt. */
const KORREL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='k' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch' seed='11'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.9'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23k)'/%3E%3C/svg%3E\")"

const CSS = `
/* De letters hieronder hebben geen variabele assen, dus de bounce- en
   informality-instellingen van Shantell moeten eraf. Blijven ze staan, dan
   negeert de browser ze en verandert er niets — behalve bij Shantell zelf,
   en dan vergelijk je twee dingen tegelijk. */
.proef :where(p, h1) { font-variation-settings: normal; }

.korrel :where(p, h1) {
  color: transparent;
  background-image: ${KORREL};
  background-color: #3e4147;
  background-blend-mode: screen;
  background-size: 120px 120px;
  background-attachment: local;
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: none;
}
.korrel :where(p.klein, h1) { background-color: #5f6369; }
`

type Proef = {
  naam: string
  bij: string
  font: string
  /** Regelhoogte-correctie: sommige van deze letters staan veel kleiner op de
      body dan Shantell, en dan vergelijk je grootte in plaats van vorm. */
  schaal?: number
  korrel?: boolean
  waarschuwing?: string
}

const PROEVEN: Proef[] = [
  {
    naam: '0 · Shantell Sans',
    bij: 'Wat er nu staat. Een viltstift: dikke, egale, gesloten streken.',
    font: 'var(--font-hand)',
  },
  {
    naam: '1 · Architects Daughter',
    bij: 'De dunne, hoekige hand van een bouwtekening. Geen korrel, wel potloodgewicht.',
    font: 'var(--f-architects)',
  },
  {
    naam: '2 · Just Me Again Down Here',
    bij: 'Nog dunner en losser. Let op of de bijschriften niet wegvallen.',
    font: 'var(--f-justme)',
    schaal: 1.15,
  },
  {
    naam: '3 · Waiting for the Sunrise',
    bij: 'Licht en schuin, zoals snel meeschrijven met een potlood.',
    font: 'var(--f-sunrise)',
    schaal: 1.1,
  },
  {
    naam: '4 · Delicious Handrawn',
    bij: 'Dun met een onregelmatige streek. Iets meer body dan 2 en 3.',
    font: 'var(--f-delicious)',
    schaal: 1.1,
  },
  {
    naam: '5 · Sedgwick Ave Display',
    bij: 'Ruwere randen, zachtpotlood. De ruigste die nog accenten kan.',
    font: 'var(--f-sedgwick)',
  },
  {
    naam: '6 · Rock Salt',
    bij: 'Echte korrel in de streek: dit is het dichtst bij jouw voorbeeld.',
    font: 'var(--f-rocksalt)',
    schaal: 0.88,
    waarschuwing:
      'Géén latin-ext. Elke é, ü, ł of ø valt terug op een andere letter, midden in de zin van een bezoeker.',
  },
  {
    naam: '7 · Cabin Sketch',
    bij: 'Gearceerd, alsof de letters zijn ingekleurd met streepjes.',
    font: 'var(--f-cabin)',
    waarschuwing:
      'Géén latin-ext, en het is een display-letter: gemaakt voor koppen, niet voor bijschriften.',
  },
  {
    naam: '8 · Architects Daughter mét korrel',
    bij: 'Een gladde potloodletter plus de ruis uit /design/potlood. Misschien slaat dit 6 en 7 zonder hun nadelen.',
    font: 'var(--f-architects)',
    korrel: true,
  },
]

export default function LetterPage() {
  const vars = [
    architects.variable,
    justme.variable,
    sunrise.variable,
    delicious.variable,
    sedgwick.variable,
    rocksalt.variable,
    cabin.variable,
  ].join(' ')

  return (
    <main className={`mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16 ${vars}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <p className="marginalia mb-2 text-[0.9rem]">
        Acht handen, dezelfde tekst. Kleur en dikte maken van een viltstift geen potlood — dat zit
        in de vorm van de streek, en dus in de letter zelf.
      </p>
      <p className="marginalia mb-8 text-[0.85rem] text-(--ink-faint)">
        Kies op de onderste twee regels van elk vel, niet op de grote zin. Een geschetste letter is
        in een kop altijd mooi en in een bijschrift van dertien pixels vaak onleesbaar.
      </p>

      {PROEVEN.map((p, i) => (
        <section key={p.naam} className="mb-14">
          <p className="marginalia mb-1 text-[0.85rem]">{p.naam}</p>
          <p className="marginalia mb-1 text-[0.8rem] text-(--ink-faint)">{p.bij}</p>
          {p.waarschuwing && (
            <p className="marginalia mb-3 text-[0.8rem] text-(--flame)">{p.waarschuwing}</p>
          )}

          <div
            className={`proef ${p.korrel ? 'korrel' : ''}`}
            style={{ fontFamily: p.font, fontSize: p.schaal ? `${p.schaal}em` : undefined }}
          >
            <Sheet tilt={i % 2 === 0 ? -0.4 : 0.4} single>
              <header>
                <h1 className="klein meta text-[0.8rem] leading-(--line-h) tracking-wide">
                  only-text.com
                </h1>
              </header>
              <p className="klein meta mt-0 text-[0.85rem]">anonymous · 28 July, 21:14 · read by 12</p>
              <p className="message text-[clamp(1.3rem,3.1vw,1.95rem)]">{ZIN}</p>
              <p className="klein meta mt-(--line-h) text-[0.82rem]">
                7 sentences have stood here. This is the size that decides it: if you cannot read
                this line on a phone, the letter is wrong however good the sentence looks.
              </p>
              <p className="klein meta text-[0.82rem]">{ACCENTEN}</p>
            </Sheet>
          </div>
        </section>
      ))}

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          terug naar de voorpagina
        </Link>
        <Link href="/design/potlood" className="marginalia text-[0.9rem] hover:text-(--ink)">
          inkt of grafiet
        </Link>
        <Link href="/design/eraser" className="marginalia text-[0.9rem] hover:text-(--ink)">
          het gummetje
        </Link>
      </nav>
    </main>
  )
}
