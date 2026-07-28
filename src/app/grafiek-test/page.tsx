import type { Metadata } from 'next'

import { HandBars, HandFunnel, HandLine } from '@/components/hand-chart'
import { Sheet } from '@/components/sheet'

/* Een werkbank, net als /design. Hij staat in geen enkel menu en in de sitemap
   staat hij ook niet, maar dat houdt niemand tegen: een pagina die bestaat wordt
   gevonden. Vandaar dezelfde regel als de rest van de werkbanken. */
export const metadata: Metadata = {
  title: 'Chart bench',
  robots: { index: false, follow: false },
}

export default function GrafiekTest() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <Sheet tilt={-0.4}>
        <p className="hand text-[1.02rem] font-bold">Why sentences bounced</p>
        <HandBars
          seed="w"
          data={[
            { label: 'Empty, or longer than the line allows', waarde: 12 },
            { label: 'The filter caught a word', waarde: 7 },
            { label: 'Wrote again too soon', waarde: 3 },
            { label: 'No reason came back', waarde: 1 },
          ]}
        />
        <p className="meta text-[0.85rem]">
          A paragraph after a chart with long labels, to see where the lines land.
        </p>
        <p className="hand text-[1.02rem] font-bold">Day by day</p>
        <HandLine
          seed="d"
          punten={[
            { label: '07-01', waarde: 4 },
            { label: '07-02', waarde: 9 },
            { label: '07-03', waarde: 2 },
            { label: '07-04', waarde: 11 },
            { label: '07-05', waarde: 6 },
          ]}
        />
        <p className="meta text-[0.85rem]">Visits per day.</p>
        <p className="hand text-[1.02rem] font-bold">A funnel that loses people</p>
        <HandFunnel
          seed="t"
          stappen={[
            { label: 'Opened the site', waarde: 240 },
            { label: 'Started typing', waarde: 96 },
            { label: 'Pressed send', waarde: 61 },
            { label: 'Got a sentence up', waarde: 58 },
          ]}
        />
        <p className="meta text-[0.85rem]">And a closing line to check the ruling.</p>
      </Sheet>
    </main>
  )
}
