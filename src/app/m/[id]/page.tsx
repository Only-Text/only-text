import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Sheet } from '@/components/sheet'
import { formatDuration, formatMoment, formatNumber, countryName } from '@/lib/format'
import { getMessage } from '@/lib/data'
import { ReportLink } from '@/components/report-link'
import { Share } from '@/components/share'

/**
 * De permalink: één bericht, bevroren.
 *
 * Dit is wat mensen delen, niet de voorpagina. Een gedeelde voorpagina toont
 * tegen de tijd dat iemand klikt de tekst van een ander, dus de deler krijgt
 * geen bevestiging en de ontvanger snapt de context niet. Hier staat voor
 * altijd de zin die er stond, met hoe lang hij het volhield.
 */

export const revalidate = 3600

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const found = await getMessage(Number(id))
  if (!found) return { title: 'Not found' }

  const { message } = found
  const kort = message.body.length > 70 ? `${message.body.slice(0, 68)}…` : message.body
  const duur = message.duration_ms ? `Stood for ${formatDuration(message.duration_ms)}.` : 'Up now.'

  return {
    title: kort,
    description: `${duur} One sentence at a time, on only-text.com.`,
    openGraph: {
      type: 'article',
      title: kort,
      description: duur,
      images: [{ url: `/api/og/${message.id}`, width: 1200, height: 630, alt: message.body }],
    },
    twitter: { card: 'summary_large_image', images: [`/api/og/${message.id}`] },
  }
}

export default async function MessagePage({ params }: Props) {
  const { id } = await params
  const numeric = Number(id)
  if (!Number.isInteger(numeric) || numeric <= 0) notFound()

  const found = await getMessage(numeric)
  if (!found) notFound()

  const { message, previous, next } = found
  const land = countryName(message.country)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={0.4}>
        <header>
          <h1 className="meta text-[0.8rem] leading-(--line-h) tracking-wide">
            <Link href="/">only-text.com</Link>
          </h1>
        </header>

        <p className="message text-[clamp(1.3rem,3.1vw,1.95rem)]">{message.body}</p>

        <p className="marginalia text-[0.95rem]">
          Written {message.author_name ? `by ${message.author_name}` : 'by someone with no name'}
          {land ? ` from ${land}` : ''} on {formatMoment(message.created_at)}.
        </p>

        <p className="meta text-[0.9rem]">
          {message.ended_at ? (
            <>
              It stood for{' '}
              <span className="text-(--ink)">{formatDuration(message.duration_ms)}</span>
              {message.rank && <> · rank #{message.rank} of {message.ranked_of}</>}
              {message.views > 0 && (
                <> and was read by {formatNumber(message.views)} {message.views === 1 ? 'person' : 'people'}</>
              )}
              .
            </>
          ) : (
            <>It is up right now. Go and take it.</>
          )}
        </p>

        <Share
          id={message.id}
          body={message.body}
          durationMs={message.duration_ms}
          rank={message.rank}
          reads={message.views}
        />

        <p className="meta mt-(--line-h) text-[0.85rem]">
          <ReportLink id={message.id} />
        </p>

        <p className="meta text-[0.85rem]">
          {previous && (
            <>
              Before this:{' '}
              <Link href={`/m/${previous.id}`} className="underline underline-offset-4">
                {previous.body.slice(0, 46)}
                {previous.body.length > 46 ? '…' : ''}
              </Link>
              <br />
            </>
          )}
          {next && (
            <>
              After this:{' '}
              <Link href={`/m/${next.id}`} className="underline underline-offset-4">
                {next.body.slice(0, 46)}
                {next.body.length > 46 ? '…' : ''}
              </Link>
            </>
          )}
        </p>
      </Sheet>

      <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pl-1">
        <Link href="/" className="marginalia text-[0.9rem] hover:text-(--ink)">
          back to the front
        </Link>
        <Link href="/archive" className="marginalia text-[0.9rem] hover:text-(--ink)">
          everything ever written
        </Link>
      </nav>
    </main>
  )
}
