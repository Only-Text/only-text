'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { trackPageOpen } from '@/lib/analytics'

/**
 * Eén regel in de layout die elk bezoek vastlegt.
 *
 * Zonder dit meten alleen de pagina's die toevallig al een clientcomponent
 * hebben: de voorpagina, de permalink en het archief. Over /about, /records,
 * /press en /stats zou dan niets bekend zijn, terwijl dat juist de pagina's
 * zijn waaraan je ziet of iemand blijft rondkijken of meteen weg is.
 *
 * Op `usePathname` en niet op montage: de layout monteert één keer, en wie
 * daarna binnen de site doorklikt zou nooit meer geteld worden.
 */
export function VisitTracker() {
  const pad = usePathname()
  const vorige = useRef<string | null>(null)

  useEffect(() => {
    // De inzichtpagina meet zichzelf niet. Anders bestaat het drukste pad van
    // de hele site uit jou die naar de cijfers zit te kijken.
    if (!pad || pad.startsWith('/private')) return
    if (vorige.current === pad) return
    vorige.current = pad
    trackPageOpen(pad)
  }, [pad])

  return null
}
