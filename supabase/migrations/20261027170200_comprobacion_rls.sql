-- Comprobación de RLS (tarea 2.4, design D4).
-- Devuelve las tablas del esquema public sin Row Level Security activado.
-- Solo la usan las pruebas automáticas con la clave secreta (service_role).

create or replace function public.tablas_sin_rls()
returns setof text
language sql
security definer
set search_path = ''
as $$
  select c.relname::text
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and not c.relrowsecurity
  order by 1;
$$;

revoke execute on function public.tablas_sin_rls() from public, anon, authenticated;
grant execute on function public.tablas_sin_rls() to service_role;
