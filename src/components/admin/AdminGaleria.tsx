"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarFoto, eliminarFoto } from "@/app/admin/galeria/acciones";
import SubirImagen from "./SubirImagen";
import EncabezadoAdmin from "./EncabezadoAdmin";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminGaleria({ inicial }: { inicial: any[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!imagenUrl) return setError("Sube una foto primero.");
    setGuardando(true);
    const res = await guardarFoto({ titulo, categoria, imagen_url: imagenUrl });
    setGuardando(false);
    if (res.ok) {
      setTitulo("");
      setCategoria("");
      setImagenUrl("");
      router.refresh();
    } else {
      setError(res.error ?? "Error al guardar.");
    }
  }

  async function borrar(id: string) {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    const res = await eliminarFoto(id);
    if (res.ok) router.refresh();
    else alert(res.error ?? "No se pudo eliminar.");
  }

  const input =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20";

  return (
    <div>
      <EncabezadoAdmin
        titulo="Galería"
        descripcion="Sube las fotos de los trabajos realizados. Publica solo fotos autorizadas por la clienta."
      />

      {/* Agregar foto */}
      <form
        onSubmit={agregar}
        className="mb-8 space-y-4 rounded-2xl border border-line bg-white/70 p-6"
      >
        <h3 className="font-serif text-xl text-ink">Agregar foto</h3>
        <SubirImagen valor={imagenUrl} onChange={setImagenUrl} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Título</label>
            <input
              className={input}
              value={titulo}
              placeholder="Ej: Balayage luminoso"
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Categoría</label>
            <input
              className={input}
              value={categoria}
              placeholder="Ej: Colorimetría"
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-rose-dark">{error}</p>}
        <button type="submit" disabled={guardando} className="btn-primario">
          {guardando ? "Guardando…" : "Agregar a la galería"}
        </button>
      </form>

      {/* Galería */}
      {inicial.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white/60 px-4 py-8 text-center text-muted">
          Aún no hay fotos en la galería.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {inicial.map((f) => (
            <div
              key={f.id}
              className="group relative overflow-hidden rounded-xl border border-line bg-white/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.imagen_url}
                alt={f.titulo || "Foto"}
                className="aspect-square w-full object-cover"
              />
              <div className="p-2">
                <p className="truncate text-xs font-medium text-ink">
                  {f.titulo || "Sin título"}
                </p>
                <p className="truncate text-[0.65rem] text-muted">{f.categoria}</p>
              </div>
              <button
                onClick={() => borrar(f.id)}
                className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-rose-dark opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
