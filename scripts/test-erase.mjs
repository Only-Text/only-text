/**
 * De baan van het gummetje nalopen.
 *
 * Bij een animatie is "ziet er nep uit" het echte falen, en dat is precies wat
 * geen enkele test ziet. Wat wel te controleren is, is of de baan doet wat hij
 * belooft: op de eerste letter beginnen, op de laatste eindigen, onderweg
 * daadwerkelijk heen en weer gaan, en het papier niet verlaten. Dat zijn de
 * dingen die bij de vorige versie fout zaten.
 *
 *     node --experimental-strip-types scripts/test-erase.mjs
 *     npx tsx scripts/test-erase.mjs
 */

import { grens, houding, planErase, RAND } from '../src/lib/erase-path.ts'

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

/** Doet alsof de browser deze regels heeft afgebroken. */
function vlakken(breedtes) {
  return breedtes.map((b, i) => ({
    top: i * REGEL + 4,
    bottom: i * REGEL + 40,
    left: 0,
    right: b,
  }))
}

/** Loopt de hele animatie af in kleine stapjes. */
function afspelen(plan, stap = 1 / 240) {
  const punten = []
  for (let k = 0; k <= plan.einde + 1e-9; k += stap) {
    punten.push({ k, ...houding(k, plan.regels, plan.einde) })
  }
  return punten
}

/* -------------------------------------------------------------------------- */

console.log('\nEén korte zin')
{
  const plan = planErase(vlakken([180]), REGEL)
  const punten = afspelen(plan)
  const r = plan.regels[0]

  ok(plan.regels.length === 1, 'één regel')
  bijna(punten[0].x, r.links, 1, 'begint op de eerste letter')
  bijna(punten.find((p) => p.k >= r.tot).x, r.rechts, 1, 'eindigt op de laatste letter')
  ok(plan.einde < 0.75, `kort is ook echt kort (${plan.einde.toFixed(2)}s)`)

  // De hele regel moet weg zijn, en geen letter eerder.
  bijna(grens(r, 0), r.links - RAND, 0.01, 'aan het begin staat er nog niets weggegomd')
  ok(grens(r, r.tot) >= r.rechts, 'aan het eind is de laatste letter weg')
}

console.log('\nEen zin van drie regels')
{
  const plan = planErase(vlakken([BLOK, BLOK, 240]), REGEL * 3)
  ok(plan.regels.length === 3, 'drie regels')

  // Elke regel begint links en eindigt rechts van díé regel, niet van het blok.
  plan.regels.forEach((r, i) => {
    bijna(houding(r.van, plan.regels, plan.einde).x, r.links, 1, `regel ${i}: start op de eerste letter`)
    bijna(houding(r.tot, plan.regels, plan.einde).x, r.rechts, 1, `regel ${i}: stopt op de laatste letter`)
  })

  // De laatste regel is korter, dus ook sneller weg.
  const duur = plan.regels.map((r) => r.tot - r.van)
  ok(duur[2] < duur[0], `de korte regel duurt korter (${duur[2].toFixed(2)}s < ${duur[0].toFixed(2)}s)`)

  // De banden sluiten aan: geen gat, geen overlap.
  for (let i = 1; i < plan.regels.length; i++) {
    bijna(plan.regels[i].boven, plan.regels[i - 1].onder, 0.01, `band ${i} sluit aan op ${i - 1}`)
  }
  ok(plan.regels[0].boven === 0, 'de eerste band begint bovenaan')
  bijna(plan.regels[2].onder, REGEL * 3, 0.01, 'de laatste band loopt tot onderaan')

  // Tussen twee regels gaat de gum van het papier af.
  const tussenin = (plan.regels[0].tot + plan.regels[1].van) / 2
  const h = houding(tussenin, plan.regels, plan.einde)
  ok(h.schaal > 1.02, 'wordt opgetild bij de sprong naar de volgende regel')
  // Niet boven beide regels uit: de gum zakt gewoon naar de volgende regel toe.
  // Wat hij wél moet doen is er in een boog naartoe, niet in een rechte lijn.
  const recht = (plan.regels[0].midden + plan.regels[1].midden) / 2
  ok(h.y < recht - 6, `boogt bij de sprong omhoog (${h.y.toFixed(1)} < ${recht.toFixed(1)})`)
}

console.log('\nDe beweging zelf')
{
  const plan = planErase(vlakken([BLOK]), REGEL)
  const punten = afspelen(plan).filter((p) => p.k <= plan.regels[0].tot)

  // Dit is het punt van de hele herbouw: gaat hij daadwerkelijk terug, of
  // schuift hij alleen wat langzamer door.
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
  const r = plan.regels[0]
  let vorige = -Infinity
  let monotoon = true
  for (const p of punten) {
    const g = grens(r, p.k)
    if (g < vorige - 1e-9) monotoon = false
    vorige = g
  }
  ok(monotoon, 'de grens loopt alleen vooruit')

  ok(
    punten.some((p) => Math.abs(p.hoek + 6) > 2),
    'kantelt mee met de haal',
  )
}

console.log('\nBlijft op het papier')
{
  // De tekst staat 116px van de linkerrand van het vel en er is 24px over
  // rechts. De gum is 94px breed, dus 47px aan weerszijden van zijn midden.
  const LINKERMARGE = 116
  const RECHTERMARGE = 24
  const HALVE_GUM = 47

  for (const breedtes of [[180], [BLOK], [BLOK, 300], [BLOK, BLOK, BLOK, 200]]) {
    const plan = planErase(vlakken(breedtes), REGEL * breedtes.length)
    const punten = afspelen(plan)
    const linkst = Math.min(...punten.map((p) => p.x))
    const rechtst = Math.max(...punten.map((p) => p.x))

    ok(
      linkst - HALVE_GUM > -LINKERMARGE,
      `[${breedtes}] komt links niet van het vel af (${(linkst - HALVE_GUM).toFixed(0)}px, marge ${LINKERMARGE})`,
    )
    // Rechts is het krap: bij een regel die tot de kantlijn doorloopt móét de
    // gum eroverheen om de laatste letter te raken. Een stukje uitsteken is
    // precies wat een hand doet; een halve gum eroverheen niet meer.
    const uitsteek = rechtst + HALVE_GUM - (BLOK + RECHTERMARGE)
    ok(uitsteek < HALVE_GUM / 2, `[${breedtes}] steekt rechts ${uitsteek.toFixed(0)}px buiten het vel`)
    ok(plan.einde <= 2.6, `[${breedtes}] duurt hooguit 2,6s (${plan.einde.toFixed(2)}s)`)
  }
}

console.log('\nRafelranden')
{
  ok(planErase([], 0) === null, 'niets te gommen geeft null')
  ok(planErase([{ top: 0, bottom: 0, left: 0, right: 0 }], 0) === null, 'lege vlakken tellen niet')

  // Twee vlakken op dezelfde hoogte horen bij één regel.
  const plan = planErase(
    [
      { top: 4, bottom: 40, left: 0, right: 120 },
      { top: 5, bottom: 40, left: 128, right: 300 },
    ],
    REGEL,
  )
  ok(plan.regels.length === 1, 'twee vlakken op dezelfde regel worden er één')
  ok(plan.regels[0].rechts === 300, 'en die regel loopt tot het verste vlak')
}

console.log(gezakt === 0 ? '\nAlles klopt.\n' : `\n${gezakt} controle(s) gezakt.\n`)
process.exit(gezakt === 0 ? 0 : 1)
