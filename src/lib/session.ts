'use client'

/**
 * Een sessie-id dat één tabblad lang meegaat.
 *
 * Bewust sessionStorage en niet localStorage of een cookie. Voor de kijkersteller
 * omdat twee tabbladen twee kijkers zijn, en voor de metingen omdat er dan
 * niets is dat een bezoeker over de tijd herkenbaar maakt: sluit het tabblad en
 * het id bestaat niet meer. Dat maakt de cijfers iets te hoog (wie morgen
 * terugkomt telt als nieuw) en dat is precies de ruil die we willen.
 *
 * Staat apart van supabase-browser zodat een pagina die alleen meet niet de
 * hele Supabase-client hoeft mee te laden.
 */
export function sessionId(): string {
  const KEY = 'only-text:session'
  try {
    const existing = sessionStorage.getItem(KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    sessionStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    // Privémodus of een browser die opslag blokkeert. Dan elke keer een nieuw
    // id: de meting wordt onnauwkeuriger, de pagina blijft werken.
    return crypto.randomUUID()
  }
}
