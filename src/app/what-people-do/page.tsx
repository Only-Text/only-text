import type { Metadata } from 'next'
import Link from 'next/link'

import { HandBars, HandFunnel, HandLine } from '@/components/hand-chart'
import { Sheet } from '@/components/sheet'
import { formatDuration, formatNumber, countryName } from '@/lib/format'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'What people do',
  description:
    'Who turns up on only-text.com, where they come from, how long they stay, and how many of them actually write a sentence. Drawn by hand, counted without cookies.',
}

/**
 * De cijfers, openbaar.
 *
 * Dit is de tegenhanger van /stats. Die pagina is persmateriaal en toont wat de
 * site heeft gedaan; deze toont wat bezoekers hebben gedaan. Dat stond eerst
 * achter een sleutel, en dat hoeft niet: er zit geen enkel persoonsgegeven in.
 * Wat je hier ziet zijn aantallen, landen en verwijzende hostnamen, allemaal
 * geaggregeerd. Op een site die zijn eigen cijfers al openbaar publiceert en
 * niemand vraagt om een account, is een dashboard achter een slot juist het
 * vreemde element.
 *
 * De grafieken zijn met potlood getekend en niet met een bibliotheek. Dat is
 * geen koketterie: dit is dezelfde site, op hetzelfde papier, in hetzelfde
 * handschrift. Een strak staafdiagram uit een grafiekbibliotheek zou hier de
 * enige rechte lijn van het hele project zijn.
 *
 * Bewust geen automatische verversing. Een pagina die zichzelf bijwerkt nodigt
 * uit om ernaar te blijven kijken, en bij deze aantallen verandert er tussen
 * twee verversingen niets dat een blik waard is.
 */

type Report = {
  window_days: number
  generated_at: string
  events_total: number
  sessions: number
  visits: number
  first_seen: string | null
  by_name: { name: string; count: number; sessions: number }[]
  rates: {
    visits: number
    typed: number
    submitted: number
    wrote: number
    typed_pct: number
    wrote_pct: number
  }
  duration: {
    measured: number
    median_s: number | null
    buckets: { label: string; count: number }[]
  }
  referrers: { source: string; count: number }[]
  countries: { country: string; count: number }[]
  devices: { device: string; count: number }[]
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
  busiest_paths: { path: string; count: number; visits: number }[]
}

type Props = { searchParams: Promise<{ days?: string }> }

export default async function WhatPeopleDoPage({ searchParams }: Props) {
  const { days } = await searchParams
  const venster = Math.min(Math.max(Number(days) || 7, 1), 60)

  const supabase = createServiceClient()
  const [{ data, error }, { data: corpus }] = await Promise.all([
    supabase.rpc('get_event_report', { p_days: venster }),
    supabase.rpc('get_corpus'),
  ])

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <Sheet>
          <p className="hand text-[1.05rem]">The numbers are not available right now.</p>
        </Sheet>
      </main>
    )
  }

  const r = data as Report
  const leeg = r.events_total === 0

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={-0.4}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link> / what people do
          </h1>
        </header>

        <p className="message text-[clamp(1.2rem,2.6vw,1.7rem)]">
          {formatNumber(r.rates.visits)} {r.rates.visits === 1 ? 'visit' : 'visits'},{' '}
          {r.rates.wrote_pct}% wrote something.
        </p>
        <p className="meta text-[0.85rem]">
          Last {r.window_days} {r.window_days === 1 ? 'day' : 'days'}. A visit is one browser tab:
          close it and the count starts over, because nothing is stored to recognise you by. That
          makes these numbers a little high, and it is the trade we wanted.
        </p>

        <Corpus c={corpus as CorpusCijfers | null} />

        {leeg && (
          <p className="hand text-[1.05rem]">
            Nothing measured yet in this window. Come back in a bit.
          </p>
        )}

        {!leeg && (
          <>
            <Kop>From opening the page to writing a sentence</Kop>
            <HandFunnel
              seed="trechter"
              stappen={[
                { label: 'Opened the site', waarde: r.rates.visits },
                { label: 'Started typing', waarde: r.rates.typed },
                { label: 'Pressed send', waarde: r.rates.submitted },
                { label: 'Got a sentence up', waarde: r.rates.wrote },
              ]}
            />
            <p className="meta text-[0.85rem]">
              Counted per visit, not per click, so somebody who writes four sentences still counts
              once. The gap between typing and sending is the one worth watching: those are people
              who wanted to and then did not.
            </p>

            <Kop>Where they came from</Kop>
            {r.referrers.length > 0 ? (
              <HandBars
                seed="herkomst"
                data={r.referrers.map((x) => ({ label: x.source, waarde: x.count }))}
              />
            ) : (
              <p className="meta text-[0.9rem]">Nothing recorded yet.</p>
            )}
            <p className="meta text-[0.85rem]">
              &ldquo;direct&rdquo; means no referrer at all: a bookmark, an app, or somebody typing
              the name. Only the hostname is kept, never the full address, because search pages put
              the query in there.
            </p>

            <Kop>Which countries</Kop>
            {r.countries.length > 0 ? (
              <HandBars
                seed="landen"
                data={r.countries.map((x) => ({
                  label: countryName(x.country) ?? x.country,
                  waarde: x.count,
                }))}
              />
            ) : (
              <p className="meta text-[0.9rem]">Nothing recorded yet.</p>
            )}

            <Kop>On what</Kop>
            {r.devices.length > 0 ? (
              <HandBars
                seed="apparaten"
                data={r.devices.map((x) => ({ label: x.device, waarde: x.count }))}
              />
            ) : (
              <p className="meta text-[0.9rem]">Nothing recorded yet.</p>
            )}
            <p className="meta text-[0.85rem]">
              Taken from the width of the window, not from the browser&rsquo;s user agent. That
              string is long enough to recognise people by, and this is not meant to.
            </p>

            <Kop>How long they stayed</Kop>
            <p className="hand text-[1rem]">
              Median visit:{' '}
              <span className="tabular-nums">
                {r.duration.median_s != null
                  ? formatDuration(Number(r.duration.median_s) * 1000)
                  : 'not set yet'}
              </span>
            </p>
            {r.duration.buckets.length > 0 && (
              <HandBars
                seed="duur"
                data={r.duration.buckets.map((b) => ({ label: b.label, waarde: b.count }))}
              />
            )}
            <p className="meta text-[0.85rem]">
              Measured on {formatNumber(r.duration.measured)}{' '}
              {r.duration.measured === 1 ? 'visit' : 'visits'} that reached the end cleanly. A tab
              killed by the system never reports back, so treat this as a floor.
            </p>

            <Kop>Losing, and telling people</Kop>
            <Regel
              label="Watched someone else take over"
              waarde={formatNumber(r.losing.takeover_watched)}
            />
            <Regel
              label="Watched their own sentence go"
              waarde={formatNumber(r.losing.sentence_lost)}
            />
            <Regel
              label="Median time those sentences stood"
              waarde={
                r.losing.median_stood_ms
                  ? formatDuration(Number(r.losing.median_stood_ms))
                  : 'not set yet'
              }
            />
            <Regel label="Clicked a share link" waarde={formatNumber(r.losing.share_click)} />
            <p className="meta text-[0.85rem]">
              {r.losing.sentence_lost > 0
                ? `${Math.round((r.losing.share_click / r.losing.sentence_lost) * 100)} shares per 100 people who lost a sentence. If that number is low, the moment is reaching them and the button is not.`
                : 'Nobody has lost a sentence while watching yet. That is the moment worth waiting for.'}
            </p>

            {r.share_channels.length > 0 && (
              <>
                <Kop>Where they share</Kop>
                <HandBars
                  seed="kanalen"
                  data={r.share_channels.map((s) => ({
                    label: `${s.channel}${s.place ? ` · ${s.place}` : ''}`,
                    waarde: s.count,
                  }))}
                />
              </>
            )}

            {r.refusals.length > 0 && (
              <>
                <Kop>Why sentences bounced</Kop>
                <HandBars
                  seed="weigeringen"
                  data={r.refusals.map((s) => ({ label: s.reason ?? 'unknown', waarde: s.count }))}
                />
              </>
            )}

            {r.busiest_paths.length > 0 && (
              <>
                <Kop>Busiest pages</Kop>
                <HandBars
                  seed="paginas"
                  data={r.busiest_paths.map((p) => ({
                    label: p.path,
                    waarde: p.count,
                    hint: `${p.count} · ${p.visits} ${p.visits === 1 ? 'visit' : 'visits'}`,
                  }))}
                />
              </>
            )}

            {r.by_day.length > 1 && (
              <>
                <Kop>Day by day</Kop>
                <HandLine
                  seed="dagen"
                  punten={r.by_day.map((d) => ({ label: d.day.slice(5), waarde: d.sessions }))}
                />
                <p className="meta text-[0.85rem]">Visits per day.</p>
              </>
            )}

            <Kop>Everything, counted</Kop>
            {r.by_name.map((e) => (
              <Regel
                key={e.name}
                label={e.name}
                waarde={`${formatNumber(e.count)} (${formatNumber(e.sessions)} ${e.sessions === 1 ? 'visit' : 'visits'})`}
              />
            ))}
          </>
        )}

        <p className="meta text-[0.8rem]">
          No cookies were set to count any of this, and none of it is shared with anyone. Rows older
          than sixty days are deleted. Other windows:{' '}
          {[1, 7, 30, 60].map((d, i) => (
            <span key={d}>
              {i > 0 && ' · '}
              <Link href={`/what-people-do?days=${d}`} className="underline underline-offset-4">
                {d}d
              </Link>
            </span>
          ))}
        </p>
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
        <Link href="/stats" className="marginalia text-[0.9rem] hover:text-(--ink)">
          the numbers
        </Link>
        <Link href="/about" className="marginalia text-[0.9rem] hover:text-(--ink)">
          what is this
        </Link>
      </nav>
    </main>
  )
}

type CorpusCijfers = {
  sentences: number
  questions_pct: number | null
  answers_pct: number | null
  took_it_back_from_themselves: number
  came_back_after_losing: number
  most_common_first_word: string | null
  median_characters: number | null
}

/**
 * Wat mensen typen, in vier zinnen.
 *
 * Bewust proza en geen tabel. Dit is het stuk waar volgens het onderzoek uit
 * geciteerd wordt, en een journalist neemt een zin over, geen rij uit een lijst.
 * Om diezelfde reden blijft het kort: nog vijf cijfers erbij maakt het niet
 * completer, alleen minder overneembaar.
 *
 * Elk onderdeel verdwijnt als het nog niets betekent. Een percentage bij zeven
 * zinnen is geen bevinding maar ruis, en de databank geeft daar null terug in
 * plaats van een getal dat overtuigender oogt dan het is.
 */
function Corpus({ c }: { c: CorpusCijfers | null }) {
  if (!c || c.sentences < 5) return null

  const stukken: string[] = []
  if (c.questions_pct !== null) stukken.push(`${c.questions_pct}% of them asked a question`)
  if (c.answers_pct !== null) {
    stukken.push(`${c.answers_pct}% picked up a word from the sentence they replaced`)
  }
  if (c.median_characters) stukken.push(`the middle one is ${c.median_characters} characters long`)

  return (
    <>
      <Kop>What people write</Kop>
      <p className="hand text-[1rem]">
        {formatNumber(c.sentences)} sentences so far
        {stukken.length > 0 ? `: ${stukken.join(', ')}` : '.'}
        {stukken.length > 0 && '.'}
      </p>
      {c.most_common_first_word && (
        <p className="hand text-[1rem]">
          More of them begin with &ldquo;{c.most_common_first_word}&rdquo; than with any other word.
        </p>
      )}
      {c.came_back_after_losing > 0 && (
        <p className="hand text-[1rem]">
          {formatNumber(c.came_back_after_losing)}{' '}
          {c.came_back_after_losing === 1 ? 'person has' : 'people have'} lost the page and come back
          to take it again.
          {c.took_it_back_from_themselves > 0 && (
            <>
              {' '}
              {formatNumber(c.took_it_back_from_themselves)}{' '}
              {c.took_it_back_from_themselves === 1 ? 'sentence was' : 'sentences were'} replaced by
              the same person who wrote the one before.
            </>
          )}
        </p>
      )}
    </>
  )
}

function Kop({ children }: { children: React.ReactNode }) {
  return <p className="hand text-[1.02rem] font-bold">{children}</p>
}

function Regel({ label, waarde }: { label: string; waarde: string }) {
  return (
    <p className="hand text-[1rem]">
      {label}: <span className="tabular-nums">{waarde}</span>
    </p>
  )
}
