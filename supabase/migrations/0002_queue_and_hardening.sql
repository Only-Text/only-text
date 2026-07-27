-- only-text.com — migratie 0002
--
-- Drie dingen die uit het onderzoek kwamen en het ontwerp veranderen:
--
-- 1. MINIMUMDUUR + WACHTRIJ. Met één plek en geen ondergrens gaat bij een
--    virale piek de gemiddelde regeerperiode naar milliseconden: iedereen
--    overschrijft elkaar, niemand leest nog iets, en het gevoel waar het hele
--    product op draait verdwijnt precies wanneer er het meeste publiek is.
--    The Button had een klok van 60 seconden, r/place een cooldown van vijf
--    minuten — die schaarste wás het spel. Elk bericht krijgt hier een
--    minimale zichtbaarheidsduur; wie tijdens die periode iets plaatst, komt
--    in een wachtrij met een zichtbare positie.
--
-- 2. PRIVÉ-SCHEMA. Tabellen verhuizen naar `app`, dat niet door PostgREST
--    wordt bediend. Er is dan geen REST-endpoint dat je kunt vergeten dicht
--    te zetten en geen kolom die per ongeluk lekt. Alles loopt via
--    SECURITY DEFINER-functies met een leeg search_path.
--
-- 3. UITZENDEN VANUIT DE RPC, PRIVAAT. realtime.send() staat nu in dezelfde
--    transactie als de overname (een rollback zendt dus nooit uit) en het
--    topic is privé, zodat niemand met de anon-sleutel nepberichten kan
--    versturen die bezoekers als echt zien.

-- ---------------------------------------------------------------------------
-- 1. Privé-schema en verhuizing
-- ---------------------------------------------------------------------------

create schema if not exists app;
revoke all on schema app from public, anon, authenticated;

drop trigger if exists messages_broadcast_insert on public.messages;
drop function if exists public.broadcast_current_message();

drop policy if exists messages_public_read   on public.messages;
drop policy if exists site_stats_public_read  on public.site_stats;

alter table public.messages    set schema app;
alter table public.rate_limits set schema app;
alter table public.reports     set schema app;
alter table public.site_stats  set schema app;

revoke all on all tables in schema app from anon, authenticated;
alter default privileges in schema app revoke all on tables from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Nieuwe kolommen voor de wachtrij-mechaniek
-- ---------------------------------------------------------------------------

alter table app.messages
  add column if not exists min_until      timestamptz,
  add column if not exists peak_viewers   integer not null default 0,
  add column if not exists waited_ms      bigint,
  add column if not exists source         text not null default 'direct';

update app.messages set min_until = created_at where min_until is null;
alter table app.messages alter column min_until set not null;

-- Een B-tree over miljoenen rijen kost honderden megabytes; BRIN op een
-- strikt oplopende tijdkolom blijft kilobytes en is voor bereikvragen
-- net zo goed.
drop index if exists app.messages_created_at_desc_idx;
create index if not exists messages_created_brin_idx
  on app.messages using brin (created_at);

create index if not exists messages_id_desc_idx
  on app.messages (id desc)
  where ended_at is not null and status = 'visible';

-- ---------------------------------------------------------------------------
-- 3. De wachtrij
-- ---------------------------------------------------------------------------

create table if not exists app.queue (
  id            bigint generated always as identity primary key,
  body          text        not null,
  author_name   text,
  client_hash   text        not null,
  country       text,
  claim_token   uuid        not null default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text        not null default 'waiting',
  message_id    bigint      references app.messages(id) on delete set null,
  resolved_at   timestamptz,
  constraint queue_status_check check (status in ('waiting','promoted','cancelled','expired'))
);

-- Eén wachtende inzending per persoon. Wie al in de rij staat, staat in de rij.
create unique index if not exists queue_one_waiting_per_client_idx
  on app.queue (client_hash)
  where status = 'waiting';

create index if not exists queue_waiting_order_idx
  on app.queue (id)
  where status = 'waiting';

create unique index if not exists queue_claim_token_idx
  on app.queue (claim_token);

-- ---------------------------------------------------------------------------
-- 4. Kijkers: heartbeat-aggregatie. Presence stuurt bij elke join een update
--    naar álle abonnees, dus O(N²) verkeer bij verloop. Dit is O(1).
-- ---------------------------------------------------------------------------

create unlogged table if not exists app.viewers (
  session_id uuid        primary key,
  seen_at    timestamptz not null default now()
);
create index if not exists viewers_seen_at_idx on app.viewers (seen_at);

-- ---------------------------------------------------------------------------
-- 5. Instellingen die live bij te stellen zijn zonder deploy
-- ---------------------------------------------------------------------------

create table if not exists app.settings (
  key   text primary key,
  value jsonb not null
);

insert into app.settings (key, value) values
  ('reign', jsonb_build_object(
      'calm_ms',   60000,   -- rustige tijden: een minuut per bericht
      'busy_ms',   30000,
      'rush_ms',   15000,
      'storm_ms',  10000,   -- ondergrens: korter dan dit leest niemand meer
      'busy_at',   3,       -- wachtrijlengte waarboven we versnellen
      'rush_at',   10,
      'storm_at',  50)),
  ('limits', jsonb_build_object(
      'queue_max',      500,
      'cooldown_s',     60,
      'hourly_max',     20,
      'throne_cooldown_s', 600))
on conflict (key) do nothing;

create or replace function app.setting(p_key text, p_field text, p_default numeric)
returns numeric
language sql stable set search_path = ''
as $$
  select coalesce((s.value ->> p_field)::numeric, p_default)
  from app.settings s where s.key = p_key;
$$;

-- ---------------------------------------------------------------------------
-- 6. Hoe lang mag het volgende bericht blijven staan?
--    Hoe drukker het is, hoe korter — maar nooit korter dan de ondergrens.
-- ---------------------------------------------------------------------------

create or replace function app.next_reign_ms()
returns integer
language plpgsql stable set search_path = ''
as $$
declare
  v_waiting integer;
begin
  select count(*) into v_waiting from app.queue where status = 'waiting';

  if v_waiting >= app.setting('reign', 'storm_at', 50) then
    return app.setting('reign', 'storm_ms', 10000)::integer;
  elsif v_waiting >= app.setting('reign', 'rush_at', 10) then
    return app.setting('reign', 'rush_ms', 15000)::integer;
  elsif v_waiting >= app.setting('reign', 'busy_at', 3) then
    return app.setting('reign', 'busy_ms', 30000)::integer;
  end if;
  return app.setting('reign', 'calm_ms', 60000)::integer;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. De kern: het volgende bericht naar voren halen als dat mag.
--    Idempotent, dus veilig om vanuit elk verzoek en vanuit cron aan te roepen.
-- ---------------------------------------------------------------------------

create or replace function app.promote_if_due()
returns app.messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current app.messages;
  v_next    app.queue;
  v_new     app.messages;
  v_now     timestamptz := clock_timestamp();
  v_reign   integer;
begin
  select * into v_current from app.messages where ended_at is null for update;

  -- Het lopende bericht heeft zijn gegarandeerde tijd nog niet uitgezeten.
  if found and v_current.min_until > v_now then
    return v_current;
  end if;

  select * into v_next from app.queue
    where status = 'waiting' order by id limit 1 for update skip locked;

  -- Niemand wacht: het huidige bericht blijft staan, hoe lang ook.
  if not found then
    return v_current;
  end if;

  v_reign := app.next_reign_ms();

  if v_current.id is not null then
    update app.messages
       set ended_at    = v_now,
           duration_ms = (extract(epoch from (v_now - created_at)) * 1000)::bigint
     where id = v_current.id
     returning * into v_current;

    update app.site_stats
       set total_ms = total_ms + coalesce(v_current.duration_ms, 0)
     where id = 1;
  end if;

  insert into app.messages
    (body, author_name, char_count, word_count, country, client_hash,
     min_until, waited_ms, source)
  values
    (v_next.body,
     v_next.author_name,
     length(v_next.body),
     coalesce(array_length(regexp_split_to_array(v_next.body, '\s+'), 1), 0),
     v_next.country,
     v_next.client_hash,
     v_now + make_interval(secs => v_reign / 1000.0),
     (extract(epoch from (v_now - v_next.created_at)) * 1000)::bigint,
     'queue')
  returning * into v_new;

  update app.queue
     set status = 'promoted', message_id = v_new.id, resolved_at = v_now
   where id = v_next.id;

  update app.site_stats
     set total_messages = total_messages + 1,
         total_chars    = total_chars + v_new.char_count,
         updated_at     = v_now
   where id = 1;

  perform app.announce(v_new, v_current);
  return v_new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Uitzenden. Privé topic: zonder INSERT-policy op realtime.messages kan
--    een client fysiek niet zelf uitzenden, alleen de database.
-- ---------------------------------------------------------------------------

create or replace function app.announce(p_new app.messages, p_prev app.messages)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'id',               p_new.id,
      'body',             p_new.body,
      'author_name',      p_new.author_name,
      'created_at',       p_new.created_at,
      'min_until',        p_new.min_until,
      'country',          p_new.country,
      'waited_ms',        p_new.waited_ms,
      'prev_id',          p_prev.id,
      'prev_body',        p_prev.body,
      'prev_duration_ms', p_prev.duration_ms,
      'queue_length',     (select count(*) from app.queue where status = 'waiting')
    ),
    'takeover',
    'current',
    true
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. Plaatsen. Ofwel direct de troon, ofwel de wachtrij in.
-- ---------------------------------------------------------------------------

drop function if exists public.post_message(text, text, text, text);

create or replace function public.post_message(
  p_body        text,
  p_author      text,
  p_client_hash text,
  p_country     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
set lock_timeout = '3s'
set statement_timeout = '8s'
as $$
declare
  v_now       timestamptz := clock_timestamp();
  v_body      text;
  v_author    text;
  v_current   app.messages;
  v_prev      app.messages;
  v_new       app.messages;
  v_rl        app.rate_limits;
  v_queue     app.queue;
  v_wait      integer;
  v_waiting   integer;
  v_position  integer;
  v_reign     integer;
  v_cooldown  integer := app.setting('limits', 'cooldown_s', 60)::integer;
  v_hourly    integer := app.setting('limits', 'hourly_max', 20)::integer;
  v_queue_max integer := app.setting('limits', 'queue_max', 500)::integer;
begin
  if p_client_hash is null or length(p_client_hash) = 0 then
    return jsonb_build_object('ok', false, 'error', 'no_client');
  end if;

  v_body   := btrim(p_body);
  v_author := nullif(btrim(coalesce(p_author, '')), '');

  if v_body is null or length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty');
  end if;
  if length(v_body) > 240 then
    return jsonb_build_object('ok', false, 'error', 'too_long');
  end if;
  if v_author is not null and length(v_author) > 24 then
    v_author := left(v_author, 24);
  end if;

  -- Hét serialisatiepunt. Transactiegebonden, dus vrij bij commit én rollback.
  perform pg_advisory_xact_lock(hashtext('only-text:current'));

  -- Snelheidsbegrenzing
  select * into v_rl from app.rate_limits where client_hash = p_client_hash for update;
  if found then
    if v_rl.blocked_until is not null and v_rl.blocked_until > v_now then
      return jsonb_build_object('ok', false, 'error', 'blocked',
        'retry_after', ceil(extract(epoch from (v_rl.blocked_until - v_now)))::integer);
    end if;

    v_wait := ceil(extract(epoch from
              (v_rl.last_post_at + make_interval(secs => v_cooldown) - v_now)))::integer;
    if v_wait > 0 then
      return jsonb_build_object('ok', false, 'error', 'cooldown', 'retry_after', v_wait);
    end if;

    if v_rl.hour_started_at + interval '1 hour' <= v_now then
      update app.rate_limits set hour_started_at = v_now, post_count_hour = 0
       where client_hash = p_client_hash;
    elsif v_rl.post_count_hour >= v_hourly then
      return jsonb_build_object('ok', false, 'error', 'hourly_limit',
        'retry_after', ceil(extract(epoch from
                        (v_rl.hour_started_at + interval '1 hour' - v_now)))::integer);
    end if;
  end if;

  -- Al wachtend? Dan geen tweede plek innemen.
  select * into v_queue from app.queue
    where client_hash = p_client_hash and status = 'waiting';
  if found then
    select count(*) into v_position from app.queue
      where status = 'waiting' and id <= v_queue.id;
    return jsonb_build_object('ok', false, 'error', 'already_queued',
      'position', v_position, 'claim_token', v_queue.claim_token);
  end if;

  -- Eerst inhalen wat er nog openstond.
  v_current := app.promote_if_due();

  if v_current.id is not null and v_current.body = v_body then
    return jsonb_build_object('ok', false, 'error', 'duplicate');
  end if;

  select count(*) into v_waiting from app.queue where status = 'waiting';

  -- Mag hij meteen? Alleen als het lopende bericht zijn tijd heeft gehad
  -- én er niemand anders voor hem in de rij staat.
  if v_waiting = 0 and (v_current.id is null or v_current.min_until <= v_now) then
    v_reign := app.next_reign_ms();
    v_prev  := v_current;

    if v_current.id is not null then
      update app.messages
         set ended_at    = v_now,
             duration_ms = (extract(epoch from (v_now - created_at)) * 1000)::bigint
       where id = v_current.id
       returning * into v_prev;

      update app.site_stats set total_ms = total_ms + coalesce(v_prev.duration_ms, 0)
       where id = 1;
    end if;

    insert into app.messages
      (body, author_name, char_count, word_count, country, client_hash, min_until, waited_ms, source)
    values
      (v_body, v_author, length(v_body),
       coalesce(array_length(regexp_split_to_array(v_body, '\s+'), 1), 0),
       p_country, p_client_hash,
       v_now + make_interval(secs => v_reign / 1000.0), 0, 'direct')
    returning * into v_new;

    update app.site_stats
       set total_messages = total_messages + 1,
           total_chars    = total_chars + v_new.char_count,
           updated_at     = v_now
     where id = 1;

    insert into app.rate_limits as rl
      (client_hash, last_post_at, post_count_hour, hour_started_at, post_count_total)
    values (p_client_hash, v_now, 1, v_now, 1)
    on conflict (client_hash) do update
      set last_post_at     = v_now,
          post_count_hour  = rl.post_count_hour + 1,
          post_count_total = rl.post_count_total + 1;

    perform app.announce(v_new, v_prev);

    return jsonb_build_object(
      'ok', true, 'live', true,
      'message',  to_jsonb(v_new)  - 'client_hash',
      'previous', case when v_prev.id is null then null else to_jsonb(v_prev) - 'client_hash' end);
  end if;

  -- Anders: de rij in.
  if v_waiting >= v_queue_max then
    return jsonb_build_object('ok', false, 'error', 'queue_full', 'waiting', v_waiting);
  end if;

  insert into app.queue (body, author_name, client_hash, country)
  values (v_body, v_author, p_client_hash, p_country)
  returning * into v_queue;

  insert into app.rate_limits as rl
    (client_hash, last_post_at, post_count_hour, hour_started_at, post_count_total)
  values (p_client_hash, v_now, 1, v_now, 1)
  on conflict (client_hash) do update
    set last_post_at     = v_now,
        post_count_hour  = rl.post_count_hour + 1,
        post_count_total = rl.post_count_total + 1;

  select count(*) into v_position from app.queue
    where status = 'waiting' and id <= v_queue.id;

  return jsonb_build_object(
    'ok', true, 'live', false, 'queued', true,
    'position',    v_position,
    'claim_token', v_queue.claim_token,
    'eta_ms',      v_position * app.next_reign_ms()
                   + greatest(0, (extract(epoch from (v_current.min_until - v_now)) * 1000)::bigint));
end;
$$;

revoke execute on function public.post_message(text, text, text, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 10. Leesfuncties. De enige weg naar buiten.
-- ---------------------------------------------------------------------------

create or replace function public.get_current()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'message', (
      select to_jsonb(m) - 'client_hash'
      from app.messages m where m.ended_at is null),
    'queue_length', (select count(*) from app.queue where status = 'waiting'),
    'viewers', (select count(*) from app.viewers where seen_at > now() - interval '30 seconds'),
    'stats', (select to_jsonb(s) from app.site_stats s where s.id = 1)
  );
$$;

-- Volatiel broertje: haalt de wachtrij in en zendt uit als dat nodig is.
create or replace function public.tick()
returns jsonb
language plpgsql security definer set search_path = ''
set lock_timeout = '2s'
as $$
begin
  perform pg_advisory_xact_lock(hashtext('only-text:current'));
  perform app.promote_if_due();
  return public.get_current();
exception
  when lock_not_available or query_canceled then
    return public.get_current();
end;
$$;

create or replace function public.get_archive(
  p_before bigint default null,
  p_limit  integer default 50,
  p_search text    default null
)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(t order by t.id desc), '[]'::jsonb)
  from (
    select m.id, m.body, m.author_name, m.created_at, m.ended_at,
           m.duration_ms, m.char_count, m.country, m.peak_viewers, m.waited_ms
    from app.messages m
    where m.status = 'visible'
      and m.ended_at is not null
      and (p_before is null or m.id < p_before)
      and (p_search is null or p_search = '' or m.body ilike '%' || p_search || '%')
    order by m.id desc
    limit least(coalesce(p_limit, 50), 100)
  ) t;
$$;

create or replace function public.get_message(p_id bigint)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'message', (select to_jsonb(m) - 'client_hash'
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

drop function if exists public.get_records(integer);

create or replace function public.get_records(p_limit integer default 50)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'longest', (
      select coalesce(jsonb_agg(t order by t.duration_ms desc), '[]'::jsonb)
      from (select m.id, m.body, m.author_name, m.created_at, m.duration_ms,
                   m.country, m.peak_viewers
            from app.messages m
            where m.status = 'visible' and m.duration_ms is not null
            order by m.duration_ms desc limit least(coalesce(p_limit,50), 100)) t),
    'shortest', (
      select coalesce(jsonb_agg(t order by t.duration_ms asc), '[]'::jsonb)
      from (select m.id, m.body, m.author_name, m.created_at, m.duration_ms,
                   m.country, m.peak_viewers
            from app.messages m
            where m.status = 'visible' and m.duration_ms is not null
            order by m.duration_ms asc limit least(coalesce(p_limit,50), 100)) t),
    'most_seen', (
      select coalesce(jsonb_agg(t order by t.peak_viewers desc), '[]'::jsonb)
      from (select m.id, m.body, m.author_name, m.created_at, m.duration_ms,
                   m.country, m.peak_viewers
            from app.messages m
            where m.status = 'visible' and m.peak_viewers > 0
            order by m.peak_viewers desc limit least(coalesce(p_limit,50), 100)) t),
    'stats', (select to_jsonb(s) from app.site_stats s where s.id = 1),
    'viewers', (select count(*) from app.viewers where seen_at > now() - interval '30 seconds')
  );
$$;

create or replace function public.get_queue_status(p_claim_token uuid)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select case
    when q.id is null then jsonb_build_object('found', false)
    when q.status = 'promoted' then jsonb_build_object(
      'found', true, 'status', 'promoted', 'message_id', q.message_id)
    when q.status <> 'waiting' then jsonb_build_object('found', true, 'status', q.status)
    else jsonb_build_object(
      'found', true, 'status', 'waiting',
      'position', (select count(*) from app.queue w where w.status = 'waiting' and w.id <= q.id),
      'eta_ms',   (select count(*) from app.queue w where w.status = 'waiting' and w.id <= q.id)
                  * app.next_reign_ms())
  end
  from (select * from app.queue where claim_token = p_claim_token) q
  right join (select 1) dummy on true;
$$;

-- ---------------------------------------------------------------------------
-- 11. Kijkers tellen
-- ---------------------------------------------------------------------------

create or replace function public.heartbeat(p_session uuid)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into app.viewers (session_id, seen_at) values (p_session, now())
  on conflict (session_id) do update set seen_at = now();

  select count(*) into v_count from app.viewers where seen_at > now() - interval '30 seconds';

  update app.messages
     set peak_viewers = greatest(peak_viewers, v_count)
   where ended_at is null and v_count > peak_viewers;

  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 12. Melden
-- ---------------------------------------------------------------------------

drop function if exists public.report_message(bigint, text, text);

create or replace function public.report_message(
  p_message_id    bigint,
  p_reporter_hash text,
  p_reason        text default null
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into app.reports (message_id, reporter_hash, reason)
  values (p_message_id, p_reporter_hash, left(coalesce(p_reason, ''), 200))
  on conflict (message_id, reporter_hash) do nothing;

  if not found then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  update app.messages set report_count = report_count + 1
   where id = p_message_id returning report_count into v_count;

  -- Drie meldingen: meteen weg van de voorpagina, ook als hij nu live staat.
  if v_count >= 3 then
    update app.messages set status = 'pending'
     where id = p_message_id and status = 'visible';

    if exists (select 1 from app.messages
               where id = p_message_id and ended_at is null) then
      update app.messages
         set ended_at = clock_timestamp(),
             duration_ms = (extract(epoch from (clock_timestamp() - created_at)) * 1000)::bigint
       where id = p_message_id;
      perform app.restore_previous();
    end if;
  end if;

  return jsonb_build_object('ok', true, 'reports', v_count);
end;
$$;

-- Als het levende bericht wordt weggehaald, mag de site niet leeg vallen:
-- het laatste zichtbare bericht ervoor komt terug.
create or replace function app.restore_previous()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_prev app.messages;
  v_new  app.messages;
begin
  if exists (select 1 from app.messages where ended_at is null) then
    return;
  end if;

  select * into v_prev from app.messages
    where status = 'visible' order by id desc limit 1;

  if not found then
    insert into app.messages (body, author_name, char_count, word_count,
                              client_hash, min_until, source)
    values ('Iemand zei hier iets. Het staat er niet meer. Zeg jij maar wat.',
            null, 62, 11, 'system', clock_timestamp(), 'system')
    returning * into v_new;
  else
    insert into app.messages (body, author_name, char_count, word_count,
                              country, client_hash, min_until, source)
    values (v_prev.body, v_prev.author_name, v_prev.char_count, v_prev.word_count,
            v_prev.country, v_prev.client_hash, clock_timestamp(), 'restored')
    returning * into v_new;
  end if;

  perform app.announce(v_new, v_prev);
end;
$$;

-- ---------------------------------------------------------------------------
-- 13. Rechten: eerst alles intrekken, dan gericht uitdelen.
--     Postgres geeft nieuwe functies standaard EXECUTE aan PUBLIC.
-- ---------------------------------------------------------------------------

alter default privileges in schema public revoke execute on functions from public;

revoke execute on function public.get_current()                        from public;
revoke execute on function public.tick()                               from public;
revoke execute on function public.get_archive(bigint, integer, text)   from public;
revoke execute on function public.get_message(bigint)                  from public;
revoke execute on function public.get_records(integer)                 from public;
revoke execute on function public.get_queue_status(uuid)               from public;
revoke execute on function public.heartbeat(uuid)                      from public;
revoke execute on function public.report_message(bigint, text, text)   from public;

grant execute on function public.get_current()                      to anon, authenticated;
grant execute on function public.get_archive(bigint, integer, text) to anon, authenticated;
grant execute on function public.get_message(bigint)                to anon, authenticated;
grant execute on function public.get_records(integer)               to anon, authenticated;
grant execute on function public.get_queue_status(uuid)             to anon, authenticated;
grant execute on function public.heartbeat(uuid)                    to anon, authenticated;

-- tick(), post_message() en report_message() lopen uitsluitend via onze
-- eigen server, die het IP hasht. Zou de browser ze rechtstreeks mogen
-- aanroepen, dan kon iedereen een willekeurige client_hash meesturen en
-- daarmee de snelheidsbegrenzing omzeilen.

-- ---------------------------------------------------------------------------
-- 14. Realtime: alleen lezen op de topics, bewust geen INSERT-policy.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'realtime')
     and exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'realtime' and c.relname = 'messages') then

    execute 'drop policy if exists "anon reads current broadcasts" on realtime.messages';
    execute $p$
      create policy "anon reads current broadcasts"
      on realtime.messages for select to anon, authenticated
      using (realtime.topic() in ('current','stats')
             and realtime.messages.extension = 'broadcast')
    $p$;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 15. Onderhoud. pg_cron is niet op elk plan beschikbaar; als het niet lukt
--     draaien we dezelfde taken vanuit de applicatie.
-- ---------------------------------------------------------------------------

create or replace function app.housekeeping()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  delete from app.viewers      where seen_at < now() - interval '5 minutes';
  delete from app.rate_limits  where last_post_at < now() - interval '2 hours'
                                 and (blocked_until is null or blocked_until < now());
  update app.queue set status = 'expired', resolved_at = now()
   where status = 'waiting' and created_at < now() - interval '2 hours';
end;
$$;

do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron niet beschikbaar: %', sqlerrm;
    return;
  end;

  perform cron.unschedule(jobname) from cron.job
    where jobname in ('only-text-tick','only-text-housekeeping');

  perform cron.schedule('only-text-tick', '10 seconds', 'select public.tick()');
  perform cron.schedule('only-text-housekeeping', '5 minutes', 'select app.housekeeping()');
exception when others then
  raise notice 'cron-taken niet ingepland: %', sqlerrm;
end
$$;
