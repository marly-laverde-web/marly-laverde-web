import { waLink, mensajeWhatsAppGeneral } from "@/data/config";
import { IconWhatsApp } from "./Icons";

export default function BotonWhatsAppFlotante() {
  return (
    <a
      href={waLink(mensajeWhatsAppGeneral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-[#1ebe5a]"
    >
      <IconWhatsApp className="h-6 w-6" />
      <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
    </a>
  );
}
