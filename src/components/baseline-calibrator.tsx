'use client'

import { useEffect } from 'react'

/**
 * Zorgt dat tekst altijd op de lijn staat, ongeacht lettertype of lettergrootte.
 *
 * Het uitgangspunt is dat de basislijn binnen een regelblok lineair meebeweegt
 * met de lettergrootte:
 *
 *     basislijn = C + lettergrootte * k
 *
 * C en k zijn eigenschappen van het lettertype en de regelhoogte. Ze zijn niet
 * uit CSS af te leiden, want de browser geeft ascender en descender nergens
 * prijs. Ze wel hardcoderen is precies wat er misging: een getal dat bij één
 * grootte klopt, laat elke andere grootte tussen de lijnen zweven. En zolang de
 * echte letter nog laadt, gelden de metrieken van de terugvalletter, die weer
 * anders zijn.
 *
 * Dus meten we het hier, in de browser, met de letter die daadwerkelijk in
 * gebruik is: twee groottes, twee basislijnen, en daar volgen C en k uit.
 * De CSS rekent er vervolgens per element de verschuiving mee uit, zodat elke
 * grootte vanzelf klopt.
 *
 * Wordt opnieuw gedaan zodra de letters geladen zijn en bij elke breekpuntwissel,
 * want de regelhoogte verandert mee.
 */
export function BaselineCalibrator() {
  useEffect(() => {
    const root = document.documentElement

    const kalibreer = () => {
      const lineH = parseFloat(getComputedStyle(root).getPropertyValue('--line-h'))
      if (!Number.isFinite(lineH) || lineH <= 0) return

      const host = document.createElement('div')
      host.setAttribute('aria-hidden', 'true')
      host.style.cssText =
        'position:absolute;left:-9999px;top:0;visibility:hidden;contain:strict;width:600px'
      document.body.appendChild(host)

      const meet = (size: number): number => {
        const p = document.createElement('p')
        p.style.cssText = `margin:0;font-size:${size}px;line-height:${lineH}px`
        p.textContent = 'Hxpg'
        const probe = document.createElement('span')
        // Een inline-block zonder hoogte valt met zijn onderrand samen met de
        // basislijn, dus zijn bovenkant is precies de basislijn.
        probe.style.cssText =
          'display:inline-block;width:0;height:0;vertical-align:baseline'
        p.prepend(probe)
        host.appendChild(p)
        const y = probe.getBoundingClientRect().top - p.getBoundingClientRect().top
        host.removeChild(p)
        return y
      }

      // Twee ver uit elkaar liggende groottes geven de nauwkeurigste helling.
      const klein = 14
      const groot = 40
      const bKlein = meet(klein)
      const bGroot = meet(groot)
      document.body.removeChild(host)

      const k = (bGroot - bKlein) / (groot - klein)
      const c = bKlein - klein * k

      if (!Number.isFinite(k) || !Number.isFinite(c)) return

      root.style.setProperty('--baseline-k', k.toFixed(5))
      root.style.setProperty('--baseline-c', `${c.toFixed(3)}px`)
      root.dataset.baselineCalibrated = 'ja'
    }

    kalibreer()

    // De terugvalletter heeft andere metrieken dan de echte; opnieuw meten
    // zodra Shantell Sans er is, anders verspringt alles op het moment dat
    // de letter binnenkomt.
    if (document.fonts?.ready) {
      void document.fonts.ready.then(kalibreer)
    }

    // De regelhoogte verandert op het mobiele breekpunt.
    const media = window.matchMedia('(max-width: 640px)')
    media.addEventListener('change', kalibreer)

    let resizeTimer: number | undefined
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(kalibreer, 150)
    }
    window.addEventListener('resize', onResize)

    return () => {
      media.removeEventListener('change', kalibreer)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [])

  return null
}
