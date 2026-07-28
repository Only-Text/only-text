-- Wie er wel mag schrijven maar niet meetelt.
--
-- De maker test op zijn eigen site, en dat moet ook: je wilt zien wat er gebeurt
-- als je typt. Maar zijn zinnen liggen daarna wel op de stapel waaruit het
-- Bluesky-account kiest, en op een stille dag is de kans dan groot dat het eerste
-- echte bericht van dat account "So cool haha nice" is. Dat is precies het soort
-- start dat je niet overdoet.
--
-- Dus dezelfde behandeling als 'seed' en 'system': de zin blijft gewoon in het
-- archief staan, want hij heeft er echt gestaan, maar hij telt niet mee als
-- schrijver en hij komt niet in aanmerking om over gepost te worden.
--
-- De hash komt uit zijn eigen zinnen en niet uit een IP-adres dat iemand
-- overtypt. Dat scheelt niet alleen een persoonsgegeven, het is ook het enige
-- dat gegarandeerd klopt: het adres dat je denkt te hebben is zelden het adres
-- waar je verkeer vandaan komt.

create table if not exists app.excluded_writers (
  client_hash text primary key,
  note        text,
  added_at    timestamptz not null default now()
);

alter table app.excluded_writers enable row level security;
revoke all on app.excluded_writers from anon, authenticated;

insert into app.excluded_writers (client_hash, note)
values ('d94ade76b3406a478eed5640b75e856f7bad338f8d0927fe78d28068a890786a', 'de maker')
on conflict (client_hash) do nothing;

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
      and m.client_hash not in (select client_hash from app.excluded_writers)
  ),
  dag as (
    select count(*) as n,
           percentile_cont(0.5) within group (order by duration_ms) as mediaan
    from gesneuveld
  ),
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
                  where client_hash not in ('seed','system')
                    and client_hash not in (select client_hash from app.excluded_writers)),
      'reads', (select coalesce(sum(views), 0) from zichtbaar)),
    'worth_posting', (select n from dag) >= 1
  );
$$;

revoke execute on function public.get_digest() from public, anon, authenticated;
