import '@/styles/tailwind.css'
import { WebsiteSchema, OrganizationSchema } from '@/components/seo-head'
import { PWAInstallButton } from '@/components/pwa-install-button'

export const metadata = {
  metadataBase: new URL('https://only-text.com'),
  title: {
    template: '%s - Only Text',
    default: 'Only Text - Free AI Text Tools | Grammar Checker, Summarizer, Tone Converter & More',
  },
  description: 'Free AI-powered text tools: grammar checker, text summarizer, tone converter, and text improver. Enhance your writing with advanced AI. No signup required, completely free.',
  keywords: ['ai text tools', 'free ai tools', 'grammar checker', 'text summarizer', 'tone converter', 'text improver', 'ai writing assistant', 'free writing tools', 'ai grammar checker', 'text enhancement'],
  authors: [{ name: 'Only Text Team' }],
  creator: 'Only Text',
  publisher: 'Only Text',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://only-text.com',
    title: 'Only Text - Free AI Text Tools',
    description: 'Free AI-powered text tools: grammar checker, text summarizer, tone converter, and text improver. Enhance your writing with advanced AI.',
    siteName: 'Only Text',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Only Text - Text Cleaning Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Only Text - Free AI Text Tools',
    description: 'Free AI-powered grammar checker, text summarizer, tone converter, and text improver. Enhance your writing instantly.',
    images: ['/og-image.png'],
    creator: '@onlytext',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
    >
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-13LZ4LQ68J"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-13LZ4LQ68J');
            `,
          }}
        />
        
        <link rel="preconnect" href="https://rsms.me/" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://rsms.me/" />
        <link 
          rel="preload" 
          href="https://rsms.me/inter/inter.css" 
          as="style"
        />
        <link 
          rel="stylesheet" 
          href="https://rsms.me/inter/inter.css" 
          media="print" 
          onLoad="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        </noscript>
        <link rel="canonical" href="https://only-text.com" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Only Text" />
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body>
        {children}
        <PWAInstallButton />
      </body>
    </html>
  )
}
