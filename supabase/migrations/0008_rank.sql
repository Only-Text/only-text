-- Migratie 0008: de ranglijstpositie van een zin.
--
-- "Mijn zin hield het vier uur" is een mededeling. "Mijn zin hield het vier uur,
-- plek 7 aller tijden" is een opschepperij, en dat is wat mensen delen. Het
-- getal moet dus mee in de deelknop en op de deelafbeelding.

create or replace function public.get_message(p_id bigint)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'message', (
      select (to_jsonb(m) - 'client_hash') || jsonb_build_object(
        'rank', case
          when m.duration_ms is null then null
          else (select count(*) + 1 from app.messages r
                where r.status = 'visible'
                  and r.duration_ms is not null
                  and r.duration_ms > m.duration_ms)
        end,
        'ranked_of', (select count(*) from app.messages r
                      where r.status = 'visible' and r.duration_ms is not null))
      from app.messages m where m.id = p_id and m.status = 'visible'),
    'previous', (select to_jsonb(m) - 'client_hash'
                 from app.messages m
                 where m.id < p_id and m.status = 'visible'
                 order by m.id desc limit 1),
    'next', (select to_jsonb(m) - 'client_hash'
             from app.messages m
             where m.id > p_id and m.status = 'visible'
             order by m.id asc limit 1)
  );
$$;

revoke execute on function public.get_message(bigint) from public;
grant execute on function public.get_message(bigint) to anon, authenticated;
