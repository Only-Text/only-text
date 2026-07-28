-- Wat het account al heeft gezien.
--
-- Een bot die antwoordt moet één ding boven alles kunnen: onthouden waar hij al
-- geweest is. Zonder dit geheugen antwoordt elke draai opnieuw op dezelfde
-- vermelding, en dan staat er binnen een uur een rij identieke reacties onder
-- iemands bericht. Dat is niet terug te nemen en het is precies het beeld dat je
-- van een geautomatiseerd account niet wilt.
--
-- De claim gaat vóór het antwoord, niet erna. Valt het plaatsen daarna om, dan
-- is die vermelding stil overgeslagen, en dat is de goede kant om fout te gaan:
-- een gemist antwoord ziet niemand, een dubbel antwoord iedereen.

create table if not exists app.bsky_handled (
  uri         text primary key,
  handled_at  timestamptz not null default now(),
  action      text
);

create index if not exists bsky_handled_when_idx on app.bsky_handled (handled_at desc);

alter table app.bsky_handled enable row level security;
revoke all on app.bsky_handled from anon, authenticated;

/**
 * Claimt een bericht. Geeft true terug als dit de eerste keer is.
 *
 * Eén insert, geen lezen-dan-schrijven: twee gelijktijdige aanroepen zouden bij
 * die tweede vorm allebei "nog niet gedaan" zien en allebei antwoorden. De
 * primaire sleutel is de enige sluitende afspraak.
 */
create or replace function public.bsky_claim(p_uri text, p_action text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into app.bsky_handled (uri, action) values (p_uri, p_action)
  on conflict (uri) do nothing;
  return found;
end;
$$;

revoke execute on function public.bsky_claim(text, text) from public, anon, authenticated;
