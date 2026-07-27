'use client'

import { useState } from 'react'

import { Penned } from './hand-drawn'
import { track } from '@/lib/analytics'

/**
 * Melden.
 *
 * De homepage is één regel ongemodereerde tekst van een vreemde. Op het moment
 * dat er twintigduizend mensen tegelijk kijken, is de kans dat daar iets staat
 * wat er niet hoort geen theoretisch risico maar een kwestie van tijd. Het
 * filter vangt het meeste af, maar niet alles: een zin kan pijnlijk zijn zonder
 * één verboden woord te bevatten.
 *
 * Daarom moet dit klein en onopvallend zijn maar altijd binnen handbereik, en
 * moet het in twee klikken klaar zijn. Drie meldingen halen een zin meteen van
 * de voorpagina, vóórdat er iemand naar kijkt. Bij dit product ís de tekst de
 * hele website plus de linkvoorbeelden die dagenlang blijven hangen, dus te
 * snel weghalen is minder erg dan te laat.
 */
export function ReportLink({ id, className = '' }: { id: number; className?: string }) {
  const [stand, setStand] = useState<'rust' | 'vragen' | 'bezig' | 'klaar' | 'fout'>('rust')

  if (stand === 'klaar') {
    return <span className={`meta text-[0.8rem] ${className}`}>Thank you, it has been flagged.</span>
  }

  if (stand === 'fout') {
    return <span className={`meta text-[0.8rem] ${className}`}>That did not go through.</span>
  }

  if (stand === 'vragen' || stand === 'bezig') {
    return (
      <span className={`meta text-[0.8rem] ${className}`}>
        Report this sentence?{' '}
        <button
          type="button"
          disabled={stand === 'bezig'}
          onClick={async () => {
            setStand('bezig')
            try {
              const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ id }),
              })
              track('report_sent', { ok: res.ok })
              setStand(res.ok ? 'klaar' : 'fout')
            } catch {
              track('report_sent', { ok: false })
              setStand('fout')
            }
          }}
          className="underline underline-offset-2 hover:text-(--flame)"
        >
          {stand === 'bezig' ? 'sending' : 'yes'}
        </button>
        {' · '}
        <button
          type="button"
          onClick={() => setStand('rust')}
          className="underline underline-offset-2"
        >
          no
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        // Ook het openen meten, niet alleen het versturen. Het verschil tussen
        // die twee is hoe vaak iemand twijfelt en zich bedenkt, en dat zegt iets
        // over hoe de zin op dat moment overkwam.
        track('report_open')
        setStand('vragen')
      }}
      className={`meta text-[0.8rem] hover:text-(--flame) ${className}`}
    >
      <Penned seed="meld-dit">report this</Penned>
    </button>
  )
}
