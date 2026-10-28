-- Menciones entre notas (cambio editor-fase2-referencias, design D4).
--
-- Una fila por cada nota (origen) que contiene al menos una referencia a otra (destino).
-- Garantías:
--   - Clave primaria (origen, destino): una nota aparece una sola vez aunque referencie varias veces.
--   - Claves foráneas compuestas con usuario_id: solo notas del mismo usuario.
--   - ON DELETE CASCADE: al eliminar una nota desaparecen sus menciones, nunca otras notas.
--   - Solo lectura para el usuario: la tabla la mantiene el trigger desde el contenido guardado.

create table public.referencias_nota (
  origen_id uuid not null,
  destino_id uuid not null,
  usuario_id uuid not null,
  creado_en timestamptz not null default now(),
  primary key (origen_id, destino_id),
  foreign key (origen_id, usuario_id) references public.notas (id, usuario_id) on delete cascade,
  foreign key (destino_id, usuario_id) references public.notas (id, usuario_id) on delete cascade,
  check (origen_id <> destino_id)
);

create index referencias_nota_destino_idx on public.referencias_nota (destino_id, usuario_id);

alter table public.referencias_nota enable row level security;
create policy "propietario_lee" on public.referencias_nota for select to authenticated
  using (usuario_id = (select auth.uid()));

-- Recalcula las menciones de la nota guardada a partir de los nodos «referencia» de su
-- contenido. security definer porque el usuario no tiene permiso de escritura en la tabla;
-- por eso filtra explícitamente por el mismo usuario_id: un id ajeno nunca produce una fila.
create or replace function public.actualizar_referencias_nota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.referencias_nota where origen_id = new.id;
  insert into public.referencias_nota (origen_id, destino_id, usuario_id)
  select new.id, n.id, new.usuario_id
    from (
      select distinct r #>> '{}' as id_texto
        from jsonb_path_query(
               new.contenido,
               'lax $.** ? (@.type == "referencia" && @.attrs.tipo == "nota").attrs.id'
             ) as r
    ) as ref
    join public.notas n on n.id::text = ref.id_texto and n.usuario_id = new.usuario_id
   where n.id <> new.id;
  return null;
end;
$$;

revoke execute on function public.actualizar_referencias_nota() from public, anon, authenticated;

create trigger notas_actualizar_referencias
  after insert or update of contenido on public.notas
  for each row execute function public.actualizar_referencias_nota();
