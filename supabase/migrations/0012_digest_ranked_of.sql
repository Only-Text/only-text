-- De schrijver heeft ook het totaal nodig waar de ranglijstplek uit komt.
-- "plek 3" zegt niets zonder "van hoeveel", en het model mag geen enkel getal
-- gebruiken dat niet in de feiten staat.

create or replace function public.get_digest()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with zichtbaar as (
    select * from app.messages where status = 'visible'
  ),
  geeindigd as (
    select count(*) as n from zichtbaar where duration_ms is not null
  ),
  gesneuveld as (
    select m.*,
           (select count(*) + 1 from zichtbaar r
            where r.duration_ms is not null and r.duration_ms > m.duration_ms) as rank
    from zichtbaar m
    where m.ended_at is not null
      and m.ended_at > now() - interval '24 hours'
  ),
  record_nu as (
    select max(duration_ms) as ms from zichtbaar where duration_ms is not null
  ),
  beste as (
    select * from gesneuveld order by rank asc, views desc limit 1
  )
  select jsonb_build_object(
    'generated_at', now(),
    'window', '24h',
    'ended_today', (select count(*) from gesneuveld),
    'record_broken', (
      select exists (
        select 1 from gesneuveld g, record_nu r
        where g.duration_ms = r.ms and g.ended_at > now() - interval '24 hours')),
    'candidate', (
      select jsonb_build_object(
        'id', b.id,
        'body', b.body,
        'author', b.author_name,
        'duration_ms', b.duration_ms,
        'rank', b.rank,
        'ranked_of', (select n from geeindigd),
        'reads', b.views,
        'ended_at', b.ended_at,
        'permalink', 'https://only-text.com/m/' || b.id,
        'image', 'https://only-text.com/api/og/' || b.id)
      from beste b),
    'standing_now', (
      select jsonb_build_object(
        'id', m.id, 'body', m.body,
        'seconds', floor(extract(epoch from (now() - m.created_at)))::bigint,
        'reads', m.views)
      from zichtbaar m where m.ended_at is null),
    'totals', jsonb_build_object(
      'sentences', (select count(*) from zichtbaar),
      'writers', (select count(distinct client_hash) from zichtbaar
                  where client_hash not in ('seed','system')),
      'reads', (select coalesce(sum(views), 0) from zichtbaar)),
    'worth_posting', (
      select coalesce(
        (select b.rank <= 10 or b.views >= 25 or b.duration_ms >= 3600000 from beste b),
        false))
  );
$$;

revoke execute on function public.get_digest() from public, anon, authenticated;
