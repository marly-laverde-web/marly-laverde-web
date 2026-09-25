import { NextRequest, NextResponse } from "next/server";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const servicios = request.nextUrl.searchParams.get("servicios");
  const fecha = request.nextUrl.searchParams.get("fecha");

  if (!servicios || !fecha) {
    return NextResponse.json(
      { disponible: false, horas: [], motivo: "Faltan datos" },
      { status: 400 }
    );
  }

  const ids = servicios.split(",").filter(Boolean);
  const resultado = await obtenerDisponibilidad(ids, fecha);
  return NextResponse.json(resultado);
}
