import type { Metadata } from "next";
import Link from "next/link";
import { CORREO_CONTACTO, DocumentoLegal } from "@/components/documento-legal";

export const metadata: Metadata = { title: "Aviso de privacidad" };

const correo = <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold underline underline-offset-2">{CORREO_CONTACTO}</a>;

export default function PaginaPrivacidad() {
  return (
    <DocumentoLegal titulo="Aviso de privacidad" actualizado="21 de octubre de 2026">
      <p>
        Este aviso explica qué datos personales recaba PideProgreso, para qué los usa y cómo puedes ejercer tus
        derechos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
      </p>

      <h2>Quién es responsable de tus datos</h2>
      <p>
        PideProgreso, con domicilio en Nuevo Progreso, municipio de Río Bravo, Tamaulipas, México, es responsable
        del tratamiento de tus datos personales. Para cualquier asunto de privacidad escríbenos a {correo}.
      </p>

      <h2>Qué datos recabamos</h2>
      <ul>
        <li>De identificación y contacto: nombre, correo electrónico y número de celular.</li>
        <li>De entrega: dirección, referencias y, si lo autorizas, la ubicación que marcas en el mapa.</li>
        <li>De tus pedidos: negocio, productos, montos, forma de pago elegida y notas.</li>
        <li>
          Si registras un negocio: nombre comercial, teléfono, WhatsApp, dirección, horario, datos para recibir
          transferencias, fotos y menú.
        </li>
        <li>
          Técnicos: datos de sesión guardados en cookies, tipo de navegador y la información que nos mandes al
          reportar un problema.
        </li>
      </ul>
      <p>No recabamos datos personales sensibles.</p>

      <h2>Para qué los usamos</h2>
      <p>Finalidades necesarias para darte el servicio:</p>
      <ul>
        <li>Crear y administrar tu cuenta e iniciar sesión.</li>
        <li>Recibir tu pedido y hacérselo llegar al negocio que elegiste para que lo prepare y entregue.</li>
        <li>Mostrarte el estado de tus pedidos y que el negocio pueda contactarte sobre ellos.</li>
        <li>Publicar la información y el menú de los negocios registrados.</li>
        <li>Atender reportes, aclaraciones y solicitudes, y prevenir fraudes o usos indebidos.</li>
      </ul>
      <p>
        Finalidades adicionales, que no son necesarias para el servicio: avisarte de promociones o novedades y
        pedirte tu opinión. Si no quieres que usemos tus datos para esto, escríbenos a {correo} en cualquier
        momento; no afectará tus pedidos.
      </p>

      <h2>Con quién los compartimos</h2>
      <ul>
        <li>
          Con el negocio al que le haces un pedido: tu nombre, celular, dirección, referencias, ubicación y el
          detalle del pedido, solo para prepararlo y entregarlo. Esta transferencia es necesaria para cumplir lo
          que pediste.
        </li>
        <li>
          Con proveedores que nos ayudan a operar la plataforma y tratan los datos por nuestra cuenta: Supabase
          (base de datos y cuentas), Netlify (hospedaje del sitio), Google (si entras con tu cuenta de Google) y
          OpenStreetMap (mapas; recibe tu dirección IP al cargar el mapa).
        </li>
        <li>Con autoridades, cuando una ley o una orden lo exija.</li>
      </ul>
      <p>No vendemos tus datos personales.</p>

      <h2>Tus derechos (ARCO) y cómo ejercerlos</h2>
      <p>
        Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso, así como revocar tu
        consentimiento o limitar su uso. Mándanos un correo a {correo} con tu nombre, el correo de tu cuenta, lo
        que solicitas y, en su caso, los datos que quieres corregir. Te responderemos en un plazo máximo de 20
        días hábiles. También puedes corregir tu nombre, celular y direcciones desde tu cuenta.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies propias para mantener tu sesión iniciada y guardamos tu carrito en tu celular. No usamos
        cookies de publicidad. Si las bloqueas en tu navegador, no podrás iniciar sesión.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Mientras tengas una cuenta y, después, solo el tiempo necesario para cumplir obligaciones legales o
        atender aclaraciones sobre pedidos.
      </p>

      <h2>Cambios a este aviso</h2>
      <p>
        Si cambiamos este aviso, publicaremos la nueva versión en esta página con su fecha de actualización.
        Consulta también nuestros <Link href="/terminos" className="font-semibold underline underline-offset-2">términos y condiciones</Link>.
      </p>
      <p>
        Si consideras que tu derecho a la protección de datos fue vulnerado, puedes acudir a la autoridad
        competente en la materia, la Secretaría Anticorrupción y Buen Gobierno.
      </p>
    </DocumentoLegal>
  );
}
