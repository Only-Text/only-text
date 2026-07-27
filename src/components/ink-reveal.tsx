import { Fragment, type CSSProperties } from 'react'

/**
 * Tekst die zich schrijft: per woord van wazig naar scherp, zoals inkt die
 * intrekt.
 *
 * Twee dingen die hier makkelijk misgaan en die allebei bewust zijn opgelost:
 *
 * 1. Per LETTER splitsen ziet er beter uit maar is inhoudelijk kapot —
 *    screenreaders lezen de zin dan letter voor letter voor. Daarom per woord,
 *    met een onzichtbaar duplicaat van de hele zin voor hulpsoftware en de
 *    fragmenten op aria-hidden.
 * 2. `display: inline-block` trimt de spatie binnen een span weg: "Dit is een"
 *    wordt "Ditiseen". De spatie moet dus als losse tekstnode tússen de spans
 *    staan, niet erin.
 */
export function InkReveal({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  // Bij een lange zin zou 45ms per woord te traag worden; de hele animatie
  // blijft onder ongeveer 1,2 seconde.
  const stagger = Math.min(45, Math.round(1200 / Math.max(words.length, 1)))

  return (
    <span
      className={`ink-in ${className}`}
      style={{ '--stagger': `${stagger}ms` } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span style={{ '--i': i } as CSSProperties}>{word}</span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  )
}
