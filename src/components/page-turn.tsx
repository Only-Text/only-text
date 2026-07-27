'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/**
 * Een blaadje van een notitieblok dat omslaat.
 *
 * Het verschil met een boekpagina is het scharnier: een blok zit aan de
 * BOVENkant vast, met lijm of ringen. De beweging kantelt dus om een
 * horizontale as bovenaan, niet om een verticale rug. Daarom rotateX en niet
 * rotateY, en daarom komt de onderrand als eerste los.
 *
 * De vier fasen uit de beschrijving zitten in de keyframes:
 *
 *   0 tot 15%   loskomen. De onderrand licht op, het blad is nog bijna plat.
 *               Onder de rand verschijnt een dunne, harde slagschaduw.
 *   15 tot 50%  opzwaaien naar verticaal, versnellend. Halverwege staat het
 *               blad loodrecht en is het van voren bijna onzichtbaar smal.
 *   50 tot 85%  de zwaartekracht neemt het over: het valt naar de andere kant,
 *               iets sneller dan het omhoogging. De achterkant is nu in beeld.
 *   85 tot 100% uitdempen. De onderrand tikt aan, veert een paar millimeter
 *               terug en zakt weg, met nog een veel kleinere naschommeling.
 *
 * Twee details die het verschil maken tussen "vlak dat kantelt" en "papier":
 * de as ligt een paar pixels bóven de rand zodat het blad niet in de ondergrond
 * snijdt, en het vlak vangt rond het verticale moment kort meer licht.
 */

type TurnState = { turnTo: (href: string) => void; turning: boolean }

const TurnContext = createContext<TurnState>({ turnTo: () => {}, turning: false })

export function useTurnTo() {
  return useContext(TurnContext).turnTo
}

/** Sneller voelt digitaal, trager voelt als karton. */
const DUUR = 0.55

/**
 * Levert de context. Alles binnen deze provider kan een omslag aanvragen;
 * alleen wat in <Turnable> zit draait mee. De navigatie eronder hoort bij het
 * bureau en niet bij het blok, dus die blijft liggen.
 */
export function TurnablePage({ children }: { children: ReactNode }) {
  const router = useRouter()
  const reduce = useReducedMotion()
  const [turning, setTurning] = useState(false)

  const turnTo = useCallback(
    (href: string) => {
      if (reduce) {
        router.push(href)
        return
      }
      setTurning(true)
      // Navigeren rond het moment dat het blad al bijna ligt: eerder is de
      // wissel zichtbaar, later staar je naar een weggedraaid vel.
      window.setTimeout(() => router.push(href), DUUR * 1000 * 0.78)
    },
    [reduce, router],
  )

  return <TurnContext.Provider value={{ turnTo, turning }}>{children}</TurnContext.Provider>
}

export function Turnable({ children }: { children: ReactNode }) {
  const { turning } = useContext(TurnContext)

  const tijden = [0, 0.15, 0.5, 0.85, 0.92, 0.97, 1]

  return (
    <div
      style={{
        // Perspectief hoort op de OUDER. Op het draaiende element zelf gezet
        // gebeurt er in 3D niets zichtbaars.
        perspective: '1500px',
        perspectiveOrigin: '50% 0%',
        position: 'relative',
      }}
    >
      {/* De slagschaduw op het blok eronder. Begint als een dunne harde lijn
          onder de opkomende rand en wordt groter en zachter naarmate het blad
          verder van het papier af komt. */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={
          turning
            ? { opacity: [0, 0.5, 0.34, 0.14, 0.06, 0.03, 0], scaleY: [0.2, 0.5, 1, 1.35, 1.1, 1, 1] }
            : { opacity: 0, scaleY: 0.2 }
        }
        transition={{ duration: DUUR, times: tijden, ease: 'linear' }}
        className="pointer-events-none absolute inset-x-2 bottom-0 origin-bottom"
        style={{
          height: 46,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.42), rgba(0,0,0,0.16) 45%, rgba(0,0,0,0) 100%)',
          filter: 'blur(6px)',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={false}
        animate={
          turning
            ? {
                rotateX: [0, -11, -90, -168, -184, -177, -180],
                // Papier is stijf genoeg om vorm te houden maar te slap om vlak
                // te blijven; die lichte inzakking rond het kantelpunt is wat
                // de kromming suggereert zonder de geometrie echt te buigen.
                scaleY: [1, 0.995, 0.972, 0.992, 1.004, 0.999, 1],
              }
            : { rotateX: 0, scaleY: 1 }
        }
        transition={{
          duration: DUUR,
          times: tijden,
          // Rustig starten, versnellen rond het kantelpunt, afremmen met een
          // lichte overshoot. Bewust niet symmetrisch.
          ease: [0.42, 0, 0.2, 1],
        }}
        style={{
          // Een paar pixels bóven de rand, anders snijdt het blad bij het
          // opkomen door de ondergrond heen.
          transformOrigin: '50% -7px',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ backfaceVisibility: 'hidden' }}>{children}</div>

        {/* De achterkant: hetzelfde papier, geen tekst. Wat je op de rug van
            een blaadje ziet is de liniatuur en wat inkt die doorschijnt. */}
        <div
          aria-hidden="true"
          className="sheet ruled pointer-events-none absolute inset-0"
          style={{
            transform: 'rotateX(180deg)',
            backfaceVisibility: 'hidden',
            opacity: 0.97,
            boxShadow: 'none',
          }}
        />

        {/* Belichting. Het opkomende vlak vangt meer licht en wordt kort
            helderder, precies rond het verticale moment. */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: turning ? [0, 0.05, 0.2, 0.06, 0.02, 0, 0] : 0 }}
          transition={{ duration: DUUR, times: tijden, ease: 'linear' }}
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, #fff, rgba(255,255,255,0.2) 70%)' }}
        />
      </motion.div>
    </div>
  )
}

/**
 * Een link die eerst de bladzijde omslaat en daarna pas navigeert.
 * Middelklik, ctrl-klik en "openen in nieuw tabblad" blijven gewoon werken.
 */
export function TurnLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  const turnTo = useTurnTo()

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }
        event.preventDefault()
        turnTo(href)
      }}
    >
      {children}
    </a>
  )
}
