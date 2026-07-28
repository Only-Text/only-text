import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'

export const metadata: Metadata = {
  title: 'Inkt of potlood',
  robots: { index: false, follow: false },
}

/**
 * Vier keer dezelfde tekst, vier keer een andere hand.
 *
 * Het verschil tussen inkt en potlood zit in drie dingen: de kleur, de dikte
 * van de streek, en of de streek egaal is. De eerste twee zijn nu live. De
 * derde — de korrel ín de letter, waar het grafiet de dalen van het papier
 * overslaat — staat hier ernaast in twee sterktes, want dat is precies het
 * soort keuze die je alleen naast elkaar kunt maken.
 *
 * Alles staat in deze pagina zelf en raakt de rest van de site niet. Kies er
 * een en dan verhuist hij naar globals.css.
 */

/** De korrel. Grover en veel sterker dan die van het papier zelf, want hij moet
 *  zichtbaar zijn binnen een letterstreek van een paar pixels breed. */
const KORREL_ZACHT =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='k' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch' seed='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.42'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23k)'/%3E%3C/svg%3E\")"

const KORREL_STERK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='k' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch' seed='11'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.9'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23k)'/%3E%3C/svg%3E\")"

const CSS = `
/* De korrel valt weg als hij met de tekst meeschuift, dus hij hangt aan het
   vel en niet aan de letter: één doorlopend papieroppervlak waar de letters
   een venster op zijn. Precies zoals een echt vel zich gedraagt. */
.staal :where(p) { background-attachment: local; }

/* 1 · inkt, zoals het was */
.v-inkt :where(p) { color: #22241d; text-shadow: none; }
.v-inkt :where(p.groot) { font-weight: 500; }
.v-inkt :where(p.klein) { color: #4d4f46; }

/* 2 · grafiet, zoals het nu live staat */
.v-grafiet :where(p) { color: #3e4147; text-shadow: 0 0.4px 0.7px rgba(62,65,71,.3); }
.v-grafiet :where(p.klein) { color: #5f6369; }

/* 3 en 4 · grafiet met korrel in de letter.
   background-clip: text schildert de achtergrond alleen binnen de letters.
   De korrel wordt met screen over de grafiettint gelegd: waar de ruis licht
   is, licht de streek op — dat zijn de vezels die de punt niet geraakt heeft.
   text-shadow moet hier uit: die zou een dichte schaduw achter een lege
   letter zetten en de korrel weer dicht smeren. */
.v-korrel :where(p) {
  color: transparent;
  background-image: var(--korrel);
  background-blend-mode: screen;
  background-size: 120px 120px;
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: none;
}
.v-korrel :where(p.groot) { background-color: #3e4147; }
.v-korrel :where(p.klein) { background-color: #5f6369; }

.v-zacht { --korrel: ${KORREL_ZACHT}; }
.v-sterk { --korrel: ${KORREL_STERK}; }
`

const ZIN = 'Somewhere a stranger is reading this exact sentence right now.'

const VARIANTEN = [
  { klasse: 'v-inkt', naam: '1 · Inkt', bij: 'Bijna zwart, dikte 500, geen zachte rand. Zoals het tot vandaag was.' },
  { klasse: 'v-grafiet', naam: '2 · Grafiet', bij: 'Koeler, dunner, met een halve pixel uitloop. Dit staat nu live.' },
  { klasse: 'v-korrel v-zacht', naam: '3 · Grafiet met korrel, zacht', bij: 'Idem, plus ruis binnen de letter. Van dichtbij te zien, van een meter niet.' },
  { klasse: 'v-korrel v-sterk', naam: '4 · Grafiet met korrel, sterk', bij: 'Grovere en diepere ruis. Let hier vooral op de kleine regel: valt die uit elkaar?' },
]

export default function PotloodPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <p className="marginalia mb-2 text-[0.9rem]">
        Vier keer dezelfde tekst. Zoom in tot je de letterranden ziet, en kijk daarna van een
        armlengte afstand.
      </p>
      <p className="marginalia mb-8 text-[0.85rem] text-(--ink-faint)">
        Waar het op stukloopt is de kleine regel: een korrel die in de grote zin mooi is, maakt
        bijschriften rafelig. Kies op de kleine regel, niet op de grote.
      </p>

      {VARIANTEN.map((v, i) => (
        <section key={v.klasse} className="mb-14">
          <p className="marginalia mb-1 text-[0.85rem]">{v.naam}</p>
          <p className="marginalia mb-3 text-[0.8rem] text-(--ink-faint)">{v.bij}</p>

          <div className={`staal ${v.klasse}`}>
            <Sheet tilt={i % 2 === 0 ? -0.4 : 0.4} single>
              <header>
                <h1 className="meta klein text-[0.8rem] leading-(--line-h) tracking-wide">
                  only-text.com
                </h1>
              </header>
              <p className="klein meta mt-0 text-[0.85rem]">anonymous · 28 July, 21:14</p>
              <p className="groot message text-[clamp(1.3rem,3.1vw,1.95rem)]">{ZIN}</p>
              <p className="klein meta mt-(--line-h) text-[0.82rem]">
                7 sentences have stood here. This line is the one that decides it: small text is
                where a grain either reads as pencil or as a printing fault.
              </p>
            </Sheet>
          </div>
        </section>
      ))}

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          terug naar de voorpagina
        </Link>
        <Link href="/design/eraser" className="marginalia text-[0.9rem] hover:text-(--ink)">
          het gummetje
        </Link>
      </nav>
    </main>
  )
}
