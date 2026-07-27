'use client'

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useId } from 'react'

/**
 * Uitgommen in plaats van doorhalen.
 *
 * Hier stond eerst een doorhaling: een golvende streep die van links naar
 * rechts over de oude zin werd getrokken. Die vertelde het verkeerde verhaal.
 * Doorhalen doe je met iets dat blíjft staan — de streep is het bewijs dat er
 * ooit iets stond. Op dit vel blijft er niets staan: de zin van je voorganger
 * is weg en het papier moet leeg zijn voor de volgende.
 *
 * Het loste bovendien een layoutprobleem niet op maar maakte het erger. De
 * doorgehaalde zin bleef staan terwijl de nieuwe er al onder gerenderd werd,
 * dus het vel werd tijdens de wissel ineens een paar regels langer en klapte
 * daarna weer terug. Nu staat er op elk moment precies één zin op het vel:
 * eerst gaat de oude weg, dan komt de nieuwe.
 */

/** Hoe lang de haal duurt. Korter voelt als wissen, langer als schrobben. */
const DUUR = 1.05

export function Erasing({ text, onDone }: { text: string; onDone: () => void }) {
  const reduce = useReducedMotion()

  /**
   * De positie van de gum, in procenten van de breedte van de zin. Hij begint
   * links buiten de tekst en eindigt rechts erbuiten, zodat de eerste en de
   * laatste letter net zo goed geraakt worden als alles ertussen.
   */
  const x = useMotionValue(-24)

  // De rand loopt vóór de gum uit. Een harde grens leest als een schuifdeur;
  // een verloop van een procent of vijftien leest als inkt die loslaat.
  const voor = useTransform(x, (v) => v + 15)
  const staart = useTransform(x, (v) => v - 28)
  const gumX = useTransform(x, (v) => `${(v + 5).toFixed(2)}%`)

  // Wat rechts van de gum ligt staat er nog; links ervan is het weg. De hoek
  // is niet 90 graden: niemand gomt kaarsrecht.
  const inkt = useMotionTemplate`linear-gradient(96deg, transparent ${x}%, #000 ${voor}%)`

  // En wat net weg is laat een veeg achter die vanzelf uitdooft.
  const veeg = useMotionTemplate`linear-gradient(96deg, transparent ${staart}%, rgba(0,0,0,0.65) ${x}%, transparent ${voor}%)`

  useEffect(() => {
    // Zonder animatie geen gum: dan is het gewoon weg en komt de nieuwe zin.
    if (reduce) {
      const timer = setTimeout(onDone, 240)
      return () => clearTimeout(timer)
    }

    // onComplete en niet de finished-promise: die laatste blijft hangen als de
    // animatie wordt afgebroken, en dan blijft het bord op de oude zin staan.
    const bezig = animate(x, 122, {
      duration: DUUR,
      ease: [0.5, 0, 0.5, 1],
      onComplete: onDone,
    })
    return () => bezig.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (reduce) {
    return (
      <span aria-hidden="true" className="block opacity-35">
        {text}
      </span>
    )
  }

  return (
    <span className="relative block">
      {/* De inkt die verdwijnt. Deze staat in de normale stroom en bepaalt dus
          de hoogte van het blok — de twee lagen hieronder liggen erover. */}
      <motion.span
        aria-hidden="true"
        className="block"
        style={{ maskImage: inkt, WebkitMaskImage: inkt }}
      >
        {text}
      </motion.span>

      {/* De veeg: hetzelfde vel tekst, maar alleen zichtbaar in een smalle band
          achter de gum aan. Zonder dit is het een nette wipe; met dit is het
          iets dat met moeite van het papier af gaat. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block text-(--ink-soft)"
        style={{
          maskImage: veeg,
          WebkitMaskImage: veeg,
          opacity: 0.3,
          filter: 'blur(1.7px)',
        }}
      >
        {text}
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 z-10 -mt-[17px] -ml-[37px] block sm:-mt-[21px] sm:-ml-[47px]"
        style={{ left: gumX }}
      >
        {/* Het heen-en-weer zit op een eigen laag, zodat het onafhankelijk van
            de doorlopende beweging naar rechts kan blijven lopen. */}
        <motion.span
          className="block"
          animate={{ rotate: [-8, -2.5, -10, -4, -8], y: [0, -2.5, 1.5, -1.5, 0] }}
          transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Gum />
        </motion.span>
      </motion.span>
    </span>
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
    <svg
      aria-hidden="true"
      viewBox="0 0 104 46"
      className="h-auto w-[74px] sm:w-[94px]"
    >
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
