-- Niets meer weggooien.
--
-- De vorige versie ruimde events ouder dan zestig dagen op als bijvangst van
-- gewoon verkeer. Dat was bedoeld om schijfruimte te sparen, maar het kost het
-- enige dat je met terugwerkende kracht niet opnieuw kunt maken: de vergelijking
-- met vorig jaar. Een rij weegt hier ongeveer honderd bytes; honderdduizend
-- bezoeken per maand is dus een paar megabyte per jaar, en dat is de vergelijking
-- ruimschoots waard.
--
-- Verder identiek aan 0010.

create or replace function public.record_events(p_events jsonb, p_country text default null)
returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  if jsonb_typeof(p_events) is distinct from 'array' then
    return 0;
  end if;

  insert into app.events (name, session_id, path, props, country)
  select
    e->>'name',
    case when e->>'session' ~ '^[0-9a-fA-F-]{36}$' then (e->>'session')::uuid end,
    left(e->>'path', 120),
    case when jsonb_typeof(e->'props') = 'object' then e->'props' else '{}'::jsonb end,
    p_country
  from jsonb_array_elements(p_events) as e
  where e->>'name' ~ '^[a-z][a-z0-9_]{2,39}$'
  limit 20;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.record_events(jsonb, text) from public, anon, authenticated;
