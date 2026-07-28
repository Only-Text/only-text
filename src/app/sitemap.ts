import type { MetadataRoute } from 'next'

import { getArchive } from '@/lib/data'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

export const revalidate = 3600

/**
 * De vaste pagina's plus de laatste duizend zinnen.
 *
 * Bewust niet het hele archief: een sitemap mag 50.000 URL's bevatten, maar
 * een lijst die bij elke zin groeit wordt onhandelbaar en de oude zinnen zijn
 * al gevonden. Zodra het archief richting de duizend loopt, is het beter dit
 * te splitsen in een index met jaarbestanden.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vast: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'always', priority: 1 },
    { url: `${SITE}/archive`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE}/records`, changeFrequency: 'hourly', priority: 0.7 },
    { url: `${SITE}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/stats`, changeFrequency: 'hourly', priority: 0.6 },
    { url: `${SITE}/what-people-do`, changeFrequency: 'hourly', priority: 0.5 },
    { url: `${SITE}/press`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    const zinnen = await getArchive({ limit: 100 })
    return [
      ...vast,
      ...zinnen.map((zin) => ({
        url: `${SITE}/m/${zin.id}`,
        lastModified: new Date(zin.ended_at ?? zin.created_at),
        changeFrequency: 'never' as const,
        priority: 0.5,
      })),
    ]
  } catch {
    // Een database die even niet meewerkt mag de sitemap niet slopen.
    return vast
  }
}
