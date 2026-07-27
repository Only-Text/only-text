import { createHash } from 'node:crypto'

/**
 * Wij slaan nooit een ruw IP-adres op. Wat de database ziet is een SHA-256
 * van het IP plus een server-side pepper. Zonder die pepper is de hash niet
 * terug te rekenen naar een IP, ook niet met een lijst van alle IPv4-adressen.
 *
 * Dit is bewust een pure functie zonder database: hij draait in de route
 * handler, zodat de browser nooit invloed heeft op de uitkomst.
 */
export function hashClient(ip: string, extra = ''): string {
  const pepper = process.env.IP_HASH_PEPPER
  if (!pepper || pepper.length < 16) {
    throw new Error('IP_HASH_PEPPER ontbreekt of is te kort (minimaal 16 tekens).')
  }
  return createHash('sha256').update(`${pepper}|${ip}|${extra}`).digest('hex')
}

/**
 * Haalt het echte bezoekers-IP uit de headers. Op Vercel is
 * `x-forwarded-for` betrouwbaar omdat het platform hem zelf zet; lokaal
 * vallen we terug op een vaste waarde zodat ontwikkelen blijft werken.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    // Het eerste adres is de oorspronkelijke client.
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip')?.trim() || '127.0.0.1'
}

/** Grove landcode van Vercel, puur voor de sfeer ("iemand uit Duitsland"). */
export function countryFrom(headers: Headers): string | null {
  const country = headers.get('x-vercel-ip-country')
  if (!country || country.length !== 2) return null
  return country.toUpperCase()
}
