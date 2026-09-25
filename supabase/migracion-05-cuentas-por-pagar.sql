-- ================================================================
--  MIGRACIÓN 05 — Cuentas por pagar (facturas de proveedores + abonos)
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN).
--  Es seguro re-ejecutarlo.
-- ================================================================

create table if not exists facturas_pagar (
  id uuid primary key default gen_random_uuid(),
  proveedor text not null,
  numero text default '',
  descripcion text default '',
  fecha_compra date,
  fecha_vencimiento date not null,
  valor_total integer not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','pagada')),
  notas text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_facturas_venc on facturas_pagar (fecha_vencimiento);

create table if not exists abonos (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references facturas_pagar(id) on delete cascade,
  fecha date not null,
  valor integer not null,
  notas text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_abonos_factura on abonos (factura_id);

alter table facturas_pagar enable row level security;
alter table abonos enable row level security;

drop policy if exists "admin facturas_pagar" on facturas_pagar;
create policy "admin facturas_pagar" on facturas_pagar
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "admin abonos" on abonos;
create policy "admin abonos" on abonos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
