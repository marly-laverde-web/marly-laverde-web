-- ================================================================
--  MIGRACIÓN 07 — Resumen del trabajo (historial técnico por cita)
-- ================================================================
--  Ejecuta este archivo en Supabase (SQL Editor → New query → RUN).
--  Es seguro re-ejecutarlo.
-- ================================================================

-- Notas técnicas de lo que se le realizó a la clienta en esa cita
-- (mezclas de color, esmaltes, productos aplicados, observaciones...)
alter table citas add column if not exists resumen_trabajo text default '';
