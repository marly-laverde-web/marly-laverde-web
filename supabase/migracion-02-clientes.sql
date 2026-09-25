-- ================================================================
--  MIGRACIÓN 02 — Fichas de clientas (CRM) + teléfono en ventas
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN)
--  una sola vez. Es seguro re-ejecutarlo (usa IF NOT EXISTS).
-- ================================================================

-- Tabla de clientas
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text unique,               -- clave para identificar a la clienta
  fecha_nacimiento date,              -- cumpleaños (opcional)
  notas text default '',
  created_at timestamptz not null default now()
);

-- Teléfono en ventas (para vincular la venta con la clienta)
alter table ventas add column if not exists cliente_telefono text default '';

-- Seguridad
alter table clientes enable row level security;
drop policy if exists "admin clientes" on clientes;
create policy "admin clientes" on clientes
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Backfill: crea fichas de clientas a partir de las citas existentes
insert into clientes (nombre, telefono)
select distinct on (cliente_telefono) cliente_nombre, cliente_telefono
from citas
where coalesce(cliente_telefono, '') <> ''
order by cliente_telefono, created_at desc
on conflict (telefono) do nothing;
