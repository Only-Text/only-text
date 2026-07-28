'use client'

import { useEffect, useState } from 'react'

import { Erasing } from '@/components/eraser'
import { HandButton } from '@/components/hand-drawn'
import { InkReveal } from '@/components/ink-reveal'
import { Sheet } from '@/components/sheet'

/**
 * Het gummetje in een lus, bij vier zinlengtes tegelijk.
 *
 * Een animatie van een seconde die één keer per overname langskomt is niet te
 * beoordelen op de plek waar hij hoort. Hier loopt hij door, naast elkaar, in
 * dezelfde letter en op hetzelfde papier als op de voorpagina — want dat is wat
 * het verschil maakt tussen "de baan klopt" en "het ziet er goed uit".
 *
 * De lus speelt de hele cyclus na, niet alleen het gommen: schrijven, even
 * laten staan, uitgommen, leeg papier. Dat is de volgorde die een bezoeker ook
 * ziet, en pas in die volgorde zie je of het gommen te lang duurt.
 */

const ZINNEN: { naam: string; tekst: string }[] = [
  {
    naam: 'Twee woorden',
    tekst: 'Mine now.',
  },
  {
    naam: 'Eén regel',
    tekst: 'Somewhere a stranger is reading this.',
  },
  {
    naam: 'Twee regels',
    tekst: 'I typed this at two in the morning and the whole internet had to look at it.',
  },
  {
    naam: 'Het maximum, 236 tekens',
    tekst:
      'This is about the longest a sentence is allowed to get here, and it takes four full lines of paper to say it, which means the eraser has to make four separate passes and lift itself back to the margin three times before the page is blank.',
  },
]

const TEMPI = [
  { naam: 'echte snelheid', waarde: 1 },
  { naam: 'half zo snel', waarde: 2 },
  { naam: 'vier keer trager', waarde: 4 },
  { naam: 'tien keer trager', waarde: 10 },
]

export function Demo() {
  const [tempo, setTempo] = useState(1)
  // Alle vellen tegelijk opnieuw laten beginnen, zodat je ze naast elkaar kunt
  // vergelijken in plaats van ze uit de pas te zien lopen.
  const [start, setStart] = useState(0)

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-3">
        {TEMPI.map((t) => (
          <button
            key={t.waarde}
            type="button"
            onClick={() => {
              setTempo(t.waarde)
              setStart((s) => s + 1)
            }}
            className={`marginalia text-[0.9rem] ${
              tempo === t.waarde ? 'text-(--flame)' : 'hover:text-(--ink)'
            }`}
          >
            {t.naam}
          </button>
        ))}
        <HandButton seed="opnieuw" onClick={() => setStart((s) => s + 1)}>
          opnieuw
        </HandButton>
      </div>

      {ZINNEN.map((zin, i) => (
        <section key={zin.naam} className="mb-14">
          <p className="marginalia mb-3 text-[0.85rem]">{zin.naam}</p>
          <Sheet tilt={i % 2 === 0 ? -0.4 : 0.4} single>
            <header>
              <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">only-text.com</h1>
            </header>
            <p className="message mt-0 text-[clamp(1.3rem,3.1vw,1.95rem)]">
              <Lus key={`${start}-${tempo}`} tekst={zin.tekst} tempo={tempo} />
            </p>
          </Sheet>
        </section>
      ))}
    </>
  )
}

/** schrijven → laten staan → uitgommen → leeg papier → opnieuw */
type Stand = 'schrijf' | 'staat' | 'gom' | 'leeg'

const WACHT: Record<Exclude<Stand, 'gom'>, number> = {
  // Ongeveer zolang als InkReveal erover doet.
  schrijf: 1300,
  staat: 900,
  leeg: 700,
}

function Lus({ tekst, tempo }: { tekst: string; tempo: number }) {
  const [stand, setStand] = useState<Stand>('schrijf')
  const [ronde, setRonde] = useState(0)

  useEffect(() => {
    if (stand === 'gom') return
    const volgende: Record<Exclude<Stand, 'gom'>, Stand> = {
      schrijf: 'staat',
      staat: 'gom',
      leeg: 'schrijf',
    }
    // De pauzes mogen iets meegroeien met de vertrager, maar niet evenredig:
    // op tien keer trager zit je anders vooral naar leeg papier te kijken.
    const rek = stand === 'schrijf' ? 1 : Math.min(tempo, 2)
    const timer = setTimeout(() => {
      if (stand === 'leeg') setRonde((r) => r + 1)
      setStand(volgende[stand])
    }, WACHT[stand] * rek)
    return () => clearTimeout(timer)
  }, [stand, tempo])

  if (stand === 'gom') {
    return <Erasing key={ronde} text={tekst} tempo={tempo} onDone={() => setStand('leeg')} />
  }

  // Ook in de pauze en op leeg papier blijft de tekst de hoogte bepalen. Zonder
  // dat springt het vel elke ronde in elkaar en terug, en dan kijk je naar de
  // verkeerde beweging.
  return (
    <span className="block" style={{ visibility: stand === 'leeg' ? 'hidden' : 'visible' }}>
      {stand === 'schrijf' ? <InkReveal key={ronde} text={tekst} /> : tekst}
    </span>
  )
}
