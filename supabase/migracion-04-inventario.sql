-- ================================================================
--  MIGRACIÓN 04 — Inventario (costo, stock) y utilidad de productos
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN)
--  una sola vez. Es seguro re-ejecutarlo.
-- ================================================================

-- Costo (valor de compra) y stock en productos
alter table productos add column if not exists costo integer default 0;
alter table productos add column if not exists stock integer default 0;

-- Vincular la venta al producto y guardar su costo al momento de la venta
alter table ventas add column if not exists producto_id uuid references productos(id) on delete set null;
alter table ventas add column if not exists costo_unitario integer default 0;
