# 🚀 Guía para poner el sitio en línea

Esta guía te lleva de la mano para dejar el sitio **funcionando en internet**,
con el panel de administración y la agenda. Son 3 partes y toma ~15–20 minutos.

> No necesitas saber programar. Solo seguir los pasos y copiar/pegar.

---

## PARTE A — Crear la base de datos (Supabase)  ·  ~10 min

La base de datos guarda los servicios, productos, fotos, citas y ventas.
Es **gratis**.

1. Entra a **https://supabase.com** y crea una cuenta (puedes usar tu correo de Google).
2. Haz clic en **New project**.
   - Ponle un nombre (ej: `marly-laverde`).
   - Crea una contraseña para la base de datos y **guárdala**.
   - Región: elige **East US** (o la más cercana).
   - Clic en **Create new project** y espera ~2 minutos.
3. **Crear las tablas:**
   - En el menú izquierdo abre **SQL Editor** → **New query**.
   - Abre el archivo `supabase/schema.sql` de este proyecto, **copia todo** su
     contenido, pégalo y haz clic en **RUN**.
   - Debe decir “Success”. ¡Listo, ya tienes las tablas y datos de ejemplo!
4. **Crear el usuario de Marly (para entrar al panel):**
   - Menú izquierdo → **Authentication** → **Users** → **Add user** → **Create new user**.
   - Escribe el **correo** y una **contraseña** para Marly.
   - Marca/activa **Auto Confirm User** (para que pueda entrar de inmediato).
   - Clic en **Create user**.
5. **Copiar las llaves del proyecto** (las necesitarás en la Parte B y C):
   - Menú izquierdo → **Project Settings** (el engranaje) → **Data API**.
     - Copia **Project URL**.
     - Copia la llave **anon / public**.
   - Luego → **Project Settings** → **API Keys**.
     - Copia la llave **service_role** (es **secreta**, no la compartas).

---

## PARTE B — Probar en tu computador (opcional pero recomendado)

1. En la carpeta del proyecto, haz una copia del archivo `.env.local.example`
   y renómbrala como **`.env.local`**.
2. Ábrela con el Bloc de notas y pega las 3 llaves de la Parte A:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Guarda, y en la terminal ejecuta:
   ```bash
   npm run dev
   ```
4. Abre **http://localhost:3000** (sitio) y **http://localhost:3000/admin**
   (panel — entra con el correo y contraseña de Marly).

Prueba: crea un servicio, sube una foto, agenda una cita de prueba y registra
una venta. Todo debe guardarse.

---

## PARTE C — Publicar en internet (Vercel)  ·  ~10 min

Vercel es donde vivirá el sitio. Es **gratis** para empezar.

### 1. Subir el proyecto a GitHub
1. Crea una cuenta en **https://github.com**.
2. Crea un repositorio nuevo (botón **New**), por ejemplo `marly-laverde-web`
   (déjalo **Private**).
3. Sube el proyecto. Desde la terminal, en la carpeta del proyecto:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/marly-laverde-web.git
   git branch -M main
   git push -u origin main
   ```
   (GitHub te pedirá iniciar sesión la primera vez.)

### 2. Publicar en Vercel
1. Entra a **https://vercel.com** e inicia sesión **con tu cuenta de GitHub**.
2. Clic en **Add New… → Project** e **importa** el repositorio `marly-laverde-web`.
3. Antes de dar “Deploy”, abre **Environment Variables** y agrega las 3 llaves
   (las mismas de la Parte A):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Clic en **Deploy** y espera ~2 minutos.
5. Vercel te dará un enlace (ej: `marly-laverde.vercel.app`). **¡Ese es el enlace
   que puedes enviar a las clientas!**

> Después puedes conectar un dominio propio (ej: `marlylaverde.com`) desde
> Vercel → Settings → Domains.

---

## ✅ Después de publicar

- Entra a `tusitio.vercel.app/admin` con el usuario de Marly.
- En **Configuración**, ajusta el horario de atención real.
- En **Servicios** y **Productos**, reemplaza los ejemplos por los reales.
- En **Galería**, sube fotos de los trabajos.
- Comparte el enlace del sitio con tus clientas para que agenden. 💗

## 🔒 Seguridad
- La llave **service_role** es secreta: solo va en `.env.local` y en Vercel.
  Nunca la publiques ni la envíes por chat.
- Solo quien tenga usuario y contraseña puede entrar al panel.
- Supabase hace copias de seguridad automáticas de la base de datos.
