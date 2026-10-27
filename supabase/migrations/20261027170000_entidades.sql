-- Entidades del archivo de conocimiento (tarea 3.1).
-- Specs: proyectos, notas, libros, fuentes-recursos, cuentas-usuario, exclusiones-alcance.
--
-- Cada elemento es canónico: existe una sola fila aunque se relacione con varios
-- espacios. Las relaciones viven en tablas de enlace (migración de vínculos).
-- Solo se guardan fechas de creación y modificación como metadatos; ninguna
-- columna mide tiempo de estudio (spec exclusiones-alcance).

-- ---------------------------------------------------------------------------
-- Proyectos de estudio: nombre y descripción opcional (spec proyectos).
-- ---------------------------------------------------------------------------
create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) > 0),
  descripcion text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- Destino de las claves foráneas compuestas de los vínculos (design D3).
  unique (id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- Notas: pieza central; contenido en JSON del editor (design D6) y texto plano
-- derivado para una futura búsqueda (spec notas).
-- ---------------------------------------------------------------------------
create table public.notas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) > 0),
  contenido jsonb not null default '{"type": "doc", "content": []}'::jsonb,
  contenido_texto text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- Libros: campos bibliográficos provisionales, sin tipos (spec libros).
-- ---------------------------------------------------------------------------
create table public.libros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) > 0),
  autores text,
  anio smallint check (anio between -3000 and 3000),
  editorial text,
  notas_bibliograficas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- Fuentes y recursos: campos provisionales, sin tipos (spec fuentes-recursos).
-- ---------------------------------------------------------------------------
create table public.recursos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) > 0),
  url text check (url is null or url ~* '^https?://'),
  autor text,
  descripcion text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id, usuario_id)
);

-- ---------------------------------------------------------------------------
-- Comunes: índice por usuario, fecha de modificación y aislamiento con RLS
-- (design D4, spec cuentas-usuario).
-- ---------------------------------------------------------------------------
do $$
declare
  tabla text;
begin
  foreach tabla in array array['proyectos', 'notas', 'libros', 'recursos'] loop
    execute format('create index %1$s_usuario_id_idx on public.%1$I (usuario_id)', tabla);

    execute format(
      'create trigger %1$s_tocar_actualizado_en before update on public.%1$I
         for each row execute function public.tocar_actualizado_en()',
      tabla);

    execute format('alter table public.%I enable row level security', tabla);

    execute format(
      'create policy "propietario_lee" on public.%I for select to authenticated
         using (usuario_id = (select auth.uid()))', tabla);
    execute format(
      'create policy "propietario_crea" on public.%I for insert to authenticated
         with check (usuario_id = (select auth.uid()))', tabla);
    execute format(
      'create policy "propietario_modifica" on public.%I for update to authenticated
         using (usuario_id = (select auth.uid()))
         with check (usuario_id = (select auth.uid()))', tabla);
    execute format(
      'create policy "propietario_borra" on public.%I for delete to authenticated
         using (usuario_id = (select auth.uid()))', tabla);
  end loop;
end
$$;
