const pesos = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function dinero(valor: number) {
  return pesos.format(valor);
}

export function envio(costo: number) {
  return costo === 0 ? "Envío gratis" : `Envío ${dinero(costo)}`;
}

// Para buscar sin importar acentos ni mayúsculas.
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
