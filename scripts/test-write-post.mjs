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

const dag = { endedToday: 3, medianMs: 900000, rankedOf: 13 }

const melk = {
  id: 9,
  body: 'Bought milk.',
  author: 'anna',
  durationMs: 68400000, // 19h 00m
  rank: 3,
  reads: 212,
  words: 2,
  isRecord: false,
}

const f = { k: melk, dag }

const gevallen = [
  ['verzonnen cijfer', '"Bought milk." Held for 19h 00m. Read by 500 people.', true],
  ['verzonnen woordgetal', '"Bought milk." Two words, read by two hundred people.', true],
  ['geparafraseerd citaat', 'Somebody wrote "bought some milk" and it stood 19h 00m.', true],
  ['em-streepje', '"Bought milk." Two words — nobody touched them for 19h 00m.', true],
  ['en-streepje', '"Bought milk." Two words – untouched for 19h 00m.', true],
  ['hashtag', '"Bought milk." 19h 00m on the front page. #onlytext', true],
  ['link erin', '"Bought milk." Read it at https://only-text.com/thoughts/9', true],
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
   Deel 2: kiezen uit een stapel.

   De vraag die deze test stelt is niet of de tekst klopt maar of het model de
   juiste zin oppakt. In elke stapel hieronder staat één zin die een vreemde
   zou doorsturen en staat de langststaande zin er expres naast, want dat is
   precies de val: die is saai en wint op elke meetbare maat.
   -------------------------------------------------------------------------- */

const stapels = [
  {
    naam: 'saai en lang naast kort en raar',
    verwacht: 21,
    kandidaten: [
      {
        id: 20, body: 'Working on quarterly reporting integrations', author: null,
        durationMs: 32400000, rank: 1, reads: 14, words: 5, isRecord: true,
      },
      {
        id: 21, body: 'I have been awake for 40 hours and the fridge is humming in a key I recognise',
        author: null, durationMs: 240000, rank: 9, reads: 61, words: 17, isRecord: false,
      },
      {
        id: 22, body: 'asdf', author: null,
        durationMs: 8000, rank: 11, reads: 3, words: 1, isRecord: false,
      },
    ],
  },
  {
    naam: 'een vraag die niemand beantwoordde',
    verwacht: 31,
    kandidaten: [
      {
        id: 30, body: 'Testing testing', author: null,
        durationMs: 18000000, rank: 2, reads: 9, words: 2, isRecord: false,
      },
      {
        id: 31, body: 'Does anybody else read the last sentence before they write over it?',
        author: 'mara', durationMs: 600000, rank: 7, reads: 140, words: 12, isRecord: false,
      },
    ],
  },
  {
    naam: 'alles even nietszeggend',
    verwacht: null,
    kandidaten: [
      { id: 40, body: 'hello', author: null, durationMs: 120000, rank: 8, reads: 4, words: 1, isRecord: false },
      { id: 41, body: 'hi', author: null, durationMs: 90000, rank: 9, reads: 2, words: 1, isRecord: false },
    ],
  },
]

console.log('\n=== kiezen uit een stapel ===')
for (const s of stapels) {
  const { id, tekst, door } = await schrijfPost(s.kandidaten, dag)
  const gekozen = s.kandidaten.find((k) => k.id === id)
  const na = controleer(tekst, { k: gekozen, dag })
  // Ook de vaste tekst moet door zijn eigen controle komen: hij is de terugval
  // en een terugval die zichzelf afkeurt is geen terugval.
  if (na !== null) fouten++

  const keuzeGoed = s.verwacht === null || id === s.verwacht
  if (!keuzeGoed) fouten++

  console.log(`\n--- ${s.naam} (${door}, koos ${id}${s.verwacht ? `, verwacht ${s.verwacht}` : ''})`)
  console.log(`    "${gekozen.body}"`)
  console.log(tekst)
  if (na) console.log(`    CONTROLE: ${na}`)
}

console.log(fouten === 0 ? '\n\nAlles groen.' : `\n\n${fouten} fout(en).`)
process.exit(fouten === 0 ? 0 : 1)
