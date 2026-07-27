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
 * Daarom: deel je een bericht, dan deel je /m/<id>, en die laat voor altijd
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
const INK = '#22241D'
const INK_SOFT = '#4D4F46'
const RULE = '#B9CDE0'
const MARGIN = '#D99A92'

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
  const lineHeight = Math.round(size * 1.45)

  const duur = message.duration_ms
    ? `stood for ${formatDuration(message.duration_ms)}`
    : 'currently up'
  const kijkers = message.peak_viewers > 1 ? ` · seen by ${formatNumber(message.peak_viewers)}` : ''
  const wie = message.author_name ? `by ${message.author_name}` : 'by someone with no name'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '64px 80px',
          position: 'relative',
          fontFamily: 'Shantell',
        }}
      >
        {/* De liniatuur. In satori bestaat repeating-linear-gradient niet,
            dus de regels staan er als losse elementen. */}
        {Array.from({ length: 630 / lineHeight + 2 }, (_, i) => (
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
            left: 132,
            width: 1,
            background: MARGIN,
          }}
        />

        <div style={{ display: 'flex', fontSize: 22, color: INK_SOFT, letterSpacing: 1 }}>
          only-text.com
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: size,
            lineHeight: `${lineHeight}px`,
            color: INK,
            paddingLeft: 92,
            paddingRight: 20,
            maxWidth: 1040,
          }}
        >
          {message.body}
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: INK_SOFT, paddingLeft: 92 }}>
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
