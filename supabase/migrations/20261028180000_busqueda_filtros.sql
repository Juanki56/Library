-- Filtros de la búsqueda global (cambio filtros-citas-busqueda, design D1).
-- Además del tipo: autor, etiqueta, fecha de modificación, proyecto y libro, combinables; con algún
-- filtro se puede buscar sin texto. Sigue siendo security invoker: la RLS limita todo al usuario.

drop function public.buscar(text, text);

create function public.buscar(
  consulta text,
  filtro text default null,
  autor text default null,
  etiqueta uuid default null,
  desde date default null,
  hasta date default null,
  proyecto uuid default null,
  libro uuid default null
)
returns table (tipo text, id uuid, titulo text, cuerpo text, rango real)
language sql
stable
security invoker
set search_path = ''
as $$
  with terminos as (
    select to_tsquery('simple', string_agg(palabra || ':*', ' & ')) as q
      from unnest(regexp_split_to_array(
             public.normalizar(regexp_replace(coalesce(consulta, ''), '[^[:alnum:][:space:]]', ' ', 'g')),
             ' ')) as palabra
     where palabra <> ''
  ),
  parametros as (
    select nullif(public.normalizar(coalesce(autor, '')), '') as autor_buscado,
           (nullif(btrim(coalesce(autor, '')), '') is not null or etiqueta is not null or desde is not null
             or hasta is not null or proyecto is not null or libro is not null) as hay_filtros
  ),
  documentos as (
    select 'proyecto'::text as tipo, p.id, p.nombre as titulo,
           p.nombre as principal, coalesce(p.descripcion, '') as resto,
           coalesce(p.descripcion, '') as cuerpo, null::text as autor_doc, p.actualizado_en as modificado
      from public.proyectos p
    union all
    select 'nota', n.id, n.titulo, n.titulo, n.contenido_texto, n.contenido_texto, null, n.actualizado_en
      from public.notas n
    union all
    select 'libro', l.id, l.titulo, l.titulo,
           concat_ws(' ', l.autores, l.descripcion),
           concat_ws(' · ', l.autores, l.descripcion), l.autores, l.actualizado_en
      from public.libros l
    union all
    select 'recurso', r.id, r.titulo, r.titulo,
           concat_ws(' ', r.autor, r.descripcion),
           concat_ws(' · ', r.autor, r.descripcion), r.autor, r.actualizado_en
      from public.recursos r
    union all
    select 'cita', c.id, left(c.texto, 80), '',
           concat_ws(' ', c.texto, c.autor, c.fuente),
           concat_ws(' — ', c.texto, c.autor, c.fuente), c.autor, c.actualizado_en
      from public.citas c
    union all
    select 'termino', g.id, g.termino, g.termino,
           concat_ws(' ', g.definicion, g.ejemplo, g.informacion_adicional),
           concat_ws(' · ', g.definicion, g.ejemplo, g.informacion_adicional), null, g.actualizado_en
      from public.glosario g
  ),
  filtrados as (
    select d.*
      from documentos d, parametros f
     where (filtro is null or d.tipo = filtro)
       and (f.autor_buscado is null
            or (d.autor_doc is not null and public.normalizar(d.autor_doc) like '%' || f.autor_buscado || '%'))
       and (desde is null or d.modificado >= desde)
       and (hasta is null or d.modificado < hasta + 1)
       and (etiqueta is null or case d.tipo
             when 'proyecto' then exists (select 1 from public.etiqueta_proyecto e where e.proyecto_id = d.id and e.etiqueta_id = etiqueta)
             when 'nota' then exists (select 1 from public.etiqueta_nota e where e.nota_id = d.id and e.etiqueta_id = etiqueta)
             when 'libro' then exists (select 1 from public.etiqueta_libro e where e.libro_id = d.id and e.etiqueta_id = etiqueta)
             when 'recurso' then exists (select 1 from public.etiqueta_recurso e where e.recurso_id = d.id and e.etiqueta_id = etiqueta)
             else false end)
       and (proyecto is null or case d.tipo
             when 'nota' then exists (select 1 from public.nota_proyecto v where v.nota_id = d.id and v.proyecto_id = proyecto)
             when 'libro' then exists (select 1 from public.libro_proyecto v where v.libro_id = d.id and v.proyecto_id = proyecto)
             when 'recurso' then exists (select 1 from public.recurso_proyecto v where v.recurso_id = d.id and v.proyecto_id = proyecto)
             else false end)
       and (libro is null or case d.tipo
             when 'nota' then exists (select 1 from public.nota_libro v where v.nota_id = d.id and v.libro_id = libro)
             when 'recurso' then exists (select 1 from public.recurso_libro v where v.recurso_id = d.id and v.libro_id = libro)
             when 'cita' then exists (select 1 from public.citas c where c.id = d.id and c.libro_id = libro)
             else false end)
  ),
  vectores as (
    select d.tipo, d.id, d.titulo, d.cuerpo, d.modificado,
           setweight(to_tsvector('simple', public.normalizar(d.principal)), 'A')
             || setweight(to_tsvector('simple', public.normalizar(d.resto)), 'B') as vector
      from filtrados d
  )
  select v.tipo, v.id, v.titulo, v.cuerpo, coalesce(ts_rank(v.vector, t.q), 0) as rango
    from vectores v, terminos t, parametros f
   where (t.q is not null and v.vector @@ t.q)
      or (t.q is null and f.hay_filtros)
   order by rango desc, v.modificado desc, v.titulo
   limit 50;
$$;

revoke execute on function public.buscar(text, text, text, uuid, date, date, uuid, uuid) from public, anon;
grant execute on function public.buscar(text, text, text, uuid, date, date, uuid, uuid) to authenticated;
