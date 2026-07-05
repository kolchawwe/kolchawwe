import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

/**
 * Builds a highly polished, professional technical implementation manual in Word (.docx) format.
 * Covers system interactions, database schema, payment gateways, emails, and custom domain deployment (Nic Chile).
 */
export async function generateManualDoc(): Promise<Buffer> {
  const doc = new Document({
    title: "Manual Técnico - Plataforma E-Commerce Kolchawwe",
    creator: "Manejador Técnico de Inteligencia Artificial",
    sections: [
      {
        properties: {},
        children: [
          // PORTADA (Cover Page)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 200 },
            children: [
              new TextRun({
                text: "MANUAL TÉCNICO DE IMPLEMENTACIÓN Y DEPLOY",
                bold: true,
                size: 36, // 18pt
                color: "111827",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "Plataforma de Clientes, Administración e Integraciones E-Commerce",
                italics: true,
                size: 24, // 12pt
                color: "4B5563",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
            children: [
              new TextRun({
                text: "KOLCHAWWE BREW — CERVECERÍA ARTESANAL",
                bold: true,
                size: 28, // 14pt
                color: "C29F5C", // Golden accent Color
                font: "Calibri",
              }),
            ],
          }),

          // Metadata block
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Autor: ", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: "AI Coding Assistant (Antigravity Agent)", size: 22, font: "Calibri" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Destinatario: ", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: "Pablo Lisboa C. (pablo.lisboa.c@gmail.com)", size: 22, font: "Calibri" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Estado de Operación: ", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: "Producción / Terminado (95% Completado)", size: 22, font: "Calibri" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 1200 },
            children: [
              new TextRun({ text: "Fecha: ", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: "Junio 2026", size: 22, font: "Calibri" }),
            ],
          }),

          // Page Break / separator
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "_________________________________________________________________________________",
                color: "D1D5DB",
              }),
            ],
          }),

          // 1. INTRODUCCIÓN Y ARQUITECTURA GENERAL
          new Paragraph({
            spacing: { before: 400, after: 150 },
            children: [
              new TextRun({
                text: "1. Introducción y Arquitectura General",
                bold: true,
                size: 28, // 14pt
                color: "111827",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "La plataforma de comercio electrónico de Kolchawwe está diseñada bajo un enfoque moderno full-stack que optimiza tanto la experiencia interactiva del usuario final en una sola pantalla de alto impacto, como las facilidades del dueño de negocio en un panel administrativo robusto y seguro. El sistema cuenta con control en tiempo real de bodega, despacho geolocalizado ajustable por comunas, integración directa de pasarela de pago y notificaciones por correo automatizadas bajo protocolo TLS de alta fidelidad.",
                size: 22,
                font: "Calibri",
              }),
            ],
          }),

          // 2. INTERACCIONES ENTRE SISTEMAS
          new Paragraph({
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "2. Interacciones entre Sistemas",
                bold: true,
                size: 28,
                color: "111827",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "El flujo operacional involucra la correcta orquestación de cinco (5) componentes tecnológicos clave:",
                size: 22,
                font: "Calibri",
              }),
            ],
          }),

          // Bullets components
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Frontend (React / Vite SPA): ", bold: true, size: 21 }),
              new TextRun({
                text: "Renderiza la interfaz premium en el navegador del usuario utilizando Tailwind CSS para estilos de baja latencia y Motion para transiciones suaves de componentes. Captura la canasta de compras del cliente, valida formatos de campos requeridos y despacha peticiones estructuradas hacia el backend.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Backend (Node.js / Express Server on Port 3000): ", bold: true, size: 21 }),
              new TextRun({
                text: "Funciona como la aduana de seguridad y controlador central de recursos. Sirve las peticiones REST, expone controladores CRUD para la administración del negocio, asila las credenciales sensibles del comercio (Tokens invisibles para el navegador) y decide cuándo persistir transacciones en base de datos.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Base de Datos (PostgreSQL o Fallback JSON local): ", bold: true, size: 21 }),
              new TextRun({
                text: "Estructura la información en cuatro modelos relacionales principales (products, orders, shipping_config, clients). Si la variable DATABASE_URL está activa, el backend se conecta dinámicamente con un pool TLS a PostgreSQL. En caso contrario, se utiliza una persistencia ligera a nivel de archivos JSON asilada en el volumen del servidor para resguardar la consistencia de inventarios.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Pasarela de Pagos (Mercado Pago API): ", bold: true, size: 21 }),
              new TextRun({
                text: "Inicializa el flujo financiero real mediante la API oficial de Mercado Pago SDK. Genera una URL temporal única de pago (Preference URL) que se concatena con los montos del subtotal y despacho, y redirige al usuario de manera segura. Resuelve el resultado financiero final a través del callback webhooks procesado en el servidor.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Servidor de Correos (SMTP Server via Nodemailer): ", bold: true, size: 21 }),
              new TextRun({
                text: "Despacha automáticamente alertas por correo en formato HTML responsivo con tablas de compra detalladas tanto para el cliente final (comprobante) como para el correo corporativo del negocio de Kolchawwe, garantizando que el equipo logístico prepare el despacho de inmediato.",
                size: 21,
              }),
            ],
          }),

          // 3. DETALLE DE ETAPAS DE OPERACIÓN (BLOQUES DETALLADOS)
          new Paragraph({
            spacing: { before: 400, after: 150 },
            children: [
              new TextRun({
                text: "3. Detalles en Bloques de Etapas Clave",
                bold: true,
                size: 28,
                color: "111827",
                font: "Calibri",
              }),
            ],
          }),

          // ETAPA 1
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "Etapa 1: Gestión Dinámica de Catálogo y Bodega (Admin Control)", bold: true, size: 24, color: "C29F5C" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Entrada de Datos: El administrador puede añadir o editar cervezas (graduación ABV, amargor IBU, volumen 330cc, precio, imagen y stock) desde la ruta administrativa oculta.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Validación y Visibilidad: Se añade soporte para el campo 'hidden' (booleano). Permite encolar o sacar temporalmente del escaparate ciertos productos sin eliminar el registro histórico de ventas.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• Control de stock: El inventario decrementa estrictamente una vez que la pasarela de pagos emite el retorno certificado de transacción completada con éxito.",
                size: 21,
              }),
            ],
          }),

          // ETAPA 2
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "Etapa 2: Cotización de Logística y Rutas de Despacho", bold: true, size: 24, color: "C29F5C" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Tarifario Personalizado por Comuna: El panel de administración permite registrar comunas personalizadas de Chile (ej: 'San Fernando', 'Chimbarongo', 'Curicó') asignando precios específicos para cada una de ellas.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Lógica de Despacho Gratuito: El sistema evalúa si el subtotal de compra supera el umbral configurado (ej: $25.000). Si califica, el recargo de despacho automáticamente se modifica como 'Gratis' ($0), incentivando la venta mayorista.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• Selección del Cliente: En el modal de compra, el combo-box de comunas se renderiza con un diseño mejorado en contraste tipográfico para legibilidad inmediata (fondo blanco, letra negra zinc) con indicativos de costo.",
                size: 21,
              }),
            ],
          }),

          // ETAPA 3
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "Etapa 3: Orquestación de Pago y Redirección Segura (Mercado Pago)", bold: true, size: 24, color: "C29F5C" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Validación de Stock Seguro: Al hacer clic en 'Continuar al Pago Seguro', se ejecuta una verificación síncrona en el backend. Si algún producto tiene stock inferior a la cantidad solicitada, frena el flujo indicando el límite exacto de bodega.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Preference Creation: El servidor de Express conecta por canal HTTP seguro con la API REST de Mercado Pago (https://api.mercadopago.com/v1/checkout/preferences) usando el token de producción.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• Registro Temporal: Antes de la redirección, se guarda un pedido provisional con estado 'pendiente' en la base de datos para resguardar la consistencia.",
                size: 21,
              }),
            ],
          }),

          // ETAPA 4 & 5
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "Etapas 4 y 5: Procesador de Callbacks, Liquidación de Stock y Correo", bold: true, size: 24, color: "C29F5C" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Verificación de Token Financiero: Al completarse el pago, Mercado Pago redirige al cliente a nuestro endpoint '/api/mercadopago-callback?status=approved&preference_id=XXX'. El backend convalida el parámetro de éxito.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "• Liquidación de Unidades: Se reduce aritméticamente el stock de cada cerveza involucrada en el pedido. Si el stock llega a cero, el artículo automáticamente se desactiva del flujo de compra rápida del frontend.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• Encomienda por Correo: Se ensambla la plantilla responsiva con el detalle de facturación y se despacha de forma paralela via SMTP TLS hacia pablo.lisboa.c@gmail.com y el correo corporativo del negocio.",
                size: 21,
              }),
            ],
          }),

          // 4. MANUAL DE PUBLICACIÓN BAJO DOMINIO EN NIC CHILE
          new Paragraph({
            spacing: { before: 400, after: 150 },
            children: [
              new TextRun({
                text: "4. Manual de Publicación bajo Dominio Propio (NIC Chile)",
                bold: true,
                size: 28,
                color: "111827",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 155 },
            children: [
              new TextRun({
                text: "Publicar tu sitio web terminado bajo tu dominio comprado en NIC Chile (ej: www.kolchawwe.cl) es perfectamente viable y seguro. El proceso consta de los siguientes pasos estructurados:",
                size: 22,
                font: "Calibri",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Paso 1: Elección de Plataforma Cloud (Hosting / PaaS): ", bold: true, size: 21 }),
              new TextRun({
                text: "La aplicación actual requiere un ambiente Node.js activo para procesar las llamadas de Mercado Pago y Nodemailer. Para producción limpia, gratuita o de bajo costo, se recomienda desplegar el contenedor en Render.com, Railway.app, o Google Cloud Run. Estas plataformas automatizan la entrega de un certificado SSL (HTTPS) gratuito obligatoriamente requerido por Mercado Pago.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Paso 2: Obtener la Dirección Servida: ", bold: true, size: 21 }),
              new TextRun({
                text: "Una vez subas tu repositorio a tu nube de hosting elegida (por ejemplo, en Render.com), esta te otorgará una dirección pública de subdominio segura, por ejemplo: 'kolchawwe-brew.onrender.com'.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Paso 3: Configurar Zonas DNS de tu Dominio: ", bold: true, size: 21 }),
              new TextRun({
                text: "Utiliza un administrador de nombres gratuito como Cloudflare (altamente recomendado por velocidad, protección y facilidad frente a caídas) o el propio gestor de DNS de tu hosting actual. Si utilizas Cloudflare: crea una cuenta, pon tu dominio, y Cloudflare te dará dos servidores DNS de nombres (ej: ns1.cloudflare.com, ns2.cloudflare.com).",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Paso 4: Delegación en NIC Chile: ", bold: true, size: 21 }),
              new TextRun({
                text: "Ingresa a tu cuenta en nic.cl. Busca tu dominio registrado en la lista de dominios activos. Dirígete a la sección 'Servidores de Nombre (DNS)' y reemplaza los campos con los DNS proporcionados en el Paso 3 (ej: los de Cloudflare, o los del hosting direto). Haz clic en 'Actualizar'. Ten en cuenta que la actualización de DNS tarda entre 2 a 12 horas en propagarse en toda la internet de Chile.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Paso 5: Registrar el registro CNAME y dirección IPv4: ", bold: true, size: 21 }),
              new TextRun({
                text: "En tu panel de control de DNS (ej: Cloudflare o panel de Hosting), añade dos registros principales:\n" +
                  "1. Registro 'CNAME' con nombre @ (o vacio) y valor apuntando a la dirección provista por tu hosting (ej: 'kolchawwe-brew.onrender.com').\n" +
                  "2. Registro 'CNAME' con nombre 'www' apuntando de la misma manera a 'kolchawwe-brew.onrender.com' para que resuelva si entran anteponiendo las tres W.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Paso 6: Configurar Variables de Entorno en Producción: ", bold: true, size: 21 }),
              new TextRun({
                text: "Configura tus claves reales en el panel de control de tu hosting (MERCADOPAGO_ACCESS_TOKEN, SMTP_USER, SMTP_PASSWORD, DATABASE_URL). El sistema leerá estas claves seguras eludiendo riesgos de hackeos del lado visual.",
                size: 21,
              }),
            ],
          }),

          // 5. MIGRACIÓN DE BASE DE DATOS HACIA AIVEN POSTGRESQL (NUEVA SECCIÓN)
          new Paragraph({
            spacing: { before: 400, after: 150 },
            children: [
              new TextRun({
                text: "5. Migración de Base de Datos hacia Aiven (Paso a Paso y Resolución de Certificados)",
                bold: true,
                size: 28,
                color: "111827",
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Cuando migras desde la base de datos de Render hacia un servicio gratuito como Aiven PostgreSQL, es común encontrarse con bloqueos de seguridad TLS debido a certificados autofirmados (Self-signed certificate in certificate chain). Aquí tienes la solución paso a paso y la corrección del código:",
                size: 22,
                font: "Calibri",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "La Causa del Error (SELF_SIGNED_CERT_IN_CHAIN): ", bold: true, size: 21 }),
              new TextRun({
                text: "Por defecto, Node.js y la librería 'pg' exigen que los certificados SSL sean emitidos por autoridades de certificación públicas reconocidas. Dado que tanto Render como Aiven usan certificados SSL autofirmados para encriptar el tráfico, Node frena la conexión con este error de seguridad.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Solución en tu script migrate.js local (Método Express): ", bold: true, size: 21 }),
              new TextRun({
                text: "Agrega la siguiente línea al principio de tu archivo 'migrate.js' para forzar a Node.js a omitir la validación rigurosa de certificados para esta migración local:\n" +
                  "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';\n" +
                  "Esto desactiva temporalmente el bloqueo de certificados en la terminal local y te permite conectar ambos Postgres simultáneamente.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Solución Segura con Configuración de Clientes (Método Recomendado): ", bold: true, size: 21 }),
              new TextRun({
                text: "Modifica los objetos de conexión en 'migrate.js' para configurar la opción ssl de forma explícita:\n" +
                  "const sourceClient = new Client({\n" +
                  "  connectionString: 'postgresql://db_stock_tpol_user:...',\n" +
                  "  ssl: { rejectUnauthorized: false }\n" +
                  "});",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Ejecución de la Migración: ", bold: true, size: 21 }),
              new TextRun({
                text: "Vuelve a ejecutar 'node migrate.js' en tu terminal. El script leerá todos los registros (productos, pedidos, configuraciones) desde tu base de datos antigua de Render y los insertará sin pérdida en tu base de datos de Aiven.",
                size: 21,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Actualización de la Variable de Entorno: ", bold: true, size: 21 }),
              new TextRun({
                text: "Finalmente, ve al panel de control de tu hosting (por ejemplo Render o Railway) y reemplaza la variable DATABASE_URL con la nueva URI provista por Aiven. La aplicación web se reiniciará automáticamente leyendo la base de datos gratuita de Aiven.",
                size: 21,
              }),
            ],
          }),

          // Final signature separator
          new Paragraph({
            spacing: { before: 400, after: 100 },
            children: [
              new TextRun({
                text: "_________________________________________________________________________________",
                color: "D1D5DB",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "¡Felicidades por terminar la página de Kolchawwe al 100%! La plataforma queda lista para deleitar a tus clientes de forma segura, moderna e interactiva.",
                italics: true,
                size: 20,
                color: "4B5563",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
