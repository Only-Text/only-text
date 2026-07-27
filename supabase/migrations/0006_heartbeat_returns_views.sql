-- Migratie 0006: de hartslag geeft nu ook het totaal aantal lezers terug.
--
-- De live-teller klopte wel maar was het verkeerde getal om te tonen: bij
-- honderd bezoekers per maand staat er vrijwel altijd nul of één, en dan lijkt
-- de site verlaten terwijl er die maand honderd mensen langs zijn geweest.
-- Het totaal aantal mensen dat déze zin heeft gezien is het getal dat oploopt
-- en dat iets betekent.
--
-- Postgres kan het retourtype van een functie niet wijzigen met CREATE OR
-- REPLACE, dus hij moet eerst weg.

drop function if exists public.heartbeat(uuid);

create or replace function public.heartbeat(p_session uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_live    integer;
  v_current bigint;
  v_views   integer;
  v_vorige  bigint;
  v_nieuw   boolean := false;
begin
  select id into v_current from app.messages where ended_at is null;

  -- Eerst kijken wat deze bezoeker als laatste zag; daarna is die waarde weg.
  select last_message_id into v_vorige
    from app.viewers where session_id = p_session;

  if v_current is not null and (v_vorige is null or v_vorige <> v_current) then
    v_nieuw := true;
  end if;

  insert into app.viewers (session_id, seen_at, last_message_id)
  values (p_session, now(), v_current)
  on conflict (session_id) do update
     set seen_at = now(),
         last_message_id = v_current;

  if v_nieuw then
    update app.messages set views = views + 1 where id = v_current;
  end if;

  select count(*) into v_live
    from app.viewers where seen_at > now() - interval '30 seconds';

  update app.messages
     set peak_viewers = greatest(peak_viewers, v_live)
   where ended_at is null and v_live > peak_viewers;

  select views into v_views from app.messages where id = v_current;

  return jsonb_build_object(
    'live', v_live,
    'views', coalesce(v_views, 0),
    'message_id', v_current
  );
end;
$$;

revoke execute on function public.heartbeat(uuid) from public;
grant  execute on function public.heartbeat(uuid) to anon, authenticated;
