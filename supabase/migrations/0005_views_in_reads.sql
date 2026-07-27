-- Migratie 0005: het aantal kijkers ook teruggeven aan de site.
-- get_message() gebruikt to_jsonb() en pikt de nieuwe kolom vanzelf op;
-- de andere twee noemen hun kolommen expliciet en moeten dus bij.

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
           m.duration_ms, m.char_count, m.country, m.peak_viewers,
           m.views, m.waited_ms
    from app.messages m
    where m.status = 'visible'
      and m.ended_at is not null
      and (p_before is null or m.id < p_before)
      and (p_search is null or p_search = '' or m.body ilike '%' || p_search || '%')
    order by m.id desc
    limit least(coalesce(p_limit, 50), 100)
  ) t;
$$;

create or replace function public.get_records(p_limit integer default 50)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'longest', (
      select coalesce(jsonb_agg(t order by t.duration_ms desc), '[]'::jsonb)
      from (select m.id, m.body, m.author_name, m.created_at, m.duration_ms,
                   m.country, m.peak_viewers, m.views
            from app.messages m
            where m.status = 'visible' and m.duration_ms is not null
            order by m.duration_ms desc limit least(coalesce(p_limit,50), 100)) t),
    'shortest', (
      select coalesce(jsonb_agg(t order by t.duration_ms asc), '[]'::jsonb)
      from (select m.id, m.body, m.author_name, m.created_at, m.duration_ms,
                   m.country, m.peak_viewers, m.views
            from app.messages m
            where m.status = 'visible' and m.duration_ms is not null
            order by m.duration_ms asc limit least(coalesce(p_limit,50), 100)) t),
    'most_seen', (
      select coalesce(jsonb_agg(t order by t.views desc), '[]'::jsonb)
      from (select m.id, m.body, m.author_name, m.created_at, m.duration_ms,
                   m.country, m.peak_viewers, m.views
            from app.messages m
            where m.status = 'visible' and m.views > 0
            order by m.views desc limit least(coalesce(p_limit,50), 100)) t),
    'stats', (select to_jsonb(s) from app.site_stats s where s.id = 1),
    'viewers', (select count(*) from app.viewers where seen_at > now() - interval '30 seconds')
  );
$$;

revoke execute on function public.get_archive(bigint, integer, text) from public;
revoke execute on function public.get_records(integer) from public;
grant execute on function public.get_archive(bigint, integer, text) to anon, authenticated;
grant execute on function public.get_records(integer) to anon, authenticated;
