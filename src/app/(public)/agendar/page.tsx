import type { Metadata } from "next";
import { site } from "@/data/config";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { obtenerServicios } from "@/lib/datos";
import FormularioCita from "@/components/FormularioCita";
import ReservaAgenda from "@/components/ReservaAgenda";
import TituloSeccion from "@/components/TituloSeccion";
import { IconClock, IconWhatsApp, IconSparkle } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Agendar cita",
  description:
    "Solicita tu cita en línea. Elige servicio, fecha y hora disponible.",
};

export const dynamic = "force-dynamic";

export default async function AgendarPage() {
  const conAgenda = supabaseConfigurado();
  const servicios = conAgenda ? await obtenerServicios() : [];

  return (
    <section className="contenedor py-16">
      <TituloSeccion
        kicker="Reserva"
        titulo="Agenda tu cita"
        subtitulo={
          conAgenda
            ? "Elige tu servicio, la fecha y una de las horas disponibles. ¡Así de fácil!"
            : "Completa el formulario y te confirmaremos disponibilidad por WhatsApp."
        }
      />

      <div className="mx-auto mt-12 grid max-w-4xl gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Información lateral */}
        <aside className="space-y-6">
          <div className="rounded-2xl bg-sand/60 p-6">
            <h3 className="flex items-center gap-2 font-serif text-xl text-ink">
              <IconSparkle className="h-5 w-5 text-rose" />
              ¿Cómo funciona?
            </h3>
            <ol className="mt-4 space-y-3 text-sm text-muted">
              {(conAgenda
                ? [
                    "Elige el servicio que deseas.",
                    "Selecciona la fecha y una hora disponible.",
                    "Deja tus datos y confirma tu cita.",
                  ]
                : [
                    "Completa tus datos y el servicio que deseas.",
                    "Se abre WhatsApp con tu solicitud lista para enviar.",
                    "Confirmamos tu cita y disponibilidad. ¡Listo!",
                  ]
              ).map((paso, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-line p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg text-ink">
              <IconClock className="h-5 w-5 text-rose" />
              Horarios de atención
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {site.horarios.map((hr) => (
                <li key={hr.dia} className="flex justify-between gap-4">
                  <span className="font-medium text-ink/90">{hr.dia}</span>
                  <span className="text-right">{hr.horas}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#25d366]/10 p-4 text-sm text-ink">
            <IconWhatsApp className="h-6 w-6 shrink-0 text-[#25d366]" />
            <span>
              ¿Prefieres escribirnos directamente? <br />
              <strong>{site.telefonoVisible}</strong>
            </span>
          </div>
        </aside>

        {/* Reserva o formulario */}
        <div className="rounded-2xl border border-line bg-white/60 p-6 sm:p-8">
          {conAgenda ? (
            <ReservaAgenda servicios={servicios} />
          ) : (
            <FormularioCita />
          )}
        </div>
      </div>
    </section>
  );
}
