export function HowToSchema({ steps, name, description, totalTime }) {
  if (!steps || steps.length === 0) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "totalTime": totalTime || "PT2M",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "image": step.image
    }))
  }

  // Remove undefined image fields
  schema.step.forEach(step => {
    if (!step.image) delete step.image
  })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
