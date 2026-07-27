-- Migratie 0009: wat is er vandaag gebeurd dat het melden waard is?
--
-- Dit is de voeding voor een agent die dagelijks één bericht plaatst. Het
-- belangrijkste ontwerpbesluit: de databank bepaalt WAT er te melden valt, niet
-- het model. Een model dat zelf mag kiezen wat interessant is gaat op een stille
-- dag iets verzinnen, en op een site die draait om echte zinnen van echte
-- mensen is dat precies de fout die je nooit meer terugdraait.
--
-- Vandaar `worth_posting`: staat die op false, dan is het antwoord "vandaag
-- niets", en dat is een geldig antwoord.

create or replace function public.get_digest()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with zichtbaar as (
    select * from app.messages where status = 'visible'
  ),
  gesneuveld as (
    -- Zinnen die in de afgelopen 24 uur van de voorpagina zijn gehaald.
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
    -- De kandidaat: hoogste ranglijstplek, en bij gelijke stand de meest gelezen.
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
    -- De regel die bepaalt of er vandaag iets te melden is. Bewust streng:
    -- liever een stille dag dan een post over niets.
    'worth_posting', (
      select coalesce(
        (select b.rank <= 10 or b.views >= 25 or b.duration_ms >= 3600000 from beste b),
        false))
  );
$$;

revoke execute on function public.get_digest() from public, anon, authenticated;
