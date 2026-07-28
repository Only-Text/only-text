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

/** De pagina's die echt bestaan. Zie `find src/app -name page.tsx`. */
const ECHTE_PADEN = new Set([
  '/',
  '/about',
  '/archive',
  '/design',
  '/press',
  '/records',
  '/stats',
  '/what-people-do',
])

/**
 * Alles wat geen bestaande pagina is wordt `/404`.
 *
 * De 404-pagina zit onder dezelfde layout, dus zonder deze filter telt elke
 * bot die /wp-admin of /ai-summarizer probeert mee in "drukste pagina's". Dat
 * gebeurde meteen op de eerste dag. Erger: het pad komt rechtstreeks uit de
 * adresbalk, dus iedereen kon er zelf regels mee in het rapport zetten.
 *
 * Eén `/404`-emmer in plaats van weggooien, want hoeveel er misgetast wordt is
 * zelf ook een getal dat iets zegt.
 */
function bekendPad(pad: string): string {
  if (ECHTE_PADEN.has(pad)) return pad
  // De permalink houdt zijn nummer: welke zin wordt bekeken is het punt.
  if (/^\/m\/\d{1,12}$/.test(pad)) return pad
  if (/^\/design\/[a-z0-9-]{1,40}$/.test(pad)) return pad
  return '/404'
}

export function VisitTracker() {
  const pad = usePathname()
  const vorige = useRef<string | null>(null)

  useEffect(() => {
    // Ook /what-people-do telt gewoon mee. Die pagina staat openbaar tussen de
    // andere, en hem overslaan zou "drukste pagina's" een onwaarheid maken.
    if (!pad) return
    if (vorige.current === pad) return
    vorige.current = pad
    trackPageOpen(bekendPad(pad))
  }, [pad])

  return null
}
