'use client'

import { useState } from 'react'

import { HandButton, Penned } from './hand-drawn'
import { formatDuration } from '@/lib/format'
import { track } from '@/lib/analytics'

/**
 * Het verliesmoment aanreiken.
 *
 * Bij dit product verliest iedereen, gegarandeerd. Dat is geen bug maar de hele
 * distributie: het moment waarop jouw zin sneuvelt is persoonlijk, tijdgebonden
 * en meetbaar, en dat is precies het soort ding dat mensen posten. Bij elke
 * vergelijkbare site kwam de doorbraak van een derde die een artefact deelde,
 * niet van de maker die een link deelde.
 *
 * Met nul volgers is dat het enige kanaal dat oneindig herhaalbaar is: je
 * bezoekers schrijven de berichten. Maar alleen als je het ze aanreikt met de
 * tekst er al in — vragen om te delen zonder de woorden te leveren levert niets.
 *
 * De tekst is bewust een opschepperij en geen mededeling. "Mijn zin hield het
 * vier uur" is informatie; "plek 7 aller tijden" is een claim die je post.
 */
export function Share({
  id,
  body,
  durationMs,
  rank,
  reads,
}: {
  id: number
  body: string
  durationMs: number | null
  rank: number | null
  reads: number
}) {
  const [gekopieerd, setGekopieerd] = useState<'link' | 'tekst' | null>(null)

  const url = `https://only-text.com/thoughts/${id}`
  const stond = durationMs ? formatDuration(durationMs) : null

  const regels = [
    `"${body}"`,
    stond
      ? `Held the front page of only-text.com for ${stond}${rank ? `, rank #${rank} of all time` : ''}.`
      : `This is on the front page of only-text.com right now.`,
    reads > 0 ? `Read by ${reads} ${reads === 1 ? 'person' : 'people'}.` : null,
  ].filter(Boolean)

  const tekst = `${regels.join('\n')}\n\n${url}`

  const kopieer = (wat: 'link' | 'tekst') => {
    void navigator.clipboard.writeText(wat === 'link' ? url : tekst).then(() => {
      // Pas ná het kopiëren. Een mislukte clipboard-actie (geen toestemming,
      // geen beveiligde verbinding) is geen deling en hoort er ook niet als
      // deling in te staan.
      track('share_click', {
        channel: wat === 'link' ? 'copy_link' : 'copy_text',
        place: 'permalink',
        stood_ms: durationMs ?? undefined,
        rank: rank ?? undefined,
      })
      setGekopieerd(wat)
      setTimeout(() => setGekopieerd(null), 2500)
    })
  }

  const naarBuiten = (channel: 'bluesky' | 'mastodon') =>
    track('share_click', {
      channel,
      place: 'permalink',
      stood_ms: durationMs ?? undefined,
      rank: rank ?? undefined,
    })

  return (
    <div className="mt-(--line-h)">
      <p className="hand text-[1rem] font-bold">Take the credit</p>
      <div className="on-rule flex flex-wrap items-baseline gap-x-4 text-[0.9rem] leading-(--line-h)">
        {/* Bluesky straft externe links niet af, in tegenstelling tot vrijwel
            elk ander platform. Daarom staat die vooraan. */}
        <a
          href={`https://bsky.app/intent/compose?text=${encodeURIComponent(tekst)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => naarBuiten('bluesky')}
          className="hand hover:text-(--flame)"
        >
          <Penned seed="bluesky-perma">post on Bluesky</Penned>
        </a>
        <a
          href={`https://mastodonshare.com/share?text=${encodeURIComponent(tekst)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => naarBuiten('mastodon')}
          className="hand hover:text-(--flame)"
        >
          <Penned seed="mastodon-perma">on Mastodon</Penned>
        </a>
        <button
          type="button"
          onClick={() => kopieer('tekst')}
          className="hand hover:text-(--flame)"
        >
          {/* De seed hangt aan de knop en niet aan het opschrift: anders
              verandert de haal van vorm op het moment dat er "copied" staat. */}
          <Penned seed="woorden-kopie">
            {gekopieerd === 'tekst' ? 'copied' : 'copy the words'}
          </Penned>
        </button>
        <button
          type="button"
          onClick={() => kopieer('link')}
          className="hand hover:text-(--flame)"
        >
          <Penned seed="link-kopie">{gekopieerd === 'link' ? 'copied' : 'just the link'}</Penned>
        </button>
      </div>
      <p className="meta text-[0.8rem]">
        The image people will see is{' '}
        <a href={`/api/og/${id}`} className="hover:text-(--flame)">
          <Penned seed="de-afbeelding">this one</Penned>
        </a>
        , and it never changes.
      </p>
    </div>
  )
}

/**
 * De variant direct na het plaatsen, als je zin nog live staat. Hier is de
 * boodschap niet "kijk wat ik volhield" maar "kijk, dit staat er nu", en dat
 * is een ander soort urgentie: het is over zodra iemand anders typt.
 */
export function ShareNow({ id, body }: { id: number; body: string }) {
  const [gekopieerd, setGekopieerd] = useState(false)
  const url = `https://only-text.com/thoughts/${id}`
  const tekst = `I just took over only-text.com. The whole homepage is my sentence until somebody types after me.\n\n"${body}"\n\n${url}`

  return (
    <div className="on-rule mt-0 flex flex-wrap items-baseline gap-x-4 text-[0.9rem] leading-(--line-h)">
      <HandButton
        seed="deelknop"
        shape="ellipse"
        onClick={() => {
          void navigator.clipboard.writeText(tekst).then(() => {
            track('share_click', { channel: 'copy_text', place: 'after_post' })
            setGekopieerd(true)
            setTimeout(() => setGekopieerd(false), 2500)
          })
        }}
      >
        {gekopieerd ? 'copied' : 'copy the brag'}
      </HandButton>
      <a
        href={`https://bsky.app/intent/compose?text=${encodeURIComponent(tekst)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('share_click', { channel: 'bluesky', place: 'after_post' })}
        className="hand hover:text-(--flame)"
      >
        <Penned seed="bluesky-net-geplaatst">post it on Bluesky</Penned>
      </a>
      <a href={`/thoughts/${id}`} className="hand hover:text-(--flame)">
        <Penned seed="op-zichzelf">see it on its own</Penned>
      </a>
    </div>
  )
}
