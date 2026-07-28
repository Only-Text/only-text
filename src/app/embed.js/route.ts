const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://only-text.com'

/**
 * De insluitbare zin: één regel HTML op de site van iemand anders.
 *
 * Waarom dit bestaat, en niet als iframe: elke insluiting moet een echte link
 * naar ons opleveren. Een iframe is voor een zoekmachine een dichte deur, een
 * `<a href>` in de pagina van een ander is precies het tegenovergestelde. En het
 * past bij wat de site is: één zin, dus ook één regel om hem ergens anders neer
 * te zetten.
 *
 * Wat hij bewust niet doet: geen cookies, geen meting, geen eigen lettertype,
 * geen frame en geen kader. Hij erft de opmaak van de pagina waar hij op staat,
 * want iemand die dit insluit heeft zijn eigen ontwerp en zit niet te wachten op
 * het onze. De enige stijl die meekomt is wat nodig is om het geen rommel te
 * laten worden.
 *
 * Het pollen gaat naar /api/current, die het CDN een seconde vasthoudt. Duizend
 * insluitingen die elke halve minuut kijken kosten samen dus nog steeds één
 * query per seconde, en dat is het hele punt van die cache.
 */
const SCRIPT = `(function () {
  var SITE = ${JSON.stringify(SITE)};

  // document.currentScript is null zodra iemand het script met defer of async
  // laadt, en dat doet de helft van de mensen. Dan maar terugzoeken op src.
  var self = document.currentScript;
  if (!self) {
    var alle = document.getElementsByTagName('script');
    for (var i = alle.length - 1; i >= 0; i--) {
      if ((alle[i].src || '').indexOf('/embed.js') !== -1) { self = alle[i]; break; }
    }
  }
  if (!self || self.dataset.onlyTextDone) return;
  self.dataset.onlyTextDone = '1';

  var doos = document.createElement('div');
  doos.className = 'only-text-embed';
  doos.style.lineHeight = '1.5';

  var zin = document.createElement('a');
  zin.href = SITE;
  zin.target = '_blank';
  zin.rel = 'noopener';
  zin.style.textDecoration = 'none';
  zin.style.color = 'inherit';
  zin.textContent = 'one sentence, loading';

  var bron = document.createElement('a');
  bron.href = SITE;
  bron.target = '_blank';
  bron.rel = 'noopener';
  bron.textContent = 'only-text.com';
  bron.style.fontSize = '0.8em';
  bron.style.opacity = '0.6';

  var onder = document.createElement('div');
  onder.appendChild(bron);

  doos.appendChild(zin);
  doos.appendChild(onder);
  self.parentNode.insertBefore(doos, self.nextSibling);

  var laatste = null;

  function haal() {
    fetch(SITE + '/api/current')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.message || d.message.body === laatste) return;
        laatste = d.message.body;
        zin.textContent = d.message.body;
        // De titel vertelt wat er te zien is zonder dat er iets bij hoeft te
        // staan: dit is nu van iemand, en het kan zo weer weg zijn.
        zin.title = 'Whoever typed last owns this. Anyone can take it.';
      })
      .catch(function () { /* de volgende ronde lost het op */ });
  }

  haal();
  // Ruim genoeg dat het niets kost, kort genoeg dat je hem ziet veranderen als
  // je even blijft kijken. Met spreiding, want duizend insluitingen die op
  // dezelfde seconde zijn geladen kloppen anders ook op dezelfde seconde.
  setInterval(haal, 30000 + Math.random() * 15000);
})();`

export const revalidate = 3600

export function GET() {
  return new Response(SCRIPT, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      // Lang, want dit bestand verandert bijna nooit en staat op sites die wij
      // niet beheren. Een uur vasthouden is genoeg om een fout te herstellen.
      'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'access-control-allow-origin': '*',
    },
  })
}
