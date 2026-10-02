-- ================================================================
--  MIGRACIÓN 08 — Ventas a crédito (cuentas por cobrar)
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN).
--  Es seguro re-ejecutarlo.
-- ================================================================

-- Permitir el medio de pago "credito"
alter table ventas drop constraint if exists ventas_medio_pago_check;
alter table ventas add constraint ventas_medio_pago_check
  check (medio_pago in ('efectivo','transferencia','datafono','credito'));

-- Datos del crédito
alter table ventas add column if not exists fecha_pago_credito date;      -- cuándo prometió pagar
alter table ventas add column if not exists credito_pagado boolean not null default false;
alter table ventas add column if not exists credito_pago_fecha date;      -- cuándo pagó realmente
alter table ventas add column if not exists credito_medio_pago text;      -- con qué pagó al final
