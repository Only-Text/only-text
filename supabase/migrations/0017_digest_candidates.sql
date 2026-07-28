-- De digest levert kandidaten, geen winnaar.
--
-- Tot nu toe koos deze functie zelf de zin van de dag, en hij koos op duur:
-- hoogste rang wint. Dat is de verkeerde variabele voor waar dit account voor
-- bedoeld is. De langststaande zin is meestal gewoon de zin die om vier uur 's
-- nachts werd getypt toen er niemand was om eroverheen te gaan. Iemand stuurt
-- geen stopwatch door, iemand stuurt een zin door.
--
-- Duur blijft in het bericht staan, want het is de score van de site en het
-- maakt de zin interessanter. Maar het is een feit in de tekst geworden en niet
-- meer de reden dat juist die zin gekozen werd. Wat wél deelbaar is kun je in
-- SQL niet meten, dus die keuze gaat naar het model, en dit levert alleen de
-- stapel waaruit gekozen mag worden.
--
-- Welke zinnen op die stapel liggen: de langste, de meest gelezene en de meest
-- recente, samengevoegd. Drie verschillende manieren om opvallend te zijn, want
-- op één maat selecteren is precies de fout die hierboven staat. Maximaal
-- twaalf, zodat de prompt niet uit de hand loopt op een drukke dag. Op een
-- rustige dag vallen ze alle drie samen en zijn het er gewoon een paar.
--
-- De drempel is nu: is er vandaag iets gebeurd. Eén echte zin van een echt
-- iemand is genoeg. Op een dode dag komt er nog steeds niets uit, want dan valt
-- er ook niets te laten zien.

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
  record_nu as (
    select max(duration_ms) as ms from zichtbaar where duration_ms is not null
  ),
  gesneuveld as (
    select m.*,
           (select count(*) + 1 from zichtbaar r
            where r.duration_ms is not null and r.duration_ms > m.duration_ms) as rank
    from zichtbaar m
    where m.ended_at is not null
      and m.ended_at > now() - interval '24 hours'
      and m.client_hash not in ('seed', 'system')
  ),
  dag as (
    select count(*) as n,
           percentile_cont(0.5) within group (order by duration_ms) as mediaan
    from gesneuveld
  ),
  -- Drie manieren om op te vallen. Union en niet union all, want een zin die
  -- op twee lijsten staat is nog steeds één zin.
  stapel as (
    (select id from gesneuveld order by duration_ms desc nulls last limit 6)
    union
    (select id from gesneuveld order by views desc limit 6)
    union
    (select id from gesneuveld order by ended_at desc limit 4)
  ),
  gekozen as (
    select g.* from gesneuveld g join stapel s on s.id = g.id
    order by g.ended_at desc
    limit 12
  )
  select jsonb_build_object(
    'generated_at', now(),
    'window', '24h',
    'ended_today', (select n from dag),
    'median_ms', (select round(mediaan)::bigint from dag),
    'ranked_of', (select n from geeindigd),
    'candidates', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', g.id,
        'body', g.body,
        'author', g.author_name,
        'duration_ms', g.duration_ms,
        'rank', g.rank,
        'reads', g.views,
        'words', g.word_count,
        'ended_at', g.ended_at,
        'is_record', g.duration_ms = (select ms from record_nu),
        'permalink', 'https://only-text.com/thoughts/' || g.id,
        'image', 'https://only-text.com/api/og/' || g.id
      ) order by g.ended_at desc), '[]'::jsonb)
      from gekozen g),
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
    -- Er is iets gebeurd vandaag, dus er valt iets te laten zien. Wat daarvan
    -- het waard is om te tonen bepaalt het model, niet deze functie.
    'worth_posting', (select n from dag) >= 1
  );
$$;

revoke execute on function public.get_digest() from public, anon, authenticated;
