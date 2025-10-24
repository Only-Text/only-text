export function WebsiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Only Text',
          url: 'https://only-text.com',
          description: 'Free online text cleaning tools. Remove emojis, bullet points, and special characters instantly.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://only-text.com/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          }
        })
      }}
    />
  )
}

export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Only Text',
          url: 'https://only-text.com',
          logo: 'https://only-text.com/logo.png',
          description: 'Only Text provides free online text cleaning and formatting tools for professionals, writers, and content creators.',
          foundingDate: '2025',
          sameAs: [
            'https://twitter.com/onlytext',
            'https://linkedin.com/company/onlytext'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'support@only-text.com',
            availableLanguage: ['English', 'Dutch']
          }
        })
      }}
    />
  )
}

export function HowToSchema({ name, description, steps }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name,
          description,
          step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            url: step.url
          }))
        })
      }}
    />
  )
}

export function ArticleSchema({ title, description, datePublished, dateModified, author = 'Only Text Team' }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          author: {
            '@type': 'Person',
            name: author
          },
          publisher: {
            '@type': 'Organization',
            name: 'Only Text',
            logo: {
              '@type': 'ImageObject',
              url: 'https://only-text.com/logo.png'
            }
          },
          datePublished,
          dateModified: dateModified || datePublished,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://only-text.com'
          }
        })
      }}
    />
  )
}
