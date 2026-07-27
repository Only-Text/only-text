import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

/**
 * De kaart voor de homepage. Bewust ZONDER de zin die er op dat moment staat.
 *
 * De verleiding is groot om hier de actuele zin in te zetten, en één van de
 * onderzoekssporen raadde dat ook aan. Toch niet doen: sociale platformen
 * cachen het scrape-resultaat per URL, en voor WhatsApp bestaat geen enkele
 * manier om dat te verversen. De eerste zin die hier toevallig in belandt zit
 * dan voor altijd vast in ieders linkvoorbeeld — inclusief de zin die iemand
 * er om drie uur 's nachts in zet om precies dat te bereiken.
 *
 * Wie een zin wil delen deelt zijn permalink; die heeft wél zijn eigen
 * afbeelding, en die mag bevriezen want hij verandert nooit meer.
 */

let fontCache: { regular: Buffer; bold: Buffer } | null = null

async function fonts() {
  fontCache ??= {
    regular: await readFile(join(process.cwd(), 'public', 'fonts', 'ShantellSans-Regular.woff')),
    bold: await readFile(join(process.cwd(), 'public', 'fonts', 'ShantellSans-Bold.woff')),
  }
  return fontCache
}

const PAPER = '#FBF7EF'
const INK = '#22241D'
const INK_SOFT = '#4D4F46'
const RULE = '#B9CDE0'
const MARGIN = '#D99A92'

export async function GET() {
  const { regular, bold } = await fonts()
  const lineHeight = 88

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: PAPER,
          padding: '0 80px',
          position: 'relative',
          fontFamily: 'Shantell',
        }}
      >
        {Array.from({ length: 8 }, (_, i) => (
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
          style={{ position: 'absolute', top: 0, bottom: 0, left: 132, width: 1, background: MARGIN }}
        />

        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 700,
            lineHeight: `${lineHeight}px`,
            color: INK,
            paddingLeft: 92,
            maxWidth: 980,
          }}
        >
          One sentence. It belongs to whoever typed last.
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            lineHeight: `${lineHeight}px`,
            color: INK_SOFT,
            paddingLeft: 92,
          }}
        >
          only-text.com
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
        'cache-control': 'public, immutable, no-transform, max-age=31536000',
      },
    },
  )
}
