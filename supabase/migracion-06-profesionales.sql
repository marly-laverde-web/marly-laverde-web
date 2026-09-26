-- ================================================================
--  MIGRACIÓN 06 — Profesionales (quién realiza el servicio)
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN).
--  Es seguro re-ejecutarlo.
-- ================================================================

create table if not exists profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profesionales enable row level security;
drop policy if exists "admin profesionales" on profesionales;
create policy "admin profesionales" on profesionales
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Nombre del profesional que realizó el servicio (se guarda en cada venta)
alter table ventas add column if not exists profesional_nombre text default '';

-- Crear a Marly Laverde por defecto (solo si la lista está vacía)
insert into profesionales (nombre)
select 'Marly Laverde'
where not exists (select 1 from profesionales);
