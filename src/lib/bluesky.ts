import { AtpAgent, RichText } from '@atproto/api'

/**
 * De Bluesky-kant van het account.
 *
 * Eén ding om te weten voordat je hier iets aan verandert: een app-wachtwoord
 * geeft volledige toegang tot het account, lezen én schrijven, en met het
 * vinkje voor privéberichten ook de DM's. Er bestaat geen variant die alleen
 * mag posten. Alles wat hier gebeurt gebeurt dus met de volle rechten van de
 * eigenaar, en daarom staat er verderop bewust geen functie die zelfstandig
 * antwoorden verstuurt.
 */

const SERVICE = 'https://bsky.social'

let sessie: AtpAgent | null = null

export async function bluesky(): Promise<AtpAgent> {
  if (sessie) return sessie

  const identifier = process.env.BLUESKY_HANDLE
  const password = process.env.BLUESKY_APP_PASSWORD
  if (!identifier || !password) {
    throw new Error('BLUESKY_HANDLE of BLUESKY_APP_PASSWORD ontbreekt')
  }

  const agent = new AtpAgent({ service: SERVICE })
  await agent.login({ identifier, password })
  sessie = agent
  return agent
}

/**
 * Plaatst één bericht met een linkkaart eraan.
 *
 * De kaart is bewust een `external`-embed en geen losse afbeelding: dan toont
 * Bluesky de titel, de omschrijving én de deelafbeelding met de link eronder,
 * in plaats van een plaatje waar je niet op kunt klikken. En omdat Bluesky als
 * enige platform uitgaande links niet afstraft, is dat hier ook echt de beste
 * vorm.
 */
export async function post(opts: {
  text: string
  url: string
  title: string
  description: string
  imageUrl?: string
}): Promise<{ uri: string; cid: string }> {
  const agent = await bluesky()

  // Zonder facets is een URL in de tekst gewoon platte tekst en niet
  // aanklikbaar. RichText zoekt links, vermeldingen en hashtags op.
  const rt = new RichText({ text: opts.text })
  await rt.detectFacets(agent)

  let thumb
  if (opts.imageUrl) {
    try {
      const res = await fetch(opts.imageUrl)
      if (res.ok) {
        const bytes = new Uint8Array(await res.arrayBuffer())
        // Bluesky weigert blobs boven het miljoen bytes; onze kaarten zitten
        // rond de 50 kB, maar een grens is een grens.
        if (bytes.byteLength < 976_000) {
          const upload = await agent.uploadBlob(bytes, {
            encoding: res.headers.get('content-type') ?? 'image/png',
          })
          thumb = upload.data.blob
        }
      }
    } catch {
      // Zonder afbeelding posten is beter dan niet posten.
    }
  }

  const result = await agent.post({
    text: rt.text,
    facets: rt.facets,
    langs: ['en'],
    embed: {
      $type: 'app.bsky.embed.external',
      external: {
        uri: opts.url,
        title: opts.title,
        description: opts.description,
        ...(thumb ? { thumb } : {}),
      },
    },
  })

  return { uri: result.uri, cid: result.cid }
}

export type Bericht = {
  soort: 'mention' | 'reply' | 'quote' | 'dm'
  van: string
  naam: string | null
  tekst: string
  wanneer: string
  link: string | null
  gelezen: boolean
}

/**
 * Alles wat iemand naar ons stuurde: vermeldingen, antwoorden, citaten en
 * privéberichten. Bewust alleen lezen.
 */
export async function inbox(limit = 40): Promise<Bericht[]> {
  const agent = await bluesky()
  const uit: Bericht[] = []

  const meldingen = await agent.listNotifications({ limit })
  for (const n of meldingen.data.notifications) {
    if (!['mention', 'reply', 'quote'].includes(n.reason)) continue
    const record = n.record as { text?: string; createdAt?: string }
    uit.push({
      soort: n.reason as 'mention' | 'reply' | 'quote',
      van: n.author.handle,
      naam: n.author.displayName ?? null,
      tekst: record.text ?? '',
      wanneer: n.indexedAt,
      link: `https://bsky.app/profile/${n.author.handle}/post/${n.uri.split('/').pop()}`,
      gelezen: n.isRead,
    })
  }

  // Privéberichten zitten op een aparte service en vallen om als het vinkje
  // voor DM-toegang niet aanstond. Dat mag de rest niet meeslepen.
  try {
    const chat = agent.withProxy('bsky_chat', 'did:web:api.bsky.chat')
    const convos = await chat.chat.bsky.convo.listConvos({ limit: 20 })
    for (const c of convos.data.convos) {
      if (c.unreadCount === 0) continue
      const m = c.lastMessage as { text?: string; sentAt?: string } | undefined
      const ander = c.members.find((lid) => lid.handle !== agent.session?.handle)
      uit.push({
        soort: 'dm',
        van: ander?.handle ?? 'onbekend',
        naam: ander?.displayName ?? null,
        tekst: m?.text ?? '',
        wanneer: m?.sentAt ?? new Date().toISOString(),
        link: `https://bsky.app/messages/${c.id}`,
        gelezen: false,
      })
    }
  } catch {
    /* geen DM-toegang, of de dienst ligt eruit */
  }

  return uit.sort((a, b) => (a.wanneer < b.wanneer ? 1 : -1))
}
