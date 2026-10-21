// URL pública del sitio. Detrás de un proxy o con `next start -H 0.0.0.0`, la URL
// interna de la petición no sirve para redirigir al navegador; se usa la
// variable NEXT_PUBLIC_SITE_URL si existe, o el host con el que llegó la petición.
export function origenPublico(h: Headers) {
  const configurado = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configurado) return configurado;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocolo =
    h.get("x-forwarded-proto")?.split(",")[0] ?? (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host) ? "http" : "https");
  return `${protocolo}://${host}`;
}
