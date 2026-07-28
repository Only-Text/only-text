-- Migratie 0011: een rijker rapport.
--
-- 0010 gaf de trechter en de deelknoppen. Wat er nog niet in zat is waar mensen
-- vandaan komen, waarop ze kijken, hoe lang ze blijven en welk deel van hen
-- daadwerkelijk iets schrijft. Dat laatste is het enige percentage dat er echt
-- toe doet op deze site.
--
-- Twee nieuwe events voeden dit (zie lib/analytics): `page_open` op elke pagina,
-- met herkomst en apparaat, en `visit_end` bij het weggaan, met de duur.
--
-- De noemer is bewust `page_open` en niet "alle events". Iemand die één pagina
-- opent en wegklikt maakt één event; iemand die schrijft maakt er acht. Delen
-- door het totaal aantal events zou de trechter dus laten meebewegen met hoe
-- actief bezoekers zijn, en dat is precies wat je probeert te meten.

create or replace function public.get_event_report(p_days integer default 7)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with dagen as (
    select greatest(least(p_days, 60), 1) as n
  ),
  venster as (
    select * from app.events, dagen
    where created_at > now() - make_interval(days => dagen.n)
  ),
  tel as (
    select name, count(*) as aantal, count(distinct session_id) as sessies
    from venster group by name
  ),
  bezoeken as (
    select count(distinct session_id) as n
    from venster where name = 'page_open'
  ),
  schrijvers as (
    select count(distinct session_id) as n
    from venster where name in ('sentence_posted', 'sentence_promoted')
  ),
  tikkers as (
    select count(distinct session_id) as n
    from venster where name = 'write_start'
  ),
  versturers as (
    select count(distinct session_id) as n
    from venster where name = 'write_submit'
  ),
  duur as (
    select (props->>'seconds')::numeric as seconden
    from venster
    where name = 'visit_end' and props->>'seconds' ~ '^[0-9]+$'
  )
  select jsonb_build_object(
    'window_days',  (select n from dagen),
    'generated_at', now(),
    'events_total', (select count(*) from venster),
    'sessions',     (select count(distinct session_id) from venster),
    'visits',       (select n from bezoeken),
    'first_seen',   (select min(created_at) from venster),

    'by_name', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'count', aantal, 'sessions', sessies)
                       order by aantal desc)
      from tel), '[]'::jsonb),

    -- Het percentage waar het om draait. Van iedereen die de site opende: wie
    -- begon er te typen, en wie kreeg er daadwerkelijk een zin op de voorpagina.
    'rates', jsonb_build_object(
      'visits',      (select n from bezoeken),
      'typed',       (select n from tikkers),
      'submitted',   (select n from versturers),
      'wrote',       (select n from schrijvers),
      'typed_pct',   case when (select n from bezoeken) > 0
                       then round(100.0 * (select n from tikkers) / (select n from bezoeken))
                       else 0 end,
      'wrote_pct',   case when (select n from bezoeken) > 0
                       then round(100.0 * (select n from schrijvers) / (select n from bezoeken))
                       else 0 end),

    -- Hoe lang bleven ze. De mediaan en niet het gemiddelde: één tabblad dat
    -- een uur open blijft staan trekt een gemiddelde volledig scheef.
    'duration', jsonb_build_object(
      'measured',   (select count(*) from duur),
      'median_s',   (select percentile_cont(0.5) within group (order by seconden) from duur),
      'buckets', coalesce((
        select jsonb_agg(jsonb_build_object('label', label, 'count', aantal) order by volgorde)
        from (
          select
            case when seconden < 10 then 'under 10s'
                 when seconden < 60 then '10s to 1m'
                 when seconden < 300 then '1m to 5m'
                 else 'over 5m' end as label,
            case when seconden < 10 then 1
                 when seconden < 60 then 2
                 when seconden < 300 then 3
                 else 4 end as volgorde,
            count(*) as aantal
          from duur group by 1, 2) s), '[]'::jsonb)),

    -- Waar kwamen ze vandaan. 'direct' betekent zonder verwijzer: een bookmark,
    -- een app, of iemand die de naam intypte.
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('source', bron, 'count', aantal) order by aantal desc)
      from (
        select props->>'referrer' as bron, count(distinct session_id) as aantal
        from venster
        where name = 'page_open' and props ? 'referrer' and props->>'referrer' <> 'internal'
        group by 1 order by count(distinct session_id) desc limit 12) s), '[]'::jsonb),

    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('country', land, 'count', aantal) order by aantal desc)
      from (
        select country as land, count(distinct session_id) as aantal
        from venster where country is not null
        group by 1 order by count(distinct session_id) desc limit 12) s), '[]'::jsonb),

    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', soort, 'count', aantal) order by aantal desc)
      from (
        select props->>'device' as soort, count(distinct session_id) as aantal
        from venster where name = 'page_open' and props ? 'device'
        group by 1) s), '[]'::jsonb),

    'funnel', jsonb_build_object(
      'board_view',      coalesce((select aantal from tel where name = 'board_view'), 0),
      'write_start',     coalesce((select aantal from tel where name = 'write_start'), 0),
      'write_submit',    coalesce((select aantal from tel where name = 'write_submit'), 0),
      'sentence_posted', coalesce((select aantal from tel where name = 'sentence_posted'), 0),
      'sentence_queued', coalesce((select aantal from tel where name = 'sentence_queued'), 0),
      'post_refused',    coalesce((select aantal from tel where name = 'post_refused'), 0),
      'write_again',     coalesce((select aantal from tel where name = 'write_again'), 0)),

    'losing', jsonb_build_object(
      'takeover_watched', coalesce((select aantal from tel where name = 'takeover_watched'), 0),
      'sentence_lost',    coalesce((select aantal from tel where name = 'sentence_lost'), 0),
      'share_click',      coalesce((select aantal from tel where name = 'share_click'), 0),
      'median_stood_ms', (
        select percentile_cont(0.5) within group (order by (props->>'stood_ms')::numeric)
        from venster
        where name = 'sentence_lost' and props->>'stood_ms' ~ '^[0-9]+$')),

    'share_channels', coalesce((
      select jsonb_agg(jsonb_build_object('channel', kanaal, 'place', plek, 'count', aantal)
                       order by aantal desc)
      from (
        select props->>'channel' as kanaal, props->>'place' as plek, count(*) as aantal
        from venster where name = 'share_click' and props ? 'channel'
        group by 1, 2) s), '[]'::jsonb),

    'refusals', coalesce((
      select jsonb_agg(jsonb_build_object('reason', reden, 'count', aantal) order by aantal desc)
      from (
        select props->>'reason' as reden, count(*) as aantal
        from venster where name = 'post_refused'
        group by 1) s), '[]'::jsonb),

    'by_day', coalesce((
      select jsonb_agg(jsonb_build_object(
               'day',      to_char(dag, 'YYYY-MM-DD'),
               'events',   aantal,
               'sessions', sessies) order by dag)
      from (
        select date_trunc('day', created_at) as dag,
               count(*) as aantal,
               count(distinct session_id) as sessies
        from venster group by 1) s), '[]'::jsonb),

    'busiest_paths', coalesce((
      select jsonb_agg(jsonb_build_object('path', pad, 'count', aantal, 'visits', sessies)
                       order by aantal desc)
      from (
        select path as pad, count(*) as aantal, count(distinct session_id) as sessies
        from venster where path is not null and name = 'page_open'
        group by 1 order by count(*) desc limit 12) s), '[]'::jsonb)
  );
$$;

revoke execute on function public.get_event_report(integer) from public, anon, authenticated;
