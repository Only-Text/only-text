# only-text.com — Het laatste bericht

## Het idee in één zin

De hele website is één bericht: dat van de laatste persoon die iets typte. Typ jij iets, dan is
de site van jou — tot de volgende komt. Alles wat ooit getypt is, blijft voor altijd in het archief.

## Kernregels

1. Er is op elk moment precies **één levend bericht**. Nooit nul, nooit twee.
2. Iedereen mag het overschrijven. Geen account, geen login, geen e-mailadres.
3. Zodra jij overschrijft, wordt het vorige bericht gesloten en krijgt het een **definitieve duur**.
   Die duur is de score: hoe lang stond jouw zin overeind.
4. Niets wordt ooit verwijderd uit het archief, behalve wat de moderatie weghaalt.
5. Alles is tekst. Geen afbeeldingen, geen video, geen advertenties, geen tracking-cookies.

## Schermen

### `/` — Het bericht

Het hart van de site. Eén vel papier, gecentreerd, met daarop:

- **Het levende bericht**, groot gezet in de accentletter.
- **De regisseur-regel eronder**: wie het schreef (of "anoniem") en hoe lang het er al staat,
  live tikkend: `staat er 4 min 12 sec`.
- **Het invoerveld**: één regel, max 240 tekens, met een tellertje dat van kleur verandert.
  Enter = plaatsen. Optioneel je naam (max 24 tekens), onthouden in localStorage.
- **Live-teller**: `17 mensen kijken nu mee`.
- **Cooldown**: na plaatsen kun je 60 seconden niet opnieuw. Zichtbaar als aftellende balk.

Wanneer iemand anders het overneemt terwijl jij kijkt:
het oude bericht wordt doorgestreept en schuift weg, het nieuwe wordt "geschreven" ingetypt.
Dit gebeurt binnen ~1 seconde na de plaatsing, via realtime.

Wanneer **jouw** bericht wordt overgenomen krijg je een aparte, zachtere melding:
`Je zin stond 3 min 41 sec. Iemand uit Duitsland nam hem over.`

### `/archief` — Alles wat ooit gezegd is

Oneindig scrollende lijst, nieuwste eerst, van elk bericht ooit, met:
tekst, auteur, tijdstip, en hoe lang het stond. Zoekveld. Deeplink per bericht (`/b/<id>`).
Filter: `langst blijven staan` / `kortst` / `nieuwste`.

### `/records` — De ranglijst

- Top 100 langst blijven staan (aller tijden).
- Kortste levensduur (de zinnen die binnen een seconde werden weggevaagd).
- Drukste uur ooit, totaal aantal berichten, totaal aantal tekens.
- Actiefste dag, gemiddelde levensduur per dag (grafiekje in tekst/ASCII).

### `/b/<id>` — Eén bericht

Permalink met eigen OG-afbeelding. Toont de zin, wie, wanneer, hoe lang,
en wat ervoor en erna kwam. Dit is wat mensen delen.

### `/over` — Wat is dit

Korte uitleg, spelregels, privacy, en een meldknop-uitleg.

### Machineleesbaar

- `/raw` — alleen de huidige tekst, `text/plain`. Niets anders.
- `/feed.xml` — RSS van alle berichten.
- `/api/current` — JSON met het huidige bericht.
- `/llms.txt` — voor AI-crawlers, in de geest van het domein.

## Deelmechaniek

De dynamische OG-afbeelding is het belangrijkste groeikanaal: wie de link deelt op
WhatsApp, X, Discord of Slack, laat daar **de huidige zin** zien. De preview is dus altijd anders.
Op `/b/<id>` staat de bevroren zin van dat moment — dat is wat je deelt als jouw zin er stond.

Na het plaatsen verschijnt: `Je zin staat nu op only-text.com` met een deelknop
die de permalink naar jouw bericht kopieert.

## Misbruik en moderatie

Zonder drempel is dit veld binnen een dag vol met haat en spam. Daarom:

- Max 240 tekens, max 24 voor de naam.
- Unicode-normalisatie (NFKC), zero-width tekens eruit, RTL-override eruit,
  combining marks begrenzen (geen zalgo), homoglyphs omzetten naar latijn.
- Woordfilter Nederlands + Engels, toegepast ná normalisatie en ná l33tspeak-omzetting.
- Geen URLs, geen e-mailadressen, geen telefoonnummers.
- Geen herhaling van hetzelfde teken meer dan 6x achter elkaar.
- Rate limiting op gehashte IP: 1 bericht per 60 sec, max 20 per uur.
- Honeypot-veld plus minimale invultijd tegen simpele bots.
- Meldknop op elk bericht; bij 3 meldingen gaat het bericht automatisch in de wachtrij
  en wordt het verborgen tot beoordeling.
- Beheerdersroute met een geheime sleutel om te verbergen en te blokkeren.

IP-adressen worden **nooit ruw opgeslagen** — alleen als SHA-256 hash met server-side pepper.

## Stijl

PostHog-palet op papier. Crème `#EEEFE9`, dikke zwarte randen, harde offset-schaduwen,
lichte rotaties (−3° tot +3°), en een echte papiertextuur via SVG-ruis. De accentkleuren
(`#F54E00`, `#F7A501`, `#2F80FA`, `#29DBBB`) worden spaarzaam gebruikt: voor de teller,
de knop, en de statusregels. Donkere modus is een omgeklapte versie van hetzelfde papier.

Animaties: tekst die zich schrijft, papier dat wegschuift, inkt die intrekt.
Alles respecteert `prefers-reduced-motion`.

## Techniek

- Next.js 16 (App Router) + React 19 + Tailwind v4, gehost op Vercel.
- Supabase Postgres voor opslag, Supabase Realtime voor de live-update en de kijkersteller.
- Schrijven gaat via een Next.js route handler (server-side), zodat het IP daar gehasht wordt
  en de client nooit iets kan vervalsen. Lezen gaat rechtstreeks vanuit de browser.
- De homepage rendert server-side met het huidige bericht, zodat er nooit een lege flits is.
