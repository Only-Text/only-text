import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

/**
 * De AI-crawlers staan er expliciet bij.
 *
 * Dat is een keuze en geen vergetelheid: bij een site die volledig uit tekst
 * bestaat is genoemd worden in een AI-antwoord waarschijnlijk een grotere bron
 * van bezoekers dan een positie in de blauwe links. De rem zit ergens anders:
 * `/api/` blijft dicht, want daar valt niets te lezen dat niet ook op een
 * gewone pagina staat, en het zijn de duurste routes om te serveren.
 */
export default function robots(): MetadataRoute.Robots {
  const crawlers = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'Amazonbot',
    'CCBot',
    'Bytespider',
    'meta-externalagent',
    'DuckAssistBot',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      ...crawlers.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/api/'] })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
