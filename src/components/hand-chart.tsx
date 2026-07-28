import { Fragment } from 'react'

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
 *
 * Eén regel is één regel.
 * ---------------------------------------------------------------------------
 * Hier stond eerst de hele grafiek in één schaalbare tekening: labels, staven
 * en getallen zaten samen in één viewBox die meeschaalde met de breedte van het
 * scherm. Dat kost de liniatuur haar houvast. De hoogte van zo'n tekening volgt
 * uit de breedte en is dus zelden een veelvoud van de regelhoogte, en alles wat
 * eronder staat schuift het restant mee omhoog. Op deze pagina stonden zeven
 * grafieken; na de derde stond de tekst een halve regel naast de lijn.
 *
 * Nu is elke rij een gewone tekstregel op het vel, met alleen de staaf zelf als
 * tekening ernaast. De labels en getallen zijn echte tekst: ze staan op de lijn
 * zoals de rest van de pagina, ze zijn te selecteren, en een schermlezer leest
 * ze voor zonder omweg via aria-label.
 *
 * De staaf schaalt niet mee met de breedte van het scherm. Elke staaf krijgt
 * een viewBox die precies zo breed is als de staaf zelf en een CSS-breedte in
 * dezelfde verhouding, zodat de schaalfactor voor álle staven gelijk is: de
 * arcering staat overal even schuin en even dicht op elkaar, en de dikte van
 * een staaf is niet afhankelijk van zijn lengte.
 */

type Reeks = { label: string; waarde: number; hint?: string }

/** Grafiet, niet inkt. Alle lijnen in deze grafieken gebruiken deze kleur. */
const GRAFIET = 'var(--ink-soft)'

/** Tekeneenheden voor een volle staaf. De CSS-breedte van het spoor bepaalt
 *  hoeveel pixels dat wordt; zie `--spoor` in globals.css. */
const SPOOR = 200

/** De dikte van een staaf, in dezelfde eenheden. */
const DIK = 18
const DIK_TRECHTER = 21

/**
 * De labelkolom groeit mee met het langste label in plaats van vast te staan op
 * de breedte van een hostnaam. Zonder dit wordt "Copied the words, after
 * writing" afgekapt op precies het stuk dat het interessant maakt, en dan is
 * een leesbaar label erger dan een code.
 *
 * De breedte staat in em en niet in pixels, zodat de kolom klopt bij elke
 * lettergrootte. 0,53em is de gemeten gemiddelde tekenbreedte van het
 * handschrift; een schatting volstaat, want de kolom mag ruimer zijn dan nodig.
 */
const TEKENBREEDTE = 0.53
const KOP_MAX_EM = 19
const MAX_TEKENS = Math.floor((KOP_MAX_EM - 0.6) / TEKENBREEDTE)

function kort(label: string): string {
  return label.length > MAX_TEKENS ? `${label.slice(0, MAX_TEKENS - 1)}…` : label
}

/** De breedte van de labelkolom, afgeleid van het langste label in de reeks. */
function kopBreedte(labels: string[]): string {
  const langste = Math.min(Math.max(...labels.map((l) => l.length), 1), MAX_TEKENS)
  return `${(langste * TEKENBREEDTE + 0.6).toFixed(2)}em`
}

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

/** Het kader van een staaf: boven, rechts, onder. Links staat de kolom al. */
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
/* Eén staaf                                                           */
/* ------------------------------------------------------------------ */

/**
 * Het getekende deel van een rij: verder niets dan een rechthoekje grafiet.
 *
 * Hij staat op de basislijn en dus op de blauwe lijn, net als de letters
 * ernaast. Nul tekenen we niet: een streepje van niets leest als een meting die
 * mislukt is, terwijl er gewoon niemand was.
 */
function Staaf({ deel, seed, dik = DIK }: { deel: number; seed: string; dik?: number }) {
  const breedte = deel > 0 ? Math.max(deel * SPOOR, 4) : 0
  if (breedte === 0) return null

  const rand = seedFrom(seed)
  const rand2 = seedFrom(`${seed}:2`)

  return (
    <svg
      viewBox={`0 0 ${breedte.toFixed(1)} ${dik}`}
      className="grafiek-staaf"
      style={{ width: `calc(var(--spoor) * ${(breedte / SPOOR).toFixed(4)})` }}
      aria-hidden="true"
      focusable="false"
    >
      <Potloodlijn
        d={staafPad(rand, 0, 0, breedte, dik)}
        dd={staafPad(rand2, 0, 0.4, breedte, dik)}
        width={dik > DIK ? 1.25 : 1.15}
      />
      <Arcering d={arcering(rand, 0, 0, breedte, dik)} />
    </svg>
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

  return (
    <div
      className="grafiek"
      style={{ '--kop': kopBreedte(data.map((d) => d.label)) } as React.CSSProperties}
    >
      {data.map((d, i) => (
        <div key={`${d.label}:${i}`} className="on-rule grafiek-rij">
          <span className="grafiek-kop">{kort(d.label)}</span>
          <Staaf deel={d.waarde / hoogste} seed={`${seed}:${d.label}`} />
          <span className="grafiek-getal tabular-nums">{d.hint ?? `${d.waarde}${eenheid}`}</span>
        </div>
      ))}
    </div>
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
 * afvielen, en waar. Dat staat daarom op een eigen regel onder de staaf en niet
 * als percentage achteraan de regel.
 */
export function HandFunnel({ stappen, seed }: { stappen: Reeks[]; seed: string }) {
  if (stappen.length === 0) return null

  const top = Math.max(stappen[0]?.waarde ?? 0, 1)

  return (
    <div
      className="grafiek"
      style={{ '--kop': kopBreedte(stappen.map((s) => s.label)) } as React.CSSProperties}
    >
      {stappen.map((s, i) => {
        const vorige = stappen[i - 1]
        const verloren = vorige ? vorige.waarde - s.waarde : 0
        const deel = Math.round((s.waarde / top) * 100)

        return (
          <Fragment key={`${s.label}:${i}`}>
            <div className="on-rule grafiek-rij">
              <span className="grafiek-kop">{kort(s.label)}</span>
              <Staaf deel={s.waarde / top} seed={`${seed}:${s.label}`} dik={DIK_TRECHTER} />
              <span className="grafiek-getal tabular-nums">
                {s.waarde} · {deel}%
              </span>
            </div>

            {/* Wie hier afviel. Alleen zetten als er iets te verliezen viel. */}
            {verloren > 0 && (
              <div className="on-rule grafiek-noot">{verloren} dropped off here</div>
            )}
          </Fragment>
        )
      })}
    </div>
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
 *
 * Dit is de enige grafiek die wél als tekening meeschaalt met de breedte, want
 * een lijn ís de vorm en die valt niet in rijen uiteen. Het vak eromheen is
 * daarom precies drie regels hoog; de tekening past zichzelf daarbinnen in. Wat
 * eronder staat blijft zo op de liniatuur staan.
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
    <div className="grafiek grafiek-vak">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full overflow-visible"
        role="img"
        aria-label={punten.map((p) => `${p.label}: ${p.waarde}`).join(', ')}
      >
        <Potloodlijn d={trek(rand, 0)} dd={trek(rand2, 0.5)} width={1.5} />

        {punten.map((p, i) => {
          const [x, y] = plek(i, p.waarde)
          return (
            <g key={`${p.label}:${i}`}>
              <circle cx={x} cy={y} r={1.9} fill={GRAFIET} opacity={0.75} />
              {/* Alleen de hoogste en de laatste krijgen hun getal erbij; alles
                  labelen maakt er weer een tabel van. */}
              {(p.waarde === hoogste || i === punten.length - 1) && (
                <text
                  x={Math.min(x + 4, W - 24)}
                  y={y - 6}
                  fill={GRAFIET}
                  style={{ font: `400 10px var(--font-hand)` }}
                >
                  {p.waarde}
                </text>
              )}
            </g>
          )
        })}

        <text
          x={links}
          y={H - 5}
          fill={GRAFIET}
          opacity={0.6}
          style={{ font: `400 10px var(--font-hand)` }}
        >
          {punten[0].label}
        </text>
        <text
          x={rechts}
          y={H - 5}
          textAnchor="end"
          fill={GRAFIET}
          opacity={0.6}
          style={{ font: `400 10px var(--font-hand)` }}
        >
          {punten[punten.length - 1].label}
        </text>
      </svg>
    </div>
  )
}
