import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
 
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a855f7',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}
      >
        OT
      </div>
    ),
    {
      ...size,
    }
  )
}
