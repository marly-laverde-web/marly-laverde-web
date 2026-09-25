-- ================================================================
--  MIGRACIÓN 03 — Módulo de Compras (costos y gastos)
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN)
--  una sola vez. Es seguro re-ejecutarlo.
-- ================================================================

create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  descripcion text not null,
  categoria text default '',
  valor integer not null,
  notas text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_compras_fecha on compras (fecha);

alter table compras enable row level security;
drop policy if exists "admin compras" on compras;
create policy "admin compras" on compras
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
