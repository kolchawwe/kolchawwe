import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, CartItem, ShippingConfig, ShippingDetails, Order, Client } from "./src/types";
import {
  initializePostgres,
  getProductsDb,
  saveProductsDb,
  getOrdersDb,
  saveOrdersDb,
  getShippingConfigDb,
  saveShippingConfigDb,
  getClientsDb,
  saveClientsDb
} from "./server-db.ts";
import {
  getCorporateEmail,
  saveCorporateEmail,
  getEmailLogs,
  sendSalesEmailNotification,
  sendTestEmailNotification,
  isSmtpConfigured
} from "./server-email.ts";


// Keep INITIAL_PRODUCTS here to avoid importing TS files directly to compiled CJS without bundler issues
const SEED_PRODUCTS = [
  {
    id: "beer-1",
    name: "Kolchawwe British Golden Ale",
    tagline: "Nuestra insignia de selección: de color dorado, aromática y fresca",
    description: "Nuestra cerveza de referencia directa de las botellas Kolchawwe. De color dorado brillante con una densa y persistente corona de espuma. Se caracteriza por sus lúpulos nobles ingleses que marcan notas florales y de malta de cebada, balanceando a la perfección su amargor con una bebabilidad increíble.",
    category: "Lager",
    price: 3100,
    stock: 120,
    image: "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=600",
    abv: 5.2,
    ibu: 20,
    volume: "330cc"
  },
  {
    id: "beer-2",
    name: "Kolchawwe Oatmeal Stout",
    tagline: "Cremosa, robusta y con imponentes notas de café y cacao",
    description: "Receta tradicional negra de Colchagua elaborada con avena tostada y maltas seleccionadas. Presenta un cuerpo sumamente aterciopelado con notas intensas de granos de café espresso, chocolate amargo artesanal y un sutil amargor herbal en boca que deleita la experiencia.",
    category: "Stout",
    price: 3400,
    stock: 85,
    image: "https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?auto=format&fit=crop&q=80&w=600",
    abv: 6.8,
    ibu: 30,
    volume: "330cc"
  },
  {
    id: "beer-3",
    name: "Kolchawwe Hops Valley IPA",
    tagline: "Explosión de lúpulos seleccionados con recuerdos cítricos tropicales",
    description: "Una India Pale Ale de carácter audaz y fiero como el caballo rampante de nuestro sello. Ofrece un asombroso bouquet aromático frutal con notas de maracuyá, cáscara de naranja y resina de pino, balanceado por un amargor elegante y limpio en garganta.",
    category: "IPA",
    price: 3300,
    stock: 95,
    image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=600",
    abv: 6.4,
    ibu: 48,
    volume: "330cc"
  },
  {
    id: "beer-4",
    name: "Kolchawwe Amber de Colchagua",
    tagline: "El balance perfecto entre caramelos de malta cristal y lúpulo de montaña",
    description: "De color cobrizo intenso con hermosos reflejos rubí. Combina ricas capas de malta dulce acaramelada del tipo toffee con el toque fresco de lúpulos cultivados, rindiendo un sabroso homenaje a las tardes cálidas del valle de Colchagua.",
    category: "Amber",
    price: 3000,
    stock: 150,
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600",
    abv: 5.4,
    ibu: 22,
    volume: "330cc"
  },
  {
    id: "beer-5",
    name: "Kolchawwe Quad de Abadía & Miel",
    tagline: "Compleja, licorosa, robustecida con miel nativa de San Fernando",
    description: "Cerveza belga de abadía de alta graduación alcohólica. Fermentada con cepas de levadura trapense y enriquecida con la más fina miel de flores del valle de San Fernando. Despierta matices profundos de frutos secos maduros, pasas, ciruelas y un final licoroso dulce.",
    category: "Belgian",
    price: 4200,
    stock: 50,
    image: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=600",
    abv: 9.0,
    ibu: 26,
    volume: "330cc"
  }
];

// Data paths
const DB_DIR = path.join(process.cwd(), "data-db");
const PRODUCTS_FILE = path.join(DB_DIR, "products.json");
const ORDERS_FILE = path.join(DB_DIR, "orders.json");
const CONFIG_FILE = path.join(DB_DIR, "config.json");
const CLIENTS_FILE = path.join(DB_DIR, "clients.json");

// Ensure DB folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

// Read / Write helpers with error handling and default fallbacks
function getProducts(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const content = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading products database, returning initials", err);
  }
  // Fallback / seed initial products
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2));
  return SEED_PRODUCTS as Product[];
}

function saveProducts(products: Product[]) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function getOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading orders database", err);
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  return [];
}

function saveOrders(orders: Order[]) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function getShippingConfig(): ShippingConfig {
  const defaultConfig: ShippingConfig = { basePrice: 3500, freeShippingThreshold: 25000 };
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading config database", err);
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
}

function saveShippingConfig(config: ShippingConfig) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getClients(): Client[] {
  try {
    if (fs.existsSync(CLIENTS_FILE)) {
      const content = fs.readFileSync(CLIENTS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading clients database", err);
  }
  return [];
}

function saveClients(clientsList: Client[]) {
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clientsList, null, 2));
}

async function registerClientOnOrder(shippingDetails: ShippingDetails) {
  try {
    const clients = await getClientsDb(getClients);
    const emailKey = shippingDetails.email.toLowerCase().trim();
    const existingIndex = clients.findIndex((c) => c.email.toLowerCase().trim() === emailKey);
    const newClient: Client = {
      email: shippingDetails.email,
      fullName: shippingDetails.fullName,
      phone: shippingDetails.phone,
      address: shippingDetails.address,
      commune: shippingDetails.commune
    };
    if (existingIndex > -1) {
      clients[existingIndex] = newClient;
    } else {
      clients.push(newClient);
    }
    await saveClientsDb(clients, saveClients);
    console.log(`👤 [Customer Sync] Registered / updated customer: ${newClient.email}`);
  } catch (err) {
    console.error("Error securing/upserting client on callback:", err);
  }
}

// Temporary in-memory holding for active secure checkout sessions
interface CheckoutSession {
  token: string;
  shippingDetails: ShippingDetails;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  expiresAt: number;
}
const activeSessions: Record<string, CheckoutSession> = {};

// Express setup
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API INDEPENDIENTES DEL CLIENTE (EXCLUSIVAS DEL BACKEND) ---

// 1. Productos
app.get("/api/products", async (req, res) => {
  try {
    const products = await getProductsDb(getProducts);
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al cargar productos de la base de datos." });
  }
});

app.post("/api/products", async (req, res) => {
  const updatedProducts = req.body;
  if (Array.isArray(updatedProducts)) {
    const success = await saveProductsDb(updatedProducts, saveProducts);
    if (success) {
      res.json({ success: true, message: "Productos guardados correctamente." });
    } else {
      res.status(500).json({ success: false, error: "Error al sincronizar productos en la base de datos." });
    }
  } else {
    res.status(400).json({ success: false, error: "Formato de cuerpo inválido." });
  }
});

// 2. Órdenes
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await getOrdersDb(getOrders);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al cargar órdenes de la base de datos." });
  }
});

app.post("/api/orders", async (req, res) => {
  const ordersList = req.body;
  if (Array.isArray(ordersList)) {
    const success = await saveOrdersDb(ordersList, saveOrders);
    if (success) {
      res.json({ success: true, message: "Órdenes actualizadas correctamente." });
    } else {
      res.status(500).json({ success: false, error: "Error al registrar órdenes en la base de datos." });
    }
  } else {
    res.status(400).json({ success: false, error: "Formato de cuerpo inválido." });
  }
});

app.post("/api/orders/status", async (req, res) => {
  const { orderId, status } = req.body;
  try {
    const orders = await getOrdersDb(getOrders);
    const orderIdx = orders.findIndex((o) => o.id === orderId);
    if (orderIdx > -1) {
      orders[orderIdx].status = status as Order["status"];
      const success = await saveOrdersDb(orders, saveOrders);
      if (success) {
        res.json({ success: true, order: orders[orderIdx] });
      } else {
        res.status(500).json({ success: false, error: "Error al guardar el estado en la base de datos." });
      }
    } else {
      res.status(404).json({ success: false, error: "Pedido no encontrado." });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al procesar el estado del pedido." });
  }
});

// 3. Configuración de Envío
app.get("/api/shipping-config", async (req, res) => {
  try {
    const config = await getShippingConfigDb(getShippingConfig);
    res.json(config);
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al cargar la configuración de envío." });
  }
});

app.post("/api/shipping-config", async (req, res) => {
  const config = req.body;
  if (config && typeof config.basePrice === "number" && typeof config.freeShippingThreshold === "number") {
    const success = await saveShippingConfigDb(config, saveShippingConfig);
    if (success) {
      res.json({ success: true, config });
    } else {
      res.status(500).json({ success: false, error: "Error al guardar configuración de envío." });
    }
  } else {
    res.status(400).json({ success: false, error: "Valores de configuración de envío inválidos." });
  }
});

// 4. Clientes (Guardado persistente, edidión, borrado, búsqueda y métricas agregadas)
app.get("/api/clients", async (req, res) => {
  try {
    let clients = await getClientsDb(getClients);
    const orders = await getOrdersDb(getOrders);

    // Si la lista de clientes está vacía pero hay pedidos, realizamos un backfill automático
    if (clients.length === 0 && orders.length > 0) {
      console.log("🔄 [Sync] Sincronizando tabla de clientes vacía con los datos de envíos históricos...");
      const initialClientsMap = new Map<string, Client>();
      orders.forEach((o) => {
        const email = o.shippingDetails.email.toLowerCase().trim();
        if (!initialClientsMap.has(email)) {
          initialClientsMap.set(email, {
            email: o.shippingDetails.email,
            fullName: o.shippingDetails.fullName,
            phone: o.shippingDetails.phone,
            address: o.shippingDetails.address,
            commune: o.shippingDetails.commune
          });
        }
      });
      clients = Array.from(initialClientsMap.values());
      await saveClientsDb(clients, saveClients);
    }

    // Calcular en tiempo real el comportamiento financiero e histórica de compras por cliente
    const responseClients = clients.map((c) => {
      const emailKey = c.email.toLowerCase().trim();
      const clientOrders = orders.filter((o) => o.shippingDetails.email.toLowerCase().trim() === emailKey);
      const totalOrdersCount = clientOrders.length;
      const spentAmount = clientOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        email: c.email,
        fullName: c.fullName,
        phone: c.phone,
        address: `${c.address}, ${c.commune}`,
        rawAddress: c.address,         // preserve raw components for editing
        rawCommune: c.commune,         // preserve raw components for editing
        totalOrdersCount,
        spentAmount
      };
    });

    res.json(responseClients);
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al recuperar reporte de clientes de base de datos." });
  }
});

app.post("/api/clients", async (req, res) => {
  const clientsList = req.body;
  if (Array.isArray(clientsList)) {
    try {
      const success = await saveClientsDb(clientsList, saveClients);
      if (success) {
        res.json({ success: true, message: "Clientes actualizados correctamente." });
      } else {
        res.status(500).json({ success: false, error: "Error al registrar cambios en base de datos." });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: "Ocurrió un error al guardar los clientes." });
    }
  } else {
    res.status(400).json({ success: false, error: "Formato de cuerpo inválido. Debe ser un arreglo." });
  }
});

// 4.5. Configuración y Notificación de Correos Corporativos (Mailing)
app.get("/api/email-config", (req, res) => {
  try {
    const corporateEmail = getCorporateEmail();
    const logs = getEmailLogs();
    const hasSmtp = isSmtpConfigured();
    res.json({
      success: true,
      hasSmtp,
      corporateEmail,
      logs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.post("/api/email-config", (req, res) => {
  try {
    const { corporateEmail } = req.body;
    if (!corporateEmail || typeof corporateEmail !== "string" || !corporateEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Dirección de correo no válida." });
    }
    saveCorporateEmail(corporateEmail);
    res.json({ success: true, message: "Correo corporativo actualizado exitosamente." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.post("/api/email-config/test", async (req, res) => {
  try {
    const { targetEmail } = req.body;
    if (!targetEmail || typeof targetEmail !== "string" || !targetEmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Destinatario no válido." });
    }
    const log = await sendTestEmailNotification(targetEmail);
    res.json({ success: true, log });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// 5. Checkout y Simulación Segura de Pasarela de Pago Transbank Webpay
app.get("/api/checkout-config", (req, res) => {
  let mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpAccessToken || mpAccessToken.trim() === "") {
    mpAccessToken = "APP_USR-6243179757932439-051819-fbc10886bcfae80699d1d0862fe16b3c-3409594471";
  }
  mpAccessToken = mpAccessToken.trim();
  const isSandbox = mpAccessToken.startsWith("TEST-");
  const tokenType = isSandbox ? "TEST" : mpAccessToken.startsWith("APP_USR-") ? "APP_USR" : "CUSTOM";
  res.json({
    hasMp: mpAccessToken.length > 0,
    isSandbox,
    tokenType
  });
});

app.post("/api/checkout", async (req, res) => {
  const { shippingDetails, items, useSandbox } = req.body as { shippingDetails: ShippingDetails; items: CartItem[]; useSandbox?: boolean };

  if (!shippingDetails || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "Faltan los detalles de envío o los productos." });
  }

  try {
    // Validaciones de stock críticas en el lado del servidor antes del pago
    const dbProducts = await getProductsDb(getProducts);
    const outOfStockItems: string[] = [];

    items.forEach((item) => {
      const dbProd = dbProducts.find((p) => p.id === item.product.id);
      if (!dbProd || dbProd.stock < item.quantity) {
        outOfStockItems.push(item.product.name);
      }
    });

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Lo sentimos, los siguientes productos no cuentan con suficiente stock en bodega: ${outOfStockItems.join(", ")}.`
      });
    }

    // Calcular totales en el servidor
    const shoppingConfig = await getShippingConfigDb(getShippingConfig);
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shippingCost = subtotal >= shoppingConfig.freeShippingThreshold ? 0 : shoppingConfig.basePrice;
    const total = subtotal + shippingCost;

    // Generar token único de Webpay / Mercado Pago
    const token = `tbk-token-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Guardar sesión de pago temporal por 15 minutos en memoria del servidor
    activeSessions[token] = {
      token,
      shippingDetails,
      items,
      subtotal,
      shippingCost,
      total,
      expiresAt: Date.now() + 15 * 60 * 1000
    };

    // Determinar el host dinámico de retorno para las URLs de callback
    let hostUrl = process.env.APP_URL;
    if (!hostUrl && req.headers.referer) {
      try {
        hostUrl = new URL(req.headers.referer).origin;
      } catch (e) {
        // ignore
      }
    }
    if (!hostUrl) {
      hostUrl = "https://ais-dev-wtuperk7t4h52vbm25uinc-756231719187.us-east1.run.app";
    }

    // Si contamos con Token de Mercado Pago, procedemos a crear una Preference de Checkout Pro real
    let mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken || mpAccessToken.trim() === "") {
      mpAccessToken = "APP_USR-6243179757932439-051819-fbc10886bcfae80699d1d0862fe16b3c-3409594471";
    }
    mpAccessToken = mpAccessToken.trim();

    if (mpAccessToken) {
      console.log(`💳 [Checkout] Mercado Pago token detected (${mpAccessToken.substring(0, 10)}...). Utilizing Checkout Pro API...`);
      const mpItems = items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        description: item.product.tagline || item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        currency_id: "CLP"
      }));

      if (shippingCost > 0) {
        mpItems.push({
          id: "shipping-cost",
          title: "Costo de Despacho",
          description: "Despacho a domicilio",
          quantity: 1,
          unit_price: shippingCost,
          currency_id: "CLP"
        });
      }

      // Sanitize phone number format for raw Mercado Pago payload (must be only digits, max 9 for mobile)
      const digitsOnly = shippingDetails.phone.replace(/\D/g, "");
      const payerPhone = digitsOnly.startsWith("56") ? digitsOnly.slice(2) : digitsOnly;
      const finalPhone = payerPhone.length > 0 ? payerPhone.slice(-9) : "999999999";

      // Split full name into first name and last name for Mercado Pago compliance
      const nameParts = shippingDetails.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "Cliente";
      const lastName = nameParts.slice(1).join(" ") || "General";

      console.log(`💳 [Checkout] Preparing payment details, sanitized phone: +56 ${finalPhone}`);

      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mpAccessToken}`
        },
        body: JSON.stringify({
          items: mpItems,
          payer: {
            name: firstName,
            surname: lastName,
            email: shippingDetails.email,
            phone: {
              area_code: "56",
              number: finalPhone
            }
          },
          back_urls: {
            success: `${hostUrl}/api/mercadopago-callback?token=${token}&status=success`,
            failure: `${hostUrl}/api/mercadopago-callback?token=${token}&status=failure`,
            pending: `${hostUrl}/api/mercadopago-callback?token=${token}&status=pending`
          },
          auto_return: "approved",
          external_reference: token
        })
      });

      if (!mpResponse.ok) {
        const errText = await mpResponse.text();
        console.error("❌ [Checkout] Mercado Pago API failed:", errText);
        throw new Error(`Failed to create Mercado Pago preference: ${errText}`);
      }

      const responseJson = (await mpResponse.json()) as { init_point?: string; sandbox_init_point?: string };
      
      // La regla de oro en Mercado Pago es que el tipo de token determina de forma exclusiva la URL de redirección:
      // - Un token 'TEST-' requiere estrictamente usar 'sandbox_init_point' para pruebas.
      // - Un token de producción real 'APP_USR-' requiere usar 'init_point' para transacciones activas.
      // Mezclar un token 'APP_USR-' con 'sandbox_init_point' produce el error API "error de mismatch de partes".
      const isTokenSandbox = mpAccessToken.startsWith("TEST-");
      const paymentUrl = isTokenSandbox
        ? (responseJson.sandbox_init_point || responseJson.init_point)
        : (responseJson.init_point || responseJson.sandbox_init_point);
      
      console.log(`💳 [Checkout] Created preference successfully. isSandboxToken?: ${isTokenSandbox}, selected url: ${paymentUrl}`);
      
      if (!paymentUrl) {
        throw new Error("Mercado Pago API response missing init_point URLs.");
      }

      res.json({ success: true, paymentUrl, token });
      return;
    }

    // Retornar al frontend URL de redirección segura a pasarela Webpay integrada en nuestro servidor
    const paymentUrl = `/webpay-portal?token=${token}`;
    res.json({ success: true, paymentUrl, token });
  } catch (err) {
    console.error("Error al iniciar checkout:", err);
    res.status(500).json({ success: false, error: "Ocurrió un error al iniciar sesión de checkout." });
  }
});

// SERVIR EL PORTAL DE PAGO WEBPAY (PÁGINA DINÁMICA DE TRANSBANK SIMULATION)
app.get("/webpay-portal", (req, res) => {
  const { token } = req.query;
  const session = activeSessions[token as string];

  if (!session || session.expiresAt < Date.now()) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Transbank Webpay Plus - Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-zinc-950 text-zinc-150 font-sans flex items-center justify-center min-h-screen">
          <div class="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
            <h1 class="text-xl font-bold text-red-500">Transacción Caducada o Inválida</h1>
            <p class="text-xs text-zinc-400">El tiempo de espera para concluir la compra de Cervecería Kolchawwe ha caducado. Vuelve a intentar la checkout.</p>
            <a href="/" class="inline-block mt-4 text-xs font-bold text-white bg-amber-600 px-6 py-3 rounded-full hover:bg-amber-500 transition-colors">Volver a la Tienda</a>
          </div>
        </body>
      </html>
    `);
  }

  // Render simulated Webpay checkout page
  res.send(`
    <html>
      <head>
        <title>Transbank Webpay Plus | Cervecería Kolchawwe</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; }
        </style>
      </head>
      <body class="bg-slate-100 flex items-center justify-center min-h-screen p-4">
        <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          <!-- Webpay Header -->
          <div class="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white flex justify-between items-center">
            <div>
              <span class="text-[10px] tracking-widest font-bold uppercase block opacity-75">Orden de Compra Protegida</span>
              <h1 class="text-2xl font-black font-serif tracking-tight">Webpay <span class="font-normal italic">plus</span></h1>
            </div>
            <div class="text-right">
              <span class="text-xs block opacity-70">Cervecería Kolchawwe SPA</span>
              <span class="text-[10px] text-red-100 font-mono">ID: ${token}</span>
            </div>
          </div>

          <!-- Transaction Info -->
          <div class="p-6 md:p-8 space-y-6">
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p class="text-xs text-slate-500 font-medium">Cliente</p>
                <p class="text-sm font-bold text-slate-800">${session.shippingDetails.fullName}</p>
                <p class="text-xs text-slate-500">${session.shippingDetails.email} | ${session.shippingDetails.phone}</p>
              </div>
              <div class="text-left md:text-right">
                <p class="text-xs text-slate-500 font-medium">Total a Pagar</p>
                <p class="text-2xl font-black text-red-650 font-mono">$${session.total.toLocaleString("es-CL")}</p>
                <p class="text-[10px] text-green-600 font-bold">✓ Envío local de selección incluido</p>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Selecciona tu Medio de Pago</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Redcompra (Débito) -->
                <label class="relative flex items-center gap-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-red-500 rounded-xl p-4 cursor-pointer transition-all">
                  <input type="radio" name="payment_method" value="debito" checked class="w-5 h-5 accent-red-600">
                  <div>
                    <span class="font-bold text-slate-800 text-sm block">Redcompra / Débito</span>
                    <span class="text-[10px] text-slate-500 block">Autorización inmediata mediante tu banco</span>
                  </div>
                </label>

                <!-- Tarjeta de Crédito -->
                <label class="relative flex items-center gap-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-red-500 rounded-xl p-4 cursor-pointer transition-all">
                  <input type="radio" name="payment_method" value="credito" class="w-5 h-5 accent-red-600">
                  <div>
                    <span class="font-bold text-slate-800 text-sm block">Tarjeta de Crédito</span>
                    <span class="text-[10px] text-slate-500 block">Diferido en 1 a 36 cuotas</span>
                  </div>
                </label>

              </div>
            </div>

            <!-- Demo details simulator warning card -->
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 space-y-1">
              <h4 class="text-xs font-bold flex items-center gap-1.5 text-amber-800">
                ⚠️ Simulador Seguro de Transbanco
              </h4>
              <p class="text-[10px] text-amber-700 leading-relaxed font-light">
                Puedes simular el flujo exitoso cliqueando "Aprobar Transacción". Esto validará la recepción en nuestro backend comercial, descontará el inventario físico en tiempo real de bodega y creará tu orden oficial. Si marcas "Rechazar", se liberará el stock bloqueado.
              </p>
            </div>

            <!-- Action buttons -->
            <div class="pt-4 flex flex-col sm:flex-row gap-3">
              <form action="/webpay-callback" method="POST" class="flex-1">
                <input type="hidden" name="token" value="${token}">
                <input type="hidden" name="status" value="success">
                <button type="submit" class="w-full bg-green-600 text-white font-extrabold text-sm py-3.5 rounded-xl hover:bg-green-500 transition-colors shadow-md shadow-green-650/10">
                  ✓ Aprobar Transacción y Pagar
                </button>
              </form>
              <form action="/webpay-callback" method="POST" class="flex-1">
                <input type="hidden" name="token" value="${token}">
                <input type="hidden" name="status" value="reject">
                <button type="submit" class="w-full bg-slate-200 text-slate-700 font-semibold text-sm py-3.5 rounded-xl hover:bg-slate-300 transition-colors">
                  ✕ Cancelar y Volver a Kolchawwe
                </button>
              </form>
            </div>
            
            <p class="text-center text-[10px] text-slate-400 font-mono">Transbank Webpay Sandbox v3.5-flash - Certificado PCI Compliance</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// MERCADO PAGO CALLBACK - RECEIVE PAYMENT STATUS AND TRANSACT WITH DATASTORE
app.get("/api/mercadopago-callback", async (req, res) => {
  const { token, status, collection_status, status: mpStatus } = req.query;
  const session = activeSessions[token as string];

  if (!session) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Mercado Pago - Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-zinc-950 text-zinc-150 font-sans flex items-center justify-center min-h-screen">
          <div class="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
            <h1 class="text-xl font-bold text-red-500">Sesión de pago no válida</h1>
            <p class="text-xs text-zinc-400">La sesión de pago ha caducado o no se encuentra en el servidor comercial. Vuelve a intentar tu compra.</p>
            <a href="/" class="inline-block mt-4 text-xs font-bold text-white bg-amber-600 px-6 py-3 rounded-full hover:bg-amber-500 transition-colors">Volver a la Tienda</a>
          </div>
        </body>
      </html>
    `);
  }

  // Remove the active session from queue
  delete activeSessions[token as string];

  const isApproved = status === "success" || collection_status === "approved" || mpStatus === "approved";

  if (!isApproved) {
    return res.redirect(`/?payment_status=error&error_msg=El+pago+mediante+Mercado+Pago+no+fue+aprobado+o+fue+cancelado.`);
  }

  try {
    // Real-time server side logic: perform final lock and commit
    const products = await getProductsDb(getProducts);
    const outOfStockItems: string[] = [];

    session.items.forEach((item) => {
      const pIdx = products.findIndex((p) => p.id === item.product.id);
      if (pIdx === -1 || products[pIdx].stock < item.quantity) {
        outOfStockItems.push(item.product.name);
      }
    });

    if (outOfStockItems.length > 0) {
      return res.redirect(`/?payment_status=error&error_msg=No+hay+stock+disponible+de+último+minuto+para:+${outOfStockItems.join(", ")}`);
    }

    // Deduct products stock securely on DB
    const updatedProducts = products.map((p) => {
      const cartItem = session.items.find((item) => item.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    await saveProductsDb(updatedProducts, saveProducts);

    // Write actual Order to backend database
    const orders = await getOrdersDb(getOrders);
    const newOrder: Order = {
      id: `CK-ORD-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      date: new Date().toISOString(),
      items: session.items,
      shippingDetails: session.shippingDetails,
      subtotal: session.subtotal,
      shippingCost: session.shippingCost,
      total: session.total,
      status: "Pendiente",
      paymentId: `MP-${req.query.payment_id || Math.floor(10000000 + Math.random() * 90000000)}`
    };

    orders.unshift(newOrder); // Add to beginning of database
    await saveOrdersDb(orders, saveOrders);

    // Register customer parameters dynamically on backend datastore
    await registerClientOnOrder(session.shippingDetails);

    // Send real-time commercial email alerts to corporate account
    try {
      await sendSalesEmailNotification(newOrder);
    } catch (mailErr) {
      console.error("Non-blocking error dispatching sales commercial email:", mailErr);
    }

    // Success redirect with token references
    res.redirect(`/?payment_status=success&order_id=${newOrder.id}`);
  } catch (err) {
    console.error("Error processing successful MP callback:", err);
    res.redirect(`/?payment_status=error&error_msg=Ocurrió+un+error+al+crear+su+orden+en+el+servidor.`);
  }
});

// WEBPAY CALLBACK - RECEIVE PAYMENT STATUS AND TRANSACT WITH DATASTORE
app.post("/webpay-callback", async (req, res) => {
  const { token, status } = req.body;
  const session = activeSessions[token as string];

  if (!session) {
    return res.status(400).send("Sesión de pago no válida.");
  }

  // Remove the active session from queue
  delete activeSessions[token as string];

  if (status !== "success") {
    // Redirect with error query parameter
    return res.redirect(`/?payment_status=error&error_msg=El+pago+fue+declinado+o+cancelado+por+el+usuario.`);
  }

  try {
    // Real-time server side logic: perform final lock and commit
    const products = await getProductsDb(getProducts);
    const outOfStockItems: string[] = [];

    session.items.forEach((item) => {
      const pIdx = products.findIndex((p) => p.id === item.product.id);
      if (pIdx === -1 || products[pIdx].stock < item.quantity) {
        outOfStockItems.push(item.product.name);
      }
    });

    if (outOfStockItems.length > 0) {
      return res.redirect(`/?payment_status=error&error_msg=No+hay+stock+disponible+de+último+minuto+para:+${outOfStockItems.join(", ")}`);
    }

    // Deduct products stock securely on DB
    const updatedProducts = products.map((p) => {
      const cartItem = session.items.find((item) => item.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    await saveProductsDb(updatedProducts, saveProducts);

    // Write actual Order to backend database
    const orders = await getOrdersDb(getOrders);
    const newOrder: Order = {
      id: `CK-ORD-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      date: new Date().toISOString(),
      items: session.items,
      shippingDetails: session.shippingDetails,
      subtotal: session.subtotal,
      shippingCost: session.shippingCost,
      total: session.total,
      status: "Pendiente",
      paymentId: `WP-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    orders.unshift(newOrder); // Add to beginning of database
    await saveOrdersDb(orders, saveOrders);

    // Register customer parameters dynamically on backend datastore
    await registerClientOnOrder(session.shippingDetails);

    // Send real-time commercial email alerts to corporate account
    try {
      await sendSalesEmailNotification(newOrder);
    } catch (mailErr) {
      console.error("Non-blocking error dispatching sales commercial email:", mailErr);
    }

    // Success redirect with token references
    res.redirect(`/?payment_status=success&order_id=${newOrder.id}`);
  } catch (err) {
    console.error("Error processing successful callback:", err);
    res.redirect(`/?payment_status=error&error_msg=Ocurrio+un+error+al+crear+su+orden+en+el+servidor.`);
  }
});

// --- VITE DEV MIDDLEWARE / PRODUCTION SERVING ---

async function startServer() {
  // Initialize and provision PostgreSQL tables if DATABASE_URL is defined
  await initializePostgres(SEED_PRODUCTS);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Single page app handling - must send index.html for undefined routes or paths
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cervercería Kolchawwe Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
