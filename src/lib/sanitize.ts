/**
 * Tekstopschoning voor een volledig openbaar, accountloos invoerveld.
 *
 * Twee verschillende bewerkingen, en het verschil is belangrijk:
 *
 *   normalizeForStorage()  — wat we bewaren en tonen. Blijft leesbaar en
 *                            behoudt hoofdletters, leestekens en diakrieten.
 *   foldForMatching()      — een geplette versie die we alleen gebruiken om
 *                            filters op los te laten. Nooit tonen, nooit opslaan.
 *
 * Wie "schåldw00rd" typt met een Cyrillische a en een nul, moet door hetzelfde
 * filter vallen als wie het gewoon uitschrijft. Daarom wordt er eerst geplet
 * en pas daarna gefilterd.
 */

export const MAX_BODY_LENGTH = 240
export const MAX_AUTHOR_LENGTH = 24

/**
 * Alle tekenklassen hieronder staan bewust als \u-escapes en niet als
 * letterlijke tekens. Sommige onzichtbare tekens (U+2028 line separator,
 * U+2029 paragraph separator) knippen een regex-literal letterlijk doormidden,
 * en dan faalt het hele bestand met "Invalid regular expression".
 */

/** Bouwt een tekenklasse uit codepunten, zodat er geen enkel onzichtbaar
 *  teken in de broncode terechtkomt. Ranges mogen als [van, tot]. */
function charClass(parts: Array<number | [number, number]>, flags = ''): RegExp {
  const esc = (c: number) => '\\u' + c.toString(16).padStart(4, '0')
  const body = parts
    .map((p) => (Array.isArray(p) ? `${esc(p[0])}-${esc(p[1])}` : esc(p)))
    .join('')
  return new RegExp(`[${body}]`, flags)
}

/** Onzichtbaar: soft hyphen, zero-width, regelscheiders, word joiner, BOM. */
const INVISIBLE = charClass(
  [0x00ad, 0x180e, [0x200b, 0x200f], 0x2028, 0x2029, [0x2060, 0x2064], 0xfeff],
  'g',
)

/** Bidirectionele stuurtekens waarmee je tekst omgekeerd kunt laten renderen. */
const BIDI_OVERRIDE = charClass([[0x202a, 0x202e], [0x2066, 0x2069]], 'g')

/** Combining marks. Te veel achter elkaar geeft zalgo dat over de layout valt. */
const COMBINING = charClass([
  [0x0300, 0x036f], [0x0483, 0x0489], [0x0591, 0x05bd],
  [0x0610, 0x061a], [0x064b, 0x065f], [0x20d0, 0x20f0], [0xfe20, 0xfe2f],
])

/** Elke soort spatie die geen gewone spatie is. */
const EXOTIC_SPACE = charClass(
  [0x00a0, 0x1680, [0x2000, 0x200a], 0x202f, 0x205f, 0x3000],
  'g',
)

/** Private Use Area en losse surrogates: renderen als blokjes of als niets. */
const PRIVATE_USE = charClass([[0xe000, 0xf8ff], [0xdb80, 0xdbff]], 'g')

/** Diakrieten na NFKD-normalisatie. */
const DIACRITICS = charClass([[0x0300, 0x036f]], 'g')

/**
 * Lookalikes uit andere schriften die er in een schreefloze letter vrijwel
 * identiek uitzien als een latijnse letter.
 */
const HOMOGLYPHS: Record<string, string> = {
  а: 'a', ᴀ: 'a', ɑ: 'a', α: 'a',
  б: 'b', ь: 'b', β: 'b', ʙ: 'b',
  с: 'c', ϲ: 'c',
  ԁ: 'd', ɗ: 'd',
  е: 'e', ε: 'e', ё: 'e', ҽ: 'e',
  ғ: 'f', ƒ: 'f',
  ɡ: 'g', ɢ: 'g',
  һ: 'h', н: 'h', ħ: 'h',
  і: 'i', ı: 'i', ɩ: 'i', ι: 'i',
  ј: 'j', ʝ: 'j',
  к: 'k', κ: 'k', ᴋ: 'k',
  ӏ: 'l', ʟ: 'l', ł: 'l',
  м: 'm', ᴍ: 'm',
  п: 'n', ɴ: 'n',
  о: 'o', ο: 'o', ө: 'o', ø: 'o', ᴏ: 'o',
  р: 'p', ρ: 'p', ᴘ: 'p',
  ԛ: 'q',
  г: 'r', ʀ: 'r',
  ѕ: 's', ș: 's',
  т: 't', τ: 't', ᴛ: 't',
  υ: 'u', ц: 'u', ʉ: 'u',
  ν: 'v', ᴠ: 'v',
  ш: 'w', ա: 'w', ᴡ: 'w',
  х: 'x', χ: 'x',
  у: 'y', γ: 'y', ʏ: 'y',
  з: 'z',
}

/** Cijfers en leestekens die als letter worden ingezet. */
const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '6': 'g',
  '7': 't', '8': 'b', '9': 'g', '@': 'a', $: 's', '!': 'i',
  '|': 'i', '+': 't', '(': 'c', '<': 'c', '£': 'e', '€': 'e',
}

/**
 * Maakt de tekst schoon zonder hem onherkenbaar te maken.
 * Dit is wat er in de database komt en wat bezoekers zien.
 */
export function normalizeForStorage(input: string): string {
  let s = input.normalize('NFC')

  s = s.replace(INVISIBLE, '')
  s = s.replace(BIDI_OVERRIDE, '')
  s = s.replace(PRIVATE_USE, '')
  s = s.replace(EXOTIC_SPACE, ' ')

  // Zalgo afknippen: hoogstens twee accenttekens op één letter.
  s = limitCombiningMarks(s, 2)

  // Dit is één zin, geen document.
  s = s.replace(/[\r\n\t]+/g, ' ')
  s = s.replace(/ {2,}/g, ' ')

  return s.trim()
}

function limitCombiningMarks(input: string, max: number): string {
  let out = ''
  let run = 0
  for (const ch of input) {
    if (COMBINING.test(ch)) {
      run += 1
      if (run > max) continue
    } else {
      run = 0
    }
    out += ch
  }
  return out
}

/**
 * Plet de tekst tot iets waar een filter betrouwbaar op kan matchen:
 * diakrieten weg, lookalikes terug naar latijn, leetspeak terug naar letters,
 * alles wat geen letter is eruit, en herhalingen ingekort.
 */
export function foldForMatching(input: string): string {
  let s = input.toLowerCase().normalize('NFKD')

  s = s.replace(DIACRITICS, '')
  s = [...s].map((ch) => HOMOGLYPHS[ch] ?? ch).join('')
  s = [...s].map((ch) => LEET[ch] ?? ch).join('')

  // Alles wat geen a-z of cijfer is weghalen, zodat "s c h e l d" ook matcht.
  s = s.replace(/[^a-z0-9]/g, '')

  // "haaaaaat" wordt "haat"
  s = s.replace(/(.)\1{2,}/g, '$1$1')

  return s
}

export type RejectReason =
  | 'empty'
  | 'too_long'
  | 'link'
  | 'contact'
  | 'repetition'
  | 'shouting'
  | 'gibberish'
  | 'blocked_word'

export type ValidationResult =
  | { ok: true; body: string }
  | { ok: false; reason: RejectReason; hint: string }

const URL_LIKE =
  /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|nl|be|de|co|xyz|ru|cn|info|biz|link|gg|tv|me|app|dev|shop|online|site|club|top)\b)/i
const EMAIL_LIKE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_LIKE = /(?:\+?\d[\s\-().]?){9,}/

/**
 * De hoofdcontrole. Geeft de schoongemaakte tekst terug, of een reden om te
 * weigeren in een vorm die we aan de bezoeker kunnen laten zien.
 */
export function validateBody(raw: string, blocklist: Set<string>): ValidationResult {
  const body = normalizeForStorage(raw)

  if (body.length === 0) {
    return { ok: false, reason: 'empty', hint: 'There is nothing here yet.' }
  }
  if (body.length > MAX_BODY_LENGTH) {
    return {
      ok: false,
      reason: 'too_long',
      hint: `${MAX_BODY_LENGTH} characters at most. This is ${body.length}.`,
    }
  }
  if (URL_LIKE.test(body)) {
    return { ok: false, reason: 'link', hint: 'Links are not allowed here.' }
  }
  if (EMAIL_LIKE.test(body) || PHONE_LIKE.test(body)) {
    return {
      ok: false,
      reason: 'contact',
      hint: 'No email addresses or phone numbers, not even your own.',
    }
  }
  if (/(.)\1{6,}/.test(body)) {
    return { ok: false, reason: 'repetition', hint: 'Too much repetition.' }
  }

  const letters = body.replace(/[^a-zA-Z]/g, '')
  if (letters.length >= 12) {
    const caps = letters.replace(/[^A-Z]/g, '').length
    if (caps / letters.length > 0.85) {
      return { ok: false, reason: 'shouting', hint: 'Not everything in capitals.' }
    }
  }

  // Eén lang woord zonder spaties breekt de layout en is bijna altijd onzin.
  const longestWord = body.split(/\s+/).reduce((a, w) => Math.max(a, w.length), 0)
  if (longestWord > 40) {
    return { ok: false, reason: 'gibberish', hint: 'That is one very long word.' }
  }

  const folded = foldForMatching(body)
  for (const term of blocklist) {
    if (folded.includes(term)) {
      return {
        ok: false,
        reason: 'blocked_word',
        hint: 'Not allowed. Say it another way.',
      }
    }
  }

  return { ok: true, body }
}

export function validateAuthor(
  raw: string | null | undefined,
  blocklist: Set<string>,
): string | null {
  if (!raw) return null
  const name = normalizeForStorage(raw).slice(0, MAX_AUTHOR_LENGTH)
  if (name.length === 0) return null
  if (URL_LIKE.test(name) || EMAIL_LIKE.test(name)) return null
  const folded = foldForMatching(name)
  for (const term of blocklist) {
    if (folded.includes(term)) return null
  }
  return name
}
