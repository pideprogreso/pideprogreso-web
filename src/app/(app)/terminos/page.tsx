import type { Metadata } from "next";
import Link from "next/link";
import { CORREO_CONTACTO, DocumentoLegal } from "@/components/documento-legal";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function PaginaTerminos() {
  return (
    <DocumentoLegal titulo="Términos y condiciones" actualizado="21 de octubre de 2026">
      <p>
        Al usar PideProgreso aceptas estos términos. Si no estás de acuerdo, por favor no uses la plataforma.
      </p>

      <h2>Qué es PideProgreso</h2>
      <p>
        PideProgreso es una plataforma que conecta a clientes con negocios de Nuevo Progreso, Tamaulipas. Los
        negocios venden sus productos directamente al cliente: cada negocio es responsable de sus productos,
        precios, existencias, preparación, calidad y entrega. PideProgreso no vende ni entrega los productos.
      </p>

      <h2>Tu cuenta</h2>
      <ul>
        <li>Para hacer pedidos o registrar un negocio necesitas una cuenta con datos verdaderos.</li>
        <li>Cuida el acceso a tu cuenta; eres responsable de lo que se haga con ella.</li>
        <li>Debes ser mayor de edad o contar con permiso de tu madre, padre o tutor.</li>
      </ul>

      <h2>Pedidos</h2>
      <ul>
        <li>El pedido se confirma cuando el negocio lo acepta. El negocio puede rechazarlo, por ejemplo, si se terminó un producto.</li>
        <li>El precio que pagas es el que ves al enviar el pedido, más el costo de envío del negocio si aplica.</li>
        <li>Los tiempos de entrega son aproximados.</li>
        <li>Puedes cancelar un pedido mientras el negocio no lo haya aceptado. Después, comunícate con el negocio.</li>
        <li>Si das una dirección o un teléfono equivocados, el negocio podría no completar la entrega.</li>
      </ul>

      <h2>Pagos</h2>
      <p>
        Pagas directamente al negocio, en efectivo al recibir o recoger, o por transferencia a la cuenta que el
        negocio indica. PideProgreso no recibe ni procesa pagos. Cualquier aclaración de un cobro se resuelve con
        el negocio.
      </p>

      <h2>Negocios</h2>
      <ul>
        <li>PideProgreso revisa cada negocio antes de publicarlo y puede rechazarlo o suspenderlo.</li>
        <li>El negocio se compromete a mantener su menú, precios y horario al día y a atender los pedidos que acepte.</li>
        <li>El negocio usará los datos de sus clientes solo para preparar y entregar sus pedidos.</li>
        <li>El negocio es responsable de cumplir sus obligaciones fiscales, sanitarias y de protección al consumidor.</li>
      </ul>

      <h2>Uso prohibido</h2>
      <p>
        No está permitido hacer pedidos falsos, suplantar a otra persona, publicar contenido ilegal u ofensivo,
        ni intentar dañar o vulnerar la plataforma. Podemos suspender cuentas que lo hagan.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Hacemos lo posible para que la plataforma funcione sin fallas, pero puede haber interrupciones. En la
        medida que la ley lo permita, PideProgreso no es responsable de los productos ni de las entregas de los
        negocios. Esto no limita los derechos que te da la Ley Federal de Protección al Consumidor; puedes acudir a
        la Profeco.
      </p>

      <h2>Datos personales</h2>
      <p>
        Tratamos tus datos según nuestro{" "}
        <Link href="/privacidad" className="font-semibold underline underline-offset-2">aviso de privacidad</Link>.
      </p>

      <h2>Cambios y contacto</h2>
      <p>
        Podemos actualizar estos términos; la versión vigente siempre estará en esta página. Estos términos se
        rigen por las leyes de México. Para dudas o aclaraciones escríbenos a{" "}
        <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold underline underline-offset-2">{CORREO_CONTACTO}</a>.
      </p>
    </DocumentoLegal>
  );
}
