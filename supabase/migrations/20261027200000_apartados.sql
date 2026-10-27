-- Apartados de los proyectos (cambio apartados-proyectos, design D1–D3).
-- Spec proyectos: un proyecto puede dividirse en apartados ordenados por el usuario;
-- sus notas, libros y recursos pueden estar en varios apartados sin duplicarse.

-- ---------------------------------------------------------------------------
-- D1. Apartados: título, descripción opcional y posición elegida por el usuario.
-- ---------------------------------------------------------------------------
create table public.apartados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid(),
  proyecto_id uuid not null,
  titulo text not null check (char_length(btrim(titulo)) > 0),
  descripcion text,
  posicion integer not null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (id, proyecto_id, usuario_id),
  -- Borrar el proyecto borra sus apartados.
  foreign key (proyecto_id, usuario_id) references public.proyectos (id, usuario_id) on delete cascade
);

create index apartados_proyecto_idx on public.apartados (proyecto_id, posicion);

create trigger apartados_tocar_actualizado_en before update on public.apartados
  for each row execute function public.tocar_actualizado_en();

alter table public.apartados enable row level security;
create policy "propietario_lee" on public.apartados for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "propietario_crea" on public.apartados for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "propietario_modifica" on public.apartados for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "propietario_borra" on public.apartados for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- D2. Asignaciones: solo lo que está en el proyecto puede estar en un apartado.
--   - (apartado, proyecto, usuario) → apartados: eliminar el apartado quita solo sus asignaciones.
--   - (elemento, proyecto) → vínculo con el proyecto: desvincular saca el elemento de sus apartados.
-- ---------------------------------------------------------------------------
create or replace function pg_temp.crear_asignacion(tabla text, elemento text, vinculo text)
returns void
language plpgsql
as $$
begin
  execute format(
    'create table public.%1$I (
       apartado_id uuid not null,
       %2$I uuid not null,
       proyecto_id uuid not null,
       usuario_id uuid not null default auth.uid(),
       creado_en timestamptz not null default now(),
       primary key (apartado_id, %2$I),
       foreign key (apartado_id, proyecto_id, usuario_id)
         references public.apartados (id, proyecto_id, usuario_id) on delete cascade,
       foreign key (%2$I, proyecto_id)
         references public.%3$I (%2$I, proyecto_id) on delete cascade
     )',
    tabla, elemento, vinculo);

  execute format('create index %1$s_elemento_idx on public.%1$I (%2$I, proyecto_id)', tabla, elemento);

  execute format('alter table public.%I enable row level security', tabla);
  execute format(
    'create policy "propietario_lee" on public.%I for select to authenticated
       using (usuario_id = (select auth.uid()))', tabla);
  execute format(
    'create policy "propietario_crea" on public.%I for insert to authenticated
       with check (usuario_id = (select auth.uid()))', tabla);
  execute format(
    'create policy "propietario_borra" on public.%I for delete to authenticated
       using (usuario_id = (select auth.uid()))', tabla);
end;
$$;

select pg_temp.crear_asignacion('apartado_nota', 'nota_id', 'nota_proyecto');
select pg_temp.crear_asignacion('apartado_libro', 'libro_id', 'libro_proyecto');
select pg_temp.crear_asignacion('apartado_recurso', 'recurso_id', 'recurso_proyecto');

-- ---------------------------------------------------------------------------
-- D3. Subir o bajar un apartado una posición, de forma atómica.
-- Primero renumera los apartados del proyecto (1..n) para eliminar huecos o empates,
-- y después intercambia la posición con el vecino. En los extremos no hace nada.
-- security invoker: RLS limita la operación a los apartados del usuario.
-- ---------------------------------------------------------------------------
create or replace function public.mover_apartado(apartado uuid, direccion text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  proyecto uuid;
  actual integer;
  destino integer;
begin
  if direccion not in ('subir', 'bajar') then
    raise exception 'direccion debe ser subir o bajar';
  end if;

  select a.proyecto_id into proyecto from public.apartados a where a.id = apartado;
  if not found then
    return;
  end if;

  update public.apartados a
     set posicion = orden.n
    from (
      select x.id, row_number() over (order by x.posicion, x.creado_en) as n
        from public.apartados x
       where x.proyecto_id = proyecto
    ) orden
   where a.id = orden.id and a.posicion is distinct from orden.n;

  select a.posicion into actual from public.apartados a where a.id = apartado;
  destino := case direccion when 'subir' then actual - 1 else actual + 1 end;

  if not exists (
    select 1 from public.apartados a where a.proyecto_id = proyecto and a.posicion = destino
  ) then
    return;
  end if;

  update public.apartados a
     set posicion = case when a.id = apartado then destino else actual end
   where a.proyecto_id = proyecto
     and (a.id = apartado or a.posicion = destino);
end;
$$;

revoke execute on function public.mover_apartado(uuid, text) from public, anon;
grant execute on function public.mover_apartado(uuid, text) to authenticated;
