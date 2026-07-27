import { NextResponse } from 'next/server'
import { z } from 'zod'

import { countryFrom } from '@/lib/client-hash'
import { ANALYTICS_EVENTS } from '@/lib/analytics-events'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Waar de metingen binnenkomen.
 *
 * De browser mag niet rechtstreeks in de tabel schrijven. De anon-sleutel staat
 * in ieders devtools, dus een open schrijfrecht op een tabel die per bezoeker
 * rijen krijgt is een uitnodiging om hem vol te zetten. Alles gaat daarom langs
 * hier, met de service_role, en deze route is de enige plek die bepaalt wat er
 * in mag.
 *
 * Drie dingen worden hier hard afgedwongen, en geen ervan mag naar de client:
 *
 *   1. De naam moet in de vaste lijst staan. Een typefout of een grappenmaker
 *      levert geen nieuwe eventnaam op die daarna voor altijd in het rapport
 *      staat.
 *   2. De eigenschappen worden gesnoeid: hooguit tien sleutels, teksten tot
 *      honderd tekens, getallen moeten eindig zijn. Zonder die grens kan iemand
 *      hier een megabyte per verzoek in kwijt.
 *   3. Het land komt van Vercel, niet uit de body. Dat is het enige stukje
 *      herkomst dat we bewaren, en de browser mag er niet over liegen.
 *
 * Wat er bewust NIET in gaat: het IP-adres, ook niet gehasht. Bij het plaatsen
 * van een zin is die hash nodig om iemand te kunnen afremmen; voor een teller
 * is hij dat niet, en wat je niet nodig hebt sla je niet op.
 */

const EventSchema = z.object({
  name: z.enum(ANALYTICS_EVENTS),
  path: z.string().max(120).optional(),
  props: z.record(z.string().max(40), z.union([z.string(), z.number(), z.boolean()])).optional(),
})

const PayloadSchema = z.object({
  session: z.uuid().optional(),
  events: z.array(EventSchema).min(1).max(20),
})

/** Hooguit tien eigenschappen per event, en niets onbegrensds erin. */
function snoei(props: Record<string, string | number | boolean> | undefined) {
  if (!props) return {}
  const uit: Record<string, string | number | boolean> = {}
  for (const [sleutel, waarde] of Object.entries(props).slice(0, 10)) {
    if (typeof waarde === 'number' && !Number.isFinite(waarde)) continue
    uit[sleutel] = typeof waarde === 'string' ? waarde.slice(0, 100) : waarde
  }
  return uit
}

export async function POST(request: Request) {
  let payload: z.infer<typeof PayloadSchema>
  try {
    payload = PayloadSchema.parse(await request.json())
  } catch (fout) {
    // Bewust 204 en geen 400. Dit is een meetendpoint: een afwijkend verzoek is
    // vaker een oude tab met verouderde code dan een aanval, en een foutmelding
    // in de console van een bezoeker is erger dan een gemiste meting.
    //
    // Wel loggen. Een endpoint dat stilzwijgend alles weggooit ziet er van
    // buiten precies hetzelfde uit als een endpoint dat werkt, en dat is één
    // keer eerder gebeurd: toen de eventlijst per ongeluk uit een clientmodule
    // kwam, faalde elke parse en leek alles in orde.
    console.warn('event geweigerd', fout instanceof Error ? fout.message : fout)
    return new NextResponse(null, { status: 204 })
  }

  const rijen = payload.events.map((e) => ({
    name: e.name,
    session: payload.session ?? null,
    path: e.path ?? null,
    props: snoei(e.props),
  }))

  try {
    const supabase = createServiceClient()
    const { error } = await supabase.rpc('record_events', {
      p_events: rijen,
      p_country: countryFrom(request.headers),
    })
    if (error) console.error('record_events faalde', error)
  } catch (error) {
    console.error('record_events onbereikbaar', error)
  }

  // Altijd 204, ook als de database het liet afweten. De browser heeft dit met
  // sendBeacon gestuurd en kan met een antwoord niets meer doen.
  return new NextResponse(null, { status: 204 })
}
