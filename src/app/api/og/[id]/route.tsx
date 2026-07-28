import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

import { formatDuration, formatNumber } from '@/lib/format'
import { getMessage } from '@/lib/data'

export const runtime = 'nodejs'

/**
 * De afbeelding die bij een gedeelde link verschijnt.
 *
 * Het belangrijkste ontwerpbesluit zit niet in het plaatje maar in de URL: die
 * is per bericht-id en verandert daarna nooit meer. WhatsApp, Discord en X
 * cachen het scrape-resultaat per URL, en WhatsApp biedt geen enkele manier om
 * dat te verversen. Eén vaste afbeelding op de voorpagina zou dus voor altijd
 * bevriezen op wat er toevallig stond bij de eerste scrape.
 *
 * Daarom: deel je een bericht, dan deel je /thoughts/<id>, en die laat voor altijd
 * de zin zien die er stond toen jij hem deelde.
 */

/**
 * Bewust een woff en geen variabele ttf: de renderer achter next/og kan geen
 * variabele lettertypen lezen en faalt daarop met een cryptische fout diep in
 * de glyphtabel. Een statische woff werkt wel, en scheelt bovendien een megabyte.
 * Eén keer inlezen en vasthouden; per verzoek van schijf lezen is zonde.
 */
const fontCache = new Map<string, Buffer>()

async function loadFont(bestand: string): Promise<Buffer> {
  const bestaand = fontCache.get(bestand)
  if (bestaand) return bestaand
  const data = await readFile(join(process.cwd(), 'public', 'fonts', bestand))
  fontCache.set(bestand, data)
  return data
}

const PAPER = '#FBF7EF'
// Dezelfde grafiettinten als op het vel zelf. Wijken die af, dan ziet iemand
// die de link doorstuurt een ander product dan wie erop klikt.
const INK = '#3E4147'
const INK_SOFT = '#5F6369'
const RULE = '#B9CDE0'
const MARGIN = '#D99A92'

const WIDTH = 1200
const HEIGHT = 630
const MARGIN_X = 132
// Tekst begint rechts van de kantlijn, net als op het vel. Alle drie de
// tekstblokken houden deze linkerkant aan — ook het adres bovenin, dat hier
// eerder links van de kantlijn in de marge hing.
const TEXT_X = 176
const TEXT_RIGHT = 64

/**
 * Waar de basislijn ligt binnen een regelblok.
 *
 * Shantell Sans heeft een ascender van 1,02em en een descender van 0,32em bij
 * 1000 eenheden per em; de renderer verdeelt wat er aan regelhoogte overblijft
 * gelijk boven en onder die twee. Uitgeschreven blijft daar
 *
 *     basislijn = regelhoogte / 2 + 0,35 * lettergrootte
 *
 * van over. Dezelfde formule als op het vel zelf, waar de browser hem bij het
 * laden opmeet (--baseline-c en --baseline-k); dat die meting op 0,346 uitkomt
 * is de bevestiging dat het klopt.
 */
const BASELINE_K = 0.35
const baselineInBox = (lineHeight: number, size: number) => lineHeight / 2 + BASELINE_K * size

/** De bovenkant van een blok, zo gekozen dat zijn eerste basislijn op `rule` valt. */
const topForBaseline = (rule: number, lineHeight: number, size: number) =>
  rule - baselineInBox(lineHeight, size)

/**
 * Hoeveel regels de zin gaat beslaan. Ruw, maar het hoeft alleen te bepalen
 * hoe hoog het blok komt te hangen: een regel ernaast zet de zin iets uit het
 * midden en verder niets. 0,53em is de gemeten gemiddelde letterbreedte van
 * Shantell Sans.
 */
const countLines = (text: string, size: number) => {
  const perLine = Math.max(1, Math.floor((WIDTH - TEXT_X - TEXT_RIGHT) / (0.53 * size)))
  return Math.max(1, Math.ceil(text.length / perLine))
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numeric = Number(id.replace(/\.png$/, ''))
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return new Response('Not found', { status: 404 })
  }

  const found = await getMessage(numeric)
  if (!found) return new Response('Not found', { status: 404 })

  const { message } = found
  const [regular, bold] = await Promise.all([
    loadFont('ShantellSans-Regular.woff'),
    loadFont('ShantellSans-Bold.woff'),
  ])

  // De tekst krimpt mee met zijn lengte, zodat een lange zin niet buiten beeld
  // valt en een korte zin niet verloren staat in het wit.
  const len = message.body.length
  const size = len < 40 ? 76 : len < 90 ? 60 : len < 150 ? 48 : 38

  /* De liniatuur is hier het raster waar al het andere aan hangt, en niet
     andersom. Eerst de regelafstand, dan de lijnen op veelvouden daarvan, dan
     de drie tekstblokken op de lijnen die vrij zijn.

     Eerder stonden de blokken met space-between uit elkaar geduwd en werden de
     lijnen daar los overheen getekend. Dat kan niet goed gaan: waar een blok
     terechtkomt hangt dan af van hoe hoog de andere twee toevallig zijn, en
     geen van de drie landde op een lijn. Op een vel met lijnen valt dat meteen
     op — daar dient een liniatuur voor. */
  const lineHeight = Math.round(size * 1.45)
  const rules = Math.floor(HEIGHT / lineHeight)
  const lines = countLines(message.body, size)

  // Het adres op de eerste lijn, de ondertitel op de laatste die nog genoeg
  // wit onder zich houdt, de zin gecentreerd op de lijnen daartussen.
  const labelRule = 1
  const bylineRule = Math.floor((HEIGHT - 40) / lineHeight)
  const bodyRule = Math.max(
    labelRule + 1,
    Math.min(
      bylineRule - lines,
      Math.round((labelRule + bylineRule) / 2 - (lines - 1) / 2),
    ),
  )

  const duur = message.duration_ms
    ? `stood for ${formatDuration(message.duration_ms)}`
    : 'currently up'
  const kijkers = message.views > 0 ? ` · read by ${formatNumber(message.views)}` : ''
  const wie = message.author_name ? `by ${message.author_name}` : 'by someone with no name'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: PAPER,
          position: 'relative',
          fontFamily: 'Shantell',
        }}
      >
        {/* De liniatuur. In satori bestaat repeating-linear-gradient niet,
            dus de regels staan er als losse elementen. */}
        {Array.from({ length: rules }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: (i + 1) * lineHeight,
              height: 1,
              background: RULE,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: MARGIN_X,
            width: 1,
            background: MARGIN,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: TEXT_X,
            top: topForBaseline(labelRule * lineHeight, lineHeight, 22),
            height: lineHeight,
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            lineHeight: `${lineHeight}px`,
            color: INK_SOFT,
            letterSpacing: 1,
          }}
        >
          only-text.com
        </div>

        <div
          style={{
            position: 'absolute',
            left: TEXT_X,
            top: topForBaseline(bodyRule * lineHeight, lineHeight, size),
            width: WIDTH - TEXT_X - TEXT_RIGHT,
            display: 'flex',
            fontSize: size,
            lineHeight: `${lineHeight}px`,
            color: INK,
          }}
        >
          {message.body}
        </div>

        <div
          style={{
            position: 'absolute',
            left: TEXT_X,
            top: topForBaseline(bylineRule * lineHeight, lineHeight, 24),
            height: lineHeight,
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            lineHeight: `${lineHeight}px`,
            color: INK_SOFT,
          }}
        >
          {wie} · {duur}
          {kijkers}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Shantell', data: regular, style: 'normal', weight: 400 },
        { name: 'Shantell', data: bold, style: 'normal', weight: 700 },
      ],
      headers: {
        // De inhoud achter deze URL verandert nooit, dus mag hij voor altijd
        // blijven staan waar dan ook.
        'cache-control': 'public, immutable, no-transform, max-age=31536000',
        'cdn-cache-control': 'public, immutable, max-age=31536000',
      },
    },
  )
}
