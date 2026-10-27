-- Búsqueda global (cambio secciones-citas-etiquetas-glosario-busqueda, design D5).
-- security invoker: se aplica la RLS del usuario, así que nunca devuelve contenido ajeno.
-- Campos por tipo según la spec busqueda; la editorial y la dirección web no se incluyen.
-- Coincidencia sin mayúsculas ni tildes y por inicio de palabra; orden por relevancia
-- (el título pesa más). Una fila por elemento: cada uno aparece una sola vez.

create or replace function public.buscar(consulta text, filtro text default null)
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
  documentos as (
    select 'proyecto'::text as tipo, p.id, p.nombre as titulo,
           p.nombre as principal, coalesce(p.descripcion, '') as resto,
           coalesce(p.descripcion, '') as cuerpo
      from public.proyectos p
    union all
    select 'nota', n.id, n.titulo, n.titulo, n.contenido_texto, n.contenido_texto
      from public.notas n
    union all
    select 'libro', l.id, l.titulo, l.titulo,
           concat_ws(' ', l.autores, l.notas_bibliograficas),
           concat_ws(' · ', l.autores, l.notas_bibliograficas)
      from public.libros l
    union all
    select 'recurso', r.id, r.titulo, r.titulo,
           concat_ws(' ', r.autor, r.descripcion),
           concat_ws(' · ', r.autor, r.descripcion)
      from public.recursos r
    union all
    select 'cita', c.id, left(c.texto, 80), '',
           concat_ws(' ', c.texto, c.autor, c.fuente),
           concat_ws(' — ', c.texto, c.autor, c.fuente)
      from public.citas c
    union all
    select 'termino', g.id, g.termino, g.termino,
           concat_ws(' ', g.definicion, g.ejemplo, g.informacion_adicional),
           concat_ws(' · ', g.definicion, g.ejemplo, g.informacion_adicional)
      from public.glosario g
  ),
  vectores as (
    select d.tipo, d.id, d.titulo, d.cuerpo,
           setweight(to_tsvector('simple', public.normalizar(d.principal)), 'A')
             || setweight(to_tsvector('simple', public.normalizar(d.resto)), 'B') as vector
      from documentos d
     where filtro is null or d.tipo = filtro
  )
  select v.tipo, v.id, v.titulo, v.cuerpo, ts_rank(v.vector, t.q) as rango
    from vectores v, terminos t
   where t.q is not null and v.vector @@ t.q
   order by rango desc, v.titulo
   limit 50;
$$;

revoke execute on function public.buscar(text, text) from public, anon;
grant execute on function public.buscar(text, text) to authenticated;
