import { readFileSync } from 'node:fs'
for (const r of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = r.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const { schrijfPost, controleer } = await import('../src/lib/write-post.ts')

/* --------------------------------------------------------------------------
   Deel 1: de controle, met verzinsels die er plausibel uitzien.

   Dit is het belangrijkste deel van deze test. Het model dat de posts schrijft
   is niet het probleem; het probleem is de dag waarop het iets aannemelijks
   verzint en er niets tussen zit. Elk geval hieronder is een tekst die zo de
   tijdlijn op zou kunnen, en die tegengehouden hoort te worden.
   -------------------------------------------------------------------------- */

const f = {
  body: 'Bought milk.',
  author: 'anna',
  durationMs: 68400000, // 19h 00m
  rank: 3,
  rankedOf: 13,
  reads: 212,
  recordBroken: false,
  endedToday: 2,
}

const gevallen = [
  ['verzonnen cijfer', '"Bought milk." Held for 19h 00m. Read by 500 people.', true],
  ['verzonnen woordgetal', '"Bought milk." Two words, read by two hundred people.', true],
  ['geparafraseerd citaat', 'Somebody wrote "bought some milk" and it stood 19h 00m.', true],
  ['em-streepje', '"Bought milk." Two words — nobody touched them for 19h 00m.', true],
  ['en-streepje', '"Bought milk." Two words – untouched for 19h 00m.', true],
  ['hashtag', '"Bought milk." 19h 00m on the front page. #onlytext', true],
  ['link erin', '"Bought milk." Read it at https://only-text.com/m/9', true],
  ['te lang', '"Bought milk." ' + 'x'.repeat(300), true],
  ['klopt helemaal', '"Bought milk." Two words from @anna, untouched for 19h 00m. 212 people read it.', false],
  ['klopt, voluit', '"Bought milk." Third longest of the 13 so far, and nobody replaced it.', false],
]

let fouten = 0
console.log('=== de controle ===\n')
for (const [naam, tekst, moetFalen] of gevallen) {
  const uitkomst = controleer(tekst, f)
  const goed = moetFalen ? uitkomst !== null : uitkomst === null
  if (!goed) fouten++
  console.log(`${goed ? 'ok  ' : 'FOUT'} ${naam.padEnd(22)} ${uitkomst ?? 'doorgelaten'}`)
}

/* --------------------------------------------------------------------------
   Deel 2: vier echte situaties door het model heen.
   -------------------------------------------------------------------------- */

const situaties = [
  {
    naam: 'het record',
    f: {
      body: 'Somewhere a stranger is reading this exact sentence right now.',
      author: 'Lorenzo', durationMs: 4316382, rank: 1, rankedOf: 13, reads: 47,
      recordBroken: true, endedToday: 6,
    },
  },
  {
    naam: 'vier seconden',
    f: {
      body: 'test', author: null, durationMs: 4000, rank: 12, rankedOf: 13,
      reads: 1, recordBroken: false, endedToday: 9,
    },
  },
  { naam: 'het alledaagse dat bleef', f },
  {
    naam: 'de onbeantwoorde vraag',
    f: {
      body: 'What would you write if you knew one stranger would read it?',
      author: null, durationMs: 7200000, rank: 5, rankedOf: 13, reads: 88,
      recordBroken: false, endedToday: 4,
    },
  },
]

console.log('\n=== vier echte situaties ===')
for (const s of situaties) {
  const { tekst, door } = await schrijfPost(s.f)
  const na = controleer(tekst, s.f)
  if (na !== null && door === 'ai') fouten++
  console.log(`\n--- ${s.naam} (${door}, ${tekst.length} tekens)`)
  console.log(tekst)
}

console.log(fouten === 0 ? '\n\nAlles groen.' : `\n\n${fouten} fout(en).`)
process.exit(fouten === 0 ? 0 : 1)
