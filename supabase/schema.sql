-- ================================================================
--  ESQUEMA DE BASE DE DATOS — Estudio de Belleza Marly Laverde
-- ================================================================
--  Cómo usarlo:
--   1. Crea un proyecto gratis en https://supabase.com
--   2. Entra a  SQL Editor  →  New query
--   3. Pega TODO este archivo y presiona  RUN
--  Esto crea las tablas, la seguridad y datos de ejemplo.
-- ================================================================

-- Extensión para UUIDs
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
--  TABLAS
-- ---------------------------------------------------------------

create table if not exists servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null,
  descripcion text default '',
  precio integer,                       -- en pesos; null = "Consultar"
  duracion_min integer not null default 60,
  intervalo_retoque_dias integer,       -- para seguimiento de retoques (fase 3)
  destacado boolean not null default false,
  activo boolean not null default true,
  imagen_url text,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null default 'General',
  descripcion text default '',
  precio integer,
  referencia text,
  disponible boolean not null default true,
  destacado boolean not null default false,
  activo boolean not null default true,
  imagen_url text,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists galeria (
  id uuid primary key default gen_random_uuid(),
  titulo text not null default '',
  categoria text not null default 'General',
  imagen_url text not null,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- Horario semanal (0 = Domingo ... 6 = Sábado)
create table if not exists horarios (
  dia_semana integer primary key check (dia_semana between 0 and 6),
  abierto boolean not null default true,
  hora_inicio time not null default '09:00',
  hora_fin time not null default '19:00'
);

-- Bloqueos puntuales (festivos, vacaciones, etc.)
create table if not exists bloqueos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora_inicio time,                     -- null = todo el día
  hora_fin time,
  motivo text default '',
  created_at timestamptz not null default now()
);

-- Configuración general (una sola fila, id = 1)
create table if not exists configuracion (
  id integer primary key default 1 check (id = 1),
  intervalo_slots integer not null default 30,   -- minutos entre horarios ofrecidos
  anticipacion_horas integer not null default 2  -- mínimo de horas para reservar
);

-- Citas / agenda
create table if not exists citas (
  id uuid primary key default gen_random_uuid(),
  cliente_nombre text not null,
  cliente_telefono text default '',
  servicio_id uuid references servicios(id) on delete set null,
  servicio_nombre text not null,
  fecha date not null,
  hora_inicio time not null,
  duracion_min integer not null default 60,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','confirmada','atendida','cancelada','no_asistio')),
  notas text default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_citas_fecha on citas (fecha);

-- Ventas (servicios y/o productos)
create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  cliente_nombre text default '',
  descripcion text not null,
  cantidad integer not null default 1,
  total integer not null,
  medio_pago text not null
    check (medio_pago in ('efectivo','transferencia','datafono')),
  cita_id uuid references citas(id) on delete set null,
  notas text default ''
);
create index if not exists idx_ventas_fecha on ventas (fecha);

-- Seguimiento de retoques / mantenimientos
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

-- ---------------------------------------------------------------
--  SEGURIDAD (Row Level Security)
-- ---------------------------------------------------------------
alter table servicios     enable row level security;
alter table productos     enable row level security;
alter table galeria       enable row level security;
alter table horarios      enable row level security;
alter table bloqueos      enable row level security;
alter table configuracion enable row level security;
alter table citas         enable row level security;
alter table ventas        enable row level security;
alter table retoques      enable row level security;

-- Lectura pública (catálogos y horarios los ve todo el mundo)
create policy "lectura publica servicios"     on servicios     for select using (true);
create policy "lectura publica productos"      on productos     for select using (true);
create policy "lectura publica galeria"        on galeria       for select using (true);
create policy "lectura publica horarios"       on horarios      for select using (true);
create policy "lectura publica bloqueos"       on bloqueos      for select using (true);
create policy "lectura publica configuracion"  on configuracion for select using (true);

-- Escritura solo para usuarios autenticados (Marly / administradoras)
create policy "admin servicios"     on servicios     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin productos"      on productos     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin galeria"        on galeria       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin horarios"       on horarios      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin bloqueos"       on bloqueos      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin configuracion"  on configuracion for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin citas"          on citas         for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin ventas"         on ventas        for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin retoques"       on retoques      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- (Las citas creadas por clientas se insertan desde el servidor con la clave de
--  servicio, que omite RLS de forma segura. Por eso no hay política anónima.)

-- ---------------------------------------------------------------
--  ALMACENAMIENTO DE IMÁGENES
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

create policy "imagenes lectura publica"
  on storage.objects for select
  using (bucket_id = 'imagenes');

create policy "imagenes subir autenticado"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes');

create policy "imagenes actualizar autenticado"
  on storage.objects for update to authenticated
  using (bucket_id = 'imagenes');

create policy "imagenes borrar autenticado"
  on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes');

-- ---------------------------------------------------------------
--  DATOS INICIALES
-- ---------------------------------------------------------------

-- Configuración por defecto
insert into configuracion (id, intervalo_slots, anticipacion_horas)
values (1, 30, 2)
on conflict (id) do nothing;

-- Horario semanal por defecto (Lun-Vie 9-19, Sáb 8-18, Dom cerrado)
insert into horarios (dia_semana, abierto, hora_inicio, hora_fin) values
  (0, false, '09:00', '19:00'),  -- Domingo
  (1, true,  '09:00', '19:00'),  -- Lunes
  (2, true,  '09:00', '19:00'),  -- Martes
  (3, true,  '09:00', '19:00'),  -- Miércoles
  (4, true,  '09:00', '19:00'),  -- Jueves
  (5, true,  '09:00', '19:00'),  -- Viernes
  (6, true,  '08:00', '18:00')   -- Sábado
on conflict (dia_semana) do nothing;

-- Servicios de ejemplo (edítalos desde el panel de administración)
insert into servicios (nombre, categoria, descripcion, precio, duracion_min, intervalo_retoque_dias, destacado, orden) values
  ('Balayage', 'Colorimetría', 'Iluminación a mano alzada para un degradado natural y luminoso.', 250000, 180, 90, true, 1),
  ('Mechas / Iluminación', 'Colorimetría', 'Mechas finas o gruesas para dar luz y dimensión.', 220000, 180, 75, true, 2),
  ('Tinte / Color completo', 'Colorimetría', 'Aplicación de color uniforme de raíz a puntas.', 120000, 120, 30, false, 3),
  ('Retoque de raíz', 'Colorimetría', 'Mantenimiento del color en la raíz.', 90000, 90, 30, false, 4),
  ('Hidratación profunda', 'Tratamientos capilares', 'Devuelve humedad y suavidad al cabello.', 70000, 60, 21, true, 5),
  ('Botox capilar', 'Tratamientos capilares', 'Reconstrucción y reducción de frizz.', 130000, 120, 60, false, 6),
  ('Keratina / Alisado', 'Tratamientos capilares', 'Alisado y control de volumen con brillo.', 180000, 150, 90, false, 7),
  ('Diseño de cejas', 'Cejas y pestañas', 'Diseño y depilación según tu rostro.', 30000, 30, 21, true, 8),
  ('Lifting de pestañas', 'Cejas y pestañas', 'Curvatura natural que realza la mirada.', 70000, 60, 45, false, 9),
  ('Maquillaje social', 'Maquillaje', 'Maquillaje profesional para eventos.', 90000, 60, null, true, 10),
  ('Manicure semipermanente', 'Manicure', 'Esmaltado de larga duración.', 45000, 60, 21, true, 11),
  ('Pedicure spa', 'Pedicure', 'Exfoliación, hidratación y masaje.', 60000, 75, 30, false, 12)
on conflict do nothing;

-- Productos de ejemplo
insert into productos (nombre, categoria, descripcion, precio, destacado, orden) values
  ('Shampoo matizador', 'Cuidado del color', 'Neutraliza tonos amarillos.', 55000, true, 1),
  ('Mascarilla de nutrición', 'Tratamiento', 'Hidratación intensa.', 60000, true, 2),
  ('Sérum de brillo', 'Styling', 'Acabado sedoso y antifrizz.', 48000, true, 3),
  ('Protector térmico', 'Styling', 'Protege del calor de la plancha.', 45000, false, 4)
on conflict do nothing;
