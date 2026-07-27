# Meten

Google Analytics 4, property `G-ZQB4HB9DJJ`. De tag zit in
[`src/components/analytics.tsx`](../src/components/analytics.tsx), de events in
[`src/lib/analytics.ts`](../src/lib/analytics.ts).

## Aan en uit

`NEXT_PUBLIC_GA_ID` overschrijft het id; leeg maken zet de meting uit voor die omgeving. Zonder de
variabele valt de site terug op de property hierboven. De tag laadt alleen in een productiebuild,
dus `npm run dev` en `npm run build` op je eigen machine komen niet in de cijfers terecht. Wil je
lokaal controleren of het werkt: `npm run build && npx next start` en dan in het tabblad
`window.dataLayer` bekijken.

## Eenmalig in te stellen in GA4

1. **Beheer > Gegevensstromen > Uitgebreide meting**: het vinkje "Paginawijzigingen op basis van
   browsergeschiedenis" moet aan. Zonder dat vinkje telt alleen de eerste pagina van een bezoek,
   want de rest van de site navigeert zonder de pagina te herladen. De code stuurt bewust geen
   eigen `page_view`, anders wordt alles dubbel geteld.
2. **Beheer > Aangepaste definities**: de parameters hieronder registreren. GA4 verzamelt ze
   meteen, maar tot ze geregistreerd zijn kun je er geen rapport op bouwen, en met terugwerkende
   kracht gaat dat niet. Doe dit dus vóór de eerste piek, niet erna.

| Parameter         | Type       | Zit op                                             |
| ----------------- | ---------- | -------------------------------------------------- |
| `reason`          | dimensie   | `post_refused`                                     |
| `channel`         | dimensie   | `share_click`                                      |
| `place`           | dimensie   | `share_click`                                      |
| `has_name`        | dimensie   | `write_submit`, `sentence_posted`                  |
| `is_live`         | dimensie   | `sentence_view`                                    |
| `has_message`     | dimensie   | `board_view`                                       |
| `body_length`     | statistiek | `write_submit`, `sentence_posted`, `sentence_queued` |
| `queue_length`    | statistiek | `board_view`, `write_start`, `write_submit`        |
| `sentences_total` | statistiek | `board_view`                                       |
| `viewers`         | statistiek | `board_view`                                       |
| `stood_ms`        | statistiek | `takeover_watched`, `sentence_lost`, `sentence_view`, `share_click` |
| `waited_ms`       | statistiek | `sentence_promoted`                                |
| `position`        | statistiek | `sentence_queued`                                  |
| `rank`            | statistiek | `sentence_view`, `share_click`                     |
| `reads`           | statistiek | `sentence_view`                                    |
| `results`         | statistiek | `archive_search`                                   |
| `term_length`     | statistiek | `archive_search`                                   |

## De events

### De voorpagina

| Event              | Wanneer                                                    |
| ------------------ | ---------------------------------------------------------- |
| `board_view`       | Voorpagina geopend, met de standen van dat moment.          |
| `takeover_watched` | Iemand anders nam over terwijl deze bezoeker keek.          |
| `sentence_lost`    | Datzelfde moment, maar het was zijn eigen zin.              |

`sentence_lost` is het interessantste getal van de hele property. Dat is het moment waarop iemand
verliest terwijl hij toekijkt, en dat is het moment waarop mensen een schermafbeelding maken.
Loopt `share_click` daarna niet mee omhoog, dan is het aanreiken van de deelknop het probleem en
niet het verkeer.

### De trechter van het schrijven

| Event               | Wanneer                                          |
| ------------------- | ------------------------------------------------ |
| `write_start`       | Eerste aanslag in het veld.                      |
| `write_submit`      | Op versturen gedrukt.                            |
| `sentence_posted`   | Meteen live.                                     |
| `sentence_queued`   | In de wachtrij gezet.                            |
| `sentence_promoted` | Vanuit de wachtrij alsnog live, met de wachttijd. |
| `post_refused`      | Server zei nee. `reason` is de code, niet de zin. |
| `write_again`       | Na afloop nog een keer.                          |

`write_start` tegenover `write_submit` is de vraag of het veld uitnodigt of afschrikt.
`sentence_queued` tegenover `sentence_promoted` is de vraag of mensen het wachten uitzitten.

### Daarna

| Event         | Wanneer                                                        |
| ------------- | -------------------------------------------------------------- |
| `share_click` | Deelknop of deellink. `channel` en `place` zeggen welke en waar. |
| `report_open` | Meldknop aangeklikt.                                            |
| `report_sent` | Melding daadwerkelijk verstuurd.                                |
| `sentence_view` | Permalink bekeken, met standtijd en positie.                  |
| `archive_search` | In het archief gezocht.                                      |

## Wat er niet naartoe gaat

- De zin zelf wordt nooit als parameter meegestuurd. Wel staat de zin in de `<title>` van zijn
  permalink, en die titel gaat als `page_title` mee bij een paginaweergave. Dat is gepubliceerde
  tekst die ook in het archief en in de RSS-feed staat, dus dat is geen lek, maar weet dat het zo
  is voordat je zegt dat Google de zinnen niet ziet.
- De zoekterm uit het archief gaat er expres uit. Het formulier is een gewone GET, dus die term
  staat in de adresregel; de tag knipt de parameter `q` eruit voordat hij de URL doorgeeft.
  `utm_*` blijft wel staan, anders is een piek niet meer terug te voeren op zijn bron.
- Namen, e-mailadressen en IP-adressen komen nergens in een event voor.

## Nog open: toestemming

Er staat geen cookiebanner op de site. GA4 zet cookies zodra de tag laadt, en voor Nederlands en
Europees publiek hoort daar toestemming vooraf bij. Dat is een bewuste, nog te maken keuze en geen
vergeten stap. Drie richtingen:

1. **Een banner**, met Consent Mode v2 op `denied` tot iemand ja zegt. Correct, maar het is wel het
   eerste wat een bezoeker op een site van één zin te zien krijgt.
2. **Cookieloos meten**, bijvoorbeeld Plausible of Vercel Analytics. Geen banner nodig, en de
   gebeurtenissen hierboven zijn er één op één naartoe te vertalen.
3. **Laten staan zoals het nu is**, met de uitleg op `/about` en `/press` die er al bij staat.
