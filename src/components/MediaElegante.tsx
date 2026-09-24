import { IconSparkle } from "./Icons";

/**
 * Muestra una foto si se proporciona `imagen`; de lo contrario muestra un
 * bloque elegante con gradiente y el título. Así el sitio se ve bien
 * incluso antes de subir las fotos reales.
 */

const gradientes = [
  "linear-gradient(135deg, #ecdad2 0%, #d9b7ab 100%)",
  "linear-gradient(135deg, #f4ebe2 0%, #e0c9b3 100%)",
  "linear-gradient(135deg, #e7d0c9 0%, #c99f97 100%)",
  "linear-gradient(135deg, #efe2d6 0%, #cbb089 100%)",
  "linear-gradient(135deg, #e9d8cf 0%, #b98f86 100%)",
];

function elegirGradiente(clave: string): string {
  let suma = 0;
  for (let i = 0; i < clave.length; i++) suma += clave.charCodeAt(i);
  return gradientes[suma % gradientes.length];
}

interface Props {
  imagen?: string;
  alt: string;
  etiqueta?: string;
  titulo?: string;
  className?: string;
}

export default function MediaElegante({
  imagen,
  alt,
  etiqueta,
  titulo,
  className = "",
}: Props) {
  if (imagen) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imagen}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: elegirGradiente(titulo || alt) }}
      role="img"
      aria-label={alt}
    >
      <IconSparkle className="absolute right-4 top-4 h-5 w-5 text-white/50" />
      <IconSparkle className="absolute bottom-6 left-5 h-3 w-3 text-white/40" />
      <div className="px-4 text-center">
        {etiqueta && (
          <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80">
            {etiqueta}
          </span>
        )}
        {titulo && (
          <span className="block font-serif text-lg text-white drop-shadow-sm">
            {titulo}
          </span>
        )}
      </div>
    </div>
  );
}
