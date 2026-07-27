'use client'

import { useEffect, useRef } from 'react'

import { track, type AnalyticsEvent, type AnalyticsParams } from '@/lib/analytics'

/**
 * Eén event vanaf een serverpagina, precies één keer.
 *
 * Het archief en de permalink zijn servercomponenten en dat wil ik zo houden;
 * ze doen niets interactiefs. Dit is het kleinste stukje browser dat nodig is
 * om er toch een meting bij te sturen, en het weegt niets.
 *
 * De ref is niet overdreven voorzichtig: React monteert in ontwikkeling elk
 * effect twee keer, en zonder deze grens telt elke paginaweergave dubbel op het
 * moment dat je zit te controleren of het werkt.
 */
export function Track({ event, params }: { event: AnalyticsEvent; params?: AnalyticsParams }) {
  const verstuurd = useRef(false)

  useEffect(() => {
    if (verstuurd.current) return
    verstuurd.current = true
    track(event, params)
    // Bewust alleen bij montage. Zou dit op `params` reageren, dan stuurt een
    // teller die per seconde oploopt ook per seconde een event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
