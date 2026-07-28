-- De kijkersteller die meebeweegt met de drukte.
--
-- Elke bezoeker klopte elke twintig seconden aan. Bij vijftig man is dat niets;
-- bij tienduizend is het vijfhonderd aanroepen per seconde, en dat is precies
-- het moment waarop je het niet kunt hebben. Sinds de voorpagina terugvalt op
-- pollen als de WebSocket het niet haalt, is dit ook echt de eerstvolgende muur:
-- de terugval haalde de vorige weg.
--
-- Dus vertelt de server hoe vaak er geklopt moet worden. Hoe voller het is, hoe
-- rustiger, met een bovengrens van twee minuten. Het totaal blijft daarmee rond
-- de vijfentwintig aanroepen per seconde tot een paar duizend kijkers.
--
-- Het venster is het lastige deel. "Live" was: gezien in de laatste dertig
-- seconden. Klopt iemand nog maar elke twee minuten, dan valt hij buiten dat
-- venster en telt hij niet meer mee, en dan zakt de teller naar nul juist als
-- het druk is. Daarom onthoudt elke rij zijn eigen tempo en geldt hij als live
-- zolang hij binnen tweeënhalf keer zijn éigen interval gezien is. Zo blijft de
-- telling kloppen bij elk tempo, zonder dat er ergens een globale instelling
-- ligt die met de klant uit de pas kan lopen.

alter table app.viewers
  add column if not exists every_ms integer not null default 20000;

create or replace function public.heartbeat(p_session uuid, p_every_ms integer default 20000)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_live    integer;
  v_current bigint;
  v_views   integer;
  v_vorige  bigint;
  v_nieuw   boolean := false;
  v_every   integer;
  v_next    integer;
begin
  -- Wat de klant meestuurt is niet te vertrouwen: het bepaalt mede of zijn rij
  -- meetelt, dus een enorme waarde zou hem eeuwig live houden.
  v_every := least(greatest(coalesce(p_every_ms, 20000), 5000), 120000);

  select id into v_current from app.messages where ended_at is null;

  -- Eerst kijken wat deze bezoeker als laatste zag; daarna is die waarde weg.
  select last_message_id into v_vorige
    from app.viewers where session_id = p_session;

  if v_current is not null and (v_vorige is null or v_vorige <> v_current) then
    v_nieuw := true;
  end if;

  insert into app.viewers (session_id, seen_at, last_message_id, every_ms)
  values (p_session, now(), v_current, v_every)
  on conflict (session_id) do update
     set seen_at = now(),
         last_message_id = v_current,
         every_ms = v_every;

  if v_nieuw then
    update app.messages set views = views + 1 where id = v_current;
  end if;

  -- Elke rij tegen zijn eigen tempo. Tweeënhalf keer, zodat één gemiste slag
  -- iemand nog niet laat verdwijnen.
  select count(*) into v_live
    from app.viewers
   where seen_at > now() - (every_ms * 2.5) * interval '1 millisecond';

  update app.messages
     set peak_viewers = greatest(peak_viewers, v_live)
   where ended_at is null and v_live > peak_viewers;

  select views into v_views from app.messages where id = v_current;

  -- Mik op ongeveer vijfentwintig aanroepen per seconde in totaal. Onder de
  -- vijfhonderd kijkers verandert er niets aan het tempo van twintig seconden.
  v_next := least(120000, greatest(20000, ceil(v_live / 25.0)::integer * 1000));

  return jsonb_build_object(
    'live', v_live,
    'views', coalesce(v_views, 0),
    'message_id', v_current,
    'next_ms', v_next
  );
end;
$$;

revoke execute on function public.heartbeat(uuid, integer) from public;
grant  execute on function public.heartbeat(uuid, integer) to anon, authenticated;
