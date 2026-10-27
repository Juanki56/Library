-- Vínculos entre elementos (tarea 3.2). Spec relaciones y design D3.
--
-- Una tabla de enlace por cada par de entidades relacionadas en las specs:
--   nota_proyecto, nota_libro, nota_recurso   (spec notas)
--   libro_proyecto                            (spec libros)
--   recurso_proyecto, recurso_libro           (spec fuentes-recursos)
--
-- Garantías de la base de datos:
--   - Clave primaria compuesta: el mismo vínculo no puede existir dos veces.
--   - Claves foráneas compuestas (elemento, usuario): solo se pueden vincular
--     elementos del mismo usuario (spec cuentas-usuario).
--   - ON DELETE CASCADE desde cada entidad: al eliminar un elemento desaparecen
--     sus vínculos, nunca los elementos relacionados.
--   - Sin política de UPDATE: un vínculo se crea o se quita, no se edita.

create or replace function pg_temp.crear_vinculo(tabla text, a text, b text)
returns void
language plpgsql
as $$
declare
  -- Nombre de la tabla de cada entidad a partir del singular usado en la columna.
  tabla_a text := case a when 'nota' then 'notas' when 'libro' then 'libros'
                         when 'recurso' then 'recursos' when 'proyecto' then 'proyectos' end;
  tabla_b text := case b when 'nota' then 'notas' when 'libro' then 'libros'
                         when 'recurso' then 'recursos' when 'proyecto' then 'proyectos' end;
begin
  execute format(
    'create table public.%1$I (
       %2$I uuid not null,
       %3$I uuid not null,
       usuario_id uuid not null default auth.uid(),
       creado_en timestamptz not null default now(),
       primary key (%2$I, %3$I),
       foreign key (%2$I, usuario_id) references public.%4$I (id, usuario_id) on delete cascade,
       foreign key (%3$I, usuario_id) references public.%5$I (id, usuario_id) on delete cascade
     )',
    tabla, a || '_id', b || '_id', tabla_a, tabla_b);

  -- La clave primaria ya indexa por el primer elemento; este índice sirve para
  -- consultar en sentido inverso (por ejemplo, "notas de este proyecto").
  execute format('create index %1$s_%2$s_idx on public.%1$I (%2$I, usuario_id)', tabla, b || '_id');

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

select pg_temp.crear_vinculo('nota_proyecto', 'nota', 'proyecto');
select pg_temp.crear_vinculo('nota_libro', 'nota', 'libro');
select pg_temp.crear_vinculo('nota_recurso', 'nota', 'recurso');
select pg_temp.crear_vinculo('libro_proyecto', 'libro', 'proyecto');
select pg_temp.crear_vinculo('recurso_proyecto', 'recurso', 'proyecto');
select pg_temp.crear_vinculo('recurso_libro', 'recurso', 'libro');
