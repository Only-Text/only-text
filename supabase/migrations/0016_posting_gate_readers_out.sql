-- De drempel om te posten, zonder lezers erin.
--
-- De vorige versie eiste eerst 25 lezers en pas daarna dat de zin bijzonder
-- was. Die volgorde klopte toen: er stonden testzinnen op de voorpagina en
-- lezers waren de enige maat die je in je eentje niet kon halen. Maar op een
-- site die net begint is het ook de maat die je nooit haalt, en dan zwijgt het
-- account precies in de weken dat het iets zou moeten doen.
--
-- Dus: lezers eruit, bijzonder erin. Twee wegen, en meer niet:
--
--   1. Het is een record, en er lag ook echt iets om te breken. Op een site met
--      drie afgelopen zinnen is de langste automatisch de langste ooit, en dat
--      is geen nieuws maar een telling. Vandaar de ondergrens van tien.
--   2. Er gebeurde vandaag iets (minstens twee zinnen vielen van de voorpagina)
--      én deze hield het minstens twee keer zo lang vol als de middelste van de
--      andere zinnen van die dag, en langer dan vijf minuten.
--
-- Die mediaan gaat over de ánderen en niet over het hele veld, en dat is geen
-- detail: met precies twee zinnen is de mediaan hun gemiddelde, en niets kan
-- ooit twee keer het eigen gemiddelde zijn. De regel zou dan pas vanaf drie
-- zinnen per dag kunnen vuren, wat je niet ziet aan de formule en wel aan een
-- account dat zwijgt. Vergeleken met de rest klopt de vraag ook beter: hield
-- deze het langer vol dan wat er verder die dag stond.
--
-- De ondergrens van vijf minuten staat er omdat het dubbele van een stille dag
-- nog steeds niets voorstelt: twee keer acht seconden is geen verhaal.
--
-- Op een dag waarop één zin bleef staan komt er niets uit, en dat klopt. Eén
-- zin is geen dag.

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
  ),
  anderen as (
    select percentile_cont(0.5) within group (order by g.duration_ms) as mediaan
    from gesneuveld g, beste b
    where g.id <> b.id
  )
  select jsonb_build_object(
    'generated_at', now(),
    'window', '24h',
    'ended_today', (select count(*) from gesneuveld),
    'median_others_ms', (select round(mediaan)::bigint from anderen),
    'record_broken', (
      select exists (
        select 1 from gesneuveld g, record_nu r
        where g.duration_ms = r.ms and g.ended_at > now() - interval '24 hours')
      and (select n from geeindigd) >= 10),
    'candidate', (
      select jsonb_build_object(
        'id', b.id, 'body', b.body, 'author', b.author_name,
        'duration_ms', b.duration_ms, 'rank', b.rank,
        'ranked_of', (select n from geeindigd), 'reads', b.views,
        'ended_at', b.ended_at,
        'permalink', 'https://only-text.com/thoughts/' || b.id,
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
        (select
           -- Een echt record: de langste ooit, uit een veld dat groot genoeg is
           -- dat "ooit" iets betekent.
           ((select n from geeindigd) >= 10
            and b.duration_ms = (select ms from record_nu))
           -- Of: er was een dag, en deze zin sprong eruit ten opzichte van wat
           -- er verder stond.
           or ((select count(*) from gesneuveld) >= 2
               and a.mediaan is not null
               and b.duration_ms >= 2 * a.mediaan
               and b.duration_ms >= 300000)
         from beste b, anderen a),
        false))
  );
$$;

revoke execute on function public.get_digest() from public, anon, authenticated;
