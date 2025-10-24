import '@/styles/tailwind.css'
import { WebsiteSchema, OrganizationSchema } from '@/components/seo-head'

export const metadata = {
  metadataBase: new URL('https://only-text.com'),
  title: {
    template: '%s - Only Text',
    default: 'Only Text - Free Text Cleaning Tool | Remove Emojis, Bullets & Special Characters',
  },
  description: 'The fastest free online tool to remove emojis, bullet points, and special characters from text. Clean AI-generated content and get plain text instantly. 100% client-side, privacy-friendly.',
  keywords: ['text cleaning', 'remove emojis', 'remove bullet points', 'word counter', 'character counter', 'case converter', 'text formatter', 'plain text', 'emoji remover', 'text tools'],
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
    title: 'Only Text - Free Text Cleaning Tools',
    description: 'Remove emojis, bullet points, and special characters from text instantly. Free online tools for text cleaning and formatting.',
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
    title: 'Only Text - Free Text Cleaning Tools',
    description: 'Remove emojis, bullet points, and special characters instantly.',
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
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body>{children}</body>
    </html>
  )
}
