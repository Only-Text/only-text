/**
 * Handgetekende vormen.
 *
 * Geen bibliotheek: een kleine deterministische ruisgenerator maakt een pad dat
 * er met de hand getrokken uitziet, en tekent het twee keer met een minieme
 * afwijking — precies wat iemand doet die met een pen een kader om iets zet.
 *
 * Deterministisch is belangrijk. Met Math.random() zou de server een ander pad
 * renderen dan de browser, en dan klapt React's hydratie eruit. De seed komt
 * daarom uit een string die aan het element vastzit.
 */

import type { CSSProperties, ReactNode } from 'react'

/** Kleine, snelle hashfunctie. Zelfde tekst in, altijd hetzelfde pad uit. */
function seedFrom(text: string): () => number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Point = [number, number]

/** Verplaatst een punt een klein beetje, zodat de lijn niet wiskundig recht is. */
function jitter(rand: () => number, [x, y]: Point, amount: number): Point {
  return [x + (rand() - 0.5) * amount, y + (rand() - 0.5) * amount]
}

/**
 * Een rechthoek met afgeronde hoeken, maar dan getekend: elke zijde krijgt een
 * lichte boog en de hoeken sluiten niet perfect aan.
 */
function roughRect(
  rand: () => number,
  w: number,
  h: number,
  radius: number,
  wobble: number,
): string {
  const r = Math.min(radius, w / 2, h / 2)
  const p = (x: number, y: number): Point => jitter(rand, [x, y], wobble)

  const a = p(r, 1)
  const b = p(w - r, 1)
  const c = p(w - 1, r)
  const d = p(w - 1, h - r)
  const e = p(w - r, h - 1)
  const f = p(r, h - 1)
  const g = p(1, h - r)
  const i = p(1, r)

  // De controlepunten krijgen ook ruis: dat maakt het verschil tussen
  // "afgeronde rechthoek" en "met de hand getrokken".
  const bow = (from: Point, to: Point): string => {
    const mx = (from[0] + to[0]) / 2 + (rand() - 0.5) * wobble * 2.2
    const my = (from[1] + to[1]) / 2 + (rand() - 0.5) * wobble * 2.2
    return `Q ${mx.toFixed(2)} ${my.toFixed(2)} ${to[0].toFixed(2)} ${to[1].toFixed(2)}`
  }

  return [
    `M ${a[0].toFixed(2)} ${a[1].toFixed(2)}`,
    bow(a, b),
    `Q ${w} ${1} ${c[0].toFixed(2)} ${c[1].toFixed(2)}`,
    bow(c, d),
    `Q ${w} ${h} ${e[0].toFixed(2)} ${e[1].toFixed(2)}`,
    bow(e, f),
    `Q ${1} ${h} ${g[0].toFixed(2)} ${g[1].toFixed(2)}`,
    bow(g, i),
    `Q ${1} ${1} ${a[0].toFixed(2)} ${a[1].toFixed(2)}`,
  ].join(' ')
}

/** Een ovaal alsof iemand een woord omcirkelt — nooit helemaal gesloten. */
function roughEllipse(rand: () => number, w: number, h: number, wobble: number): string {
  const cx = w / 2
  const cy = h / 2
  const rx = w / 2 - 2
  const ry = h / 2 - 2
  const steps = 22
  // Iets meer dan een hele ronde, zodat het einde het begin voorbijschiet.
  const total = Math.PI * 2 + 0.35
  const start = -0.4

  const pts: string[] = []
  for (let s = 0; s <= steps; s++) {
    const t = start + (s / steps) * total
    const x = cx + Math.cos(t) * rx + (rand() - 0.5) * wobble
    const y = cy + Math.sin(t) * ry + (rand() - 0.5) * wobble
    pts.push(`${s === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

type FrameProps = {
  /** Bepaalt het pad. Zelfde seed = zelfde vorm, op server en in de browser. */
  seed: string
  shape?: 'rect' | 'ellipse'
  wobble?: number
  radius?: number
  /** Twee lijnen over elkaar, zoals iemand die het kader nog eens natrekt. */
  passes?: number
  strokeWidth?: number
  className?: string
  style?: CSSProperties
}

/**
 * Tekent het kader als achtergrond van zijn ouder. De ouder moet
 * `position: relative` hebben.
 */
export function HandFrame({
  seed,
  shape = 'rect',
  wobble = 3.4,
  radius = 12,
  passes = 2,
  strokeWidth = 1.7,
  className = '',
  style,
}: FrameProps) {
  // Vaste viewBox die met preserveAspectRatio="none" wordt uitgerekt: zo hoeven
  // we de echte pixelmaat niet te kennen en werkt dezelfde vorm bij elke breedte.
  const W = 200
  const H = 56

  const paths: string[] = []
  for (let i = 0; i < passes; i++) {
    const rand = seedFrom(`${seed}#${i}`)
    paths.push(
      shape === 'ellipse'
        ? roughEllipse(rand, W, H, wobble)
        : roughRect(rand, W, H, radius, wobble),
    )
  }

  // Elke doorgang staat een halve graad scheef ten opzichte van de vorige.
  // Dat is wat het verschil maakt tussen "twee keer hetzelfde pad" en "iemand
  // die het kader nog een keer natrekt en er net naast zit".
  const kanteling = [0, -0.6, 0.5]

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${className}`}
      style={style}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--stroke)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          // Zonder dit rekt de lijndikte mee met de vorm: een brede knop krijgt
          // dan dunne verticale randen en dikke horizontale.
          vectorEffect="non-scaling-stroke"
          opacity={i === 0 ? 0.92 : 0.45}
          transform={`rotate(${kanteling[i] ?? 0} ${W / 2} ${H / 2})`}
        />
      ))}
    </svg>
  )
}

type ButtonProps = {
  children: ReactNode
  seed?: string
  shape?: 'rect' | 'ellipse'
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  className?: string
  title?: string
}

/**
 * Een knop die eruitziet alsof hij met pen op het papier is gezet.
 * Bij indrukken zakt hij een pixel — alsof je op het papier drukt.
 */
export function HandButton({
  children,
  seed,
  shape = 'rect',
  type = 'button',
  disabled,
  onClick,
  className = '',
  title,
}: ButtonProps) {
  const key = seed ?? (typeof children === 'string' ? children : 'knop')

  // Hoogte precies één regel, zonder verticale padding: elke pixel extra duwt
  // alles wat eronder staat van de liniatuur af.
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`hand relative inline-flex h-(--line-h) items-center justify-center px-6 leading-(--line-h) transition-transform duration-100 active:translate-y-px disabled:opacity-40 ${className}`}
      style={{ fontVariationSettings: "'BNCE' 30, 'INFM' 25" }}
    >
      <HandFrame seed={key} shape={shape} />
      <span className="relative">{children}</span>
    </button>
  )
}

/** Een handgetekend kader om willekeurige inhoud. */
export function HandBox({
  children,
  seed,
  className = '',
}: {
  children: ReactNode
  seed: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <HandFrame seed={seed} wobble={2.2} strokeWidth={1.6} passes={1} />
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * Een golvende onderstreping, zoals iemand die iets aanstreept.
 * Gebruikt voor links en voor de actieve navigatie.
 */
export function HandUnderline({ seed = 'lijn' }: { seed?: string }) {
  const rand = seedFrom(seed)
  const pts: string[] = []
  for (let i = 0; i <= 12; i++) {
    const x = (i / 12) * 100
    const y = 4 + (rand() - 0.5) * 2.6
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`)
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-1 left-0 h-[6px] w-full"
    >
      <path
        d={pts.join(' ')}
        fill="none"
        stroke="var(--stroke)"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}
