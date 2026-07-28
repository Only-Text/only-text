'use client'

import { useEffect, useState } from 'react'

import { formatMoment, formatShortMoment } from '@/lib/format'

/**
 * Een tijdstip, eerst in UTC en daarna in de zone van de bezoeker.
 *
 * De omweg is nodig omdat de server en de browser niet in dezelfde tijdzone
 * staan. Rendert de browser meteen de lokale tijd, dan wijkt zijn eerste render
 * af van de HTML die de server stuurde, en dan gooit React die HTML weg en
 * tekent de hele pagina opnieuw. Dat gebeurde hier op elk bezoek, met React-fout
 * 418 in de console en een dubbel uitgevoerde hartslag als bijvangst. Het zag er
 * verder normaal uit, wat het precies het soort fout maakt dat blijft staan.
 *
 * Dus: de eerste render is exact wat de server schreef, en pas als het monteren
 * klaar is verschijnt de echte tijd. Eén overbodige render per tijdstip, in ruil
 * voor geen enkele weggegooide pagina.
 */
export function Moment({ iso, kort = false }: { iso: string; kort?: boolean }) {
  const opmaak = kort ? formatShortMoment : formatMoment
  const [tekst, setTekst] = useState(() => opmaak(iso, 'UTC'))

  useEffect(() => {
    setTekst(opmaak(iso))
  }, [iso, opmaak])

  return <>{tekst}</>
}
