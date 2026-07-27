-- only-text.com — Het laatste bericht
-- Migratie 0001: schema, indexen, RLS, RPC's en beginwaarden.
--
-- Uitgangspunten:
--   * Er is op elk moment precies één levend bericht: de rij met ended_at IS NULL.
--   * Schrijven kan ALLEEN via post_message(), aangeroepen vanaf de server met de service_role.
--     De browser kan dus niets vervalsen (geen eigen client_hash, geen eigen tijdstip).
--   * De browser mag lezen, maar nooit de kolommen client_hash / ip-gerelateerde velden.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id              bigint generated always as identity primary key,
  body            text        not null,
  author_name     text,
  created_at      timestamptz not null default now(),
  ended_at        timestamptz,
  duration_ms     bigint,
  char_count      integer     not null,
  word_count      integer     not null,
  country         text,
  client_hash     text        not null,
  status          text        not null default 'visible',
  removed_reason  text,
  report_count    integer     not null default 0,
  constraint messages_status_check     check (status in ('visible','removed','pending')),
  constraint messages_body_length      check (char_length(body) between 1 and 240),
  constraint messages_author_length    check (author_name is null or char_length(author_name) between 1 and 24),
  constraint messages_duration_sign    check (duration_ms is null or duration_ms >= 0),
  constraint messages_ended_after      check (ended_at is null or ended_at >= created_at)
);

comment on table  public.messages           is 'Elk bericht dat ooit op de homepage heeft gestaan. ended_at IS NULL = staat er nu.';
comment on column public.messages.client_hash is 'SHA-256 van IP + server-pepper. Nooit publiek leesbaar.';
comment on column public.messages.duration_ms is 'Hoe lang dit bericht op de homepage stond. NULL zolang het er nog staat.';

-- Precies één levend bericht. De uitdrukking is altijd TRUE voor die rijen,
-- dus het unieke index dwingt af dat er er maar één van kan bestaan.
create unique index if not exists messages_single_live_idx
  on public.messages ((ended_at is null))
  where ended_at is null;

create index if not exists messages_created_at_desc_idx
  on public.messages (created_at desc);

create index if not exists messages_duration_desc_idx
  on public.messages (duration_ms desc nulls last)
  where status = 'visible';

create index if not exists messages_duration_asc_idx
  on public.messages (duration_ms asc)
  where status = 'visible' and duration_ms is not null;

create index if not exists messages_body_trgm_idx
  on public.messages using gin (body gin_trgm_ops);

create index if not exists messages_client_hash_idx
  on public.messages (client_hash, created_at desc);


create table if not exists public.rate_limits (
  client_hash      text primary key,
  last_post_at     timestamptz not null,
  post_count_hour  integer     not null default 1,
  hour_started_at  timestamptz not null default now(),
  post_count_total integer     not null default 1,
  blocked_until    timestamptz,
  blocked_reason   text
);

comment on table public.rate_limits is 'Snelheidsbegrenzing per gehashte bezoeker. Bevat geen ruwe IP-adressen.';


create table if not exists public.reports (
  id            bigint generated always as identity primary key,
  message_id    bigint      not null references public.messages(id) on delete cascade,
  reporter_hash text        not null,
  reason        text,
  created_at    timestamptz not null default now(),
  handled_at    timestamptz,
  constraint reports_unique_per_reporter unique (message_id, reporter_hash),
  constraint reports_reason_length check (reason is null or char_length(reason) <= 200)
);

create index if not exists reports_open_idx
  on public.reports (created_at desc)
  where handled_at is null;


create table if not exists public.site_stats (
  id              integer primary key default 1,
  total_messages  bigint  not null default 0,
  total_chars     bigint  not null default 0,
  total_ms        bigint  not null default 0,
  updated_at      timestamptz not null default now(),
  constraint site_stats_singleton check (id = 1)
);

insert into public.site_stats (id) values (1) on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- Rechten en RLS
-- ---------------------------------------------------------------------------

alter table public.messages    enable row level security;
alter table public.rate_limits enable row level security;
alter table public.reports     enable row level security;
alter table public.site_stats  enable row level security;

-- Standaard alles intrekken; daarna alleen expliciet teruggeven.
revoke all on public.messages    from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;
revoke all on public.reports     from anon, authenticated;
revoke all on public.site_stats  from anon, authenticated;

-- Lezen mag, maar NOOIT client_hash. Kolomrechten sluiten dat hard af,
-- ook als iemand een select * probeert.
grant select (id, body, author_name, created_at, ended_at, duration_ms,
              char_count, word_count, country, status, report_count)
  on public.messages to anon, authenticated;

grant select on public.site_stats to anon, authenticated;

create policy messages_public_read on public.messages
  for select to anon, authenticated
  using (status = 'visible');

create policy site_stats_public_read on public.site_stats
  for select to anon, authenticated
  using (true);

-- rate_limits en reports hebben bewust geen enkele policy:
-- alleen de service_role (die RLS omzeilt) komt erbij.


-- ---------------------------------------------------------------------------
-- Realtime: elke wisseling wordt uitgezonden op een broadcast-kanaal.
-- Broadcast schaalt veel beter dan postgres_changes bij duizenden kijkers,
-- omdat de payload één keer wordt opgebouwd in plaats van per verbinding.
-- ---------------------------------------------------------------------------

create or replace function public.broadcast_current_message()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if new.ended_at is null and new.status = 'visible' then
    perform realtime.send(
      jsonb_build_object(
        'id',          new.id,
        'body',        new.body,
        'author_name', new.author_name,
        'created_at',  new.created_at,
        'char_count',  new.char_count,
        'country',     new.country
      ),
      'takeover',        -- event
      'only-text:live',  -- topic
      false              -- public channel, geen auth nodig om te ontvangen
    );
  end if;
  return new;
end;
$$;

drop trigger if exists messages_broadcast_insert on public.messages;
create trigger messages_broadcast_insert
  after insert on public.messages
  for each row execute function public.broadcast_current_message();


-- ---------------------------------------------------------------------------
-- post_message: de enige manier om iets te plaatsen.
-- Atomair: sluit het lopende bericht, opent het nieuwe, werkt tellers bij.
-- ---------------------------------------------------------------------------

create or replace function public.post_message(
  p_body        text,
  p_author      text,
  p_client_hash text,
  p_country     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now        timestamptz := now();
  v_body       text;
  v_author     text;
  v_had_prev   boolean := false;
  v_prev       public.messages%rowtype;
  v_new        public.messages%rowtype;
  v_rl         public.rate_limits%rowtype;
  v_wait       integer;
  c_cooldown   constant integer := 60;   -- seconden tussen twee berichten
  c_hourly_max constant integer := 20;   -- berichten per uur
begin
  if p_client_hash is null or char_length(p_client_hash) = 0 then
    return jsonb_build_object('ok', false, 'error', 'no_client');
  end if;

  -- Alle plaatsingen serialiseren. Zonder dit kunnen twee gelijktijdige
  -- verzoeken allebei denken dat zij het lopende bericht mogen sluiten.
  perform pg_advisory_xact_lock(hashtext('only-text:post'));

  v_body   := btrim(p_body);
  v_author := nullif(btrim(coalesce(p_author, '')), '');

  if v_body is null or char_length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty');
  end if;
  if char_length(v_body) > 240 then
    return jsonb_build_object('ok', false, 'error', 'too_long');
  end if;
  if v_author is not null and char_length(v_author) > 24 then
    v_author := left(v_author, 24);
  end if;

  -- Snelheidsbegrenzing
  select * into v_rl from public.rate_limits
    where client_hash = p_client_hash for update;

  if found then
    if v_rl.blocked_until is not null and v_rl.blocked_until > v_now then
      return jsonb_build_object('ok', false, 'error', 'blocked',
        'retry_after', ceil(extract(epoch from (v_rl.blocked_until - v_now)))::integer);
    end if;

    v_wait := ceil(extract(epoch from
                (v_rl.last_post_at + make_interval(secs => c_cooldown) - v_now)))::integer;
    if v_wait > 0 then
      return jsonb_build_object('ok', false, 'error', 'cooldown', 'retry_after', v_wait);
    end if;

    if v_rl.hour_started_at + interval '1 hour' <= v_now then
      update public.rate_limits
         set hour_started_at = v_now, post_count_hour = 0
       where client_hash = p_client_hash;
      v_rl.post_count_hour := 0;
    elsif v_rl.post_count_hour >= c_hourly_max then
      return jsonb_build_object('ok', false, 'error', 'hourly_limit',
        'retry_after', ceil(extract(epoch from
                        (v_rl.hour_started_at + interval '1 hour' - v_now)))::integer);
    end if;
  end if;

  -- Het lopende bericht vastzetten
  select * into v_prev from public.messages where ended_at is null for update;
  v_had_prev := found;

  if v_had_prev and v_prev.body = v_body then
    return jsonb_build_object('ok', false, 'error', 'duplicate');
  end if;

  if v_had_prev then
    update public.messages
       set ended_at    = v_now,
           duration_ms = (extract(epoch from (v_now - created_at)) * 1000)::bigint
     where id = v_prev.id
     returning * into v_prev;

    update public.site_stats
       set total_ms = total_ms + coalesce(v_prev.duration_ms, 0)
     where id = 1;
  end if;

  insert into public.messages
    (body, author_name, char_count, word_count, country, client_hash)
  values
    (v_body,
     v_author,
     char_length(v_body),
     coalesce(array_length(regexp_split_to_array(v_body, '\s+'), 1), 0),
     p_country,
     p_client_hash)
  returning * into v_new;

  insert into public.rate_limits as rl
    (client_hash, last_post_at, post_count_hour, hour_started_at, post_count_total)
  values
    (p_client_hash, v_now, 1, v_now, 1)
  on conflict (client_hash) do update
     set last_post_at     = v_now,
         post_count_hour  = rl.post_count_hour + 1,
         post_count_total = rl.post_count_total + 1;

  update public.site_stats
     set total_messages = total_messages + 1,
         total_chars    = total_chars + v_new.char_count,
         updated_at     = v_now
   where id = 1;

  return jsonb_build_object(
    'ok', true,
    'message',  to_jsonb(v_new)  - 'client_hash',
    'previous', case when v_had_prev then to_jsonb(v_prev) - 'client_hash' else null end
  );
end;
$$;

revoke all on function public.post_message(text, text, text, text) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- report_message: melden kan wel rechtstreeks, want het is onschadelijk.
-- Bij 3 meldingen gaat het bericht automatisch in de wachtrij.
-- ---------------------------------------------------------------------------

create or replace function public.report_message(
  p_message_id    bigint,
  p_reporter_hash text,
  p_reason        text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  insert into public.reports (message_id, reporter_hash, reason)
  values (p_message_id, p_reporter_hash, left(coalesce(p_reason, ''), 200))
  on conflict (message_id, reporter_hash) do nothing;

  if not found then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  update public.messages
     set report_count = report_count + 1
   where id = p_message_id
   returning report_count into v_count;

  if v_count >= 3 then
    update public.messages
       set status = 'pending'
     where id = p_message_id and status = 'visible';
  end if;

  return jsonb_build_object('ok', true, 'reports', v_count);
end;
$$;

revoke all on function public.report_message(bigint, text, text) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Statistiek-functies voor /records — als functie zodat er geen dure
-- COUNT(*) over miljoenen rijen vanuit de browser gedraaid kan worden.
-- ---------------------------------------------------------------------------

create or replace function public.get_records(p_limit integer default 100)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'longest', (
      select coalesce(jsonb_agg(t order by t.duration_ms desc), '[]'::jsonb)
      from (
        select id, body, author_name, created_at, duration_ms, country
        from public.messages
        where status = 'visible' and duration_ms is not null
        order by duration_ms desc
        limit least(greatest(p_limit, 1), 100)
      ) t
    ),
    'shortest', (
      select coalesce(jsonb_agg(t order by t.duration_ms asc), '[]'::jsonb)
      from (
        select id, body, author_name, created_at, duration_ms, country
        from public.messages
        where status = 'visible' and duration_ms is not null
        order by duration_ms asc
        limit least(greatest(p_limit, 1), 100)
      ) t
    ),
    'stats', (
      select to_jsonb(s) from public.site_stats s where s.id = 1
    )
  );
$$;

grant execute on function public.get_records(integer) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- Het allereerste bericht, zodat de site nooit leeg is.
-- ---------------------------------------------------------------------------

insert into public.messages (body, author_name, char_count, word_count, client_hash, country)
select 'This website is one sentence long. It belongs to whoever typed last. Right now, that is nobody — so it is yours.',
       null, 113, 21, 'seed', null
where not exists (select 1 from public.messages);

update public.site_stats
   set total_messages = (select count(*) from public.messages),
       total_chars    = (select coalesce(sum(char_count), 0) from public.messages)
 where id = 1;
