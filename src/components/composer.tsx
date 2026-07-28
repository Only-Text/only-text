'use client'

import { useEffect, useRef, useState } from 'react'

import { HandButton, Penned } from './hand-drawn'
import { PenCaret } from './pen-caret'
import { ShareNow } from './share'
import { MAX_AUTHOR_LENGTH, MAX_BODY_LENGTH } from '@/lib/sanitize'
import { formatDuration } from '@/lib/format'
import { track } from '@/lib/analytics'
import { rememberName, rememberedName } from '@/lib/supabase-browser'

type Queued = { position: number; etaMs: number; token: string }

/**
 * Geen kader om het invoerveld.
 *
 * Op een echt schrijfblok staat er geen vierkant waar je in moet schrijven; er
 * staat hooguit een kopje en daaronder begin je op de volgende regel. Een
 * omlijnd tekstvak is een formulier-idioom dat de papierillusie meteen breekt.
 * Dus: een vet kopje met dubbele punt, en daaronder gewoon de regels.
 */
export function Composer({
  queueLength,
  onPosted,
}: {
  queueLength: number
  onPosted: (id: number) => void
}) {
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [queued, setQueued] = useState<Queued | null>(null)
  const [justPosted, setJustPosted] = useState<{ id: number; body: string } | null>(null)
  const [focused, setFocused] = useState(false)

  const shownAt = useRef(Date.now())
  const verzonden = useRef('')
  const honeypot = useRef<HTMLInputElement>(null)
  const field = useRef<HTMLTextAreaElement>(null)

  // Voor de meting: is er al één keer een toets aangeslagen, en sinds wanneer
  // staat deze bezoeker in de wachtrij. Bewust refs en geen state, want geen van
  // beide hoort iets opnieuw te tekenen.
  const begonnen = useRef(false)
  const inRijSinds = useRef(0)

  useEffect(() => {
    setName(rememberedName())

    // De browser voert `autofocus` uit op de HTML van de server, dus vóórdat
    // React zijn listeners heeft aangehangen. Dat focus-event gaat daardoor
    // verloren en onFocus vuurt nooit. Bij het monteren dus zelf kijken of het
    // veld al scherp staat.
    if (field.current && document.activeElement === field.current) {
      setFocused(true)
    }
  }, [])

  /* Het veld groeit mee met de tekst, in hele regels, zodat de liniatuur klopt. */
  useEffect(() => {
    const el = field.current
    if (!el) return
    const lineH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--line-h'),
    )
    el.style.height = 'auto'
    const lines = Math.max(1, Math.ceil(el.scrollHeight / lineH))
    el.style.height = `${lines * lineH}px`
  }, [body])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    if (!queued) return
    let stopped = false

    const poll = async () => {
      if (stopped) return
      try {
        const res = await fetch(`/api/queue/${queued.token}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as {
          status?: string
          position?: number
          eta_ms?: number
          message_id?: number
        }
        if (stopped) return
        if (data.status === 'promoted') {
          setQueued(null)
          if (data.message_id) {
            track('sentence_promoted', {
              waited_ms: inRijSinds.current ? Date.now() - inRijSinds.current : undefined,
            })
            setJustPosted({ id: data.message_id, body: verzonden.current })
            onPosted(data.message_id)
          }
        } else if (data.status === 'waiting' && typeof data.position === 'number') {
          setQueued((q) => (q ? { ...q, position: data.position!, etaMs: data.eta_ms ?? 0 } : q))
        } else {
          setQueued(null)
        }
      } catch {
        /* volgende ronde */
      }
    }

    const timer = setInterval(poll, 4000)
    void poll()
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [queued, onPosted])

  const remaining = MAX_BODY_LENGTH - body.length
  const canSend = body.trim().length > 0 && remaining >= 0 && !busy && cooldown === 0 && !queued

  async function submit(event?: React.FormEvent) {
    event?.preventDefault()
    if (!canSend) return

    setBusy(true)
    setError(null)

    track('write_submit', {
      body_length: body.trim().length,
      has_name: name.trim().length > 0,
      queue_length: queueLength,
    })

    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          body,
          author: name || null,
          website: honeypot.current?.value ?? '',
          shownAt: shownAt.current,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        // De code, niet de hint. `cooldown` blijft `cooldown`; de zin eromheen
        // mag morgen anders geformuleerd worden zonder dat het rapport breekt.
        track('post_refused', { reason: data.error ?? 'unknown', status: res.status })
        setError(data.hint ?? 'That did not work.')
        if (typeof data.retry_after === 'number') setCooldown(data.retry_after)
        return
      }

      rememberName(name)
      verzonden.current = body
      const lengte = body.trim().length
      setBody('')
      shownAt.current = Date.now()
      begonnen.current = false

      if (data.live) {
        track('sentence_posted', { body_length: lengte, has_name: name.trim().length > 0 })
        setJustPosted({ id: data.message.id, body: data.message.body })
        onPosted(data.message.id)
      } else if (data.queued) {
        inRijSinds.current = Date.now()
        track('sentence_queued', {
          body_length: lengte,
          position: data.position ?? 1,
          eta_ms: data.eta_ms ?? 0,
        })
        setQueued({
          position: data.position ?? 1,
          etaMs: data.eta_ms ?? 0,
          token: data.claim_token,
        })
      }
    } catch {
      track('post_refused', { reason: 'network', status: 0 })
      setError('No connection. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (justPosted) {
    return (
      <AfterPost
        id={justPosted.id}
        body={justPosted.body}
        onAgain={() => setJustPosted(null)}
      />
    )
  }

  if (queued) {
    return (
      <div className="mt-(--line-h)">
        <p className="hand text-[1.05rem] font-bold">
          You are in line, number {queued.position}.
        </p>
        <p className="meta text-[0.9rem]">
          Your sentence goes up in about {formatDuration(queued.etaMs)}. Leave this tab open and
          you will see it happen.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-(--line-h)">
      {/* Onzichtbaar voor mensen, onweerstaanbaar voor bots. */}
      <input
        ref={honeypot}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <label htmlFor="zin" className="hand block text-[1rem] font-bold">
        Write your sentence here:
      </label>
      {/* De spelregel staat hier en niet bovenaan: pas op het moment dat je gaat
          typen wil je weten wat er dan gebeurt.

          Deze regel stond er eerder al en ging er weer af omdat hij naast de zin
          om aandacht stond te vragen. Hij komt terug met "for everyone" erbij,
          want dat is het deel dat een nieuwe bezoeker niet kan raden en dat het
          verschil maakt tussen een invoerveld en een knop die een hele website
          verandert. Wie via een gedeelde link binnenkomt heeft de voorpagina
          nooit gezien en weet dus niet dat die zin bovenin de site zelf is.

          Of het werkt is te zien op /what-people-do: daar staat welk deel van de
          bezoekers ook echt schrijft. Gaat dat niet omhoog, dan kan deze regel er
          net zo makkelijk weer af. */}
      <p className="meta text-[0.85rem]">
        It replaces the sentence above, for everyone, until somebody types after you.
      </p>

      <div className="on-rule relative text-[1.35rem]">
        <textarea
          ref={field}
          id="zin"
          value={body}
          onChange={(e) => {
            const nieuw = e.target.value.replace(/[\r\n]+/g, ' ')
            // Eén keer per zin, bij de eerste letter. Dit is de bovenkant van de
            // trechter: hoeveel mensen beginnen te typen tegenover hoeveel er
            // uiteindelijk op versturen drukken.
            if (!begonnen.current && nieuw.length > 0) {
              begonnen.current = true
              track('write_start', { queue_length: queueLength })
            }
            setBody(nieuw)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void submit()
            }
          }}
          rows={1}
          maxLength={MAX_BODY_LENGTH + 40}
          autoFocus
          className="hand relative z-10 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[1.35rem] leading-(--line-h) caret-transparent outline-none placeholder:text-(--ink-faint) focus-visible:shadow-none focus-visible:outline-none"
          style={{ fontVariationSettings: "'BNCE' 34, 'INFM' 26" }}
        />
        <PenCaret fieldRef={field} value={body} visible={focused} />
      </div>

      <div className="on-rule mt-0 flex flex-wrap items-baseline gap-x-4 text-[0.95rem] leading-(--line-h)">
        <span className="hand text-[0.95rem]">
          from:{' '}
          <label htmlFor="naam" className="sr-only">
            Your name, optional
          </label>
          <input
            id="naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_AUTHOR_LENGTH}
            placeholder="anonymous"
            className="hand w-36 border-0 bg-transparent p-0 text-[0.95rem] outline-none placeholder:text-(--ink-faint) focus-visible:shadow-none"
          />
        </span>

        <HandButton type="submit" disabled={!canSend} seed="plaatsknop">
          {busy ? 'sending' : cooldown > 0 ? `wait ${cooldown}s` : 'put it up'}
        </HandButton>

        <span
          className={`meta tabular-nums text-[0.85rem] ${
            remaining < 0 ? 'text-(--flame)' : remaining < 30 ? 'text-(--accent)' : ''
          }`}
        >
          {remaining}
        </span>

        {queueLength > 0 && (
          <span className="meta text-[0.85rem]">
            {queueLength} ahead of you
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="hand text-[0.95rem] text-(--flame)">
          {error}
        </p>
      )}
    </form>
  )
}

function AfterPost({
  id,
  body,
  onAgain,
}: {
  id: number
  body: string
  onAgain: () => void
}) {
  return (
    <div className="mt-(--line-h)">
      <p className="hand text-[1.05rem] font-bold">Your sentence is up.</p>
      <ShareNow id={id} body={body} />
      <p className="meta text-[0.8rem]">
        <button
          type="button"
          onClick={() => {
            track('write_again')
            onAgain()
          }}
          className="hover:text-(--flame)"
        >
          <Penned seed="nog-een">write another</Penned>
        </button>
      </p>
    </div>
  )
}
