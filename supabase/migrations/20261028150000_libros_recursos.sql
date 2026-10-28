-- Campos definitivos de libros y recursos (cambio libros-recursos-menu-inicio, design D1).
-- Decididos por el usuario el 2026-10-28 (§2.3 y §2.4 del documento de especificación).
-- Sin pérdida de datos: las notas bibliográficas pasan a ser la descripción.

alter table public.libros rename column notas_bibliograficas to descripcion;

alter table public.libros
  add column isbn text check (isbn is null or isbn ~ '^([0-9]{9}[0-9X]|[0-9]{13})$'),
  add column estado_lectura text check (estado_lectura is null or estado_lectura in ('por_leer', 'leyendo', 'leido')),
  -- Portada subida (ruta en el bucket privado «imagenes») o desde una dirección web; nunca las dos.
  add column portada_ruta text,
  add column portada_url text check (portada_url is null or portada_url ~* '^https?://'),
  add constraint libros_una_portada check (portada_ruta is null or portada_url is null);

alter table public.recursos
  add column tipo text not null default 'otro'
    check (tipo in ('articulo', 'pagina_web', 'video', 'podcast', 'documento', 'curso', 'audio', 'otro')),
  add column fecha_publicacion date;

-- La búsqueda usa la descripción de los libros (antes «notas bibliográficas»). Misma función,
-- redefinida porque su cuerpo guarda el nombre antiguo de la columna.
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
           concat_ws(' ', l.autores, l.descripcion),
           concat_ws(' · ', l.autores, l.descripcion)
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
