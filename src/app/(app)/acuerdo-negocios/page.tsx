import type { Metadata } from "next";
import Link from "next/link";
import { CORREO_CONTACTO, DocumentoLegal } from "@/components/documento-legal";

export const metadata: Metadata = { title: "Acuerdo para negocios" };

const enlace = "font-semibold underline underline-offset-2";

// Borrador pendiente de revisión del abogado (18 nov 2026).
export default function PaginaAcuerdoNegocios() {
  return (
    // Al cambiar la fecha, actualiza también version_legal('negocios') en Supabase.
    <DocumentoLegal titulo="Acuerdo para negocios" actualizado="18 de noviembre de 2026">
      <p>
        Este acuerdo aplica a quien registra un negocio en PideProgreso. Al registrarlo lo aceptas, además de los{" "}
        <Link href="/terminos" className={enlace}>términos y condiciones</Link> y el{" "}
        <Link href="/privacidad" className={enlace}>aviso de privacidad</Link>.
      </p>

      <h2>Qué hace PideProgreso</h2>
      <p>
        PideProgreso es solo una plataforma que muestra tu negocio y te hace llegar los pedidos de tus clientes.
        PideProgreso no vende, no prepara, no cobra y no entrega productos, y no es tu socio, empleador ni
        intermediario en la venta.
      </p>

      <h2>De qué es responsable tu negocio</h2>
      <p>Tu negocio es el único responsable de:</p>
      <ul>
        <li>Recibir y contestar los pedidos: aceptarlos o rechazarlos a tiempo.</li>
        <li>Preparar los productos con la calidad, higiene, cantidades y precios que publicaste.</li>
        <li>Cobrar al cliente, en efectivo o por transferencia, y resolver cualquier aclaración, devolución o reembolso.</li>
        <li>Entregar los pedidos con tu propio repartidor o en tu local cuando el cliente pasa a recoger, incluido lo que pase en el trayecto.</li>
        <li>Lo que publiques: menú, precios, fotos, horario y datos de pago deben ser verdaderos y estar al día.</li>
        <li>
          Cumplir tus obligaciones fiscales, sanitarias, laborales y de protección al consumidor, y contar con los
          permisos que tu giro necesite.
        </li>
        <li>Usar los datos de tus clientes solo para preparar y entregar sus pedidos, y cuidarlos.</li>
      </ul>

      <h2>Productos prohibidos</h2>
      <p>
        En PideProgreso no se permite publicar, vender ni entregar bebidas alcohólicas, cigarros, tabaco,
        vapeadores, drogas ni productos parecidos, ni nada cuya venta sea ilegal. El negocio que lo haga será dado de baja de
        inmediato, sin aviso previo, y quedará en una lista negra: ni el negocio ni sus responsables podrán volver a
        registrarse en PideProgreso.
      </p>

      <h2>Reclamaciones</h2>
      <p>
        Las quejas o reclamaciones de tus clientes sobre productos, cobros o entregas son tuyas de resolver. Si por
        algo que hizo o dejó de hacer tu negocio alguien reclama a PideProgreso, tu negocio responderá por ello y
        cubrirá los daños y gastos que cause, en la medida que la ley lo permita.
      </p>

      <h2>Cuota y publicación</h2>
      <ul>
        <li>Pagas una cuota fija al mes, sin comisión por pedido, según lo que acordemos contigo.</li>
        <li>
          PideProgreso revisa cada negocio antes de publicarlo y puede rechazarlo, pausarlo o suspenderlo si no
          cumple este acuerdo, recibe quejas repetidas o deja de pagar la cuota.
        </li>
        <li>Puedes dejar la plataforma cuando quieras avisándonos por correo.</li>
      </ul>

      <h2>Cambios y contacto</h2>
      <p>
        Podemos actualizar este acuerdo; la versión vigente estará en esta página y te avisaremos de cambios
        importantes. Se rige por las leyes de México. Para dudas escríbenos a{" "}
        <a href={`mailto:${CORREO_CONTACTO}`} className={enlace}>{CORREO_CONTACTO}</a>.
      </p>
    </DocumentoLegal>
  );
}
