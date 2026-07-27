-- Migratie 0010: eigen metingen, in eigen huis.
--
-- Hier stond eerst Google Analytics. Dat betekende cookies, een toestemmingsbalk
-- als eerste wat een bezoeker ziet op een site van één zin, en de belofte in
-- SPEC.md ("geen tracking-cookies") die niet meer klopte. De cijfers gaan dus
-- naar dezelfde database als de rest van de site.
--
-- Drie dingen die dit anders maken dan een meetdienst:
--
--   * Geen cookie en geen blijvend kenmerk. Het sessie-id komt uit
--     sessionStorage, leeft één tabblad lang en is bij het sluiten weg. Twee
--     bezoeken van dezelfde persoon zijn hier dus twee sessies, en dat is een
--     bewuste ruil: liever een cijfer dat iets te hoog is dan een bezoeker die
--     over de tijd te volgen valt.
--   * Schrijven kan alleen via de service_role, net als bij post_message. De
--     anon-sleutel staat in de browser, en een meetendpoint dat iedereen mag
--     aanroepen is een open deur naar een tabel die vollopen kan.
--   * Rijen ouder dan zestig dagen gaan weg. Het gratis plan van Supabase heeft
--     500 MB, en één virale dag schrijft meer rijen dan een half jaar rustig
--     verkeer. Zestig dagen is genoeg om een piek na te kijken en te weinig om
--     een archief te worden.

-- ---------------------------------------------------------------------------
-- Tabel
-- ---------------------------------------------------------------------------

create table if not exists app.events (
  id          bigint      generated always as identity primary key,
  name        text        not null,
  session_id  uuid,
  path        text,
  props       jsonb       not null default '{}'::jsonb,
  country     text,
  created_at  timestamptz not null default now(),
  constraint events_name_shape  check (name ~ '^[a-z][a-z0-9_]{2,39}$'),
  constraint events_path_length check (path is null or char_length(path) <= 120),
  constraint events_country_len check (country is null or char_length(country) = 2)
);

comment on table  app.events            is 'Eigen metingen. Geen cookies, geen derde partij, zestig dagen bewaard.';
comment on column app.events.session_id is 'Uit sessionStorage, leeft één tabblad. Nooit gekoppeld aan een persoon.';
comment on column app.events.props      is 'Losse getallen en labels per event. Nooit de zin zelf, nooit een zoekterm.';

-- BRIN op de tijd, net als bij messages: de tabel groeit uitsluitend achteraan,
-- dus een btree-index zou vooral schijfruimte kosten die we niet hebben.
create index if not exists events_created_at_brin_idx
  on app.events using brin (created_at);

-- Vrijwel elke vraag is "hoe vaak gebeurde X in de laatste N dagen".
create index if not exists events_name_created_idx
  on app.events (name, created_at desc);

alter table app.events enable row level security;
revoke all on app.events from anon, authenticated;

-- Geen enkele policy: alleen de service_role, die RLS omzeilt, komt erbij.
-- Lezen gaat via get_event_report(), en die draait achter de sleutel.

-- ---------------------------------------------------------------------------
-- Schrijven
-- ---------------------------------------------------------------------------

/**
 * Eén verzoek levert meerdere events tegelijk aan.
 *
 * De browser stuurt niet per klik maar in bosjes van maximaal twintig, met
 * sendBeacon bij het verlaten van de pagina. Eén insert per bosje in plaats van
 * één per gebeurtenis scheelt op een drukke dag een orde van grootte aan
 * verbindingen naar een database die op het gratis plan zestig gelijktijdige
 * verbindingen heeft.
 */
create or replace function public.record_events(p_events jsonb, p_country text default null)
returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  if jsonb_typeof(p_events) is distinct from 'array' then
    return 0;
  end if;

  insert into app.events (name, session_id, path, props, country)
  select
    e->>'name',
    -- Een kapot id mag nooit de hele bundel laten mislukken, dus geen harde
    -- cast maar eerst kijken of het de vorm van een uuid heeft.
    case when e->>'session' ~ '^[0-9a-fA-F-]{36}$' then (e->>'session')::uuid end,
    left(e->>'path', 120),
    case when jsonb_typeof(e->'props') = 'object' then e->'props' else '{}'::jsonb end,
    p_country
  from jsonb_array_elements(p_events) as e
  -- Dezelfde vorm als de check op de tabel. Zonder dit filter laat één
  -- onzinnige naam de hele insert klappen en zijn ook de goede events weg.
  where e->>'name' ~ '^[a-z][a-z0-9_]{2,39}$'
  limit 20;

  get diagnostics v_count = row_count;

  -- Opruimen als bijvangst van gewoon verkeer, niet met een cronjob die op het
  -- gratis plan niet bestaat. Eén op de duizend keer, dus op een rustige dag
  -- gebeurt het een keer en op een drukke dag vaak genoeg.
  if random() < 0.001 then
    delete from app.events where created_at < now() - interval '60 days';
  end if;

  return v_count;
end;
$$;

revoke execute on function public.record_events(jsonb, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Lezen
-- ---------------------------------------------------------------------------

/**
 * Alles wat de inzichtpagina nodig heeft, in één aanroep.
 *
 * Bewust één functie en niet acht losse queries: op het gratis plan is elke
 * heen-en-weer naar de database duurder dan het werk zelf, en een pagina die
 * acht keer wacht voelt stuk terwijl er niets mis is.
 */
create or replace function public.get_event_report(p_days integer default 7)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with venster as (
    select * from app.events
    where created_at > now() - make_interval(days => greatest(least(p_days, 60), 1))
  ),
  tel as (
    select name, count(*) as aantal, count(distinct session_id) as sessies
    from venster group by name
  )
  select jsonb_build_object(
    'window_days',  greatest(least(p_days, 60), 1),
    'generated_at', now(),
    'events_total', (select count(*) from venster),
    'sessions',     (select count(distinct session_id) from venster),
    'first_seen',   (select min(created_at) from venster),

    'by_name', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'count', aantal, 'sessions', sessies)
                       order by aantal desc)
      from tel), '[]'::jsonb),

    -- De trechter van het schrijven, in de volgorde waarin hij gelopen wordt.
    'funnel', jsonb_build_object(
      'board_view',      coalesce((select aantal from tel where name = 'board_view'), 0),
      'write_start',     coalesce((select aantal from tel where name = 'write_start'), 0),
      'write_submit',    coalesce((select aantal from tel where name = 'write_submit'), 0),
      'sentence_posted', coalesce((select aantal from tel where name = 'sentence_posted'), 0),
      'sentence_queued', coalesce((select aantal from tel where name = 'sentence_queued'), 0),
      'post_refused',    coalesce((select aantal from tel where name = 'post_refused'), 0),
      'write_again',     coalesce((select aantal from tel where name = 'write_again'), 0)),

    -- Het moment waar het om draait: iemand ziet zijn zin sneuvelen en deelt.
    'losing', jsonb_build_object(
      'takeover_watched', coalesce((select aantal from tel where name = 'takeover_watched'), 0),
      'sentence_lost',    coalesce((select aantal from tel where name = 'sentence_lost'), 0),
      'share_click',      coalesce((select aantal from tel where name = 'share_click'), 0),
      'median_stood_ms', (
        select percentile_cont(0.5) within group (order by (props->>'stood_ms')::numeric)
        from venster
        where name = 'sentence_lost' and props->>'stood_ms' ~ '^[0-9]+$')),

    'share_channels', coalesce((
      select jsonb_agg(x order by x->>'count' desc) from (
        select jsonb_build_object(
                 'channel', props->>'channel',
                 'place',   props->>'place',
                 'count',   count(*)) as x
        from venster where name = 'share_click' and props ? 'channel'
        group by props->>'channel', props->>'place') s), '[]'::jsonb),

    'refusals', coalesce((
      select jsonb_agg(x order by x->>'count' desc) from (
        select jsonb_build_object('reason', props->>'reason', 'count', count(*)) as x
        from venster where name = 'post_refused'
        group by props->>'reason') s), '[]'::jsonb),

    'by_day', coalesce((
      select jsonb_agg(x order by x->>'day') from (
        select jsonb_build_object(
                 'day',      to_char(date_trunc('day', created_at), 'YYYY-MM-DD'),
                 'events',   count(*),
                 'sessions', count(distinct session_id)) as x
        from venster group by date_trunc('day', created_at)) s), '[]'::jsonb),

    'busiest_paths', coalesce((
      select jsonb_agg(x order by x->>'count' desc) from (
        select jsonb_build_object('path', path, 'count', count(*)) as x
        from venster where path is not null
        group by path order by count(*) desc limit 12) s), '[]'::jsonb)
  );
$$;

revoke execute on function public.get_event_report(integer) from public, anon, authenticated;
