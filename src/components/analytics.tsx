import Script from 'next/script'

import { GA_ID, analyticsEnabled } from '@/lib/analytics'

/**
 * De Google-tag (gtag.js).
 *
 * Google zegt "plak dit direct na het <head>-element". In de App Router doe je
 * dat met next/script en niet met een letterlijke <script> in de HTML: Next
 * houdt dan bij dat de tag precies één keer laadt, ook als iemand van de
 * voorpagina naar het archief navigeert zonder de pagina te herladen. Twee keer
 * laden zou elke bezoeker dubbel tellen.
 *
 * `afterInteractive` in plaats van `beforeInteractive`: die eerste laadt de tag
 * zodra de pagina bruikbaar is, de tweede vóór alle eigen code. Deze site is één
 * zin op een vel papier, en die zin voor een meetscript laten wachten is de
 * verkeerde volgorde. Het scheelt niets in de cijfers, want gtag stuurt zijn
 * eerste hit toch pas als hij binnen is.
 *
 * Paginaweergaven bij navigatie binnen de site komen automatisch mee, mits in
 * GA4 onder Beheer > Gegevensstromen > Uitgebreide meting het vinkje
 * "Paginawijzigingen op basis van browsergeschiedenis" aan staat. Handmatig
 * page_view sturen zou daar bovenop komen en alles verdubbelen.
 *
 * De `q` uit de URL gaat er wel uit. Het zoekformulier van het archief is een
 * gewone GET, dus zonder deze ingreep staat letterlijk waar iemand naar zocht in
 * de adresregel die naar Google gaat, en mensen zoeken daar naar hun eigen naam.
 * Alleen die parameter, niet de hele querystring: utm-labels moeten blijven
 * staan, anders is straks niet meer te zien waar een piek vandaan kwam.
 */
export function Analytics() {
  if (!analyticsEnabled) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { page_location: (function () {
  try {
    var u = new URL(window.location.href);
    u.searchParams.delete('q');
    return u.toString();
  } catch (e) {
    return window.location.href;
  }
})() });`}
      </Script>
    </>
  )
}
