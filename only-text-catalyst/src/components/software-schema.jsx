export function SoftwareApplicationSchema({ tool }) {
  if (!tool) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": tool.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.rating.value,
      "ratingCount": tool.rating.count,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "featureList": tool.features,
    "screenshot": tool.screenshot,
    "author": {
      "@type": "Organization",
      "name": "Only Text"
    },
    "softwareVersion": "1.0",
    "datePublished": "2025-10-27",
    "description": tool.description
  }

  // Remove undefined values
  Object.keys(schema).forEach(key => schema[key] === undefined && delete schema[key])
  if (schema.aggregateRating === undefined) delete schema.aggregateRating

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
