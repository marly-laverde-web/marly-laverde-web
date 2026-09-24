import Link from "next/link";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { crearClienteServidor } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

function PantallaConfiguracion() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <h1 className="font-serif text-3xl text-ink">Falta conectar la base de datos</h1>
      <p className="mt-4 text-muted">
        El panel de administración necesita Supabase para funcionar. Sigue estos
        pasos (una sola vez):
      </p>
      <ol className="mt-6 space-y-3 text-sm text-ink/90">
        <li>1. Crea un proyecto gratis en <strong>supabase.com</strong>.</li>
        <li>2. En <strong>SQL Editor</strong>, ejecuta el archivo <code className="rounded bg-sand px-1">supabase/schema.sql</code>.</li>
        <li>3. Copia las claves del proyecto en el archivo <code className="rounded bg-sand px-1">.env.local</code> (usa <code className="rounded bg-sand px-1">.env.local.example</code> como guía).</li>
        <li>4. Crea el usuario de Marly en <strong>Authentication → Users → Add user</strong>.</li>
        <li>5. Reinicia el sitio.</li>
      </ol>
      <p className="mt-6 text-xs text-muted">
        Encontrarás la guía completa en el archivo <strong>README.md</strong>.
      </p>
      <Link href="/" className="btn-secundario mt-8 self-start">
        ← Volver al sitio
      </Link>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigurado()) {
    return <PantallaConfiguracion />;
  }

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión → mostrar solo la pantalla de login (children).
  if (!user) {
    return <>{children}</>;
  }

  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
