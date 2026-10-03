-- ================================================================
--  MIGRACIÓN 09 — Abonos a cuentas por cobrar (ventas a crédito)
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN).
--  Es seguro re-ejecutarlo.
-- ================================================================

create table if not exists abonos_credito (
  id uuid primary key default gen_random_uuid(),
  grupo_clave text not null,            -- identifica la deuda (cita_id o cliente+fecha)
  cliente_nombre text default '',
  fecha date not null,                  -- cuándo abonó
  valor integer not null,               -- cuánto abonó
  medio_pago text not null default 'efectivo',
  notas text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_abonos_credito_grupo on abonos_credito (grupo_clave);

alter table abonos_credito enable row level security;

drop policy if exists "admin abonos_credito" on abonos_credito;
create policy "admin abonos_credito" on abonos_credito
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
