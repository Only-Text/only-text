import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * Hetzelfde icoon als icon.svg, maar iOS wil een PNG zonder transparantie en
 * zonder afgeronde hoeken — die zet het besturingssysteem er zelf omheen.
 * Vandaar geen radius en geen rand, en iets ruimer opgezet zodat het niet in
 * de knip valt als iOS de hoeken afsnijdt.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FBF7EF',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* de rode kantlijn */}
        <div
          style={{ position: 'absolute', left: 44, top: 0, bottom: 0, width: 5, background: '#D99A92' }}
        />
        {/* de blauwe regel */}
        <div
          style={{ position: 'absolute', left: 0, right: 0, top: 122, height: 7, background: '#B9CDE0' }}
        />
        {/* de haal inkt */}
        <div
          style={{
            position: 'absolute',
            left: 62,
            top: 100,
            width: 42,
            height: 15,
            borderRadius: 8,
            background: '#22241D',
          }}
        />
        {/* de punt erachter */}
        <div
          style={{
            position: 'absolute',
            left: 118,
            top: 100,
            width: 15,
            height: 15,
            borderRadius: 8,
            background: '#22241D',
          }}
        />
      </div>
    ),
    size,
  )
}
