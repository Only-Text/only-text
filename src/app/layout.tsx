import type { Metadata, Viewport } from 'next'
import { Shantell_Sans } from 'next/font/google'

import { BaselineCalibrator } from '@/components/baseline-calibrator'
import { VisitTracker } from '@/components/visit-tracker'
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
    default: 'only-text.com · a website that is one sentence long',
    template: '%s · only-text.com',
  },
  description:
    'One sentence sits at the top of this site, written by one person somewhere in the world. It belongs to whoever typed last, so what you read is whatever a stranger decided to say. Type something and it is yours, until the next one comes along.',
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
  // Zonder de tweede regel knipt Google het fragment af op ongeveer 160 tekens
  // en toont hij de deelafbeelding als miniatuur. Op een site waar de hele
  // inhoud één zin is, is dat fragment de zin: mag het volledig getoond worden,
  // dan staat er in het zoekresultaat precies wat er op de pagina staat. Dat
  // geldt net zo goed voor de antwoordmachines, die zich aan dezelfde limieten
  // houden bij het citeren.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  // Let op: geen `canonical` hier. Metadata erft naar beneden door, dus een
  // canonical in de wortel maakt van elke pagina in de site een dubbele van de
  // voorpagina — inclusief elke permalink, wat precies de pagina's zijn waarvan
  // we willen dat ze gevonden worden. Elke pagina zet zijn eigen.
  alternates: { types: { 'application/rss+xml': `${SITE}/feed.xml` } },
}

/**
 * Wat deze site is, in de vorm waarin een machine het overneemt.
 *
 * De helft van het verkeer is geen mens, en het deel daarvan dat antwoorden
 * samenstelt leest liever een graaf dan een alinea. Hier staat dus wie de
 * uitgever is, waar het account staat dat erbij hoort, en dat er in het archief
 * gezocht kan worden. Alles wat erin staat is elders op de site na te lopen.
 */
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}#website`,
      url: SITE,
      name: 'only-text.com',
      description:
        'A website that is one sentence long, written by one stranger at a time from wherever they happen to be.',
      inLanguage: 'en',
      publisher: { '@id': `${SITE}#publisher` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE}/archive?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}#publisher`,
      name: 'only-text.com',
      url: SITE,
      description: 'One sentence at a time, written by whoever turns up.',
      sameAs: ['https://bsky.app/profile/only-text.com'],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <BaselineCalibrator />
        <VisitTracker />
        {children}
      </body>
    </html>
  )
}
