/**
 * De aftrap: het eerste bericht van het account.
 *
 * Dit is het enige bericht dat niet over een zin gaat die het volhield, want
 * die zijn er nog niet. Het gaat over de lege plek zelf, en het is de ene keer
 * dat uitnodigen mag: iemand moet de eerste zijn.
 *
 * Draait standaard droog. Hij haalt de echte zin op die op dat moment op de
 * voorpagina staat, zet het bericht in elkaar en drukt het af. Pas met --post
 * gaat het er ook echt op, en dat is met opzet: dit is de eerste indruk van een
 * account met nul volgers, en die typ je één keer.
 *
 *   node scripts/bsky-launch.mjs          droog, laat zien wat er zou komen
 *   node scripts/bsky-launch.mjs --post   plaatst het echt
 */
import { readFileSync } from 'node:fs'

for (const r of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = r.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'
const echt = process.argv.includes('--post')

const huidig = await fetch(`${SITE}/api/current`).then((r) => r.json())
if (!huidig?.message?.body) throw new Error('geen zin op de voorpagina, dus niets om naar te wijzen')

// De startzin citeren leek een goed idee tot het er stond: die zegt zelf al
// "one sentence long", dus het bericht herhaalde zijn eigen openingsregel en
// het citaat werd bovendien afgekapt. De laatste regel wordt daarom een feit
// uit de databank, en die blijft kloppen ook als iemand de pagina overneemt
// tussen dit afdrukken en het plaatsen in.
const geteld = huidig?.stats?.total_messages ?? 1
const slot =
  geteld <= 1
    ? 'Nobody has taken it yet. It is just sitting there.'
    : `It has already changed hands ${geteld - 1} ${geteld - 1 === 1 ? 'time' : 'times'}.`

const tekst = [
  'only-text.com is one sentence long.',
  '',
  'That sentence is the whole homepage. It belongs to whoever typed last and stays theirs until somebody types over it. No account, nothing to sign up for, no feed.',
  '',
  slot,
].join('\n')

// Het antwoord herhaalt niet wat er hierboven al staat: het zegt wat dit account
// zelf gaat doen, zodat wie hier volgt weet waar hij ja tegen zegt.
const naschrift =
  'Everything ever typed stays in a public archive, with how long it survived written next to it. That number is the only score here, and the sentences that lasted are the only thing this account will post.'

console.log('--- bericht ---')
console.log(tekst)
console.log(`\n(${tekst.length} tekens)`)
console.log('\n--- antwoord eronder ---')
console.log(naschrift)
console.log(`\n(${naschrift.length} tekens)`)
console.log('\n--- linkkaart ---')
console.log(`${SITE} · one sentence at a time`)

if (tekst.length > 300 || naschrift.length > 300) {
  throw new Error('te lang voor Bluesky, kort in voordat je dit plaatst')
}

if (!echt) {
  console.log('\nDroog gedraaid. Voeg --post toe om het echt te plaatsen.')
  process.exit(0)
}

const { post } = await import('../src/lib/bluesky.ts')
const geplaatst = await post({
  text: tekst,
  url: SITE,
  title: 'only-text.com',
  description: 'One sentence. It belongs to whoever typed last.',
  imageUrl: `${SITE}/og-default.png`,
  naschrift,
})

console.log(`\nGeplaatst: ${geplaatst.uri}`)
