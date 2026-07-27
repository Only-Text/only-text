-- Migratie 0004: hoeveel mensen hebben een zin gezien?
--
-- De live-teller ("2 mensen lezen dit nu") klopt, maar hij oogt mager zolang er
-- weinig verkeer is en hij verdwijnt zodra de zin wordt overgenomen. Een
-- blijvend getal is waardevoller: dat is wat er op de permalink komt te staan
-- en wat iemand een reden geeft om zijn bewijs te delen.
--
-- Het moet wel goedkoop blijven. Een tabel met één rij per (bericht, bezoeker)
-- groeit sneller dan het archief zelf. In plaats daarvan onthouden we op de
-- bezoeker welk bericht hij als laatste zag: verandert dat, dan is het een
-- nieuwe kijker voor dat bericht. Eén update, geen extra rijen.

alter table app.messages
  add column if not exists views integer not null default 0;

alter table app.viewers
  add column if not exists last_message_id bigint;

create or replace function public.heartbeat(p_session uuid)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_count   integer;
  v_current bigint;
  v_vorige  bigint;
  v_nieuw   boolean := false;
begin
  select id into v_current from app.messages where ended_at is null;

  -- Eerst kijken wat deze bezoeker als laatste zag. Dit moet vóór de update,
  -- want daarna is de oude waarde weg.
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

  select count(*) into v_count
    from app.viewers where seen_at > now() - interval '30 seconds';

  update app.messages
     set peak_viewers = greatest(peak_viewers, v_count)
   where ended_at is null and v_count > peak_viewers;

  return v_count;
end;
$$;

revoke execute on function public.heartbeat(uuid) from public;
grant  execute on function public.heartbeat(uuid) to anon, authenticated;

-- De bestaande zinnen krijgen hun piek als startwaarde, zodat het archief niet
-- overal nul laat zien.
update app.messages set views = greatest(views, peak_viewers) where views = 0;
