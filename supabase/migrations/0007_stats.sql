-- Migratie 0007: publieke cijfers.
--
-- Dit is geen dashboard voor onszelf maar persmateriaal. Een journalist die om
-- elf uur 's avonds een stuk afmaakt heeft een getal nodig dat hij zelf kan
-- controleren, en gaat daar niemand voor mailen. Elk record dat sneuvelt is
-- bovendien gratis een nieuwsfeit.
--
-- Alles wat hier uit komt is geaggregeerd. Het aantal schrijvers wordt geteld
-- op de gehashte bezoeker-ID, dus er komt geen enkel persoonsgegeven naar buiten.

create or replace function public.get_stats()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with zichtbaar as (
    select * from app.messages where status = 'visible'
  ),
  afgesloten as (
    select * from zichtbaar where duration_ms is not null
  )
  select jsonb_build_object(
    'sentences_total',   (select count(*) from zichtbaar),
    'characters_total',  (select coalesce(sum(char_count), 0) from zichtbaar),
    'writers_total',     (select count(distinct client_hash) from zichtbaar
                          where client_hash not in ('seed','system')),
    'countries_total',   (select count(distinct country) from zichtbaar where country is not null),
    'sentences_24h',     (select count(*) from zichtbaar where created_at > now() - interval '24 hours'),
    'reads_total',       (select coalesce(sum(views), 0) from zichtbaar),
    'standing_now', (
      select jsonb_build_object(
        'id', m.id, 'body', m.body, 'author', m.author_name,
        'since', m.created_at,
        'seconds', floor(extract(epoch from (now() - m.created_at)))::bigint,
        'reads', m.views)
      from zichtbaar m where m.ended_at is null),
    'longest_ever', (
      select jsonb_build_object(
        'id', m.id, 'body', m.body, 'author', m.author_name,
        'ms', m.duration_ms, 'reads', m.views, 'on', m.created_at)
      from afgesloten m order by m.duration_ms desc limit 1),
    'shortest_ever', (
      select jsonb_build_object(
        'id', m.id, 'body', m.body, 'ms', m.duration_ms)
      from afgesloten m order by m.duration_ms asc limit 1),
    'median_ms', (
      select percentile_cont(0.5) within group (order by duration_ms) from afgesloten),
    'queue_now',   (select count(*) from app.queue where status = 'waiting'),
    'reading_now', (select count(*) from app.viewers where seen_at > now() - interval '30 seconds'),
    'generated_at', now()
  );
$$;

revoke execute on function public.get_stats() from public;
grant execute on function public.get_stats() to anon, authenticated;
