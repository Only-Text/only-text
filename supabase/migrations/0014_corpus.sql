-- Wat mensen typen als ze weten dat precies één iemand het leest.
--
-- Dit is het verhaal waar journalisten volgens het onderzoek uit citeren: niet
-- de site is interessant, maar wat er gebeurt met mensen die één regel krijgen
-- die weg is zodra iemand anders typt.
--
-- Alles hier is geteld, niet geschat, en alles is zonder een model te berekenen.
-- Waar een cijfer nog niet betekenisvol is (te weinig zinnen) komt er null uit
-- in plaats van een misleidende 0 of 100 procent.

create or replace function public.get_corpus()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with z as (
    select id, body, client_hash, created_at, ended_at,
           lower(regexp_replace(body, '[^[:alnum:][:space:]'']', '', 'g')) as schoon,
           row_number() over (order by id) as nr
    from app.messages
    where status = 'visible' and client_hash not in ('seed', 'system')
  ),
  n as (select count(*)::int as totaal from z),

  -- Elke zin naast de zin die er direct voor stond.
  paren as (
    select a.id, a.body, a.client_hash, a.schoon,
           v.body as vorige, v.client_hash as vorige_hash,
           v.schoon as vorige_schoon
    from z a join z v on v.nr = a.nr - 1
  ),

  -- Een antwoord: deelt een woord van vijf letters of langer met de vorige zin.
  -- Korte woorden tellen niet mee, want dan is "that the and" al een gesprek.
  antwoorden as (
    select count(*)::int as n
    from paren p
    where exists (
      select 1
      from unnest(string_to_array(p.schoon, ' ')) w
      where length(w) >= 5
        and w = any(string_to_array(p.vorige_schoon, ' '))
    )
  ),

  -- Iemand die de pagina direct van zichzelf overnam.
  achter_elkaar as (
    select count(*)::int as n from paren where client_hash = vorige_hash
  ),

  -- Iemand die verslagen werd en later terugkwam om hem terug te pakken.
  terug as (
    select count(distinct a.client_hash)::int as n
    from z a
    where a.ended_at is not null
      and exists (select 1 from z b
                  where b.client_hash = a.client_hash and b.id > a.id)
  ),

  eerste_woorden as (
    select lower(split_part(trim(body), ' ', 1)) as w, count(*)::int as n
    from z group by 1 order by n desc, w limit 1
  )

  select jsonb_build_object(
    'generated_at', now(),
    'sentences', (select totaal from n),
    -- Onder de tien zinnen zegt een percentage niets, dus dan geven we het niet.
    'questions_pct', (
      select case when totaal >= 10 then
        round(100.0 * (select count(*) from z where body like '%?') / totaal)::int
      end from n),
    'answers_pct', (
      select case when totaal >= 10 then
        round(100.0 * (select n from antwoorden) / greatest(totaal - 1, 1))::int
      end from n),
    'took_it_back_from_themselves', (select n from achter_elkaar),
    'came_back_after_losing', (select n from terug),
    'most_common_first_word', (select w from eerste_woorden),
    'median_characters', (
      select percentile_cont(0.5) within group (order by length(body))::int from z),
    'longest_sentence_characters', (select max(length(body))::int from z),
    'shortest_sentence_characters', (select min(length(body))::int from z)
  );
$$;

grant execute on function public.get_corpus() to anon, authenticated;
