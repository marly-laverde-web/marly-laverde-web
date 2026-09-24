interface Props {
  kicker?: string;
  titulo: string;
  subtitulo?: string;
  centrado?: boolean;
  claro?: boolean; // texto en color claro (para fondos oscuros)
}

export default function TituloSeccion({
  kicker,
  titulo,
  subtitulo,
  centrado = true,
  claro = false,
}: Props) {
  return (
    <div className={`${centrado ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {kicker && (
        <span className={`kicker ${claro ? "!text-rose-soft" : ""}`}>{kicker}</span>
      )}
      <h2
        className={`mt-3 font-serif text-3xl sm:text-4xl ${
          claro ? "text-cream" : "text-ink"
        }`}
      >
        {titulo}
      </h2>
      {subtitulo && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            claro ? "text-cream/80" : "text-muted"
          }`}
        >
          {subtitulo}
        </p>
      )}
    </div>
  );
}
