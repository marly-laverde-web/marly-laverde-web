# Estudio de Belleza Marly Laverde — Plataforma web

Plataforma web del Estudio de Belleza Marly Laverde con:
- **Sitio público:** catálogo de servicios y productos, galería, WhatsApp y
  **agenda en línea** (las clientas ven fechas y horas disponibles).
- **Panel de administración** (con usuario y contraseña) para crear servicios,
  productos, subir fotos, gestionar la agenda y registrar ventas.

Construido con **Next.js + Tailwind CSS + Supabase**.

---

## ⚡ Cómo dejarlo funcionando

Sigue la guía paso a paso del archivo **[`GUIA-DESPLIEGUE.md`](GUIA-DESPLIEGUE.md)**:
conectar Supabase (base de datos gratis), crear el usuario de Marly y publicar
en Vercel. Toma ~15 minutos y no requiere saber programar.

---

## 🌸 ¿Dónde se administra el contenido?

Una vez conectado, **todo se maneja desde el panel** en `/admin`
(entrando con el usuario de Marly):

| Sección del panel | Qué hace |
|---|---|
| **Panel** | Resumen del día: citas, ingresos, indicadores |
| **Agenda** | Ver, crear y gestionar citas; cambiar su estado |
| **Servicios** | Crear/editar servicios, precio, **duración** y foto |
| **Productos** | Crear/editar productos y fotos |
| **Galería** | Subir fotos de los trabajos |
| **Ventas** | Registrar cobros (efectivo / transferencia / datáfono) |
| **Configuración** | Horario de atención, intervalos y días bloqueados |

Los textos generales (teléfono, redes, horarios mostrados) están en
`src/data/config.ts`.

> ⚠️ Los servicios/productos que trae al inicio son **ejemplos**. Reemplázalos
> por los reales desde el panel.

---

## 💻 Ejecutar en tu computador

```bash
npm install       # solo la primera vez
npm run dev       # inicia el sitio
```
Abre http://localhost:3000 (sitio) y http://localhost:3000/admin (panel).
Necesitas el archivo `.env.local` configurado (ver la guía de despliegue).

---

## 🗺️ Fases del proyecto

- ✅ **Fase 1:** Sitio público (catálogos, galería, WhatsApp).
- ✅ **Fase 2:** Panel de administración + agenda con disponibilidad + ventas.
- **Fase 3 (siguiente):** Seguimiento automático de retoques + reportes
  exportables (Excel/CSV) + ficha/CRM de clientas.
- **Fase 4:** Portal de clientas + automatización de WhatsApp (Business API) + app (PWA).

---

## 📞 Datos del negocio

- WhatsApp: +57 316 766 4920
- Instagram / Facebook / TikTok: configurados en `src/data/config.ts`
