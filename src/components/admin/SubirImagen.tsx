"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function SubirImagen({
  valor,
  onChange,
}: {
  valor?: string;
  onChange: (url: string) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function manejar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError("");

    const supabase = crearClienteNavegador();
    const ext = file.name.split(".").pop() || "jpg";
    const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: errSubida } = await supabase.storage
      .from("imagenes")
      .upload(nombre, file, { cacheControl: "3600", upsert: false });

    if (errSubida) {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
      setSubiendo(false);
      return;
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(nombre);
    onChange(data.publicUrl);
    setSubiendo(false);
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {valor ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valor}
            alt="Vista previa"
            className="h-20 w-20 rounded-lg border border-line object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-line bg-sand/50 text-center text-[0.6rem] text-muted">
            Sin foto
          </div>
        )}
        <div className="space-y-2">
          <label className="btn-secundario !px-4 !py-2 !text-xs cursor-pointer">
            {subiendo ? "Subiendo…" : valor ? "Cambiar foto" : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              onChange={manejar}
              disabled={subiendo}
              className="hidden"
            />
          </label>
          {valor && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="block text-xs text-rose-dark hover:underline"
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rose-dark">{error}</p>}
    </div>
  );
}
