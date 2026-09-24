"use client";

interface Props {
  titulo: string;
  descripcion?: string;
  accion?: { texto: string; onClick: () => void };
}

export default function EncabezadoAdmin({ titulo, descripcion, accion }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 max-w-xl text-sm text-muted">{descripcion}</p>
        )}
      </div>
      {accion && (
        <button onClick={accion.onClick} className="btn-primario !py-2.5 text-sm">
          {accion.texto}
        </button>
      )}
    </div>
  );
}
