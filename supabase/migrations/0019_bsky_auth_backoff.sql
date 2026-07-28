-- Niet blijven kloppen op een deur die dicht is.
--
-- Bluesky staat tien mislukte aanmeldingen per dag toe per account. De
-- antwoordcron draait elk kwartier, dus zodra de gegevens niet kloppen zijn die
-- tien binnen twee uur op en komt het account daarna ook met de júiste gegevens
-- de rest van de dag niet meer binnen. De fout die je maakt bij het instellen
-- van een omgevingsvariabele wordt zo een storing van een etmaal.
--
-- Dus onthouden we een mislukte aanmelding en houden we een uur onze mond. Eén
-- poging per uur is genoeg om te merken dat het weer werkt, en vierentwintig
-- pogingen per dag passen ruim binnen de tien mislukte die je mag hebben omdat
-- ze pas doortellen zolang het misgaat.

create or replace function public.bsky_auth_blocked()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app.bsky_handled
    where uri = 'auth-failure' and handled_at > now() - interval '1 hour'
  );
$$;

create or replace function public.bsky_auth_failed()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into app.bsky_handled (uri, action)
  values ('auth-failure', 'auth')
  on conflict (uri) do update set handled_at = now();
$$;

revoke execute on function public.bsky_auth_blocked() from public, anon, authenticated;
revoke execute on function public.bsky_auth_failed() from public, anon, authenticated;
