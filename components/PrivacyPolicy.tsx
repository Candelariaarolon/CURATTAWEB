import type { ReactNode } from "react";
import TexturedSection from "./TexturedSection";

type SectionProps = {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
};

function Section({ id, number, title, children }: SectionProps) {
  return (
    <section id={id} className="border-t border-carbon/10 pt-12">
      <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-cuero-dark">
        {number}
      </p>
      <h2 className="mt-3 font-serif text-2xl text-carbon md:text-3xl">
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[15px] leading-[1.75] text-carbon/80">
        {children}
      </div>
    </section>
  );
}

function InShort({ children }: { children: ReactNode }) {
  return (
    <p className="border-l border-cuero-light/50 pl-5 italic text-carbon/70">
      <span className="font-medium not-italic text-carbon">En resumen. </span>
      {children}
    </p>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 font-serif text-lg text-carbon md:text-xl">
      {children}
    </h3>
  );
}

const TOC = [
  { id: "pp-info", n: "01", title: "Qué información recopilamos" },
  { id: "pp-uso", n: "02", title: "Cómo procesamos tu información" },
  { id: "pp-compartir", n: "03", title: "Cuándo y con quién compartimos" },
  { id: "pp-cookies", n: "04", title: "Cookies y tecnologías de seguimiento" },
  { id: "pp-ia", n: "05", title: "Productos basados en inteligencia artificial" },
  { id: "pp-social", n: "06", title: "Inicios de sesión con terceros" },
  { id: "pp-retencion", n: "07", title: "Cuánto tiempo conservamos tu información" },
  { id: "pp-seguridad", n: "08", title: "Cómo cuidamos tu información" },
  { id: "pp-derechos", n: "09", title: "Tus derechos de privacidad" },
  { id: "pp-dnt", n: "10", title: "Señales Do-Not-Track" },
  { id: "pp-cambios", n: "11", title: "Actualizaciones a este aviso" },
  { id: "pp-contacto", n: "12", title: "Cómo contactarnos" },
  { id: "pp-acceso", n: "13", title: "Revisar, actualizar o eliminar tus datos" },
];

export default function PrivacyPolicy() {
  return (
    <TexturedSection
      texture="linen"
      overlay="blanco-roto"
      overlayOpacity={0.93}
      className="py-24 md:py-32"
    >
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <header className="text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Curatta · Documento
          </p>
          <h1 className="mt-5 font-serif text-4xl text-carbon md:text-5xl">
            Política de Privacidad
          </h1>
          <p className="mt-4 font-sans text-sm text-carbon/60">
            Última actualización: 17 de junio de 2026
          </p>
        </header>

        <div className="mt-14 space-y-5 text-[15px] leading-[1.75] text-carbon/80">
          <p>
            Este aviso de privacidad de <strong>María Candelaria Rolón Martínez</strong>{" "}
            (en adelante, <em>“Curatta”</em>, <em>“nosotras”</em> o <em>“nuestro”</em>)
            describe cómo y por qué podemos acceder, recopilar, almacenar, usar y/o
            compartir (<em>“procesar”</em>) tu información personal cuando usás
            nuestros servicios (los <em>“Servicios”</em>), incluso cuando:
          </p>
          <ul className="list-disc space-y-2 pl-5 marker:text-cuero-dark">
            <li>
              Visitás nuestro sitio web en{" "}
              <a
                href="https://curatta.lat"
                className="underline decoration-cuero-light/60 underline-offset-4 transition hover:text-cuero-dark"
              >
                curatta.lat
              </a>{" "}
              o cualquier sitio nuestro que enlace a este aviso.
            </li>
            <li>
              Usás Curatta, una plataforma de descubrimiento de moda que conecta
              tus tableros de inspiración de Pinterest con prendas reales y
              comprables de tiendas locales. Curatta analiza tus pines guardados
              mediante inteligencia artificial para encontrar ropa, accesorios y
              artículos visualmente similares disponibles en comercios.
            </li>
            <li>
              Interactuás con nosotros de otras formas relacionadas, incluyendo
              marketing o eventos.
            </li>
          </ul>
          <p>
            <strong>¿Preguntas o inquietudes?</strong> Leer este aviso te ayudará
            a entender tus derechos y opciones. Somos responsables de las
            decisiones sobre cómo se procesa tu información personal. Si no
            estás de acuerdo con nuestras políticas y prácticas, te pedimos no
            usar nuestros Servicios. Si tenés consultas, escribinos a{" "}
            <a
              href="mailto:candeerolonn@gmail.com"
              className="underline decoration-cuero-light/60 underline-offset-4 transition hover:text-cuero-dark"
            >
              candeerolonn@gmail.com
            </a>
            .
          </p>
        </div>

        <div className="mt-16 border-t border-carbon/10 pt-12">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-cuero-dark">
            Resumen
          </p>
          <h2 className="mt-3 font-serif text-2xl text-carbon md:text-3xl">
            Puntos clave
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-carbon/80">
            <p>
              <strong>Qué información recopilamos.</strong> Procesamos los datos
              que vos nos proporcionás y cierta información técnica del dispositivo
              y del uso del sitio.
            </p>
            <p>
              <strong>Información sensible.</strong> No procesamos información
              sensible (orígenes raciales, orientación sexual, creencias
              religiosas, etc.).
            </p>
            <p>
              <strong>Para qué la usamos.</strong> Para proveer y mejorar los
              Servicios, comunicarnos con vos, prevenir fraude y cumplir con la
              ley. Solo procesamos información cuando hay una base legal válida.
            </p>
            <p>
              <strong>Con quién la compartimos.</strong> Solo con terceros
              específicos detallados en este aviso (proveedores de IA, hosting,
              programas de afiliados y conexión con Pinterest).
            </p>
            <p>
              <strong>Cuáles son tus derechos.</strong> Según tu jurisdicción,
              podés tener derechos sobre tu información personal: acceso,
              rectificación, eliminación, oposición o portabilidad.
            </p>
          </div>
        </div>

        <nav className="mt-16 border-t border-carbon/10 pt-12">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-cuero-dark">
            Índice
          </p>
          <h2 className="mt-3 font-serif text-2xl text-carbon md:text-3xl">
            Tabla de contenidos
          </h2>
          <ol className="mt-6 space-y-2 text-[15px]">
            {TOC.map((item) => (
              <li key={item.id} className="flex gap-4">
                <span className="w-6 shrink-0 font-sans text-[11px] uppercase tracking-[0.2em] text-cuero-dark">
                  {item.n}
                </span>
                <a
                  href={`#${item.id}`}
                  className="text-carbon/80 underline decoration-transparent underline-offset-4 transition duration-300 hover:decoration-cuero-light/60 hover:text-carbon"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-16 space-y-16">
          <Section id="pp-info" number="01" title="Qué información recopilamos">
            <InShort>
              Recopilamos la información personal que vos nos proporcionás, más
              cierta información técnica recogida automáticamente.
            </InShort>

            <SubHeading>Información que nos das voluntariamente</SubHeading>
            <p>
              Recopilamos los datos personales que nos proporcionás cuando te
              registrás en los Servicios, manifestás interés en obtener
              información sobre nosotros o nuestros productos, participás en
              actividades dentro de los Servicios, o nos contactás.
            </p>
            <p>La información personal que recopilamos puede incluir:</p>
            <ul className="list-disc space-y-1 pl-5 marker:text-cuero-dark">
              <li>nombre y apellido;</li>
              <li>dirección de correo electrónico;</li>
              <li>nombre de usuario.</li>
            </ul>
            <p>
              <strong>Información sensible.</strong> No procesamos información
              sensible.
            </p>
            <p>
              <strong>Datos de inicio de sesión social.</strong> Podemos
              ofrecerte la opción de registrarte usando tu cuenta de Pinterest.
              Si elegís hacerlo, recibiremos cierta información de perfil desde
              esa plataforma, según se describe más abajo en{" "}
              <em>“Inicios de sesión con terceros”</em>.
            </p>
            <p>
              Toda la información personal que nos brindes debe ser verdadera,
              completa y exacta, y debés notificarnos cualquier cambio.
            </p>

            <SubHeading>Información recopilada automáticamente</SubHeading>
            <InShort>
              Cierta información —como tu dirección IP y características del
              navegador o dispositivo— se recopila automáticamente cuando
              visitás los Servicios.
            </InShort>
            <p>
              Esta información no revela tu identidad específica, pero puede
              incluir datos del dispositivo y del uso: dirección IP,
              características del navegador y del dispositivo, sistema
              operativo, preferencias de idioma, URLs de referencia, nombre del
              dispositivo, país, ubicación general, información sobre cómo y
              cuándo usás los Servicios, y otra información técnica. La
              necesitamos principalmente para mantener la seguridad y
              operación de los Servicios, y para análisis internos.
            </p>
            <p>La información que recopilamos incluye:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cuero-dark">
              <li>
                <em>Datos de registro y uso.</em> Información de servicio,
                diagnóstico, uso y rendimiento que nuestros servidores recogen
                automáticamente cuando accedés a los Servicios: IP, información
                del dispositivo, tipo de navegador, fecha/hora de uso, páginas
                vistas, búsquedas y otras acciones.
              </li>
              <li>
                <em>Datos del dispositivo.</em> Computadora, teléfono o tablet
                desde el cual accedés: IP (o proxy), identificadores de
                dispositivo y aplicación, ubicación general, tipo de navegador,
                modelo de hardware, proveedor de internet y configuración del
                sistema.
              </li>
            </ul>

            <SubHeading>Información de otras fuentes</SubHeading>
            <InShort>
              Podemos recopilar datos limitados de bases públicas, socios de
              marketing, plataformas sociales y otras fuentes externas.
            </InShort>
            <p>
              Para mejorar nuestra capacidad de ofrecerte servicios y
              comunicaciones relevantes, podemos obtener información sobre vos
              desde bases de datos públicas, programas de afiliados, proveedores
              de datos, plataformas sociales y otros terceros. Esta información
              puede incluir correos, perfiles sociales y datos de intención de
              compra, con fines de marketing dirigido.
            </p>
            <p>
              Si interactuás con nosotros en una plataforma social usando tu
              cuenta (por ejemplo, Pinterest), recibimos información personal
              desde esa plataforma. La información que recibimos depende de la
              configuración de privacidad de tu cuenta en esa plataforma; el
              uso que ellas hagan de tu información no se rige por este aviso.
            </p>
          </Section>

          <Section id="pp-uso" number="02" title="Cómo procesamos tu información">
            <InShort>
              Procesamos tu información para proveer, mejorar y administrar los
              Servicios, comunicarnos con vos, prevenir fraude y cumplir con la
              ley. También podemos procesarla para otros fines con tu
              consentimiento.
            </InShort>
            <p>
              <strong>
                Procesamos tu información personal por distintas razones,
                dependiendo de cómo interactuás con los Servicios, incluyendo:
              </strong>
            </p>
            <ul className="list-disc space-y-3 pl-5 marker:text-cuero-dark">
              <li>
                <strong>Crear y administrar cuentas.</strong> Para que puedas
                crear y mantener tu cuenta operativa.
              </li>
              <li>
                <strong>Entregar y facilitar los servicios.</strong> Para
                brindarte el servicio solicitado.
              </li>
              <li>
                <strong>Responder consultas y dar soporte.</strong> Para
                resolver problemas que puedas tener con el servicio.
              </li>
              <li>
                <strong>Enviar información administrativa.</strong> Detalles
                sobre nuestros productos y servicios, cambios en nuestras
                políticas y otra información similar.
              </li>
              <li>
                <strong>Proteger los Servicios.</strong> Para mantenerlos
                seguros, incluyendo monitoreo y prevención de fraude.
              </li>
              <li>
                <strong>Evaluar y mejorar la experiencia.</strong> Para
                identificar tendencias de uso, medir la efectividad de
                campañas, y mejorar productos, marketing y experiencia.
              </li>
              <li>
                <strong>Identificar tendencias de uso.</strong> Para entender
                mejor cómo se usan los Servicios y mejorarlos.
              </li>
            </ul>
          </Section>

          <Section
            id="pp-compartir"
            number="03"
            title="Cuándo y con quién compartimos tu información personal"
          >
            <InShort>
              Podemos compartir información en situaciones específicas y con
              los terceros que se enumeran a continuación.
            </InShort>
            <p>
              <strong>Proveedores y prestadores de servicios.</strong> Podemos
              compartir tus datos con proveedores externos, contratistas o
              agentes que prestan servicios para nosotras y que necesitan
              acceso a esa información para hacer su trabajo.
            </p>
            <p>
              Los terceros con quienes podemos compartir información personal son:
            </p>

            <SubHeading>Programas de marketing de afiliados</SubHeading>
            <p>Mercado Libre y Tiendanube.</p>

            <SubHeading>Proveedores de servicios de IA</SubHeading>
            <p>OpenAI y Microsoft Azure AI.</p>

            <SubHeading>Conexión con cuentas de terceros</SubHeading>
            <p>Pinterest (para conectar tus tableros).</p>

            <SubHeading>Optimización de funcionalidad e infraestructura</SubHeading>
            <p>Termly.io.</p>

            <SubHeading>Hosting del sitio web</SubHeading>
            <p>Railway y Vercel.</p>

            <p className="pt-4">
              También podemos compartir tu información personal en las
              siguientes situaciones:
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cuero-dark">
              <li>
                <strong>Transferencias comerciales.</strong> En relación con
                negociaciones de fusión, venta de activos, financiamiento o
                adquisición.
              </li>
              <li>
                <strong>Cumplimiento legal.</strong> Cuando estemos obligadas a
                divulgar información por ley, orden judicial o requerimiento
                gubernamental.
              </li>
            </ul>
          </Section>

          <Section
            id="pp-cookies"
            number="04"
            title="Cookies y tecnologías de seguimiento"
          >
            <InShort>
              Podemos usar cookies y tecnologías similares para recopilar y
              almacenar información.
            </InShort>
            <p>
              Podemos usar cookies y tecnologías similares (como web beacons y
              píxeles) para recopilar información cuando interactuás con los
              Servicios. Algunas tecnologías de seguimiento nos ayudan a
              mantener la seguridad de los Servicios y tu cuenta, prevenir
              fallas, guardar tus preferencias y asistir con funciones básicas
              del sitio.
            </p>
            <p>
              También permitimos a terceros usar tecnologías de seguimiento en
              los Servicios para análisis y publicidad, incluyendo ayudar a
              gestionar y mostrar avisos adaptados a tus intereses.
            </p>
            <p>
              Información específica sobre cómo usamos estas tecnologías y cómo
              podés rechazar ciertas cookies está disponible en nuestro aviso
              de cookies en{" "}
              <a
                href="https://curatta.lat/cookies"
                className="underline decoration-cuero-light/60 underline-offset-4 transition hover:text-cuero-dark"
              >
                curatta.lat/cookies
              </a>
              .
            </p>
          </Section>

          <Section
            id="pp-ia"
            number="05"
            title="Productos basados en inteligencia artificial"
          >
            <InShort>
              Ofrecemos productos, funciones y herramientas potenciadas por
              inteligencia artificial, aprendizaje automático y tecnologías
              similares.
            </InShort>
            <p>
              Como parte de nuestros Servicios, ofrecemos productos potenciados
              por IA (los <em>“Productos de IA”</em>). Estas herramientas están
              diseñadas para mejorar tu experiencia. Los términos de este aviso
              rigen tu uso de los Productos de IA dentro de nuestros Servicios.
            </p>

            <SubHeading>Uso de tecnologías de IA</SubHeading>
            <p>
              Proveemos los Productos de IA a través de proveedores externos
              (los <em>“Proveedores de IA”</em>), incluyendo OpenAI. Como se
              describe en este aviso, tus inputs, outputs e información personal
              serán compartidos y procesados por estos Proveedores para
              habilitar el uso de los Productos de IA con los fines descriptos
              en la sección <em>“Cuándo y con quién compartimos tu información”</em>.
              No debés usar los Productos de IA en formas que violen los
              términos de ningún Proveedor.
            </p>

            <SubHeading>Nuestros Productos de IA</SubHeading>
            <p>Nuestros Productos de IA están diseñados para:</p>
            <ul className="list-disc space-y-1 pl-5 marker:text-cuero-dark">
              <li>análisis de imágenes;</li>
              <li>recomendaciones;</li>
              <li>análisis predictivo;</li>
              <li>búsqueda con IA;</li>
              <li>modelos de aprendizaje automático.</li>
            </ul>

            <SubHeading>Cómo procesamos tus datos con IA</SubHeading>
            <p>
              Toda la información personal procesada con nuestros Productos de
              IA se maneja en línea con este aviso y con nuestros acuerdos con
              terceros, manteniendo la seguridad de tus datos.
            </p>

            <SubHeading>Cómo optar por no participar</SubHeading>
            <p>Para no participar, podés:</p>
            <ul className="list-disc space-y-1 pl-5 marker:text-cuero-dark">
              <li>
                ingresar a la configuración de tu cuenta y actualizarla;
              </li>
              <li>
                contactarnos a la dirección indicada al final de este aviso.
              </li>
            </ul>
          </Section>

          <Section
            id="pp-social"
            number="06"
            title="Cómo manejamos los inicios de sesión con terceros"
          >
            <InShort>
              Si elegís registrarte o iniciar sesión en nuestros Servicios
              usando una cuenta de terceros, podemos tener acceso a cierta
              información sobre vos.
            </InShort>
            <p>
              Nuestros Servicios permiten registrarte e iniciar sesión usando
              los datos de tu cuenta de Pinterest. Cuando hacés esto, recibimos
              información de perfil desde Pinterest, que puede incluir tu
              nombre, dirección de correo, foto de perfil y otra información
              que hayas elegido hacer pública.
            </p>
            <p>
              Usaremos esa información solo para los fines descriptos en este
              aviso o que se aclaren al momento de su uso. No controlamos ni
              somos responsables del uso que Pinterest haga de tu información
              personal. Te recomendamos revisar el aviso de privacidad de
              Pinterest para entender cómo recopilan, usan y comparten tus
              datos, y cómo configurar tus preferencias.
            </p>
          </Section>

          <Section
            id="pp-retencion"
            number="07"
            title="Cuánto tiempo conservamos tu información"
          >
            <InShort>
              Conservamos tu información el tiempo necesario para cumplir los
              fines descriptos en este aviso, salvo que la ley exija otra cosa.
            </InShort>
            <p>
              Solo conservaremos tu información personal durante el tiempo
              necesario para los fines establecidos en este aviso, a menos que
              la ley exija o permita un período más largo (por ejemplo,
              requisitos impositivos o contables). Ningún propósito de este
              aviso requerirá conservar tus datos personales por más tiempo del
              período en que tengas una cuenta con nosotras.
            </p>
            <p>
              Cuando no tengamos una necesidad legítima continua de procesar tu
              información personal, la eliminaremos o anonimizaremos; si esto
              no fuera posible (por ejemplo, porque está en backups),
              almacenaremos la información de forma segura y la aislaremos de
              cualquier procesamiento hasta que sea posible eliminarla.
            </p>
          </Section>

          <Section
            id="pp-seguridad"
            number="08"
            title="Cómo cuidamos tu información"
          >
            <InShort>
              Buscamos proteger tu información personal mediante un sistema de
              medidas técnicas y organizativas de seguridad.
            </InShort>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas
              apropiadas y razonables, diseñadas para proteger cualquier
              información personal que procesemos. Sin embargo, ninguna
              transmisión electrónica por internet ni tecnología de
              almacenamiento puede garantizarse 100% segura, por lo que no
              podemos prometer que terceros no autorizados no vayan a poder
              vulnerar nuestras medidas. Aunque haremos lo posible por proteger
              tu información, el envío de datos personales hacia y desde
              nuestros Servicios es bajo tu propio riesgo. Te recomendamos
              acceder a los Servicios desde un entorno seguro.
            </p>
          </Section>

          <Section
            id="pp-derechos"
            number="09"
            title="Tus derechos de privacidad"
          >
            <InShort>
              Podés revisar, cambiar o cerrar tu cuenta en cualquier momento,
              según tu país de residencia.
            </InShort>
            <p>
              En Argentina, la Ley 25.326 de Protección de los Datos Personales
              te otorga derechos de acceso, rectificación, actualización y
              supresión de tus datos personales. Para ejercerlos, podés
              contactarnos a{" "}
              <a
                href="mailto:candeerolonn@gmail.com"
                className="underline decoration-cuero-light/60 underline-offset-4 transition hover:text-cuero-dark"
              >
                candeerolonn@gmail.com
              </a>
              .
            </p>

            <SubHeading>Retiro del consentimiento</SubHeading>
            <p>
              Si nos basamos en tu consentimiento para procesar tu información
              personal, tenés derecho a retirarlo en cualquier momento
              contactándonos por las vías indicadas en{" "}
              <em>“Cómo contactarnos”</em>. Esto no afecta la legalidad del
              procesamiento previo al retiro, ni el procesamiento basado en
              otras bases legales.
            </p>

            <SubHeading>Comunicaciones de marketing</SubHeading>
            <p>
              Podés cancelar la suscripción a comunicaciones de marketing en
              cualquier momento haciendo clic en el enlace para darse de baja
              en los correos que enviamos, o contactándonos. Aun así, podemos
              seguir comunicándonos con vos para mensajes relacionados con el
              servicio.
            </p>

            <SubHeading>Información de la cuenta</SubHeading>
            <p>
              Si en algún momento querés revisar o cambiar la información de tu
              cuenta, o cerrarla, podés ingresar a la configuración de tu
              cuenta y actualizarla. Cuando solicites el cierre, desactivaremos
              o eliminaremos tu cuenta e información de nuestras bases
              activas. Podemos retener cierta información para prevenir fraude,
              resolver problemas, asistir investigaciones, hacer cumplir
              nuestros términos legales y/o cumplir con requisitos legales.
            </p>

            <SubHeading>Cookies y tecnologías similares</SubHeading>
            <p>
              La mayoría de los navegadores aceptan cookies por defecto. Podés
              configurar tu navegador para eliminarlas o rechazarlas; esto
              puede afectar ciertas funciones de los Servicios.
            </p>
          </Section>

          <Section id="pp-dnt" number="10" title="Señales Do-Not-Track">
            <p>
              La mayoría de los navegadores web y algunos sistemas operativos
              móviles incluyen una función Do-Not-Track (<em>“DNT”</em>) que
              podés activar para señalar tu preferencia de privacidad. Como
              actualmente no hay un estándar tecnológico uniforme para
              reconocer e implementar señales DNT, no respondemos a señales DNT
              del navegador ni a ningún mecanismo automático que comunique tu
              preferencia de no ser rastreado. Si en el futuro se adoptara un
              estándar al que debamos adherir, te informaremos en una versión
              revisada de este aviso.
            </p>
          </Section>

          <Section
            id="pp-cambios"
            number="11"
            title="Actualizaciones a este aviso"
          >
            <InShort>
              Sí, vamos a actualizar este aviso cuando sea necesario para
              cumplir con las leyes vigentes.
            </InShort>
            <p>
              Podemos actualizar este aviso de privacidad ocasionalmente. La
              versión actualizada se indicará con una fecha de{" "}
              <em>“Última actualización”</em> revisada al inicio del documento.
              Si hacemos cambios materiales, podemos notificarte de forma
              destacada en el sitio o enviándote una notificación directa. Te
              recomendamos revisar este aviso con frecuencia.
            </p>
          </Section>

          <Section
            id="pp-contacto"
            number="12"
            title="Cómo contactarnos sobre este aviso"
          >
            <p>
              Si tenés preguntas o comentarios sobre este aviso, podés
              escribirnos a{" "}
              <a
                href="mailto:candeerolonn@gmail.com"
                className="underline decoration-cuero-light/60 underline-offset-4 transition hover:text-cuero-dark"
              >
                candeerolonn@gmail.com
              </a>{" "}
              o por correo postal a:
            </p>
            <address className="not-italic text-carbon/80">
              <div>María Candelaria Rolón Martínez</div>
              <div>Córdoba, Córdoba, 5009</div>
              <div>Argentina</div>
            </address>
          </Section>

          <Section
            id="pp-acceso"
            number="13"
            title="Cómo revisar, actualizar o eliminar tus datos"
          >
            <p>
              Según las leyes aplicables en tu país, podés tener derecho a
              solicitar acceso a la información personal que recopilamos sobre
              vos, conocer detalles sobre cómo la procesamos, corregir
              inexactitudes o eliminar tu información personal. También podés
              tener derecho a retirar tu consentimiento al procesamiento.
              Estos derechos pueden tener limitaciones según la ley aplicable.
              Para ejercerlos, escribinos a{" "}
              <a
                href="mailto:candeerolonn@gmail.com"
                className="underline decoration-cuero-light/60 underline-offset-4 transition hover:text-cuero-dark"
              >
                candeerolonn@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>

        <footer className="mt-20 border-t border-carbon/10 pt-10 text-center">
          <a
            href="#top"
            className="font-sans text-[11px] uppercase tracking-[0.3em] text-cuero-dark transition hover:text-carbon"
          >
            Volver al inicio
          </a>
        </footer>
      </div>
    </TexturedSection>
  );
}
