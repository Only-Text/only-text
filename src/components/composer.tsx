'use client'

import { useEffect, useRef, useState } from 'react'

import { HandButton } from './hand-drawn'
import { PenCaret } from './pen-caret'
import { MAX_AUTHOR_LENGTH, MAX_BODY_LENGTH } from '@/lib/sanitize'
import { formatDuration } from '@/lib/format'
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
  const [justPosted, setJustPosted] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)

  const shownAt = useRef(Date.now())
  const honeypot = useRef<HTMLInputElement>(null)
  const field = useRef<HTMLTextAreaElement>(null)

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
          setJustPosted(data.message_id ?? null)
          if (data.message_id) onPosted(data.message_id)
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
        setError(data.hint ?? 'That did not work.')
        if (typeof data.retry_after === 'number') setCooldown(data.retry_after)
        return
      }

      rememberName(name)
      setBody('')
      shownAt.current = Date.now()

      if (data.live) {
        setJustPosted(data.message?.id ?? null)
        onPosted(data.message?.id ?? 0)
      } else if (data.queued) {
        setQueued({
          position: data.position ?? 1,
          etaMs: data.eta_ms ?? 0,
          token: data.claim_token,
        })
      }
    } catch {
      setError('No connection. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (justPosted) {
    return <AfterPost id={justPosted} onAgain={() => setJustPosted(null)} />
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

      <div className="on-rule relative text-[1.35rem]">
        <textarea
          ref={field}
          id="zin"
          value={body}
          onChange={(e) => setBody(e.target.value.replace(/[\r\n]+/g, ' '))}
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

      <div className="on-rule mt-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95rem] leading-(--line-h)">
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

function AfterPost({ id, onAgain }: { id: number; onAgain: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window === 'undefined' ? '' : `${window.location.origin}/m/${id}`

  return (
    <div className="mt-(--line-h)">
      <p className="hand text-[1.05rem] font-bold">Your sentence is up.</p>
      <p className="meta text-[0.9rem]">
        From now on, what counts is how long you hold it.
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <HandButton
          seed="deelknop"
          shape="ellipse"
          onClick={() => {
            void navigator.clipboard.writeText(url).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2500)
            })
          }}
        >
          {copied ? 'link copied' : 'share the proof'}
        </HandButton>
        <a href={`/m/${id}`} className="hand text-[0.95rem] underline underline-offset-4">
          see it on its own
        </a>
        <button type="button" onClick={onAgain} className="meta text-[0.85rem] underline">
          write another
        </button>
      </div>
    </div>
  )
}
