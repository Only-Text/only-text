import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity'

import { foldForMatching } from './sanitize'

/**
 * Moderatie zonder AI.
 *
 * Alles hieronder is platte logica: normaliseren, platslaan, en vergelijken met
 * lijsten. Dat is bewust, want een taalmodel raadplegen kost honderden
 * milliseconden per bericht en dit veld moet aanvoelen als typen op papier.
 * Iemand drukt op enter en zijn zin staat er. Geen wachtbalk, geen "even
 * controleren".
 *
 * Het beleid is niet preuts. Wie "verdomme" of "shit" typt mag dat zeggen; dat
 * censureren maakt de site braaf en saai. Wat we tegenhouden is wat op mensen
 * gericht is:
 *
 *   1. scheldwoorden over afkomst, huidskleur, geloof, seksualiteit of handicap
 *   2. haatideologie en de bijbehorende leuzen en codes
 *   3. bedreigingen en oproepen tot geweld
 *   4. seksuele inhoud waarbij kinderen betrokken zijn
 *
 * Persoonsgegevens (adressen, telefoonnummers, links) worden in sanitize.ts
 * afgevangen, niet hier.
 *
 * Alle termen staan in geplette vorm: kleine letters, zonder spaties, zonder
 * accenten, met leetspeak teruggedraaid. `foldForMatching('K4nker-l1jer')`
 * levert `kankerlijer`, dus die trucs werken hier niet.
 */

/**
 * De standaarddataset van `obscenity` blokkeert ál het gevloek, inclusief
 * "shit" en "fuck". Dat is precies wat we níet willen: "Shit happens, and then
 * you get on with it" is een prima zin voor de voorpagina.
 *
 * Daarom knippen we de lijst terug tot alleen de woorden die op een groep
 * mensen gericht zijn. De matcher van obscenity blijft wel staan, want die is
 * goed in het herkennen van uitgerekte en verminkte varianten.
 */
const ENGELSE_SCHELDWOORDEN = new Set([
  'abbo', 'abeed', 'africoon', 'chink', 'coon', 'dyke', 'fag', 'faggot',
  'kike', 'nigger', 'nigga', 'retard', 'spic', 'tranny', 'wigger',
])

const englishMatcher = new RegExpMatcher({
  ...englishDataset
    .removePhrasesIf(
      (phrase) => !ENGELSE_SCHELDWOORDEN.has(phrase.metadata?.originalWord ?? ''),
    )
    .build(),
  ...englishRecommendedTransformers,
})

/**
 * Engelstalige haat en bedreiging die niet in die dataset zit. Deze gaan via
 * dezelfde geplette vergelijking als de Nederlandse lijst, dus leetspeak en
 * spaties tussen de letters werken hier ook niet als ontsnapping.
 */
const ENGELS_EXTRA = [
  'wetback', 'towelhead', 'raghead', 'sandnigger', 'beaner', 'gook',
  'zipperhead', 'currymuncher', 'gypsyscum', 'whitetrash',
  'killallthe', 'gasthejews', 'hitlerwasright', 'deathto',
  'ropeday', 'dayofthe rope', 'killyourself', 'kysnow', 'neckyourself',
  'childporn', 'childrape', 'jailbait', 'lolicon',
]

/**
 * Afkomst, huidskleur en etniciteit.
 *
 * Bewust weggelaten: woorden als "mocro", "bounty" en "pauper". Die worden ook
 * neutraal of als zelfbenoeming gebruikt, en een vals alarm op een onschuldige
 * zin is hier erger dan een gemist scheldwoord: wie ten onrechte geweigerd
 * wordt, komt niet terug.
 */
const HERKOMST = [
  'neger', 'negers', 'nikker', 'nikkers', 'roetmop', 'roetmoppen',
  'zwartjoekel', 'spleetoog', 'spleetogen', 'poepchinees',
  'kanakker', 'kanakkers', 'bosneger',
  'kutbuitenlander', 'zandneger', 'kameelneuker', 'geitenneuker',
  'kutmocro', 'pleuriszwarte',
]

/** Geloof. */
const GELOOF = [
  'kutjood', 'vuilejood', 'jodenhond', 'jodenhonden', 'kutmoslim',
  'moslimhond', 'moslimtuig', 'kutchristen', 'islamhond', 'kaffir',
]

/** Seksualiteit en gender. */
const SEKSUALITEIT = [
  'kutflikker', 'vuileflikker', 'flikkers', 'homohater', 'kutpot',
  'vuilepot', 'travestietenhoer', 'kuttrans', 'trannie', 'tranny',
  'kutlesbo', 'homotuig',
]

/** Handicap en gezondheid als scheldwoord tegen een persoon. */
const HANDICAP = [
  'kutmongool', 'vuilemongool', 'debielemongool', 'mongooltje',
  'kutgehandicapte', 'spastentuig', 'kutspast',
]

/**
 * Haatideologie, leuzen en codes.
 *
 * Twee dingen om te onthouden bij het uitbreiden van deze lijst:
 *
 * 1. Korte fragmenten zijn gevaarlijk. "zog" zat hier eerst in, maar dat komt
 *    voor in "zogenaamd"; "sieg" zit in "Siegfried". Alleen hele leuzen.
 * 2. Termen met drie of meer dezelfde tekens achter elkaar kunnen nooit
 *    matchen: foldForMatching() kort herhalingen in tot twee, dus "kkk" wordt
 *    "kk" en de term is dood letterwerk.
 */
const IDEOLOGIE = [
  'heilhitler', 'siegheil', 'hitlerjugend', 'blutundboden', 'bloodandsoil',
  'whitepower', 'whitepride', 'racewar', 'rassenoorlog', 'raciaalzuiver',
  'gaskamer', 'gaskamers', 'vergassen', 'ovenin', 'holohoax',
  'holocaustontkenning', 'jodenvraagstuk', 'endlosung', 'finalsolution',
  'omvolking', 'greatreplacement', 'kukluxklan',
  'combat18', 'blood18', 'wpww', 'rahowa', 'fourteenwords', 'veertienwoorden',
]

/** Bedreiging en geweld. */
const GEWELD = [
  'ikvermoordje', 'ikmaakjedood', 'ikmaakjeaf', 'jegaateraan',
  'ikstekjeneer', 'ikschietjedood', 'ikkomjehalen', 'ikweetwaarjewoont',
  'doodsbedreiging', 'gasjullie', 'hangalle', 'ikslajedood',
  'moetdood', 'moetenallemaaldood', 'killyourself', 'kysjezelf',
  'ganjezelfophangen', 'springvoordetrein', 'pleegzelfmoord',
]

/** Seksueel misbruik van kinderen. */
const KINDEREN = [
  'kinderporno', 'kinderpornografie', 'pedofielmateriaal', 'childporn',
  'cp video', 'kinderseks', 'lolicon', 'jailbait',
]

/**
 * Versterkers plus doelwitten. Losse woorden zijn hier het probleem niet:
 * "kanker" alleen is Nederlands vloeken, "kankerjood" is iets heel anders.
 * Door ze te combineren vangen we de gerichte variant zonder het gewone
 * gevloek te verbieden.
 */
const VERSTERKERS = [
  'kanker', 'kankere', 'tering', 'tyfus', 'pleuris', 'pokke', 'kut', 'vuile',
  'vieze', 'stomme', 'dood', 'klote',
]
const DOELWITTEN = [
  'jood', 'joden', 'moslim', 'moslims', 'neger', 'negers', 'nikker',
  'flikker', 'flikkers', 'homo', 'homos', 'lesbo', 'pot', 'mongool',
  'mongolen', 'turk', 'turken', 'marokkaan', 'marokkanen', 'chinees',
  'chinezen', 'zigeuner', 'zigeuners', 'aap', 'apen', 'buitenlander',
  'asielzoeker', 'vluchteling', 'gehandicapte', 'spast', 'kankerlijer',
]

function buildSet(): Set<string> {
  const set = new Set<string>()
  const add = (term: string) => {
    const folded = foldForMatching(term)
    if (folded.length >= 3) set.add(folded)
  }

  for (const list of [
    HERKOMST, GELOOF, SEKSUALITEIT, HANDICAP, IDEOLOGIE, GEWELD, KINDEREN,
    ENGELS_EXTRA,
  ]) {
    list.forEach(add)
  }

  for (const v of VERSTERKERS) {
    for (const d of DOELWITTEN) {
      add(v + d)
      add(v + d + 'en')
      add(v + d + 's')
    }
  }

  return set
}

const NEDERLANDS = buildSet()

export type ModerationVerdict =
  | { blocked: false }
  | { blocked: true; language: 'en' | 'nl' }

export function checkContent(text: string): ModerationVerdict {
  if (englishMatcher.hasMatch(text)) return { blocked: true, language: 'en' }

  const folded = foldForMatching(text)
  for (const term of NEDERLANDS) {
    if (folded.includes(term)) return { blocked: true, language: 'nl' }
  }
  return { blocked: false }
}

/** De lijst die sanitize.validateBody() gebruikt voor namen en tekst. */
export function dutchBlocklist(): Set<string> {
  return NEDERLANDS
}

/**
 * De afwijzing. Bewust niet belerend: een strenge toon nodigt uit om het nog
 * eens te proberen, terwijl een droge grap de lol er meteen af haalt. Er is
 * geen enkele reden om iemand hier een preek te geven.
 */
const AFWIJZINGEN: Record<string, string[]> = {
  blocked_word: [
    'The paper refuses to take this one.',
    'The pen ran dry at exactly that word.',
    'That sentence fell out on the way to the page.',
    'No. Write something you will still stand behind tomorrow.',
    'Even the ink went pale. Try again.',
    'That word does not fit through the letterbox.',
  ],
  link: [
    'Links do not work on paper.',
    'You cannot click a sheet of paper.',
    'This is not a noticeboard for your website.',
  ],
  contact: [
    'Do not put your phone number on the front page of the internet.',
    'Everyone would call. Leave it out.',
  ],
  repetition: [
    'That is more of a noise than a sentence.',
    'The key is stuck. Let go of it.',
  ],
  shouting: [
    'No need to shout, everyone is already reading.',
    'Turn off the caps lock and try again.',
  ],
  gibberish: [
    'That is one word half a metre long.',
    'There is no room left for a space, and that is a sign.',
  ],
  too_long: [
    'It is a sentence, not a letter.',
    'Cut it down. The space is scarce, that is the whole point.',
  ],
  duplicate: ['That is already up there. Word for word.'],
  empty: ['There is nothing here yet.'],
}

/**
 * Kiest een melding op basis van de tekst zelf, zodat dezelfde poging steeds
 * hetzelfde antwoord geeft. Willekeur zou bij een herhaalde poging een andere
 * grap geven, en dan gaat iemand er net zo lang op drukken tot hij ze allemaal
 * heeft gezien.
 */
export function funnyRejection(reason: string, seed: string): string {
  const options = AFWIJZINGEN[reason]
  if (!options || options.length === 0) return 'That did not work.'
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return options[h % options.length]
}
