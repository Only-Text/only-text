-- Migratie 0003: rechten echt dichtzetten.
--
-- Supabase zet standaard privileges klaar die nieuwe functies in `public`
-- expliciet EXECUTE geven aan anon, authenticated én service_role. Intrekken
-- bij alleen PUBLIC laat die directe grants dus gewoon staan. Dat betekende
-- dat de browser met de anon-sleutel rechtstreeks tick() en report_message()
-- kon aanroepen — en bij report_message zelfs een willekeurige reporter_hash
-- kon meesturen en zo in zijn eentje elk bericht van de voorpagina halen.

revoke execute on function public.tick()                             from public, anon, authenticated;
revoke execute on function public.report_message(bigint, text, text) from public, anon, authenticated;
revoke execute on function public.post_message(text, text, text, text) from public, anon, authenticated;

-- Voorkom dat een volgende migratie dit stilzwijgend terugdraait.
alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

-- Ook geen tweede identieke zin in de wachtrij: die zou bij promotie
-- alsnog als duplicaat op de voorpagina belanden.
create or replace function app.queue_has_body(p_body text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from app.queue where status = 'waiting' and body = p_body);
$$;

revoke execute on function app.queue_has_body(text) from public, anon, authenticated;
