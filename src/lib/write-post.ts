import Anthropic from '@anthropic-ai/sdk'

import { formatDuration, formatNumber } from './format'

/**
 * De posttekst schrijven.
 *
 * De opzet in één zin: het model kiest de invalshoek, de feiten liggen vast.
 *
 * Dat onderscheid is de hele reden dat dit veilig kan. Een model dat vrij mag
 * schrijven over een site die volledig draait op echte zinnen van echte mensen
 * kan één ding kapotmaken dat je nooit meer terugkrijgt, namelijk een cijfer of
 * een citaat verzinnen dat er niet is. Dus schrijft het model wel, maar wordt
 * elk getal en elk citaat achteraf teruggelegd naast de databank. Klopt er iets
 * niet, dan gaat het één keer terug met de reden erbij, en anders valt hij
 * terug op de vaste tekst. Die vaste tekst is saai maar altijd waar, en dat is
 * de goede volgorde van die twee.
 *
 * De reden dat er überhaupt een model aan te pas komt: het onderzoek naar wat
 * er op Bluesky werkt was helder dat elke dag hetzelfde kaartje posten in de
 * 10% promotie valt die genegeerd wordt. Variatie in invalshoek is precies wat
 * een model wél goed kan en een sjabloon niet.
 */

export type Feiten = {
  body: string
  author: string | null
  durationMs: number
  rank: number
  rankedOf: number
  reads: number
  recordBroken: boolean
  endedToday: number
}

/** De invalshoeken. Het model kiest er één die bij déze zin past. */
const INVALSHOEKEN = `
- the record: this one outlasted everything before it
- the blink: it was gone almost immediately
- the exchange: read it as an answer to whatever came before
- the hour: something about when it was written, or where
- the mundane one that survived: two ordinary words nobody dared replace
- the unanswered question: it asked something and the next person ignored it
- the crowd: many people read this one
- the milestone: a round number of sentences, writers or readers
- the plain fact: sometimes the numbers are the whole story
- the quiet: nothing much happened, and that is its own observation
`.trim()

const SYSTEEM = `You write one short post for the Bluesky account of only-text.com.

only-text.com is a website that holds exactly one sentence at a time. Whoever
typed last owns the entire homepage. Anyone can take it from them without making
an account. The only score is how long your sentence survives before somebody
replaces it. Everything ever typed stays in a public archive.

Your job is to pick an angle and write around the facts you are given. Angles to
choose from, though you are not limited to these:

${INVALSHOEKEN}

Rules, all of them absolute:

1. Every number you write must appear in the facts you were given. Never
   calculate, estimate, round or infer one. If a number is not in the facts, it
   does not go in the post.
2. If you quote the sentence, quote it exactly, character for character. Never
   paraphrase it inside quotation marks.
3. Never write anything about the sentence that you were not told. You do not
   know who wrote it, why, where they were, or what they meant.
4. No em dashes and no en dashes. Use a comma, a full stop or a colon.
5. No hashtags. No emoji. Never end by asking people to visit, click or share.
6. Under 280 characters. Do not include a link, one is attached automatically.
7. Write like a person who finds this genuinely interesting, not like a brand.
   Short sentences. Dry rather than excited.

Reply with the post text and nothing else. No preamble, no quotation marks
around the whole thing, no explanation.`

/**
 * De feiten in de vorm die het model krijgt. Alles wat hier niet in staat mag
 * er niet in de post staan, dus dit is bewust letterlijk en zonder proza.
 */
function feitenblok(f: Feiten): string {
  const regels = [
    `The sentence, to quote exactly: "${f.body}"`,
    f.author ? `Written by: @${f.author}` : `Written by: nobody left a name`,
    `How long it held the front page: ${formatDuration(f.durationMs)}`,
    `Its rank: #${f.rank} of ${formatNumber(f.rankedOf)} sentences ever`,
    `People who read it: ${formatNumber(f.reads)}`,
    f.recordBroken ? `This is the longest any sentence has ever stood.` : null,
    `Sentences that came off the front page in the last 24 hours: ${formatNumber(f.endedToday)}`,
    // Staat hier omdat "two words and nobody touched them" een goede zin is en
    // het model anders een getal zou gebruiken dat het nergens kreeg.
    `Words in the sentence: ${f.body.trim().split(/\s+/).length}`,
  ].filter(Boolean)

  return regels.join('\n')
}

/**
 * Voluit geschreven getallen, zodat de controle ze net zo hard kan nakijken als
 * cijfers. Zonder dit ontsnapt "read by two hundred people" bij 88 lezers.
 * Eén wordt overgeslagen: dat woord komt te vaak voor als lidwoord.
 */
const WOORDGETAL: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80,
  ninety: 90, hundred: 100, thousand: 1000,
  second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8,
  ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13,
  twentieth: 20, thirtieth: 30,
}

/** De vaste tekst. Saai, maar elk woord komt uit de databank. */
export function vasteTekst(f: Feiten): string {
  const wie = f.author ? `by @${f.author}` : 'by nobody in particular'
  const kop = f.recordBroken
    ? 'A new record on only-text.com.'
    : 'This one just came off the front page.'

  return [
    kop,
    '',
    `"${f.body}"`,
    '',
    `Held it for ${formatDuration(f.durationMs)} ${wie}. Rank #${f.rank} of all time, read by ${formatNumber(f.reads)}.`,
  ].join('\n')
}

/* --------------------------------------------------------------------------
   De controle
   --------------------------------------------------------------------------
   Dit is het deel dat het verschil maakt tussen "een model schrijft onze
   posts" en "een model mag de vorm kiezen". Zonder deze functie is de rest
   van dit bestand een leuk idee met een open einde. */

export function controleer(tekst: string, f: Feiten): string | null {
  if (tekst.length > 290) return 'the post is longer than 290 characters'

  if (/[—–]/.test(tekst)) return 'the post contains an em dash or en dash'

  if (/#\w/.test(tekst)) return 'the post contains a hashtag'

  if (/https?:\/\//i.test(tekst)) return 'the post contains a link'

  // Elk getal in de post moet ook in de feiten staan. Getallen zijn het
  // makkelijkst te verzinnen en het duurst als ze fout zijn. Cijfers én
  // voluit geschreven woorden, want anders is de controle een zeef.
  const feiten = feitenblok(f)
  const cijfers: string[] = [
    ...(feiten.match(/\d+/g) ?? []),
    ...(f.body.match(/\d+/g) ?? []),
  ]
  const toegestaan = new Set(cijfers.map(Number).filter(Number.isFinite))

  for (const getal of tekst.match(/\d+/g) ?? []) {
    if (!toegestaan.has(Number(getal))) return `the number ${getal} is not in the facts`
  }

  for (const woord of tekst.toLowerCase().match(/[a-z]+/g) ?? []) {
    const waarde = WOORDGETAL[woord]
    if (waarde !== undefined && !toegestaan.has(waarde)) {
      return `you wrote "${woord}" but ${waarde} is not in the facts`
    }
  }

  // Alles tussen aanhalingstekens moet letterlijk uit de zin komen. Zo kan er
  // geen geparafraseerd citaat ontstaan dat eruitziet alsof iemand het typte.
  for (const m of tekst.matchAll(/"([^"]+)"/g)) {
    if (!f.body.includes(m[1])) {
      return `you put "${m[1]}" in quotation marks but that is not what the sentence says`
    }
  }

  return null
}

/**
 * Schrijft de post. Bij twijfel wint de vaste tekst.
 */
export async function schrijfPost(f: Feiten): Promise<{ tekst: string; door: 'ai' | 'sjabloon' }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { tekst: vasteTekst(f), door: 'sjabloon' }
  }

  const client = new Anthropic()
  const gesprek: Anthropic.MessageParam[] = [
    { role: 'user', content: `Here are the facts.\n\n${feitenblok(f)}` },
  ]

  // Twee pogingen. De tweede krijgt te horen wat er mis was, want dat is
  // meestal genoeg en het scheelt een derde ronde.
  for (let poging = 0; poging < 2; poging++) {
    let antwoord: Anthropic.Message
    try {
      antwoord = await client.messages.create({
        model: 'claude-opus-5',
        max_tokens: 2000,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium' },
        system: SYSTEEM,
        messages: gesprek,
      })
    } catch (e) {
      console.error('schrijfPost: API-aanroep faalde', e)
      break
    }

    // Bij een weigering niet naar een ander model uitwijken: we hebben al een
    // betere terugval, namelijk een tekst die gegarandeerd klopt.
    if (antwoord.stop_reason === 'refusal') break

    const tekst = antwoord.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    if (!tekst) break

    const fout = controleer(tekst, f)
    if (!fout) return { tekst, door: 'ai' }

    console.warn(`schrijfPost: poging ${poging + 1} afgekeurd, ${fout}`)
    gesprek.push(
      { role: 'assistant', content: tekst },
      {
        role: 'user',
        content: `That does not work: ${fout}. Write it again, and this time use only what is in the facts.`,
      },
    )
  }

  return { tekst: vasteTekst(f), door: 'sjabloon' }
}
