import { seedFrom } from './hand-drawn'

/**
 * Grafieken met potlood getekend.
 *
 * Geen grafiekbibliotheek. De kleinste weegt meer dan deze hele site, en
 * belangrijker: elke bibliotheek tekent wiskundig rechte assen met vaste
 * tickafstanden, en dat is precies waaraan je ziet dat het geen papier is.
 * Niemand tekent een staafdiagram met een liniaal in een notitieboek.
 *
 * Potlood en geen pen, en dat zit in drie dingen. De kleur is grafiet en niet
 * inktzwart. Elke haal wordt twee keer getrokken, met een minieme afwijking en
 * verschillende dekking, want een potloodlijn heeft geen scherpe rand. En een
 * vlak wordt gearceerd in plaats van gevuld: met een potlood kun je niet
 * inkleuren, dus je zet er schuine streepjes in.
 *
 * Dezelfde deterministische ruisgenerator als de kaders, om dezelfde reden: met
 * Math.random() zou de server een ander pad tekenen dan de browser en klapt de
 * hydratie eruit. De seed komt uit het label, dus dezelfde staaf ziet er bij
 * elke herlading hetzelfde uit maar verschilt van de staaf eronder.
 */

type Reeks = { label: string; waarde: number; hint?: string }

/** Grafiet, niet inkt. Alle lijnen in deze grafieken gebruiken deze kleur. */
const GRAFIET = 'var(--ink-soft)'

/** Eén letterinstelling voor alle tekst: hetzelfde handschrift als de site. */
const SCHRIFT = (grootte: number) => ({ font: `400 ${grootte}px var(--font-hand)` })

/** Een lijn van links naar rechts die in het midden doorzakt, zoals een pols. */
function haal(rand: () => number, x1: number, y1: number, x2: number, y2: number, bow: number) {
  const stappen = 8
  const punten: string[] = []
  for (let i = 0; i <= stappen; i++) {
    const t = i / stappen
    const x = x1 + (x2 - x1) * t
    const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * bow + (rand() - 0.5) * 1.1
    punten.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`)
  }
  return punten.join(' ')
}

/**
 * Twee halen over elkaar met verschillende dekking.
 *
 * Dit is het verschil tussen pen en potlood. Eén strakke lijn van 1,5 dik leest
 * als inkt; twee dunnere lijnen die net niet samenvallen leveren de zachte,
 * korrelige rand die grafiet op papier heeft.
 */
function Potloodlijn({ d, dd, width = 1.15 }: { d: string; dd: string; width?: number }) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={GRAFIET}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.82}
      />
      <path
        d={dd}
        fill="none"
        stroke={GRAFIET}
        strokeWidth={width * 0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.38}
      />
    </>
  )
}

/** Het kader van een staaf: boven, rechts, onder. Links staat de as al. */
function staafPad(rand: () => number, x: number, y: number, breedte: number, h: number) {
  return [
    haal(rand, x, y, x + breedte, y, 0.6),
    haal(rand, x + breedte, y, x + breedte, y + h, 0.35),
    haal(rand, x + breedte, y + h, x, y + h, -0.6),
  ].join(' ')
}

/**
 * Arcering: schuine streepjes die het vlak vullen.
 *
 * Niet helemaal regelmatig, en af en toe ontbreekt er een. Een perfect
 * gelijkmatige arcering is weer een raster, en dan ben je terug bij de liniaal.
 */
function arcering(rand: () => number, x: number, y: number, breedte: number, hoogte: number) {
  const lijnen: string[] = []
  const afstand = 4.5
  for (let d = -hoogte; d < breedte; d += afstand) {
    const x1 = x + Math.max(d, 0)
    const y1 = y + hoogte - Math.max(-d, 0)
    const x2 = x + Math.min(d + hoogte, breedte)
    const y2 = y + hoogte - Math.min(d + hoogte, breedte) + d
    if (x2 - x1 < 1.5) continue
    if (rand() < 0.14) continue
    // De streepjes komen niet allemaal even ver: de pols haalt niet elke keer
    // de rand, en dat is precies wat het handgetekend maakt.
    const kort = rand() * 1.8
    lijnen.push(
      `M ${(x1 + kort).toFixed(1)} ${Math.min(y1, y + hoogte).toFixed(1)} L ${x2.toFixed(1)} ${Math.max(y2, y).toFixed(1)}`,
    )
  }
  return lijnen.join(' ')
}

function Arcering({ d }: { d: string }) {
  if (!d) return null
  return (
    <path
      d={d}
      fill="none"
      stroke={GRAFIET}
      strokeWidth={0.9}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      opacity={0.34}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Staven, liggend                                                     */
/* ------------------------------------------------------------------ */

/**
 * Liggende staven met het label ernaast.
 *
 * Liggend en niet staand: de labels zijn hostnamen en landen, en die passen
 * staand nooit zonder ze schuin te zetten of af te korten.
 */
export function HandBars({
  data,
  seed,
  eenheid = '',
}: {
  data: Reeks[]
  seed: string
  eenheid?: string
}) {
  if (data.length === 0) return null

  const hoogste = Math.max(...data.map((d) => d.waarde), 1)
  const regel = 30
  const H = data.length * regel + 10
  const W = 340
  const labelBreedte = 132
  const spoor = W - labelBreedte - 56

  // Breedte begrenzen en niet de hoogte. Met een maxHeight vecht de begrenzing
  // tegen de verhouding van de viewBox: de tekening krimpt dan om in de hoogte
  // te passen en blijft met witruimte ernaast halverwege hangen.
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-1 block h-auto w-full max-w-110 overflow-visible"
      role="img"
      aria-label={data.map((d) => `${d.label}: ${d.waarde}`).join(', ')}
    >
      {data.map((d, i) => {
        const rand = seedFrom(`${seed}:${d.label}`)
        const rand2 = seedFrom(`${seed}:${d.label}:2`)
        const y = i * regel + 7
        const breedte = Math.max((d.waarde / hoogste) * spoor, d.waarde > 0 ? 3 : 0)
        const h = 14

        return (
          <g key={d.label}>
            <text
              x={labelBreedte - 7}
              y={y + h - 2}
              textAnchor="end"
              fill={GRAFIET}
              style={SCHRIFT(11)}
            >
              {d.label.length > 22 ? `${d.label.slice(0, 21)}…` : d.label}
            </text>

            {breedte > 0 && (
              <>
                <Potloodlijn
                  d={staafPad(rand, labelBreedte, y, breedte, h)}
                  dd={staafPad(rand2, labelBreedte, y + 0.4, breedte, h)}
                />
                <Arcering d={arcering(rand, labelBreedte, y, breedte, h)} />
              </>
            )}

            <text x={labelBreedte + breedte + 8} y={y + h - 2} fill={GRAFIET} style={SCHRIFT(11)}>
              {d.hint ?? `${d.waarde}${eenheid}`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* De trechter                                                         */
/* ------------------------------------------------------------------ */

/**
 * Staven die versmallen, met het verlies eronder.
 *
 * Dezelfde indeling als de gewone staven: label links, staaf rechts. Het label
 * boven de staaf zetten leek logischer maar botste met de regel eronder zodra
 * er ook nog "zoveel haakten hier af" bij kwam, en dan loopt de hele trechter
 * over zichzelf heen.
 *
 * Het getal dat je wil zien is niet hoeveel er overbleven maar hoeveel er
 * afvielen, en waar. Dat staat daarom apart onder elke staaf en niet als
 * percentage achteraan de regel.
 */
export function HandFunnel({ stappen, seed }: { stappen: Reeks[]; seed: string }) {
  if (stappen.length === 0) return null

  const top = Math.max(stappen[0]?.waarde ?? 0, 1)
  const regel = 44
  const W = 340
  const labelBreedte = 132
  const spoor = W - labelBreedte - 62
  const H = stappen.length * regel + 8

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-1 block h-auto w-full max-w-115 overflow-visible"
      role="img"
      aria-label={stappen.map((s) => `${s.label}: ${s.waarde}`).join(', ')}
    >
      {stappen.map((s, i) => {
        const rand = seedFrom(`${seed}:${s.label}`)
        const rand2 = seedFrom(`${seed}:${s.label}:2`)
        const y = i * regel + 8
        const breedte = Math.max((s.waarde / top) * spoor, s.waarde > 0 ? 4 : 0)
        const h = 17
        const vorige = stappen[i - 1]
        const verloren = vorige ? vorige.waarde - s.waarde : 0
        const deel = top > 0 ? Math.round((s.waarde / top) * 100) : 0

        return (
          <g key={s.label}>
            <text
              x={labelBreedte - 7}
              y={y + h - 3}
              textAnchor="end"
              fill={GRAFIET}
              style={SCHRIFT(11.5)}
            >
              {s.label}
            </text>

            {breedte > 0 && (
              <>
                <Potloodlijn
                  d={staafPad(rand, labelBreedte, y, breedte, h)}
                  dd={staafPad(rand2, labelBreedte, y + 0.4, breedte, h)}
                  width={1.25}
                />
                <Arcering d={arcering(rand, labelBreedte, y, breedte, h)} />
              </>
            )}

            <text x={labelBreedte + breedte + 8} y={y + h - 3} fill={GRAFIET} style={SCHRIFT(11.5)}>
              {s.waarde} · {deel}%
            </text>

            {/* Wie hier afviel. Alleen tekenen als er iets te verliezen viel. */}
            {vorige && verloren > 0 && (
              <text
                x={labelBreedte + 2}
                y={y + h + 12}
                fill={GRAFIET}
                opacity={0.72}
                style={SCHRIFT(9.5)}
              >
                {verloren} dropped off here
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Verloop over de dagen                                               */
/* ------------------------------------------------------------------ */

/**
 * Eén doorlopende haal langs de dagen, met een stip per meetpunt.
 *
 * Geen assen en geen raster: op papier trek je een lijn en zet je er links en
 * rechts een getal bij. Wat je wil weten is de vorm, en die is zonder raster
 * beter te zien.
 */
export function HandLine({
  punten,
  seed,
}: {
  punten: { label: string; waarde: number }[]
  seed: string
}) {
  if (punten.length < 2) return null

  const W = 340
  const H = 96
  const links = 8
  const rechts = W - 8
  const boven = 14
  const onder = H - 22
  const hoogste = Math.max(...punten.map((p) => p.waarde), 1)
  const rand = seedFrom(seed)
  const rand2 = seedFrom(`${seed}:2`)

  const plek = (i: number, waarde: number): [number, number] => [
    links + ((rechts - links) * i) / (punten.length - 1),
    onder - (waarde / hoogste) * (onder - boven),
  ]

  // Per segment een eigen lichte doorzakking, zodat de lijn nergens precies
  // recht loopt. Twee doorgangen voor de potloodrand.
  const trek = (r: () => number, offset: number) => {
    const stukken: string[] = []
    for (let i = 0; i < punten.length - 1; i++) {
      const [x1, y1] = plek(i, punten[i].waarde)
      const [x2, y2] = plek(i + 1, punten[i + 1].waarde)
      stukken.push(haal(r, x1, y1 + offset, x2, y2 + offset, (r() - 0.5) * 2.2))
    }
    return stukken.join(' ')
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-1 block h-auto w-full max-w-115 overflow-visible"
      role="img"
      aria-label={punten.map((p) => `${p.label}: ${p.waarde}`).join(', ')}
    >
      <Potloodlijn d={trek(rand, 0)} dd={trek(rand2, 0.5)} width={1.5} />

      {punten.map((p, i) => {
        const [x, y] = plek(i, p.waarde)
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r={1.9} fill={GRAFIET} opacity={0.75} />
            {/* Alleen de hoogste en de laatste krijgen hun getal erbij; alles
                labelen maakt er weer een tabel van. */}
            {(p.waarde === hoogste || i === punten.length - 1) && (
              <text x={Math.min(x + 4, W - 24)} y={y - 6} fill={GRAFIET} style={SCHRIFT(10)}>
                {p.waarde}
              </text>
            )}
          </g>
        )
      })}

      <text x={links} y={H - 5} fill={GRAFIET} opacity={0.6} style={SCHRIFT(10)}>
        {punten[0].label}
      </text>
      <text
        x={rechts}
        y={H - 5}
        textAnchor="end"
        fill={GRAFIET}
        opacity={0.6}
        style={SCHRIFT(10)}
      >
        {punten[punten.length - 1].label}
      </text>
    </svg>
  )
}
