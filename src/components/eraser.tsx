'use client'

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'

import { RAND, STAART, grens, houding, planErase, type Plan, type Regel } from '@/lib/erase-path'

/**
 * Uitgommen in plaats van doorhalen.
 *
 * Hier stond eerst een doorhaling: een golvende streep over de oude zin. Die
 * vertelde het verkeerde verhaal. Doorhalen doe je met iets dat blíjft staan —
 * de streep is het bewijs dat er ooit iets stond. Op dit vel blijft er niets
 * staan: de zin van je voorganger is weg en het papier moet leeg zijn voor de
 * volgende.
 *
 * De eerste versie gomde met één rechte haal over het hele tekstblok, van
 * buiten het papier links tot buiten het papier rechts. Dat was sneller te
 * bouwen en meteen te zien: een gum die begint waar niets staat en eindigt waar
 * niets staat, in één vloeiende beweging, is geen gum maar een schuifdeur.
 *
 * Deze versie meet eerst waar de tekst werkelijk staat. Elke regel krijgt zijn
 * eigen haal, van de eerste letter tot de laatste letter van díé regel, met de
 * gum die er heen en weer overheen schuurt. Een zin van drie woorden is in een
 * halve seconde weg; een zin van vier regels kost vier halen met een sprong
 * terug naar de kantlijn tussen elke twee.
 *
 * Het rekenwerk staat in lib/erase-path.ts, zodat het te controleren is zonder
 * ernaar te hoeven kijken. Hier blijft alleen het meten en het tekenen over.
 */

export function Erasing({
  text,
  onDone,
  tempo = 1,
}: {
  text: string
  onDone: () => void
  /**
   * Vertrager voor de demo op /design/eraser. Dezelfde baan, langzamer
   * afgespeeld — een animatie van een seconde beoordeel je niet op een seconde.
   */
  tempo?: number
}) {
  const reduce = useReducedMotion()

  const doos = useRef<HTMLSpanElement>(null)
  const zetsel = useRef<HTMLSpanElement>(null)

  const [plan, setPlan] = useState<(Plan & { hoogte: number }) | null>(null)
  const klok = useMotionValue(0)

  /**
   * Opmeten waar de regels staan.
   *
   * Een Range over de tekstknoop geeft de rechthoeken van de regels die de
   * browser daadwerkelijk heeft afgebroken — inclusief wat `text-wrap: balance`
   * ervan gemaakt heeft. Zelf woorden opmeten en groeperen zou hetzelfde
   * antwoord moeten geven, maar alleen zolang je elke afbreekregel die de
   * layout-engine kent ook zelf naspeelt.
   */
  useEffect(() => {
    const blok = doos.current
    const tekst = zetsel.current
    if (!blok || !tekst) return

    const kader = blok.getBoundingClientRect()
    const bereik = document.createRange()
    bereik.selectNodeContents(tekst)

    const gemaakt = planErase(
      Array.from(bereik.getClientRects()).map((r) => ({
        top: r.top - kader.top,
        bottom: r.bottom - kader.top,
        left: r.left - kader.left,
        right: r.right - kader.left,
      })),
      kader.height,
    )

    // Niets te gommen — dan hoeft er ook niet gewacht te worden.
    if (!gemaakt) {
      onDone()
      return
    }
    setPlan({ ...gemaakt, hoogte: kader.height })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* De haal zelf. Lineair, want alle versnelling zit al in de baan. */
  useEffect(() => {
    if (reduce) {
      const timer = setTimeout(onDone, 240)
      return () => clearTimeout(timer)
    }
    if (!plan) return

    // onComplete en niet de finished-promise: die laatste blijft hangen als de
    // animatie wordt afgebroken, en dan blijft het bord op de oude zin staan.
    const bezig = animate(klok, plan.einde, {
      duration: plan.einde * tempo,
      ease: 'linear',
      onComplete: onDone,
    })
    return () => bezig.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, reduce, tempo])

  if (reduce) {
    return (
      <span aria-hidden="true" className="block opacity-35">
        {text}
      </span>
    )
  }

  return (
    <span ref={doos} className="relative block">
      {/* Deze bepaalt de hoogte van het blok en levert de regelposities. Tot er
          gemeten is staat hij er gewoon zichtbaar; daarna nemen de lagen het
          over en verdwijnt hij zonder zijn ruimte op te geven. */}
      <span
        ref={zetsel}
        aria-hidden="true"
        className="block"
        style={{ visibility: plan ? 'hidden' : 'visible' }}
      >
        {text}
      </span>

      {plan?.regels.map((regel, i) => (
        <LijnLaag key={i} klok={klok} regel={regel} tekst={text} hoogte={plan.hoogte} />
      ))}

      {plan && <GumLaag klok={klok} regels={plan.regels} einde={plan.einde} />}
    </span>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * Eén regel tekst, met zijn eigen grens.
 *
 * Elke laag toont de hele zin maar laat er met clip-path alleen zijn eigen
 * regel van zien. Dat is bewust: de tekst in losse regels opknippen zou de
 * afbreking van de browser moeten naspelen, en die klopt per definitie beter
 * dan wat wij ervan zouden maken.
 */
function LijnLaag({
  klok,
  regel,
  tekst,
  hoogte,
}: {
  klok: MotionValue<number>
  regel: Regel
  tekst: string
  hoogte: number
}) {
  const g = useTransform(klok, (k) => grens(regel, k))
  const voor = useTransform(g, (v) => v + RAND)
  const achter = useTransform(g, (v) => v - STAART)

  const inkt = useMotionTemplate`linear-gradient(94deg, transparent ${g}px, #000 ${voor}px)`
  const veeg = useMotionTemplate`linear-gradient(94deg, transparent ${achter}px, rgba(0,0,0,0.65) ${g}px, transparent ${voor}px)`

  const band = `inset(${regel.boven.toFixed(1)}px 0 ${(hoogte - regel.onder).toFixed(1)}px 0)`

  return (
    <>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block"
        style={{ clipPath: band, maskImage: inkt, WebkitMaskImage: inkt }}
      >
        {tekst}
      </motion.span>

      {/* De veeg die achter de gum aan hangt. Zonder dit is het een nette wipe;
          met dit is het iets dat met moeite van het papier af gaat. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block text-(--ink-soft)"
        style={{
          clipPath: band,
          maskImage: veeg,
          WebkitMaskImage: veeg,
          opacity: 0.32,
          filter: 'blur(1.6px)',
        }}
      >
        {tekst}
      </motion.span>
    </>
  )
}

function GumLaag({
  klok,
  regels,
  einde,
}: {
  klok: MotionValue<number>
  regels: Regel[]
  einde: number
}) {
  const x = useTransform(klok, (k) => houding(k, regels, einde).x)
  const y = useTransform(klok, (k) => houding(k, regels, einde).y)
  const hoek = useTransform(klok, (k) => houding(k, regels, einde).hoek)
  const schaal = useTransform(klok, (k) => houding(k, regels, einde).schaal)
  const dekking = useTransform(klok, (k) => houding(k, regels, einde).dekking)

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-10 block"
      // left/top zetten de gum op de gemeten plek; de x/y van -50% trekken hem
      // daar vervolgens omheen in plaats van eronder vandaan.
      style={{
        left: x,
        top: y,
        x: '-50%',
        y: '-50%',
        rotate: hoek,
        scale: schaal,
        opacity: dekking,
      }}
    >
      <Gum />
    </motion.span>
  )
}

/**
 * Het gummetje.
 *
 * Bewust een tekening en geen foto. Een uitgeknipte productfoto op een vel dat
 * verder helemaal met de pen is gezet, verraadt in één oogopslag dat het geen
 * papier is — precies wat de rest van deze site zo hard probeert te vermijden.
 * Dit is de klassieke tweekleurige gum, met de inktrand van de site eromheen.
 */
function Gum() {
  // Twee gums tegelijk komt niet voor, maar een id dat botst geeft een fout die
  // je pas ziet als hij optreedt. useId kost niets.
  const uid = useId().replace(/:/g, '')
  const vlak = `gum-vlak-${uid}`
  const vorm = `gum-vorm-${uid}`

  return (
    <svg aria-hidden="true" viewBox="0 0 104 46" className="h-auto w-18.5 sm:w-23.5">
      <defs>
        <linearGradient id={vlak} x1="0" y1="0" x2="1" y2="0">
          {/* Twee stops op dezelfde offset: dat geeft een harde scheiding in
              plaats van een verloop, zoals bij een echte tweekleurige gum. */}
          <stop offset="0.57" stopColor="#d24b36" />
          <stop offset="0.57" stopColor="#5c6e99" />
        </linearGradient>
        <clipPath id={vorm}>
          <rect x="6" y="8" width="92" height="28" rx="7" />
        </clipPath>
      </defs>

      {/* De gum ligt op het papier, hij zit er niet in. */}
      <ellipse cx="54" cy="39.5" rx="40" ry="3.6" fill="#22241d" opacity="0.13" />

      <g clipPath={`url(#${vorm})`}>
        <rect x="6" y="8" width="92" height="28" fill={`url(#${vlak})`} />
        {/* De crèmekleurige band die op dit soort gummen de twee helften scheidt. */}
        <path d="M 25 8 L 31 8 L 26 36 L 20 36 Z" fill="#f7f2e6" opacity="0.9" />
        {/* Licht van boven, schaduw van onder. Meer is niet nodig om er een
            blok van te maken in plaats van een gekleurde rechthoek. */}
        <rect x="6" y="8" width="92" height="7" fill="#ffffff" opacity="0.22" />
        <rect x="6" y="30" width="92" height="6" fill="#22241d" opacity="0.14" />
      </g>

      <rect
        x="6"
        y="8"
        width="92"
        height="28"
        rx="7"
        fill="none"
        stroke="var(--stroke)"
        strokeWidth="2"
        opacity="0.85"
      />

      {/* Gruis. Zonder dit schuift er een blokje langs; met dit schuurt er iets
          over papier. */}
      <circle cx="13" cy="41" r="1.6" fill="#22241d" opacity="0.3" />
      <circle cx="23" cy="43.5" r="1.1" fill="#22241d" opacity="0.24" />
      <circle cx="34" cy="40.5" r="1.3" fill="#22241d" opacity="0.18" />
    </svg>
  )
}
