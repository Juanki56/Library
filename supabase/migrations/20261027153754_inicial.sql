-- Migración inicial: utilidades comunes del esquema.
-- Las tablas de contenido llegan en migraciones posteriores (tareas 3.1 y 3.2).

-- Mantiene la columna actualizado_en al día en cualquier tabla que use el trigger.
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;
