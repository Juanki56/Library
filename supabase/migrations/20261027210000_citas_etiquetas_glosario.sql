-- Citas, etiquetas y glosario (cambio secciones-citas-etiquetas-glosario-busqueda, design D1–D4).

-- ---------------------------------------------------------------------------
-- D1. Normalización: sin mayúsculas, sin tildes y sin espacios sobrantes.
-- Inmutable para poder usarla en columnas generadas (diccionario de unaccent explícito).
-- ---------------------------------------------------------------------------
create extension if not exists unaccent with schema extensions;

create or replace function public.normalizar(texto text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent(
    'extensions.unaccent'::regdictionary,
    regexp_replace(btrim(coalesce(texto, '')), '\s+', ' ', 'g')
  ));
$$;

-- Políticas estándar de propietario para una tabla con usuario_id.
create or replace function pg_temp.politicas(tabla text, con_update boolean)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', tabla);
  execute format(
    'create policy "propietario_lee" on public.%I for select to authenticated
       using (usuario_id = (select auth.uid()))', tabla);
  execute format(
    'create policy "propietario_crea" on public.%I for insert to authenticated
       with check (usuario_id = (select auth.uid()))', tabla);
  if con_update then
    execute format(
      'create policy "propietario_modifica" on public.%I for update to authenticated
         using (usuario_id = (select auth.uid()))
         with check (usuario_id = (select auth.uid()))', tabla);
  end if;
  execute format(
    'create policy "propietario_borra" on public.%I for delete to authenticated
       using (usuario_id = (select auth.uid()))', tabla);
end;
$$;

-- ---------------------------------------------------------------------------
-- D2. Citas: independientes, con enlace opcional y exclusivo a un libro o recurso.
-- Al borrar el libro o recurso, la cita se conserva sin enlace (spec relaciones).
-- ---------------------------------------------------------------------------
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) > 0),
  tipo text not null default 'cita' check (tipo in ('cita', 'frase', 'proverbio')),
  autor text,
  fuente text,
  libro_id uuid,
  recurso_id uuid,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (libro_id is null or recurso_id is null),
  foreign key (libro_id, usuario_id) references public.libros (id, usuario_id) on delete set null (libro_id),
  foreign key (recurso_id, usuario_id) references public.recursos (id, usuario_id) on delete set null (recurso_id)
);

create index citas_usuario_idx on public.citas (usuario_id, creado_en desc);
create index citas_libro_idx on public.citas (libro_id) where libro_id is not null;
create index citas_recurso_idx on public.citas (recurso_id) where recurso_id is not null;
create trigger citas_tocar_actualizado_en before update on public.citas
  for each row execute function public.tocar_actualizado_en();
select pg_temp.politicas('citas', true);

-- ---------------------------------------------------------------------------
-- D3. Etiquetas: una por nombre normalizado y usuario, con una tabla de asignación por tipo.
-- ---------------------------------------------------------------------------
create table public.etiquetas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) > 0),
  nombre_normalizado text generated always as (public.normalizar(nombre)) stored,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id, usuario_id),
  unique (usuario_id, nombre_normalizado)
);

create trigger etiquetas_tocar_actualizado_en before update on public.etiquetas
  for each row execute function public.tocar_actualizado_en();
select pg_temp.politicas('etiquetas', true);

create or replace function pg_temp.crear_asignacion_etiqueta(tabla text, elemento text, tabla_elemento text)
returns void
language plpgsql
as $$
begin
  execute format(
    'create table public.%1$I (
       etiqueta_id uuid not null,
       %2$I uuid not null,
       usuario_id uuid not null default auth.uid(),
       creado_en timestamptz not null default now(),
       primary key (etiqueta_id, %2$I),
       foreign key (etiqueta_id, usuario_id) references public.etiquetas (id, usuario_id) on delete cascade,
       foreign key (%2$I, usuario_id) references public.%3$I (id, usuario_id) on delete cascade
     )',
    tabla, elemento, tabla_elemento);
  execute format('create index %1$s_elemento_idx on public.%1$I (%2$I)', tabla, elemento);
  perform pg_temp.politicas(tabla, false);
end;
$$;

select pg_temp.crear_asignacion_etiqueta('etiqueta_nota', 'nota_id', 'notas');
select pg_temp.crear_asignacion_etiqueta('etiqueta_libro', 'libro_id', 'libros');
select pg_temp.crear_asignacion_etiqueta('etiqueta_proyecto', 'proyecto_id', 'proyectos');
select pg_temp.crear_asignacion_etiqueta('etiqueta_recurso', 'recurso_id', 'recursos');

-- ---------------------------------------------------------------------------
-- D4. Glosario: término único (normalizado) por usuario; término y definición obligatorios.
-- ---------------------------------------------------------------------------
create table public.glosario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  termino text not null check (char_length(btrim(termino)) > 0),
  termino_normalizado text generated always as (public.normalizar(termino)) stored,
  definicion text not null check (char_length(btrim(definicion)) > 0),
  ejemplo text,
  informacion_adicional text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (usuario_id, termino_normalizado)
);

create trigger glosario_tocar_actualizado_en before update on public.glosario
  for each row execute function public.tocar_actualizado_en();
select pg_temp.politicas('glosario', true);
