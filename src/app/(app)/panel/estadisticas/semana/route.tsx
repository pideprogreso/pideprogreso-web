import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { origenPublico } from "@/lib/origen";
import { dinero } from "@/lib/formato";
import { obtenerEstadisticasNegocio, requerirNegocio } from "@/lib/panel";

// La fuente de títulos de la marca; sin internet la tarjeta sale con la fuente por defecto.
let gabarito: Promise<ArrayBuffer | null> | undefined;
function fuenteTitulos() {
  gabarito ??= fetch("https://fonts.googleapis.com/css2?family=Gabarito:wght@800")
    .then((r) => r.text())
    .then((css) => css.match(/src: url\((.+?)\)/)?.[1])
    .then((url) => (url ? fetch(url).then((r) => r.arrayBuffer()) : null))
    .catch(() => {
      gabarito = undefined; // reintenta en la siguiente
      return null;
    });
  return gabarito;
}

// Tarjeta de 1080x1350 con el resumen de los últimos 7 días, para compartir en WhatsApp o en estados.
export async function GET() {
  await connection(); // depende de la sesión: nunca se prerenderiza
  const negocio = await requerirNegocio("/panel/estadisticas");
  const desde = Date.now() - 7 * 86_400_000;
  const semana = (await obtenerEstadisticasNegocio(negocio.id)).filter(
    (p) => new Date(p.creadoEn).getTime() >= desde && p.estado !== "cancelado" && p.estado !== "rechazado",
  );
  const vendido = semana.filter((p) => p.estado === "entregado").reduce((s, p) => s + p.total, 0);
  const productos = new Map<string, number>();
  for (const p of semana) for (const d of p.productos) productos.set(d.nombre, (productos.get(d.nombre) ?? 0) + d.cantidad);
  const sitio = origenPublico(await headers()).replace(/^https?:\/\//, "");
  const estrella = [...productos].sort((a, b) => b[1] - a[1])[0];

  const fuente = await fuenteTitulos();
  const titulos = fuente ? "Gabarito" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#3a0617",
          color: "#fff",
          padding: 90,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#f8cd57", letterSpacing: 2 }}>MI SEMANA EN PIDEPROGRESO</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, fontFamily: titulos, marginTop: 24, lineHeight: 1.05 }}>{negocio.nombre}</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ display: "flex", fontSize: 44, opacity: 0.75 }}>Vendí</div>
          <div style={{ display: "flex", fontSize: 200, fontWeight: 800, fontFamily: titulos, color: "#f2b632", lineHeight: 1 }}>{dinero(vendido)}</div>
          <div style={{ display: "flex", fontSize: 56, marginTop: 30 }}>
            {semana.length} {semana.length === 1 ? "pedido" : "pedidos"} en 7 días
          </div>
          {estrella && (
            <div style={{ display: "flex", fontSize: 44, marginTop: 50, padding: "26px 36px", borderRadius: 32, background: "rgba(255,255,255,0.1)" }}>
              Lo más pedido: {estrella[0]}
            </div>
          )}
        </div>
        <div style={{ display: "flex", marginTop: 70, fontSize: 40, opacity: 0.8 }}>Pide en {sitio}</div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: fuente ? [{ name: "Gabarito", data: fuente, weight: 800 }] : undefined,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
