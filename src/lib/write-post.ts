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

/** Eén zin die vandaag van de voorpagina viel. */
export type Kandidaat = {
  id: number
  body: string
  author: string | null
  durationMs: number
  rank: number
  reads: number
  words: number
  isRecord: boolean
}

/** Wat er verder over de dag te zeggen valt, gelijk voor elke kandidaat. */
export type Dag = {
  endedToday: number
  medianMs: number | null
  rankedOf: number
}

export type Feiten = { k: Kandidaat; dag: Dag }

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

const SYSTEEM = `You pick one sentence and write one short post about it, for the
Bluesky account of only-text.com.

only-text.com is a website that holds exactly one sentence at a time. Whoever
typed last owns the entire homepage. Anyone can take it from them without making
an account. The only score is how long your sentence survives before somebody
replaces it. Everything ever typed stays in a public archive.

Who you are. You are not a person and you are not a brand: you are the page
itself, keeping a log. You were there for every sentence that has ever stood
here, you know exactly how long each one lasted, and you find that genuinely
interesting the way a lighthouse keeper finds the weather interesting. You have
no opinions about what people write and you never grade it. You notice, you
record, and occasionally something is worth pointing at. You are dry rather than
warm, and you would rather say one true thing than three nice ones. You have all
the time in the world, so you are never in a hurry to be liked.

Choosing. You are given every sentence that came off the front page in the last
day. Pick the one a stranger would repeat to somebody else, and write about that
one. Not the one that lasted longest: the sentence that held the page for nine
hours is usually the one typed at four in the morning when nobody was awake to
take it. How long something lasted is a fact you may use and it often makes the
sentence funnier, but it is never the reason to pick it.

What travels: something odd, something exact, something that sounds like a real
person had a real day. Two ordinary words nobody dared touch. A question left
hanging. A sentence that reads differently once you know how long it stood. A
short strange one beats a long dull one every time. If none of them is
remarkable, take the one with the most life in it and write it plainly. Never
oversell: calling a flat sentence remarkable is worse than posting nothing.

Then pick an angle and write around the facts of the one you chose. Angles,
though you are not limited to these:

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
8. You know the sentences listed below and nothing else. You cannot see the
   archive, so never say something is the most read, the longest, the first or
   beyond anything else unless a fact says so in those words. Comparing to the
   other sentences listed here is fine. Inventing a comparison is the one
   mistake that cannot be taken back.

Answer with the id of the sentence you chose and the post text, and nothing
else. No preamble, no quotation marks around the whole post, no explanation.`

/**
 * De feiten van één zin, in de vorm die het model krijgt. Alles wat hier niet
 * in staat mag er niet in de post staan, dus dit is bewust letterlijk en zonder
 * proza. Dit blok is ook de bron van de controle achteraf: elk getal dat hier
 * voorkomt mag in de tekst, de rest niet.
 */
function feitenblok({ k, dag }: Feiten): string {
  const regels = [
    `Sentence id: ${k.id}`,
    `The sentence, to quote exactly: "${k.body}"`,
    k.author ? `Written by: @${k.author}` : `Written by: nobody left a name`,
    `How long it held the front page: ${formatDuration(k.durationMs)}`,
    `Its rank: #${k.rank} of ${formatNumber(dag.rankedOf)} sentences ever`,
    `People who read it: ${formatNumber(k.reads)}`,
    k.isRecord ? `This is the longest any sentence has ever stood.` : null,
    // "This one included" staat er niet voor de sier. Zonder die drie woorden
    // leest het model het getal als iets wat naast deze zin gebeurde, en dan
    // schrijft het "two came off the page, and this was not one of them" over
    // een zin die per definitie van de pagina viel. Dat is geen verzonnen
    // getal, dus de controle ziet het niet.
    `Sentences that came off the front page in the last 24 hours, this one included: ${formatNumber(dag.endedToday)}`,
    // De vergelijking met de rest van de dag is vaak het hele verhaal: "twee
    // minuten" zegt niets, "twee minuten terwijl de rest het geen twintig
    // seconden volhield" zegt alles.
    dag.medianMs
      ? `How long the middle sentence of the last 24 hours lasted: ${formatDuration(dag.medianMs)}`
      : null,
    // Staat hier omdat "two words and nobody touched them" een goede zin is en
    // het model anders een getal zou gebruiken dat het nergens kreeg.
    `Words in the sentence: ${k.words}`,
  ].filter(Boolean)

  return regels.join('\n')
}

/** De hele stapel, zodat het model kan kiezen. */
function kandidatenblok(ks: Kandidaat[], dag: Dag): string {
  return ks.map((k) => feitenblok({ k, dag })).join('\n\n')
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
export function vasteTekst({ k, dag }: Feiten): string {
  const wie = k.author ? `by @${k.author}` : 'by nobody in particular'
  const kop = k.isRecord
    ? 'A new record on only-text.com.'
    : 'This one just came off the front page.'

  return [
    kop,
    '',
    `"${k.body}"`,
    '',
    `Held it for ${formatDuration(k.durationMs)} ${wie}. Rank #${k.rank} of ${formatNumber(dag.rankedOf)}, read by ${formatNumber(k.reads)}.`,
  ].join('\n')
}

/**
 * De regel die als antwoord onder het bericht komt.
 *
 * Het bericht zelf gaat over één zin van één vreemde, en dat is precies goed:
 * daar gaat de site over. Maar wie er langsscrolt zonder de site te kennen ziet
 * een citaat zonder wereld eromheen. Die uitleg hoort in het antwoord, niet in
 * het bericht, want anders gaat het bericht over ons.
 *
 * Vast geschreven en niet door het model: een uitleg van wat je bent moet elke
 * dag hetzelfde zijn, en dit is de ene plek waar één keer uitnodigen mag. Vier
 * varianten zodat het geen automaat wordt, gekozen op het nummer van de zin,
 * zodat dezelfde invoer altijd hetzelfde oplevert en dit te testen is.
 */
const NASCHRIFTEN = [
  'If you are new here: only-text.com is one sentence long. Whoever typed it owns the page until somebody else types. That is the whole site.',
  'The site behind this holds exactly one sentence. No accounts, no feed, no algorithm. You take the page by writing on it and you keep it until someone wants it more.',
  'How it works: only-text.com has room for one sentence. Anyone can replace it, and the only score is how long yours stays up.',
  'Context, if you just wandered in: the entire homepage is one sentence, it belongs to whoever typed last, and it is free to take.',
]

export function naschriftVoor(id: number): string {
  return NASCHRIFTEN[Math.abs(id) % NASCHRIFTEN.length]
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

  // Een letter na het hekje, niet zomaar een teken: "#3" is een rangnummer en
  // dat staat zo in het feitenblok dat het model krijgt. Met /#\w/ keurden we
  // dus af wat we zelf hadden aangereikt, en de vaste terugvaltekst viel op zijn
  // eigen controle. Een hashtag zonder letter bestaat op Bluesky niet.
  if (/#[a-z]/i.test(tekst)) return 'the post contains a hashtag'

  if (/https?:\/\//i.test(tekst)) return 'the post contains a link'

  // Elk getal in de post moet ook in de feiten staan. Getallen zijn het
  // makkelijkst te verzinnen en het duurst als ze fout zijn. Cijfers én
  // voluit geschreven woorden, want anders is de controle een zeef.
  const feiten = feitenblok(f)
  const cijfers: string[] = [
    ...(feiten.match(/\d+/g) ?? []),
    ...(f.k.body.match(/\d+/g) ?? []),
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

  // Een uitspraak over het hele archief kan het model niet doen: het krijgt de
  // zinnen van vandaag en verder niets. Toch schreef het "61 people read it,
  // more than any other sentence in the archive has managed", en dat was ook
  // nog onwaar. Het getal klopte, dus de controle hierboven liet het door.
  //
  // Dit vangt alleen de vorm waarin dat gebeurde en niet elke denkbare claim;
  // dat laatste kan niet met een reguliere uitdrukking. De regel in de opdracht
  // doet het echte werk, dit is het net eronder. Bij een echt record mag het
  // wel, want dan staat het in de feiten.
  if (!f.k.isRecord && /more than any|than any other|longest ever|never been|first ever/i.test(tekst)) {
    return 'you claimed something about the whole archive, and you were only shown today'
  }

  // Alles tussen aanhalingstekens moet letterlijk uit de zin komen. Zo kan er
  // geen geparafraseerd citaat ontstaan dat eruitziet alsof iemand het typte.
  for (const m of tekst.matchAll(/"([^"]+)"/g)) {
    if (!f.k.body.includes(m[1])) {
      return `you put "${m[1]}" in quotation marks but that is not what the sentence says`
    }
  }

  return null
}

/**
 * Het antwoordformaat. Het model kiest én schrijft, dus er moeten twee dingen
 * uit komen en het nummer moet zonder gokwerk terug te lezen zijn. Vrij tekst
 * laten uitpakken en er dan een id uit vissen is precies de plek waar een
 * regenboog aan randgevallen ontstaat.
 */
const ANTWOORDVORM = {
  type: 'json_schema' as const,
  schema: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: 'The id of the sentence you chose.' },
      post: { type: 'string', description: 'The post text, under 280 characters.' },
    },
    required: ['id', 'post'],
    additionalProperties: false,
  },
}

/**
 * Kiest een zin en schrijft de post. Bij twijfel wint de vaste tekst.
 *
 * Welke zin de vaste tekst neemt als het model afhaakt: de langststaande. Dat
 * is precies de keuze die we het model uit handen namen, maar een terugval mag
 * geen oordeel vellen, en "de langste" is tenminste na te rekenen.
 */
export async function schrijfPost(
  kandidaten: Kandidaat[],
  dag: Dag,
): Promise<{ id: number; tekst: string; door: 'ai' | 'sjabloon' }> {
  if (kandidaten.length === 0) throw new Error('geen kandidaten om over te schrijven')

  const langste = [...kandidaten].sort((a, b) => b.durationMs - a.durationMs)[0]
  const terugval = {
    id: langste.id,
    tekst: vasteTekst({ k: langste, dag }),
    door: 'sjabloon' as const,
  }

  if (!process.env.ANTHROPIC_API_KEY) return terugval

  const client = new Anthropic()
  const gesprek: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: 'user',
      content: `Here is every sentence that came off the front page in the last day. Pick one and write the post.\n\n${kandidatenblok(kandidaten, dag)}`,
    },
  ]

  // Twee pogingen. De tweede krijgt te horen wat er mis was, want dat is
  // meestal genoeg en het scheelt een derde ronde.
  for (let poging = 0; poging < 2; poging++) {
    let antwoord: Anthropic.Beta.BetaMessage
    try {
      antwoord = await client.beta.messages.create({
        model: 'claude-opus-5',
        // Ruim, want het budget dekt het denken én de tekst. De post zelf is
        // 280 tekens; wat hier op raakt is het nadenken over de invalshoek, en
        // een afgekapt antwoord kost een hele ronde.
        max_tokens: 8000,
        thinking: { type: 'adaptive' },
        // Eén aanroep per dag, dus zuinig zijn levert hier niets op, en de
        // moeilijkheid zit hem juist in de afweging: welke invalshoek past bij
        // déze zin, en welk getal maakt het punt. Dat is precies waar een
        // hogere inspanning voor is.
        output_config: { effort: 'high', format: ANTWOORDVORM },
        // Mensen typen hier wat ze willen. Wordt een zin geweigerd door de
        // classificatie, dan valt de aanroep zonder dit terug op de vaste tekst
        // en gaat de invalshoek verloren; met dit valt hij terug op een ander
        // model en komt er alsnog een geschreven bericht uit.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
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

    const rauw = antwoord.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    if (!rauw) break

    let keuze: { id: number; post: string }
    try {
      keuze = JSON.parse(rauw)
    } catch {
      console.error('schrijfPost: antwoord was geen geldige json')
      break
    }

    // Het gekozen nummer moet uit de stapel komen. Een zin verzinnen die er niet
    // in stond zou een linkkaart opleveren die nergens heen wijst, en dat is een
    // fout die je pas ziet als iemand erop klikt.
    const gekozen = kandidaten.find((k) => k.id === keuze.id)
    if (!gekozen) {
      console.warn(`schrijfPost: id ${keuze.id} stond niet in de stapel`)
      gesprek.push(
        { role: 'assistant', content: rauw },
        {
          role: 'user',
          content: `There is no sentence with id ${keuze.id}. Choose one of the ids you were given.`,
        },
      )
      continue
    }

    const tekst = keuze.post.trim()
    const fout = controleer(tekst, { k: gekozen, dag })
    if (!fout) return { id: gekozen.id, tekst, door: 'ai' }

    console.warn(`schrijfPost: poging ${poging + 1} afgekeurd, ${fout}`)
    gesprek.push(
      { role: 'assistant', content: rauw },
      {
        role: 'user',
        content: `That does not work: ${fout}. Write it again, and this time use only what is in the facts of the sentence you chose.`,
      },
    )
  }

  return terugval
}
