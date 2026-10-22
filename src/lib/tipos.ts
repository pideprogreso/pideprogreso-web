export type Negocio = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null; // slug de la categoría
  direccion: string | null;
  horario: string | null;
  telefono: string | null;
  whatsapp: string | null;
  datosTransferencia: string | null;
  logoUrl: string | null;
  portadaUrl: string | null;
  abierto: boolean;
  destacadoHasta?: string | null; // hasta cuándo sale primero en el inicio (lo pone el admin)
  aceptaEntrega: boolean;
  aceptaRecoger: boolean;
  costoEnvio: number;
  pedidoMinimo: number;
  tiempoMin: number;
  tiempoMax: number;
};

export type Producto = {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagenUrl: string | null;
  seccion: string;
};
