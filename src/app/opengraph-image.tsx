import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { site } from "@/data/config";

export const alt = "Marly Laverde Estudio de Belleza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf7f2",
          gap: 34,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={340}
          height={340}
          style={{ borderRadius: 9999, objectFit: "cover" }}
          alt=""
        />
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#a76d6f",
            fontWeight: 700,
          }}
        >
          Colorimetría · Tratamientos capilares
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#7a6c62" }}>
          {site.ciudad} · {site.telefonoVisible}
        </div>
      </div>
    ),
    { ...size }
  );
}
