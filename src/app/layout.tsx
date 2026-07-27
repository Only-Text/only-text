import type { Metadata, Viewport } from 'next'
import { Shantell_Sans } from 'next/font/google'

import { BaselineCalibrator } from '@/components/baseline-calibrator'
import './globals.css'

/**
 * Shantell Sans: een handschriftletter die ontworpen is om lang leesbaar te
 * blijven, met variabele assen voor bounce en informality. Daarmee kan dezelfde
 * letter rustig staan in kleine metadata en losser in het grote bericht — één
 * woff2 in plaats van vier bestanden.
 */
const shantell = Shantell_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['BNCE', 'INFM', 'SPAC'],
  variable: '--font-shantell',
  display: 'swap',
  // Zonder metrische correctie verspringen de regels zichtbaar ten opzichte van
  // de liniatuur op het moment dat de echte letter binnenkomt.
  adjustFontFallback: true,
})

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'only-text.com — a website that is one sentence long',
    template: '%s · only-text.com',
  },
  description:
    'One sentence sits at the top of this site. It belongs to whoever typed last. Type something and it is yours, until the next person comes along.',
  applicationName: 'only-text',
  // Bewust een vaste, gebrande afbeelding op de homepage. Sociale platformen
  // cachen het scrape-resultaat per URL, en WhatsApp biedt geen enkele manier
  // om dat te verversen. Zou hier het actuele bericht staan, dan zit precies
  // dat bericht voor altijd vast in ieders linkvoorbeeld. Delen doe je via de
  // permalink van een bericht, die wél zijn eigen afbeelding krijgt.
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'only-text',
    title: 'only-text.com',
    description: 'One sentence. It belongs to whoever typed last.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'only-text.com' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'only-text.com',
    description: 'One sentence. It belongs to whoever typed last.',
    images: ['/og-default.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/', types: { 'application/rss+xml': `${SITE}/feed.xml` } },
}

export const viewport: Viewport = {
  themeColor: '#eeefe9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={shantell.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#bericht"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-(--paper) focus:px-4 focus:py-2"
        >
          Skip to the sentence
        </a>
        <BaselineCalibrator />
        {children}
      </body>
    </html>
  )
}
