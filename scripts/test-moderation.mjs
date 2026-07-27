/**
 * Test van het filter. Twee vragen, en de tweede is de belangrijkste:
 *
 *   1. Laat het de dingen die er niet horen daadwerkelijk niet door?
 *   2. Laat het gewone zinnen wél door?
 *
 * Vals alarm is hier erger dan een gemiste treffer. Wie een onschuldige zin
 * typt en geweigerd wordt, denkt dat de site stuk is en komt niet terug.
 *
 *   node scripts/test-moderation.mjs
 */
const { checkContent, dutchBlocklist } = await import('../src/lib/moderation.ts')
const { validateBody } = await import('../src/lib/sanitize.ts')

const blocklist = dutchBlocklist()
let fouten = 0

function moetDoor(zin) {
  const v = validateBody(zin, blocklist)
  const m = v.ok ? checkContent(v.body) : { blocked: true }
  const goed = v.ok && !m.blocked
  if (!goed) {
    fouten++
    console.log(`FOUT  onterecht geweigerd: "${zin}"  (${v.ok ? 'filter' : v.reason})`)
  }
  return goed
}

function moetNiet(zin, waarom) {
  const v = validateBody(zin, blocklist)
  const geblokkeerd = !v.ok || checkContent(v.body).blocked
  if (!geblokkeerd) {
    fouten++
    console.log(`FOUT  kwam er doorheen (${waarom}): "${zin}"`)
  }
  return geblokkeerd
}

console.log('\n— gewone zinnen moeten er gewoon doorheen —')
const onschuldig = [
  'Vandaag naar de dierentuin gegaan.',
  'I just watched the sun come up over the harbour.',
  'Zogenaamd zou het vandaag droog blijven.',
  'Mijn kat heeft de hele nacht op mijn hoofd geslapen.',
  'This is my first time here and I have no idea what to write.',
  'Verdomme, ik ben mijn sleutels weer kwijt.',
  'Shit happens, and then you get on with it.',
  'Siegfried en Roy hadden ook een tijger.',
  'De pot verwijt de ketel dat hij zwart ziet.',
  'Ik werk bij een bank in Utrecht.',
  "Coördinatie, ijsvrij, geënt, één, café, financiën, blèren, zeeën.",
  'Greetings from Seoul, it is 3am and I cannot sleep.',
  'Мой русский друг говорит привет.',
  'Somebody once told me the world is gonna roll me.',
  'Het regent al drie dagen achter elkaar.',
  'I love my mother more than anything.',
]
onschuldig.forEach(moetDoor)

console.log('\n— dit hoort tegengehouden te worden —')
const verwerpelijk = [
  ['Alle kutjoden moeten weg', 'gericht scheldwoord'],
  ['k4nker j0den', 'leetspeak'],
  ['K A N K E R M O S L I M', 'spaties tussen letters'],
  ['heil hitler', 'ideologie'],
  ['Ik vermoord je morgen', 'bedreiging'],
  ['go kill yourself', 'bedreiging'],
  ['vuile flikker die je bent', 'gericht scheldwoord'],
  ['kinderporno', 'kinderen'],
  ['Bekijk het op https://voorbeeld.nl', 'link'],
  ['Bel me op 06 12 34 56 78', 'telefoonnummer'],
  ['mail naar iemand@voorbeeld.nl', 'e-mailadres'],
  ['AAAAAAAAAAAAAAAAAA', 'herhaling'],
  ['DIT IS ALLEMAAL IN HOOFDLETTERS EN SCHREEUWERIG', 'schreeuwen'],
  ['ннн'.repeat(30), 'te lang'],
]
verwerpelijk.forEach(([zin, waarom]) => moetNiet(zin, waarom))

console.log('\n— unicode-trucs —')
const trucs = [
  ['Zalgo: ẗ̸̢̛̗̮͈́̈́ë̶́ͅk̷̺̏s̶̰̈t̴̰̽ hier', 'zalgo wordt afgekapt'],
  ['tekst​met​onzichtbare​tekens', 'zero-width eruit'],
  ['‮omgekeerd renderen', 'bidi-override eruit'],
]
for (const [zin, wat] of trucs) {
  const v = validateBody(zin, blocklist)
  const schoon = v.ok ? v.body : '(geweigerd)'
  const rommel = new RegExp('[\u200b-\u200f\u202a-\u202e\ufeff]')
  const heeftRommel = rommel.test(schoon)
  if (heeftRommel) {
    fouten++
    console.log(`FOUT  ${wat}: rommel bleef staan`)
  } else {
    console.log(`OK    ${wat} -> "${schoon.slice(0, 46)}"`)
  }
}

console.log(`\n${fouten === 0 ? 'Alles goed.' : `${fouten} probleem(en).`}\n`)
process.exit(fouten === 0 ? 0 : 1)
