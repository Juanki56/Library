-- Imágenes de las notas (cambio editor-fase3-imagenes-videos, design D2).
--
-- Bucket privado: nadie las ve sin sesión, ni con el enlace. Cada usuario solo puede leer,
-- subir y borrar dentro de su carpeta (<usuario>/<nota>/<archivo>). Sin SVG: puede contener código.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', false, 5242880, array['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

create policy "imagenes_propietario_lee" on storage.objects for select to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "imagenes_propietario_sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "imagenes_propietario_borra" on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Registro de cada imagen subida y su nota, para borrar las que dejan de usarse (design D8).
-- La cascada al eliminar la nota borra solo estas filas; los archivos los borra el servicio.
create table public.imagenes_nota (
  ruta text primary key,
  nota_id uuid not null,
  usuario_id uuid not null default auth.uid(),
  creado_en timestamptz not null default now(),
  foreign key (nota_id, usuario_id) references public.notas (id, usuario_id) on delete cascade,
  check (split_part(ruta, '/', 1) = usuario_id::text and split_part(ruta, '/', 2) = nota_id::text)
);

create index imagenes_nota_nota_idx on public.imagenes_nota (nota_id, usuario_id);

alter table public.imagenes_nota enable row level security;
create policy "propietario_lee" on public.imagenes_nota for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "propietario_crea" on public.imagenes_nota for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "propietario_borra" on public.imagenes_nota for delete to authenticated
  using (usuario_id = (select auth.uid()));
