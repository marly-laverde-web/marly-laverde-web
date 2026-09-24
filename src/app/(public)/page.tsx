import Link from "next/link";
import { site, waLink, mensajeWhatsAppGeneral } from "@/data/config";
import { obtenerServicios, obtenerProductos, obtenerGaleria } from "@/lib/datos";
import TituloSeccion from "@/components/TituloSeccion";
import ServicioCard from "@/components/ServicioCard";
import ProductoCard from "@/components/ProductoCard";
import MediaElegante from "@/components/MediaElegante";
import { IconWhatsApp, IconArrowRight, IconSparkle } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [servicios, productos, galeria] = await Promise.all([
    obtenerServicios(),
    obtenerProductos(),
    obtenerGaleria(),
  ]);
  const destacados = servicios.filter((s) => s.destacado).slice(0, 6);
  const productosDestacados = productos.filter((p) => p.destacado).slice(0, 3);
  const previewGaleria = galeria.slice(0, 6);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-rose-soft/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-sand blur-3xl" />

        <div className="contenedor relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          {/* Texto */}
          <div className="aparecer">
            <span className="kicker">{site.subtitulo}</span>
            <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Realza tu belleza con un{" "}
              <span className="text-rose">color a tu medida</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              {site.eslogan}. Un espacio exclusivo donde cada detalle está pensado
              para ti.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agendar" className="btn-primario">
                Agendar cita
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink(mensajeWhatsAppGeneral)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <IconWhatsApp className="h-5 w-5" />
                WhatsApp
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2">
                <IconSparkle className="h-4 w-4 text-gold" />
                Especialistas en colorimetría
              </span>
              <span className="flex items-center gap-2">
                <IconSparkle className="h-4 w-4 text-gold" />
                Atención personalizada
              </span>
            </div>
          </div>

          {/* Collage decorativo */}
          <div className="aparecer grid grid-cols-2 gap-4">
            <div className="mt-8 space-y-4">
              <div className="h-48 overflow-hidden rounded-2xl shadow-sm">
                <MediaElegante alt="Colorimetría" etiqueta="Especialidad" titulo="Colorimetría" />
              </div>
              <div className="h-36 overflow-hidden rounded-2xl shadow-sm">
                <MediaElegante alt="Manicure" etiqueta="Belleza" titulo="Manicure" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-36 overflow-hidden rounded-2xl shadow-sm">
                <MediaElegante alt="Tratamientos" etiqueta="Cuidado" titulo="Tratamientos" />
              </div>
              <div className="h-48 overflow-hidden rounded-2xl shadow-sm">
                <MediaElegante alt="Maquillaje" etiqueta="Realza" titulo="Maquillaje" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ESPECIALIDAD ============ */}
      <section className="contenedor py-16">
        <div className="grid items-center gap-12 rounded-3xl bg-sand/60 p-8 sm:p-12 lg:grid-cols-2">
          <div className="h-64 overflow-hidden rounded-2xl lg:h-80">
            <MediaElegante alt="Nuestra especialidad" etiqueta="Marly Laverde" titulo="Color & Cabello" />
          </div>
          <div>
            <span className="kicker">Nuestra especialidad</span>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              Colorimetría y tratamientos capilares
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Nos especializamos en transformar y cuidar tu cabello con técnicas
              profesionales de color: balayage, mechas, corrección de color y
              tratamientos que devuelven vida, brillo y salud a tu melena.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Diagnóstico y color personalizado",
                "Productos de alta calidad",
                "Seguimiento y recomendaciones de cuidado",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-ink/90">
                  <IconSparkle className="h-4 w-4 shrink-0 text-rose" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/servicios" className="btn-secundario mt-8">
              Ver todos los servicios
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SERVICIOS DESTACADOS ============ */}
      <section className="contenedor py-16">
        <TituloSeccion
          kicker="Servicios"
          titulo="Lo más solicitado"
          subtitulo="Una selección de nuestros servicios favoritos. Explora el catálogo completo para conocer todo lo que ofrecemos."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((s) => (
            <ServicioCard key={s.id} servicio={s} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/servicios" className="btn-primario">
            Ver catálogo completo
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============ GALERÍA ============ */}
      <section className="contenedor py-16">
        <TituloSeccion
          kicker="Galería"
          titulo="Nuestros trabajos"
          subtitulo="Resultados reales que hablan por sí solos."
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {previewGaleria.map((f) => (
            <div
              key={f.id}
              className="aspect-square overflow-hidden rounded-xl shadow-sm"
            >
              <MediaElegante
                imagen={f.imagen}
                alt={f.titulo}
                etiqueta={f.categoria}
                titulo={f.titulo}
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/galeria" className="btn-secundario">
            Ver galería completa
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============ PRODUCTOS ============ */}
      {productosDestacados.length > 0 && (
        <section className="contenedor py-16">
          <TituloSeccion
            kicker="Tienda"
            titulo="Productos recomendados"
            subtitulo="Lleva a casa el cuidado profesional que tu cabello merece."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productosDestacados.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/productos" className="btn-secundario">
              Ver todos los productos
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ============ CTA FINAL ============ */}
      <section className="contenedor py-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <TituloSeccion
              kicker="Reserva tu espacio"
              titulo="¿Lista para tu próxima cita?"
              subtitulo="Escríbenos por WhatsApp o agenda en línea. Estaremos encantadas de atenderte."
              claro
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/agendar" className="btn-primario">
                Agendar cita
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink(mensajeWhatsAppGeneral)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <IconWhatsApp className="h-5 w-5" />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
