# Meten

Eigen metingen, in de eigen database. Geen cookies, geen derde partij, geen
toestemmingsbalk, en geen rekening.

| Onderdeel      | Waar                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| Namen          | [`src/lib/analytics-events.ts`](../src/lib/analytics-events.ts)          |
| Verzamelen     | [`src/lib/analytics.ts`](../src/lib/analytics.ts)                        |
| Vanaf een serverpagina | [`src/components/track.tsx`](../src/components/track.tsx)         |
| Binnenkomst    | [`src/app/api/event/route.ts`](../src/app/api/event/route.ts)            |
| Tabel en rapport | [`supabase/migrations/0010_events.sql`](../supabase/migrations/0010_events.sql) |
| Bekijken       | [`src/app/private/events/page.tsx`](../src/app/private/events/page.tsx)  |

## Kijken

`https://only-text.com/private/events?key=<AGENT_KEY>`

Met `&days=30` voor een ander venster (1 tot 60). De pagina staat op `noindex`,
`/private/` staat in robots.txt, en zonder de juiste sleutel zegt hij "Nothing
to see here". Dezelfde sleutel als `/api/agent/digest`.

## Waarom dit geen Google Analytics is

GA4 zet cookies. Dat betekent voor Europees publiek een toestemmingsbalk, en dat
is het eerste wat een bezoeker zou zien op een site die uit één zin bestaat.
Bovendien staat in [SPEC.md](SPEC.md) dat er geen tracking-cookies zijn, en dat
hoort te kloppen. Van de cookieloze diensten heeft Vercel op het gratis plan
geen custom events (alleen paginaweergaven) en Plausible geen gratis plan. De
database die de site toch al draait kan dit gewoon zelf.

## Wat er niet bewaard wordt

- **Geen cookie en geen blijvend kenmerk.** Het sessie-id komt uit
  sessionStorage en leeft één tabblad. Wie morgen terugkomt telt als nieuw. De
  cijfers zijn daardoor iets te hoog, en dat is de bedoelde ruil.
- **Geen IP-adres, ook niet gehasht.** Bij het plaatsen van een zin is die hash
  nodig om iemand te kunnen afremmen. Voor een teller is hij dat niet.
- **Niet de zin zelf**, en **niet de zoekterm** uit het archief. Alleen de
  lengte, het aantal resultaten en het pad.
- Wel: de naam van het event, het pad, een handvol getallen en labels, en de
  landcode die Vercel meestuurt.

Rijen ouder dan zestig dagen worden verwijderd. Dat gebeurt als bijvangst van
gewoon verkeer (één op de duizend inserts), want een cronjob heeft het gratis
plan niet.

## De events

### De voorpagina

| Event              | Wanneer                                            | Erbij                                    |
| ------------------ | -------------------------------------------------- | ---------------------------------------- |
| `board_view`       | Voorpagina geopend                                 | `sentences_total`, `queue_length`, `viewers`, `has_message` |
| `takeover_watched` | Iemand anders nam over terwijl deze bezoeker keek  | `stood_ms`                               |
| `sentence_lost`    | Datzelfde moment, maar het was zijn eigen zin      | `stood_ms`                               |

`sentence_lost` is het interessantste getal van de hele tabel. Dat is het moment
waarop iemand verliest terwijl hij toekijkt, en dat is het moment waarop mensen
een schermafbeelding maken. Loopt `share_click` daarna niet mee omhoog, dan is
het aanreiken van de deelknop het probleem en niet het verkeer. De inzichtpagina
rekent die verhouding voor je uit.

### De trechter van het schrijven

| Event               | Wanneer                          | Erbij                                     |
| ------------------- | -------------------------------- | ----------------------------------------- |
| `write_start`       | Eerste aanslag in het veld       | `queue_length`                            |
| `write_submit`      | Op versturen gedrukt             | `body_length`, `has_name`, `queue_length` |
| `sentence_posted`   | Meteen live                      | `body_length`, `has_name`                 |
| `sentence_queued`   | In de wachtrij gezet             | `body_length`, `position`, `eta_ms`       |
| `sentence_promoted` | Vanuit de wachtrij alsnog live   | `waited_ms`                               |
| `post_refused`      | Server zei nee                   | `reason`, `status`                        |
| `write_again`       | Na afloop nog een keer           |                                           |

`reason` is de foutcode van de server (`cooldown`, `blocked_word`, `duplicate`,
`too_long`, ...) en niet de zin die de bezoeker te zien kreeg. Die zin mag
morgen anders geformuleerd worden zonder dat het rapport breekt.

### Daarna, en rondkijken

| Event            | Wanneer                       | Erbij                                  |
| ---------------- | ----------------------------- | -------------------------------------- |
| `share_click`    | Deelknop of deellink          | `channel`, `place`, `stood_ms`, `rank` |
| `report_open`    | Meldknop aangeklikt           |                                        |
| `report_sent`    | Melding verstuurd             | `ok`                                   |
| `sentence_view`  | Permalink bekeken             | `stood_ms`, `rank`, `reads`, `is_live` |
| `archive_search` | In het archief gezocht        | `results`, `term_length`               |

## Een event toevoegen

1. De naam erbij in [`analytics-events.ts`](../src/lib/analytics-events.ts).
   Doe dit eerst: de route handler weigert alles wat er niet in staat, dus
   andersom komt je event er stilzwijgend nooit in.
2. `track('naam', { ... })` aanroepen in een clientcomponent, of
   `<Track event="naam" params={{ ... }} />` vanaf een serverpagina.
3. Wil je het los terugzien op de inzichtpagina, dan de kolom erbij in
   `get_event_report()`. Onder "Everything, counted" verschijnt het sowieso.

Eigenschappen: hooguit tien per event, teksten tot honderd tekens. De route
snoeit de rest weg zonder te klagen.

## Waar het stil kan misgaan

- **Ontwikkeling meet niet.** `analyticsEnabled` staat alleen aan in een
  productiebuild, anders zit je eigen herladen in de cijfers. Lokaal
  controleren gaat met `npm run build && npx next start`, en dan kijken met
  `npm run db -- "select * from app.events order by id desc limit 20;"`.
- **`/api/event` antwoordt altijd 204**, ook op onzin. Dat is met opzet, want de
  browser stuurt dit met `sendBeacon` en kan met een foutmelding niets. Een
  geweigerd verzoek komt wel in het serverlog te staan als `event geweigerd`;
  kijk daar als een event niet opduikt.
- **De namenlijst staat apart van `lib/analytics.ts`** omdat dat een
  clientmodule is. Importeer je hem daaruit in de route handler, dan krijg je
  geen array maar een verwijzing naar een clientcomponent, en dan faalt elke
  parse zonder dat er iets kapotgaat. Dat is precies één keer gebeurd.
