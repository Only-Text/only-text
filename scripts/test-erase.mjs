/**
 * De baan van het gummetje nalopen.
 *
 * Bij een animatie is "ziet er nep uit" het echte falen, en dat is precies wat
 * geen enkele test ziet. Wat wel te controleren is, is of de baan doet wat hij
 * belooft: op de eerste letter beginnen, op de laatste eindigen, onderweg
 * daadwerkelijk heen en weer gaan, niets laten staan, en — de reden dat dit
 * bestand er is — nooit iets weghalen op een plek waar de gum nog niet geweest
 * is. Dat waren stuk voor stuk echte fouten.
 *
 *     npx tsx scripts/test-erase.mjs
 */

import { grens, houding, planErase, RAND, STAART } from '../src/lib/erase-path.ts'

let gezakt = 0

function ok(waar, wat) {
  if (waar) {
    console.log(`  ok   ${wat}`)
  } else {
    gezakt++
    console.log(`  FOUT ${wat}`)
  }
}

function bijna(a, b, marge, wat) {
  ok(Math.abs(a - b) <= marge, `${wat} (${a.toFixed(1)} ≈ ${b.toFixed(1)})`)
}

/** De regelhoogte en de tekstbreedte van de voorpagina op een breed scherm. */
const REGEL = 44
const BLOK = 560

/** De halve breedte van het gummetje: 94px op een breed scherm, 74px daaronder. */
const HALVE_GUM = 47
const HALVE_GUM_MOBIEL = 37

/** Doet alsof de browser deze regels heeft afgebroken. */
function vlakken(breedtes) {
  return breedtes.map((b, i) => ({
    top: i * REGEL + 4,
    bottom: i * REGEL + 40,
    left: 0,
    right: b,
  }))
}

function maak(breedtes, halveGum = HALVE_GUM) {
  return planErase(vlakken(breedtes), REGEL * breedtes.length, halveGum)
}

/** Loopt de hele animatie af in kleine stapjes. */
function afspelen(p, stap = 1 / 240) {
  const punten = []
  for (let k = 0; k <= p.einde + 1e-9; k += stap) {
    punten.push({ k, ...houding(k, p.regels, p.einde) })
  }
  return punten
}

const MATEN = [[180], [BLOK], [BLOK, 300], [BLOK, BLOK, BLOK, 200]]

/* -------------------------------------------------------------------------- */

console.log('\nWeg is pas weg als de gum eroverheen is')
{
  // Dit is de fout die op de site te zien was: de grens liep met een eigen,
  // langere baan dan de gum, terwijl de gum onderweg terugveert. Op het diepste
  // punt van een haal lag de grens tachtig pixels vóór het midden van de gum,
  // en dan komt de zachte rand eronder vandaan: je zag letters vervagen op een
  // plek waar de gum nog niet geweest was.
  for (const halveGum of [HALVE_GUM, HALVE_GUM_MOBIEL]) {
    for (const breedtes of MATEN) {
      const p = maak(breedtes, halveGum)
      let ergste = -Infinity
      let ergsteRegel = -1

      p.regels.forEach((r, i) => {
        for (let k = r.van; k <= r.tot; k += 1 / 480) {
          // De rechterkant van de zachte rand tegenover de rechterkant van de gum.
          const buiten = grens(r, k) + RAND - (houding(k, p.regels, p.einde).x + halveGum)
          if (buiten > ergste) {
            ergste = buiten
            ergsteRegel = i
          }
        }
      })

      ok(
        ergste <= 0,
        `gum ${halveGum * 2}px, [${breedtes}]: de rand blijft ${(-ergste).toFixed(0)}px binnen de gum` +
          (ergste > 0 ? ` — steekt ${ergste.toFixed(0)}px uit op regel ${ergsteRegel}` : ''),
      )
    }
  }
}

console.log('\nEr blijft niets staan')
{
  // De veeg hangt achter de grens aan, van `grens - STAART` tot `grens + RAND`.
  // Stopte de grens op de laatste letter, dan lag die band daarna voor altijd
  // over het laatste stukje tekst en bleven er letters als grijze schim staan.
  for (const breedtes of MATEN) {
    const p = maak(breedtes)
    let schoon = true
    for (const r of p.regels) {
      if (grens(r, p.einde) - STAART < r.rechts) schoon = false
    }
    ok(schoon, `[${breedtes}] geen veeg over de laatste letters`)
  }
}

console.log('\nEén korte zin')
{
  const p = maak([180])
  const punten = afspelen(p)
  const r = p.regels[0]

  ok(p.regels.length === 1, 'één regel')
  bijna(punten[0].x, r.links, 1, 'begint op de eerste letter')
  bijna(punten.find((q) => q.k >= r.tot).x, r.rechts, 1, 'eindigt op de laatste letter')
  bijna(grens(r, 0), r.links, 0.01, 'aan het begin staat er nog niets weggegomd')
  ok(grens(r, r.tot) >= r.rechts, 'aan het eind is de laatste letter weg')
}

console.log('\nEen zin van drie regels')
{
  const p = maak([BLOK, BLOK, 240])
  ok(p.regels.length === 3, 'drie regels')

  // Elke regel begint links en eindigt rechts van díé regel, niet van het blok.
  p.regels.forEach((r, i) => {
    bijna(houding(r.van, p.regels, p.einde).x, r.links, 1, `regel ${i}: start op de eerste letter`)
    bijna(houding(r.tot, p.regels, p.einde).x, r.rechts, 1, `regel ${i}: stopt op de laatste letter`)
  })

  const duur = p.regels.map((r) => r.tot - r.van)
  ok(duur[2] < duur[0], `de korte regel duurt korter (${duur[2].toFixed(2)}s < ${duur[0].toFixed(2)}s)`)

  // De banden sluiten aan: geen gat, geen overlap.
  for (let i = 1; i < p.regels.length; i++) {
    bijna(p.regels[i].boven, p.regels[i - 1].onder, 0.01, `band ${i} sluit aan op ${i - 1}`)
  }
  ok(p.regels[0].boven === 0, 'de eerste band begint bovenaan')
  bijna(p.regels[2].onder, REGEL * 3, 0.01, 'de laatste band loopt tot onderaan')

  // Tussen twee regels gaat de gum van het papier af.
  const tussenin = (p.regels[0].tot + p.regels[1].van) / 2
  const h = houding(tussenin, p.regels, p.einde)
  ok(h.schaal > 1.02, 'wordt opgetild bij de sprong naar de volgende regel')
  const recht = (p.regels[0].midden + p.regels[1].midden) / 2
  ok(h.y < recht - 6, `boogt bij de sprong omhoog (${h.y.toFixed(1)} < ${recht.toFixed(1)})`)
}

console.log('\nDe beweging zelf')
{
  const p = maak([BLOK])
  const punten = afspelen(p).filter((q) => q.k <= p.regels[0].tot)

  let terug = 0
  let grootsteStapTerug = 0
  for (let i = 1; i < punten.length; i++) {
    const d = punten[i].x - punten[i - 1].x
    if (d < 0) {
      terug++
      grootsteStapTerug = Math.min(grootsteStapTerug, d)
    }
  }
  ok(terug > 0, `gaat onderweg echt naar achteren (${terug} stapjes terug)`)
  ok(grootsteStapTerug < -0.2, 'en niet zo weinig dat je het niet ziet')

  // De grens mag daarbij nooit meebewegen: gegomde inkt komt niet terug.
  const r = p.regels[0]
  let vorige = -Infinity
  let monotoon = true
  for (const q of afspelen(p)) {
    const g = grens(r, q.k)
    if (g < vorige - 1e-9) monotoon = false
    vorige = g
  }
  ok(monotoon, 'de grens loopt alleen vooruit')

  ok(punten.some((q) => Math.abs(q.hoek + 6) > 2), 'kantelt mee met de haal')
}

console.log('\nBlijft op het papier')
{
  // De tekst staat 116px van de linkerrand van het vel en er is 24px over rechts.
  const LINKERMARGE = 116
  const RECHTERMARGE = 24

  for (const breedtes of MATEN) {
    const p = maak(breedtes)
    const punten = afspelen(p)
    const linkst = Math.min(...punten.map((q) => q.x))
    const rechtst = Math.max(...punten.map((q) => q.x))

    ok(
      linkst - HALVE_GUM > -LINKERMARGE,
      `[${breedtes}] komt links niet van het vel af (${(linkst - HALVE_GUM).toFixed(0)}px, marge ${LINKERMARGE})`,
    )
    // Bij een regel die tot de kantlijn doorloopt móét de gum eroverheen om de
    // laatste letter te raken. Een stukje uitsteken is wat een hand doet.
    const uitsteek = rechtst + HALVE_GUM - (BLOK + RECHTERMARGE)
    ok(uitsteek < HALVE_GUM / 2, `[${breedtes}] steekt rechts ${uitsteek.toFixed(0)}px buiten het vel`)
  }
}

console.log('\nEén hand, één snelheid')
{
  // Een bovengrens op de totale duur perste de langste zin samen, waardoor die
  // merkbaar sneller gegomd werd dan een korte. Meer tekst hoort langer te
  // duren, nooit sneller te gaan.
  const tempo = (breedtes) => {
    const p = maak(breedtes)
    const px = p.regels.reduce((a, r) => a + (r.rechts - r.links), 0)
    const tijd = p.regels.reduce((a, r) => a + (r.tot - r.van), 0)
    return px / tijd
  }

  const kort = tempo([180])
  const vier = tempo([BLOK, BLOK, BLOK, 200])
  const lang = tempo([BLOK])

  ok(
    Math.abs(vier - lang) / lang < 0.05,
    `vier regels gaan even snel als één (${vier.toFixed(0)} vs ${lang.toFixed(0)} px/s)`,
  )
  // Een kort woord mag wél trager: MINSTE_HALEN geeft ook twee woorden twee
  // halen. Wat niet mag is dat korte tekst juist sneller weggaat dan lange.
  ok(kort <= lang * 1.05, `een kort woord wordt niet afgeraffeld (${kort.toFixed(0)} vs ${lang.toFixed(0)} px/s)`)

  ok(maak([BLOK]).einde > maak([180]).einde, 'een volle regel duurt langer dan een kort woord')
  ok(maak([BLOK, BLOK, BLOK, 200]).einde > maak([BLOK, 300]).einde, 'vier regels duren langer dan twee')

  console.log('  --- duur per zinlengte ---')
  for (const breedtes of MATEN) {
    console.log(`       [${breedtes}] ${maak(breedtes).einde.toFixed(2)}s`)
  }
}

console.log('\nRafelranden')
{
  ok(planErase([], 0, HALVE_GUM) === null, 'niets te gommen geeft null')
  ok(
    planErase([{ top: 0, bottom: 0, left: 0, right: 0 }], 0, HALVE_GUM) === null,
    'lege vlakken tellen niet',
  )

  // Twee vlakken op dezelfde hoogte horen bij één regel.
  const p = planErase(
    [
      { top: 4, bottom: 40, left: 0, right: 120 },
      { top: 5, bottom: 40, left: 128, right: 300 },
    ],
    REGEL,
    HALVE_GUM,
  )
  ok(p.regels.length === 1, 'twee vlakken op dezelfde regel worden er één')
  ok(p.regels[0].rechts === 300, 'en die regel loopt tot het verste vlak')
}

console.log(gezakt === 0 ? '\nAlles klopt.\n' : `\n${gezakt} controle(s) gezakt.\n`)
process.exit(gezakt === 0 ? 0 : 1)
