-- ================================================================
--  MIGRACIÓN 01 — Seguimiento de retoques
-- ================================================================
--  Ejecuta este archivo SOLO si ya habías corrido schema.sql ANTES
--  de que existiera la tabla de retoques. Si vas a correr schema.sql
--  por primera vez, NO necesitas este archivo (ya está incluido).
-- ================================================================

create table if not exists retoques (
  id uuid primary key default gen_random_uuid(),
  cliente_nombre text not null,
  cliente_telefono text default '',
  servicio_id uuid references servicios(id) on delete set null,
  servicio_nombre text not null,
  fecha_retoque date not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','recordada','agendada','cancelada')),
  cita_origen_id uuid references citas(id) on delete set null,
  notas text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_retoques_fecha on retoques (fecha_retoque);

alter table retoques enable row level security;

drop policy if exists "admin retoques" on retoques;
create policy "admin retoques" on retoques
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
