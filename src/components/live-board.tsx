'use client'

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { browserClient, sessionId } from '@/lib/supabase-browser'
import { countryName, formatDurationLong, formatNumber } from '@/lib/format'
import { Composer } from './composer'
import { InkReveal } from './ink-reveal'

export type LiveMessage = {
  id: number
  body: string
  author_name: string | null
  created_at: string
  min_until: string
  country: string | null
  waited_ms: number | null
  peak_viewers?: number
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
      if (!stopped && typeof data === 'number') {
        setState((s) => ({ ...s, viewers: data }))
      }
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

  /* Het doorgestreepte bericht weer opruimen. */
  useEffect(() => {
    if (!outgoing) return
    const timer = setTimeout(() => setOutgoing(null), reduce ? 900 : 2600)
    return () => clearTimeout(timer)
  }, [outgoing, reduce])

  const msg = state.message

  return (
    <MotionConfig reducedMotion="user">
      {/* Een bijschrift boven de zin in plaats van uitleg eronder.
          Zo weet je in één oogopslag wat dat grote stuk tekst is, zonder dat
          er een alinea bij komt die er net zo belangrijk uitziet als de zin
          zelf. De rest van de uitleg staat bij het invoerveld, want daar heb
          je hem pas nodig. */}
      <p className="meta text-[0.78rem] uppercase leading-(--line-h) tracking-[0.14em]">
        the last thing anyone typed
      </p>

      <div className="relative">
        {/* Het vorige bericht: doorgestreept, schuift weg. */}
        <AnimatePresence>
          {outgoing && (
            <motion.p
              key={outgoing.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, x: -60, rotate: 2.5, transition: { duration: 0.55 } }
              }
              className="message struck pointer-events-none absolute inset-x-0 top-0 text-[clamp(1.3rem,3.1vw,1.95rem)]"
              style={{ willChange: 'transform' }}
            >
              {outgoing.body}
            </motion.p>
          )}
        </AnimatePresence>

        <p
          id="bericht"
          className="message text-[clamp(1.3rem,3.1vw,1.95rem)]"
          style={{ opacity: outgoing ? 0 : 1 }}
        >
          {msg ? <InkReveal key={msg.id} text={msg.body} /> : 'Nothing here right now.'}
        </p>
      </div>

      {msg && <Standing message={msg} viewers={state.viewers} mine={mineId === msg.id} />}

      <Composer
        queueLength={state.queue_length}
        onPosted={(id) => {
          setMineId(id)
          void refetch()
        }}
      />

      <Footline state={state} connected={connected} />
    </MotionConfig>
  )
}

/* -------------------------------------------------------------------- */

function Standing({
  message,
  viewers,
  mine,
}: {
  message: LiveMessage
  viewers: number
  mine: boolean
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const standing = Math.max(0, now - new Date(message.created_at).getTime())
  const land = countryName(message.country)
  const who = message.author_name?.trim()

  // Geen eigen marge: opeenvolgende alinea's op het vel krijgen die al via de
  // liniatuur-regels. Allebei zetten geeft een lege regel ertussen.
  return (
    <p className="marginalia text-[0.95rem] leading-(--line-h)">
      {mine ? (
        <strong className="text-(--flame)">This one is yours. </strong>
      ) : null}
      Written by {who ? <span className="text-(--ink)">{who}</span> : 'someone with no name'}
      {land ? ` from ${land}` : ''} and has been up for{' '}
      {/* De server rendert een andere seconde dan de browser een tel later.
          Dat is geen fout maar de aard van een klok, dus laten we het verschil
          hier expliciet toe in plaats van de waarde pas na hydratie te tonen —
          zo staat er ook zonder JavaScript iets zinnigs. */}
      <span suppressHydrationWarning className="tabular-nums text-(--ink)">
        {formatDurationLong(standing)}
      </span>
      .
      {viewers > 1 && (
        <>
          {' '}
          Right now,{' '}
          <span className="tabular-nums text-(--ink)">{formatNumber(viewers)}</span> people are reading it.
        </>
      )}
    </p>
  )
}

function Footline({ state, connected }: { state: BoardState; connected: boolean }) {
  const total = state.stats?.total_messages ?? 0
  return (
    <p className="meta mt-(--line-h) text-[0.82rem] leading-(--line-h)">
      {formatNumber(total)} sentences have stood here.
      {state.queue_length > 0 && (
        <> {state.queue_length} {state.queue_length === 1 ? 'person is' : 'people are'} waiting their turn.</>
      )}
      {!connected && <span className="text-(--ink-faint)"> · connecting</span>}
    </p>
  )
}
