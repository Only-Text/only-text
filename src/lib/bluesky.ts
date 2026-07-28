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
  /**
   * Eén regel die als antwoord onder het bericht komt te staan.
   *
   * Een draad van twee levert op Bluesky merkbaar meer antwoorden op dan één
   * los bericht, en er is hier ook echt een tweede ding te zeggen: het bericht
   * gaat over één zin, en niet iedereen die langsscrolt weet wat de site is.
   * Die uitleg hoort niet in het bericht zelf, want dan gaat het over ons in
   * plaats van over wat iemand schreef.
   */
  naschrift?: string
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

  // Het naschrift mag niet fataal zijn: het hoofdbericht staat er al, en een
  // draad van één is beter dan een mislukte aanroep die de cron op 502 zet.
  if (opts.naschrift) {
    try {
      const ref = { uri: result.uri, cid: result.cid }
      const staart = new RichText({ text: opts.naschrift })
      await staart.detectFacets(agent)
      await agent.post({
        text: staart.text,
        facets: staart.facets,
        langs: ['en'],
        reply: { root: ref, parent: ref },
      })
    } catch (e) {
      console.error('naschrift plaatsen faalde', e)
    }
  }

  return { uri: result.uri, cid: result.cid }
}

/**
 * Antwoordt onder een bestaand bericht.
 *
 * Deze functie stond hier bewust niet, met het argument dat een app-wachtwoord
 * volledige toegang geeft en een zelfstandig antwoordend account daarmee een
 * groot oppervlak heeft. Dat argument klopt nog steeds; wat veranderd is, is dat
 * er nu een rem omheen staat die er toen niet was. Wie deze functie aanroept
 * moet drie dingen geregeld hebben, en ze staan alle drie in
 * `/api/cron/replies`: het bericht is eerst geclaimd in de databank zodat er
 * nooit twee keer geantwoord wordt, er zit een harde bovengrens op het aantal
 * antwoorden per draai, en de tekst komt langs dezelfde controle als de posts.
 *
 * Zonder die drie hoort dit niet aangeroepen te worden.
 */
export async function antwoordOp(opts: {
  text: string
  parent: { uri: string; cid: string }
  root: { uri: string; cid: string }
}): Promise<{ uri: string; cid: string }> {
  const agent = await bluesky()
  const rt = new RichText({ text: opts.text })
  await rt.detectFacets(agent)

  const result = await agent.post({
    text: rt.text,
    facets: rt.facets,
    langs: ['en'],
    reply: { root: opts.root, parent: opts.parent },
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
  /** Waar dit bericht staat, zodat er een antwoord onder kan. Leeg bij een DM. */
  uri?: string
  cid?: string
  /** De bovenkant van de draad. Bij een losse vermelding is dat het bericht zelf. */
  rootUri?: string
  rootCid?: string
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
    const record = n.record as {
      text?: string
      createdAt?: string
      reply?: { root?: { uri?: string; cid?: string } }
    }
    // De wortel van de draad, want een antwoord moet zowel zijn buurman als de
    // bovenkant meesturen. Is dit een losse vermelding, dan is het bericht zelf
    // de bovenkant.
    const wortel = record.reply?.root
    uit.push({
      soort: n.reason as 'mention' | 'reply' | 'quote',
      van: n.author.handle,
      naam: n.author.displayName ?? null,
      tekst: record.text ?? '',
      wanneer: n.indexedAt,
      link: `https://bsky.app/profile/${n.author.handle}/post/${n.uri.split('/').pop()}`,
      gelezen: n.isRead,
      uri: n.uri,
      cid: n.cid,
      rootUri: wortel?.uri ?? n.uri,
      rootCid: wortel?.cid ?? n.cid,
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
