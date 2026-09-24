import { NextRequest, NextResponse } from "next/server";
import { obtenerDisponibilidad } from "@/lib/disponibilidad";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const servicio = request.nextUrl.searchParams.get("servicio");
  const fecha = request.nextUrl.searchParams.get("fecha");

  if (!servicio || !fecha) {
    return NextResponse.json(
      { disponible: false, horas: [], motivo: "Faltan datos" },
      { status: 400 }
    );
  }

  const resultado = await obtenerDisponibilidad(servicio, fecha);
  return NextResponse.json(resultado);
}
