/**
 * De baan die het gummetje aflegt.
 *
 * Dit staat los van de component omdat het de enige echt rekenkundige stap in
 * de animatie is: uit de plek waar de tekst staat volgt hoe lang er gegomd
 * wordt, waar de gum op elk moment ligt, en waar de grens tussen weg en niet
 * weg loopt. Zonder ogen op het scherm is het verschil tussen "klopt" en "ziet
 * er nep uit" hier niet te zien, en met deze functies apart is het wél te
 * controleren. Zie scripts/test-erase.mjs.
 *
 * Alle maten zijn pixels ten opzichte van de linkerbovenhoek van het tekstblok,
 * alle tijden zijn seconden vanaf het begin van de animatie.
 */

/* -------------------------------------------------------------------------- */
/* De maatvoering                                                             */
/* -------------------------------------------------------------------------- */

/** Hoe lang één heen-en-weer duurt. Ongeveer zeven per seconde is een hand. */
const SECONDEN_PER_HAAL = 0.145
/** Ook één kort woord verdient meer dan één veeg. */
const MINSTE_HALEN = 2
/** Van het eind van een regel terug naar het begin van de volgende. */
const SPRONG = 0.16
/** De gum optillen aan het eind. */
const AFRONDEN = 0.22
/**
 * Nadat de gum van een regel af is loopt de grens nog even door, tot voorbij
 * het punt waar de veegband hem nog raakt. Zonder dit blijft die band voor
 * altijd over het laatste stukje tekst liggen en zie je de laatste letters als
 * grijze schim staan. Het is onzichtbaar: op dat moment is er niets meer om
 * weg te halen, alleen de veeg schuift van het papier af.
 */
const NASLEEP = 0.18

/** De zachte rand van de veeg. Een harde grens leest als een schuifdeur. */
export const RAND = 15
/** Hoe lang de veeg achter de gum aan blijft hangen. */
export const STAART = 34

/**
 * Ruimte tussen de zachte rand en de rand van de gum.
 *
 * Dit getal is de hele reden dat de vorige versie niet klopte. De grens liep
 * met een eigen, langere baan dan de gum, terwijl de gum onderweg terugveert.
 * Op het diepste punt van een haal lag de grens daardoor tachtig pixels vóór
 * het midden van de gum — en die is maar zevenenveertig pixels breed vanaf zijn
 * midden. De zachte rand kwam dus onder de gum vandaan en je zag de tekst
 * vervagen op een plek waar de gum nog helemaal niet geweest was.
 *
 * Nu volgt de grens de gum, en de terugslag wordt zó gekozen dat de grens plus
 * zijn zachte rand altijd binnen de gum vallen. Weg is dus pas weg als het
 * eronder gezeten heeft.
 */
const SPELING = 4

/**
 * Hoeveel pixels tekst er per heen-en-weer wordt afgelegd, uitgedrukt in
 * terugslagen. Onder π zou de gum alleen langzamer vooruit gaan in plaats van
 * echt terug; 2,6 laat hem duidelijk terugveren zonder stil te staan.
 */
const HAAL_PER_TERUGSLAG = 2.6

/* -------------------------------------------------------------------------- */

/** Een stuk tekst zoals de browser het teruggeeft, al omgerekend naar het blok. */
export type Vlak = { top: number; bottom: number; left: number; right: number }

export type Regel = {
  /** De band waarin deze regel valt. De banden sluiten exact op elkaar aan. */
  boven: number
  onder: number
  /** Waar op deze regel de inkt begint en eindigt. */
  links: number
  rechts: number
  /** De hoogte waarop de gum ligt. */
  midden: number
  /** Het stuk van de tijdlijn waarin deze regel weggaat. */
  van: number
  tot: number
  halen: number
  /** Hoe ver de gum op deze regel terugveert, in pixels. */
  terugslag: number
}

export type Plan = { regels: Regel[]; einde: number }

export type Houding = { x: number; y: number; hoek: number; schaal: number; dekking: number }

/* -------------------------------------------------------------------------- */

/**
 * Van gemeten tekstvlakken naar een plan: welke regel wanneer weggaat.
 *
 * `halveGum` is de halve breedte van het gummetje in pixels. Die bepaalt hoe
 * ver er teruggeveerd mag worden en dus ook hoeveel halen een regel krijgt:
 * op een telefoon is de gum kleiner, dus veert hij minder ver terug en zijn er
 * meer, kortere halen nodig. Geeft null terug als er niets te gommen valt.
 */
export function planErase(stukken: Vlak[], hoogte: number, halveGum: number): Plan | null {
  const bruikbaar = stukken.filter((s) => s.right - s.left > 1 && s.bottom - s.top > 1)
  if (bruikbaar.length === 0) return null

  // Meerdere vlakken op dezelfde hoogte horen bij dezelfde regel. Een Range
  // levert er meestal één per regel, maar niet met de garantie erbij.
  const rauw: Vlak[] = []
  for (const s of bruikbaar) {
    const vorige = rauw[rauw.length - 1]
    if (vorige && Math.abs(vorige.top - s.top) < 4) {
      vorige.left = Math.min(vorige.left, s.left)
      vorige.right = Math.max(vorige.right, s.right)
      vorige.bottom = Math.max(vorige.bottom, s.bottom)
    } else {
      rauw.push({ top: s.top, bottom: s.bottom, left: s.left, right: s.right })
    }
  }

  // De terugslag past binnen de gum, met de zachte rand erbij. Zie SPELING.
  const terugslag = Math.max(8, halveGum - RAND - SPELING)
  const pixelsPerHaal = terugslag * HAAL_PER_TERUGSLAG

  // Naar boven afronden, niet naar het dichtstbijzijnde. Bij afronden krijgt
  // een regel van 2,5 haal er twee, en dan gaat díé regel merkbaar sneller dan
  // een lange — precies het verschil in snelheid dat hierboven wordt bestreden,
  // maar dan binnengeslopen via de afronding.
  const halen = rauw.map((r) =>
    Math.max(MINSTE_HALEN, Math.ceil((r.right - r.left) / pixelsPerHaal)),
  )

  // Hier stond een bovengrens op de totale duur: een lange zin werd evenredig
  // ingekort zodat het geheel binnen tweeënhalve seconde bleef. Dat kostte
  // precies het verkeerde. Een gum heeft één snelheid, en zodra de langste zin
  // wordt samengeperst schuurt hij dáár merkbaar sneller dan bij een korte zin
  // — je ziet twee verschillende handen. Nu bepaalt de hoeveelheid tekst alleen
  // nog hoe lang het duurt, nooit hoe snel het gaat.
  let klok = 0
  const regels: Regel[] = rauw.map((r, i) => {
    const van = klok
    const tot = van + halen[i] * SECONDEN_PER_HAAL
    klok = tot + SPRONG
    return {
      // De grens tussen twee regels ligt er halverwege tussenin. Met overlap
      // zou de staart van een 'g' uit de eerste regel pas verdwijnen als de
      // tweede regel aan de beurt is; met een gat blijft er inkt over.
      boven: i === 0 ? 0 : (r.top + rauw[i - 1].bottom) / 2,
      onder: i === rauw.length - 1 ? hoogte : (rauw[i + 1].top + r.bottom) / 2,
      links: r.left,
      rechts: r.right,
      midden: (r.top + r.bottom) / 2,
      van,
      tot,
      halen: halen[i],
      terugslag,
    }
  })

  const laatste = regels[regels.length - 1]
  return { regels, einde: laatste.tot + Math.max(AFRONDEN, NASLEEP) }
}

/**
 * Hoever de gum achterligt op de grens, als deel van de terugslag.
 *
 * Nul aan het begin en aan het eind van elke haal, maximaal halverwege. Aan het
 * begin en het einde van de hele regel ligt de gum dus precies op de grens: hij
 * start op de eerste letter en stopt op de laatste.
 */
function achterstand(r: Regel, s: number): number {
  return (1 - Math.cos(2 * Math.PI * r.halen * s)) / 2
}

/**
 * De grens tussen weg en nog niet weg, in pixels vanaf links.
 *
 * Dit is de drager van de beweging van de gum: dezelfde baan, maar zonder het
 * terugveren. De gum raakt hem aan het begin en eind van elke haal en ligt er
 * de rest van de tijd achter — nooit ervoor. Daarmee is weg pas weg als de gum
 * eroverheen is gegaan.
 */
export function grens(r: Regel, k: number): number {
  if (k <= r.van) return r.links
  if (k < r.tot) return r.links + (r.rechts - r.links) * ((k - r.van) / (r.tot - r.van))

  // Nasleep: de grens trekt door tot de veegband van de tekst af is. Er valt
  // op dat moment niets meer weg te halen, dus je ziet er alleen de veeg van
  // verdwijnen.
  const na = Math.min(1, (k - r.tot) / NASLEEP)
  return r.rechts + (STAART + RAND) * na
}

/** Het midden van de gum op een regel, in pixels vanaf links. */
function midden(r: Regel, s: number): number {
  return r.links + (r.rechts - r.links) * s - r.terugslag * achterstand(r, s)
}

/**
 * Waar de gum ligt op tijdstip k, en hoe hij erbij ligt.
 *
 * Drie soorten momenten: schurend over een regel, springend naar de volgende,
 * en opgetild aan het eind.
 */
export function houding(k: number, regels: Regel[], einde: number): Houding {
  for (let i = 0; i < regels.length; i++) {
    const r = regels[i]
    if (k > r.tot) continue

    if (k >= r.van || i === 0) {
      const s = Math.min(1, Math.max(0, (k - r.van) / (r.tot - r.van)))
      return {
        x: midden(r, s),
        // Een hand houdt een gum niet waterpas. Het meebewegen is klein genoeg
        // om niet op te vallen en groot genoeg om te missen.
        y: r.midden + 1.8 * Math.sin(4 * Math.PI * r.halen * s),
        hoek: -6 - 5 * Math.sin(2 * Math.PI * r.halen * s),
        schaal: 1,
        dekking: 1,
      }
    }

    // Ertussenin: van het eind van de vorige regel naar het begin van deze.
    const vorige = regels[i - 1]
    const s = Math.min(1, Math.max(0, (k - vorige.tot) / Math.max(r.van - vorige.tot, 0.001)))
    const e = s * s * (3 - 2 * s)
    const til = Math.sin(Math.PI * s)
    return {
      x: vorige.rechts * (1 - e) + r.links * e,
      // Even van het papier af. Zonder dit schuift de gum dwars door de regel
      // die er nog staat heen, en die gomt hij dan niet.
      y: vorige.midden * (1 - e) + r.midden * e - 11 * til,
      hoek: -6 + 11 * til,
      schaal: 1 + 0.09 * til,
      dekking: 1,
    }
  }

  // Voorbij de laatste regel: optillen en weg.
  const laatste = regels[regels.length - 1]
  const s = Math.min(1, Math.max(0, (k - laatste.tot) / Math.max(einde - laatste.tot, 0.001)))
  return {
    x: laatste.rechts,
    y: laatste.midden - 14 * s,
    hoek: -6 + 8 * s,
    schaal: 1 + 0.18 * s,
    dekking: 1 - s,
  }
}
