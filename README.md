# Estudio de Belleza Marly Laverde — Sitio web

Sitio web profesional del Estudio de Belleza Marly Laverde.
**Fase 1: sitio público** (catálogo de servicios y productos, galería,
integración con WhatsApp y solicitud de citas).

Construido con **Next.js + Tailwind CSS**.

---

## 🌸 Guía rápida (para editar el contenido)

No necesitas saber programar para cambiar el contenido. Todo está en la
carpeta `src/data/`:

| Quiero cambiar... | Abre este archivo |
|---|---|
| Teléfono, redes, horarios, textos generales | `src/data/config.ts` |
| Servicios, precios, categorías | `src/data/servicios.ts` |
| Productos | `src/data/productos.ts` |
| Fotos de la galería | `src/data/galeria.ts` (y carpeta `public/galeria/`) |

Cada archivo tiene instrucciones escritas al inicio. Cambia solo el texto
entre comillas.

> ⚠️ Los precios, servicios y productos incluidos son **ejemplos**.
> Reemplázalos por los reales del estudio.

---

## 💻 Ejecutar el sitio en tu computador

Requisitos: tener instalado **Node.js** (ya instalado).

1. Instalar dependencias (solo la primera vez):
   ```bash
   npm install
   ```
2. Iniciar el sitio en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador: http://localhost:3000

---

## 🚀 Publicar en internet (Vercel)

1. Crear una cuenta gratuita en https://vercel.com
2. Subir este proyecto a GitHub (o importarlo directamente en Vercel).
3. Vercel detecta Next.js automáticamente y publica el sitio.

Costo: **gratis** en el plan inicial.

---

## 🗺️ Próximas fases (según el plan)

- **Fase 2:** Panel administrativo + agenda de citas + gestión de clientas (CRM).
- **Fase 3:** Seguimiento de retoques + registro de ventas + reportes.
- **Fase 4:** Portal de clientas + automatización de WhatsApp + app (PWA).

---

## 📞 Datos del negocio

- WhatsApp: +57 316 766 4920
- Instagram / Facebook / TikTok: configurados en `src/data/config.ts`
