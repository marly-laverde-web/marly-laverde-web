"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { site } from "@/data/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-3xl text-ink">
            {site.nombre}
          </Link>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-rose">
            Panel de administración
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="space-y-5 rounded-2xl border border-line bg-white/70 p-7 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-soft/60 px-4 py-3 text-sm text-rose-dark">
              {error}
            </p>
          )}

          <button type="submit" disabled={cargando} className="btn-primario w-full">
            {cargando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-rose">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
