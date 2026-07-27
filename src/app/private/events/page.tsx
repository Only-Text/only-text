import type { Metadata } from 'next'
import Link from 'next/link'

import { Sheet } from '@/components/sheet'
import { formatDuration, formatNumber } from '@/lib/format'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'What people do',
  robots: { index: false, follow: false },
}

/**
 * De cijfers, voor jou.
 *
 * Dit is de tegenhanger van /stats. Die pagina is persmateriaal en toont wat de
 * site heeft gedaan; deze toont wat bezoekers hebben gedaan, en dat is niets
 * voor buiten. Vandaar de sleutel in de URL, `noindex`, en een regel in
 * robots.txt. Geen van die drie is op zichzelf genoeg, samen wel.
 *
 * Bewust geen grafieken. Bij deze aantallen zegt een lijst met percentages
 * ernaast meer dan een plaatje, en het scheelt een bibliotheek van honderd
 * kilobyte op een site die verder uit tekst bestaat.
 */

type Report = {
  window_days: number
  generated_at: string
  events_total: number
  sessions: number
  first_seen: string | null
  by_name: { name: string; count: number; sessions: number }[]
  funnel: {
    board_view: number
    write_start: number
    write_submit: number
    sentence_posted: number
    sentence_queued: number
    post_refused: number
    write_again: number
  }
  losing: {
    takeover_watched: number
    sentence_lost: number
    share_click: number
    median_stood_ms: number | null
  }
  share_channels: { channel: string; place: string | null; count: number }[]
  refusals: { reason: string; count: number }[]
  by_day: { day: string; events: number; sessions: number }[]
  busiest_paths: { path: string; count: number }[]
}

type Props = { searchParams: Promise<{ key?: string; days?: string }> }

export default async function EventsPage({ searchParams }: Props) {
  const { key, days } = await searchParams
  const sleutel = process.env.AGENT_KEY

  if (!sleutel || key !== sleutel) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <Sheet>
          <p className="hand text-[1.05rem]">Nothing to see here.</p>
        </Sheet>
      </main>
    )
  }

  const venster = Math.min(Math.max(Number(days) || 7, 1), 60)
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_event_report', { p_days: venster })

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <Sheet>
          <p className="hand text-[1.05rem]">The numbers are not available right now.</p>
          <p className="meta text-[0.85rem]">{error?.message ?? 'no data'}</p>
        </Sheet>
      </main>
    )
  }

  const r = data as Report
  const f = r.funnel
  const l = r.losing

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={-0.4}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / what people do
          </h1>
        </header>

        <p className="message text-[clamp(1.2rem,2.6vw,1.7rem)]">
          {formatNumber(r.sessions)} {r.sessions === 1 ? 'visit' : 'visits'},{' '}
          {formatNumber(r.events_total)} things done.
        </p>
        <p className="meta text-[0.85rem]">
          Last {r.window_days} {r.window_days === 1 ? 'day' : 'days'}. A visit is one browser tab:
          close it and the count starts over, because nothing is stored to recognise you by.
        </p>

        <p className="hand text-[1.02rem] font-bold">Does anyone write</p>
        <Trap label="Opened the front page" waarde={f.board_view} van={f.board_view} />
        <Trap label="Started typing" waarde={f.write_start} van={f.board_view} />
        <Trap label="Pressed send" waarde={f.write_submit} van={f.board_view} />
        <Trap label="Went up straight away" waarde={f.sentence_posted} van={f.board_view} />
        <Trap label="Went into the queue" waarde={f.sentence_queued} van={f.board_view} />
        <Trap label="Was refused" waarde={f.post_refused} van={f.board_view} />
        <Trap label="Wrote another one" waarde={f.write_again} van={f.board_view} />

        <p className="hand text-[1.02rem] font-bold">Losing, and telling people</p>
        <Regel label="Watched someone else take over" waarde={formatNumber(l.takeover_watched)} />
        <Regel label="Watched their own sentence go" waarde={formatNumber(l.sentence_lost)} />
        <Regel
          label="Median time those sentences stood"
          waarde={l.median_stood_ms ? formatDuration(Number(l.median_stood_ms)) : 'not set yet'}
        />
        <Regel label="Clicked a share link" waarde={formatNumber(l.share_click)} />
        <p className="meta text-[0.85rem]">
          {l.sentence_lost > 0
            ? `${Math.round((l.share_click / l.sentence_lost) * 100)} shares per 100 people who lost a sentence. If that number is low, the moment is reaching them and the button is not.`
            : 'Nobody has lost a sentence while watching yet. That is the moment worth waiting for.'}
        </p>

        {r.share_channels.length > 0 && (
          <>
            <p className="hand text-[1.02rem] font-bold">Where they share</p>
            {r.share_channels.map((s) => (
              <Regel
                key={`${s.channel}-${s.place}`}
                label={`${s.channel}${s.place ? ` (${s.place})` : ''}`}
                waarde={formatNumber(s.count)}
              />
            ))}
          </>
        )}

        {r.refusals.length > 0 && (
          <>
            <p className="hand text-[1.02rem] font-bold">Why sentences bounced</p>
            {r.refusals.map((s) => (
              <Regel key={s.reason} label={s.reason ?? 'unknown'} waarde={formatNumber(s.count)} />
            ))}
          </>
        )}

        {r.busiest_paths.length > 0 && (
          <>
            <p className="hand text-[1.02rem] font-bold">Busiest pages</p>
            {r.busiest_paths.map((p) => (
              <Regel key={p.path} label={p.path} waarde={formatNumber(p.count)} />
            ))}
          </>
        )}

        {r.by_day.length > 0 && (
          <>
            <p className="hand text-[1.02rem] font-bold">Day by day</p>
            {r.by_day.map((d) => (
              <Regel
                key={d.day}
                label={d.day}
                waarde={`${formatNumber(d.sessions)} visits, ${formatNumber(d.events)} things`}
              />
            ))}
          </>
        )}

        <p className="hand text-[1.02rem] font-bold">Everything, counted</p>
        {r.by_name.map((e) => (
          <Regel
            key={e.name}
            label={e.name}
            waarde={`${formatNumber(e.count)} (${formatNumber(e.sessions)} visits)`}
          />
        ))}

        <p className="meta text-[0.8rem]">
          Nothing here is a cookie and nothing here leaves the building. Rows older than sixty days
          are deleted. Other windows:{' '}
          {[1, 7, 30, 60].map((d, i) => (
            <span key={d}>
              {i > 0 && ' · '}
              <Link
                href={`/private/events?key=${key}&days=${d}`}
                className="underline underline-offset-4"
              >
                {d}d
              </Link>
            </span>
          ))}
        </p>
      </Sheet>
    </main>
  )
}

/** Een regel uit de trechter, met het percentage van de bovenkant erbij. */
function Trap({ label, waarde, van }: { label: string; waarde: number; van: number }) {
  const deel = van > 0 ? Math.round((waarde / van) * 100) : 0
  return (
    <p className="hand text-[1rem]">
      {label}: <span className="tabular-nums">{formatNumber(waarde)}</span>
      {van > 0 && <span className="meta text-[0.85rem]"> · {deel}%</span>}
    </p>
  )
}

function Regel({ label, waarde }: { label: string; waarde: string }) {
  return (
    <p className="hand text-[1rem]">
      {label}: <span className="tabular-nums">{waarde}</span>
    </p>
  )
}
