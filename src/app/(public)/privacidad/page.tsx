import type { Metadata } from "next";
import { site } from "@/data/config";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos",
  description:
    "Política de tratamiento de datos personales conforme a la Ley 1581 de 2012 de Colombia.",
};

export default function PrivacidadPage() {
  return (
    <section className="contenedor max-w-3xl py-16">
      <span className="kicker">Legal</span>
      <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
        Política de tratamiento de datos personales
      </h1>
      <p className="mt-3 text-sm text-muted">
        Conforme a la Ley 1581 de 2012 y el Decreto 1074 de 2015 (Colombia).
      </p>

      <div className="prose-belleza mt-10 space-y-8 text-[0.95rem] leading-relaxed text-ink/90">
        <div className="rounded-xl bg-sand/60 p-4 text-sm text-muted">
          <strong className="text-ink">Nota:</strong> Este documento es una
          plantilla base. Antes de publicarlo, complétalo con los datos legales
          del establecimiento (razón social, NIT, dirección y correo) y, si es
          posible, revísalo con un asesor jurídico.
        </div>

        <section>
          <h2 className="font-serif text-xl text-ink">1. Responsable del tratamiento</h2>
          <p className="mt-2">
            {site.nombre} {site.subtitulo} (en adelante, «el Estudio») es
            responsable del tratamiento de los datos personales que recolecta de
            sus clientas y usuarios.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted">
            <li>Razón social / NIT: [completar]</li>
            <li>
              Dirección: {site.direccion || "[completar]"}
              {site.ciudad ? `, ${site.ciudad}` : ""}
            </li>
            <li>Teléfono / WhatsApp: {site.telefonoVisible}</li>
            <li>Correo electrónico: {site.email || "[completar]"}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">2. Datos que recolectamos</h2>
          <p className="mt-2">
            Recolectamos únicamente los datos necesarios para prestar nuestros
            servicios, tales como: nombres y apellidos, número de celular, fecha
            de cumpleaños, historial de servicios y observaciones relevantes para
            la atención.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">3. Finalidad del tratamiento</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Agendar, confirmar y gestionar citas.</li>
            <li>Prestar y hacer seguimiento a los servicios adquiridos.</li>
            <li>Recordar fechas de retoque o mantenimiento.</li>
            <li>
              Enviar información comercial, promociones y felicitaciones, previa
              autorización.
            </li>
            <li>Atender solicitudes, quejas y reclamos.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">4. Autorización</h2>
          <p className="mt-2">
            Al proporcionar sus datos y contactarnos, la clienta autoriza su
            tratamiento conforme a esta política. La autorización para
            comunicaciones comerciales es opcional y puede revocarse en cualquier
            momento.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">5. Derechos del titular</h2>
          <p className="mt-2">
            Como titular de sus datos, usted tiene derecho a conocer, actualizar,
            rectificar y suprimir sus datos personales, así como a revocar la
            autorización otorgada. Puede ejercer estos derechos escribiéndonos al{" "}
            <strong>{site.telefonoVisible}</strong>
            {site.email ? (
              <>
                {" "}o al correo <strong>{site.email}</strong>
              </>
            ) : null}
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">6. Seguridad de la información</h2>
          <p className="mt-2">
            El Estudio adopta medidas técnicas y administrativas razonables para
            proteger los datos personales contra acceso no autorizado, pérdida o
            alteración.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">7. Vigencia</h2>
          <p className="mt-2">
            Esta política rige a partir de su publicación. Los datos se
            conservarán durante el tiempo necesario para cumplir las finalidades
            descritas y las obligaciones legales aplicables.
          </p>
        </section>
      </div>
    </section>
  );
}
