import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { textoEstado, type EstadoPedido, type Modalidad } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import { supabaseUrl } from "@/lib/supabase/config";

// La base (trigger de pedidos y pg_cron) llama aquí con el id de un pedido.
// No hace falta secreto: solo se avisa lo que de verdad pasó con ese pedido, y
// avisos_enviados impide repetir un aviso aunque alguien llame muchas veces.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Aviso = { title: string; body: string; url: string; tag: string };

export async function POST(request: Request) {
  const secreta = process.env.SUPABASE_SECRET_KEY;
  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!supabaseUrl || !secreta || !publica || !privada) return new Response("Sin configurar", { status: 503 });

  const { pedido_id: id } = await request.json().catch(() => ({}));
  if (typeof id !== "string" || !UUID.test(id)) return new Response("Pedido no válido", { status: 400 });

  const db = createClient(supabaseUrl, secreta, { auth: { persistSession: false } });
  const { data: p } = await db
    .from("pedidos")
    .select("id, folio, estado, modalidad, total, nombre_contacto, cliente_id, creado_en, motivo_cancelacion, negocios(nombre, propietario_id)")
    .eq("id", id)
    .maybeSingle();
  if (!p) return new Response("No existe", { status: 404 });

  const quienCancelo = async (pedidoId: string) =>
    (await db.from("pedido_historial").select("cambiado_por").eq("pedido_id", pedidoId).eq("estado", "cancelado").limit(1).maybeSingle())
      .data?.cambiado_por as string | null | undefined;
  const negocio = p.negocios as unknown as { nombre: string; propietario_id: string };
  const estado = p.estado as EstadoPedido;
  const sinRespuesta = estado === "recibido" && Date.now() - new Date(p.creado_en).getTime() >= 5 * 60000;
  const motivo = sinRespuesta ? "sin_respuesta" : estado;

  let destino: string[];
  let aviso: Aviso;
  if (sinRespuesta) {
    const { data: admins } = await db.from("perfiles").select("id").eq("rol", "admin");
    destino = (admins ?? []).map((a) => a.id);
    aviso = {
      title: `Pedido #${p.folio} sin aceptar`,
      body: `${negocio.nombre} no ha contestado en 5 minutos. Llámales antes de que se cancele.`,
      url: "/admin/pedidos",
      tag: `admin-${p.id}`,
    };
  } else if (estado === "recibido") {
    destino = [negocio.propietario_id];
    aviso = {
      title: `Pedido nuevo #${p.folio}`,
      body: `${p.nombre_contacto} · ${dinero(Number(p.total))}`,
      url: "/panel",
      tag: p.id,
    };
  } else if (estado === "cancelado" && !p.motivo_cancelacion && (await quienCancelo(p.id)) === p.cliente_id) {
    destino = [negocio.propietario_id];
    aviso = { title: `Pedido #${p.folio} cancelado`, body: "El cliente canceló el pedido.", url: "/panel", tag: p.id };
  } else {
    const { titulo, detalle } =
      p.motivo_cancelacion === "sin_respuesta"
        ? { titulo: "El negocio no respondió a tiempo", detalle: "Cancelamos tu pedido. Puedes pedir en otro negocio." }
        : textoEstado(estado, p.modalidad as Modalidad);
    destino = [p.cliente_id];
    aviso = { title: titulo, body: `${negocio.nombre} · ${detalle}`, url: `/pedidos/${p.id}`, tag: p.id };
  }

  // Si el aviso ya salió (o lo está mandando otra llamada), no se repite.
  const { error: repetido } = await db.from("avisos_enviados").insert({ pedido_id: p.id, motivo });
  if (repetido) return new Response("Ya avisado");

  const { data: subs } = await db.from("suscripciones_push").select("endpoint, p256dh, auth").in("usuario_id", destino);
  webpush.setVapidDetails("mailto:pideprogreso@gmail.com", publica, privada);
  await Promise.all(
    (subs ?? []).map((s) =>
      webpush
        .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(aviso), {
          TTL: 600,
          urgency: "high",
        })
        .catch(async (e: { statusCode?: number }) => {
          // 404/410: el celular ya no acepta avisos (desinstaló o quitó el permiso).
          if (e.statusCode === 404 || e.statusCode === 410) await db.from("suscripciones_push").delete().eq("endpoint", s.endpoint);
          else console.error("aviso push", e);
        }),
    ),
  );
  return new Response(`Enviado a ${subs?.length ?? 0}`);
}

