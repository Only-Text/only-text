'use client'

import { MotionConfig, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { browserClient, sessionId } from '@/lib/supabase-browser'
import { countryName, formatNumber, formatShortMoment } from '@/lib/format'
import { track } from '@/lib/analytics'
import { Composer } from './composer'
import { Erasing } from './eraser'
import { Eye } from './eye'
import { InkReveal } from './ink-reveal'
import { Pin } from './pin'
import { ReportLink } from './report-link'

export type LiveMessage = {
  id: number
  body: string
  author_name: string | null
  created_at: string
  min_until: string
  country: string | null
  waited_ms: number | null
  peak_viewers?: number
  views?: number
}

export type BoardState = {
  message: LiveMessage | null
  queue_length: number
  viewers: number
  stats: { total_messages: number; total_chars: number; total_ms: number } | null
}

type Outgoing = { id: number; body: string; duration_ms: number | null }

export function LiveBoard({ initial }: { initial: BoardState }) {
  const [state, setState] = useState<BoardState>(initial)
  const [outgoing, setOutgoing] = useState<Outgoing | null>(null)
  const [mineId, setMineId] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)

  // Het hoogste id dat we hebben verwerkt. Broadcasts kunnen in de verkeerde
  // volgorde aankomen; zonder deze grens kan een vertraagd bericht #99 een
  // nieuwer #100 overschrijven en draait de pagina terug in de tijd.
  const highest = useRef(initial.message?.id ?? 0)
  const reduce = useReducedMotion()

  // Hetzelfde id als `mineId`, maar als ref. De realtime-listener wordt één keer
  // opgezet en houdt daarmee voor altijd de waarde vast die bij het monteren
  // gold; zonder deze ref zou hij denken dat niemand ooit zijn eigen zin
  // verliest.
  const mijnId = useRef<number | null>(null)

  const apply = useCallback((next: BoardState, prev?: Outgoing) => {
    const id = next.message?.id ?? 0
    if (id && id <= highest.current) return
    highest.current = id
    if (prev?.id) setOutgoing(prev)
    setState(next)
  }, [])

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/current', { cache: 'no-store' })
      if (!res.ok) return
      apply((await res.json()) as BoardState)
    } catch {
      /* offline: de volgende poging lost het op */
    }
  }, [apply])

  /* ------------------------------------------------------------------ */
  /* Realtime                                                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const sb = browserClient()
    let cancelled = false
    let channel: ReturnType<typeof sb.channel> | undefined

    void (async () => {
      // Verplicht voor een privé-topic. Zonder dit weigert Realtime de join.
      await sb.realtime.setAuth()
      if (cancelled) return

      channel = sb.channel('current', {
        config: { private: true, broadcast: { self: false } },
      })

      channel
        .on('broadcast', { event: 'takeover' }, ({ payload }) => {
          const p = payload as Record<string, unknown>

          // Het moment waar het om draait: iemand kijkt en de zin verandert
          // onder zijn ogen. Was het zijn eigen zin, dan is dit precies het
          // moment waarop mensen een schermafbeelding maken.
          const vorige = p.prev_id ? Number(p.prev_id) : null
          if (vorige) {
            track(mijnId.current === vorige ? 'sentence_lost' : 'takeover_watched', {
              stood_ms: (p.prev_duration_ms as number | null) ?? undefined,
            })
          }

          apply(
            {
              message: {
                id: Number(p.id),
                body: String(p.body),
                author_name: (p.author_name as string | null) ?? null,
                created_at: String(p.created_at),
                min_until: String(p.min_until),
                country: (p.country as string | null) ?? null,
                waited_ms: (p.waited_ms as number | null) ?? null,
                views: 0,
              },
              queue_length: Number(p.queue_length ?? 0),
              viewers: state.viewers,
              stats: state.stats,
            },
            p.prev_id
              ? {
                  id: Number(p.prev_id),
                  body: String(p.prev_body ?? ''),
                  duration_ms: (p.prev_duration_ms as number | null) ?? null,
                }
              : undefined,
          )
        })
        .subscribe((status) => {
          if (cancelled) return
          setConnected(status === 'SUBSCRIBED')
          // Tussen het renderen op de server en dit moment kunnen overnames
          // gemist zijn. Eén keer opnieuw ophalen dicht dat gat.
          if (status === 'SUBSCRIBED') void refetch()
        })
    })()

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refetch()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      // removeChannel, niet alleen unsubscribe: anders blijft het kanaal in
      // de registry staan en loop je met Fast Refresh tegen de limiet aan.
      if (channel) void sb.removeChannel(channel)
    }
    // Bewust lege lijst: supabase of router hierin zet een resubscribe-lus op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------------------------------------------ */
  /* Kijkersteller                                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const sb = browserClient()
    const me = sessionId()
    let stopped = false

    const beat = async () => {
      if (stopped || document.visibilityState !== 'visible') return
      const { data } = await sb.rpc('heartbeat', { p_session: me })
      const hart = data as { live?: number; views?: number; message_id?: number } | null
      if (stopped || !hart) return

      setState((s) => ({
        ...s,
        viewers: hart.live ?? s.viewers,
        // Het totaal hoort bij het bericht dat op dat moment live stond. Is er
        // ondertussen overgenomen, dan laten we het oude getal met rust.
        message:
          s.message && hart.message_id === s.message.id
            ? { ...s.message, views: hart.views ?? s.message.views }
            : s.message,
      }))
    }

    void beat()
    const timer = setInterval(beat, 20_000)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [])

  /* ------------------------------------------------------------------ */
  /* De wachtrij aanzetten zodra de minimumduur voorbij is                */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!state.message || state.queue_length === 0) return
    const wait = new Date(state.message.min_until).getTime() - Date.now()
    // Iets speling zodat niet alle tabbladen op dezelfde milliseconde vragen.
    const jitter = 200 + Math.random() * 1200
    const timer = setTimeout(
      () => {
        void fetch('/api/tick', { method: 'POST' }).then(() => refetch())
      },
      Math.max(wait, 0) + jitter,
    )
    return () => clearTimeout(timer)
  }, [state.message, state.queue_length, refetch])

  /* ------------------------------------------------------------------ */
  /* Meting                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * De stand van het bord bij binnenkomst.
   *
   * GA telt zelf al hoeveel mensen de voorpagina openen. Wat het niet weet is
   * hoe druk het op dat moment wás, en dat is juist de vraag: krijgen bezoekers
   * een lege wachtrij te zien of staan er twintig mensen voor ze.
   */
  useEffect(() => {
    track('board_view', {
      sentences_total: initial.stats?.total_messages ?? 0,
      queue_length: initial.queue_length,
      viewers: initial.viewers,
      has_message: Boolean(initial.message),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Noodrem. Normaal meldt de gum zelf dat hij klaar is, maar als die melding
     om wat voor reden dan ook uitblijft — een tabblad dat naar de achtergrond
     gaat halverwege de animatie, bijvoorbeeld — blijft de oude zin anders voor
     altijd staan terwijl de nieuwe er allang is. */
  useEffect(() => {
    if (!outgoing) return
    const timer = setTimeout(() => setOutgoing(null), reduce ? 900 : 2600)
    return () => clearTimeout(timer)
  }, [outgoing, reduce])

  const msg = state.message

  return (
    <MotionConfig reducedMotion="user">
      {/* Wie, waarvandaan, wanneer, hoe vaak gelezen — in één korte regel boven
          de zin. Hier stond eerst een volzin met land, standtijd tot op de
          seconde en het aantal gelijktijdige kijkers, plus een kopje erboven.
          Dat waren vier dingen die allemaal om aandacht vroegen naast de zin
          waar het om gaat. Vier feiten met een icoontje ertussen lezen als één
          regel; de standtijd en de kijkers staan op de permalink voor wie
          doorklikt. */}
      {msg && <Byline message={msg} mine={mineId === msg.id} />}

      {/* Eén zin tegelijk op het vel. Zolang de oude weggegomd wordt is de
          nieuwe er nog niet: dat is wat er op papier ook gebeurt, en het
          scheelt de sprong in hoogte die je kreeg toen de twee even samen op
          het vel stonden.

          data-nosnippet houdt de zin van een bezoeker uit het zoekresultaat.
          Zonder dit zet Google een willekeurige vreemdentekst onder je titel
          in de resultaten — mogelijk in een andere taal, mogelijk iets waar
          je niet mee geassocieerd wilt worden. De uitleg eromheen wordt dan
          als snippet gebruikt, en dat is precies wat je wil. De permalinks
          tonen hun zin wél gewoon, want die zijn per stuk gearchiveerd. */}
      {/* mt-0 is niet overbodig. Hier omheen stond een div, en die brak de
          `p + p`-regel uit de basislaag die elke alinea een lege regel boven
          zich geeft. Nu de zin direct op de byline volgt zou die regel wél
          aanslaan en zakt de zin een regel weg van zijn naamregel. */}
      <p
        id="bericht"
        data-nosnippet
        className="message mt-0 text-[clamp(1.3rem,3.1vw,1.95rem)]"
      >
        {outgoing ? (
          <Erasing key={outgoing.id} text={outgoing.body} onDone={() => setOutgoing(null)} />
        ) : msg ? (
          <InkReveal key={msg.id} text={msg.body} />
        ) : (
          'Nothing here right now.'
        )}
      </p>

      <Composer
        queueLength={state.queue_length}
        onPosted={(id) => {
          mijnId.current = id
          setMineId(id)
          void refetch()
        }}
      />

      <Footline state={state} connected={connected} messageId={msg?.id ?? null} />
    </MotionConfig>
  )
}

/* -------------------------------------------------------------------- */

/**
 * De regel boven de zin: wie het schreef, waarvandaan, wanneer, en hoe vaak hij
 * gelezen is.
 *
 * Het land staat er omdat het van een naamloze zin een zin van iemand maakt:
 * een vreemde in Brazilië die nu, terwijl jij kijkt, dit op het vel heeft gezet.
 * Alleen het land, nooit fijner — dat komt uit de rand van Vercel en gaat niet
 * verder dan wat er ook op de permalink staat. Ontbreekt het (een IP dat de
 * rand niet kan plaatsen), dan valt het stukje gewoon weg.
 *
 * Bewust geen live-teller en geen oplopende standtijd. Bij weinig verkeer staat
 * een live-teller vrijwel altijd op nul, en een klok die per seconde verspringt
 * trekt de aandacht weg van de zin. Het aantal lezers loopt wél op en blijft
 * staan, dus dat is het getal dat iets betekent.
 */
function Byline({ message, mine }: { message: LiveMessage; mine: boolean }) {
  const naam = message.author_name?.trim()
  const land = countryName(message.country)
  const reads = message.views ?? 0

  return (
    <p className="meta mt-(--line-h) text-[0.85rem]">
      {mine && <span className="text-(--flame)">yours · </span>}
      {naam ? `@${naam}` : "anonymous"}
      {land && (
        <>
          {" · "}
          <Pin /> {land}
        </>
      )}
      {" · "}
      {formatShortMoment(message.created_at)}
      {reads > 0 && (
        <>
          {" · "}
          <Eye /> <span className="tabular-nums">{formatNumber(reads)}</span>
        </>
      )}
    </p>
  )
}

function Footline({
  state,
  connected,
  messageId,
}: {
  state: BoardState
  connected: boolean
  messageId: number | null
}) {
  const total = state.stats?.total_messages ?? 0
  return (
    <p className="meta mt-(--line-h) text-[0.82rem] leading-(--line-h)">
      {formatNumber(total)} sentences have stood here.
      {state.queue_length > 0 && (
        <>
          {' '}
          {state.queue_length} {state.queue_length === 1 ? 'person is' : 'people are'} waiting their
          turn.
        </>
      )}
      {messageId && (
        <>
          {' · '}
          <ReportLink id={messageId} />
        </>
      )}
      {!connected && <span className="text-(--ink-faint)"> · connecting</span>}
    </p>
  )
}
