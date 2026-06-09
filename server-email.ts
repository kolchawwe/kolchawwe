import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { Order, EmailLog } from "./src/types";

const DB_DIR = path.join(process.cwd(), "data-db");
const LOG_FILE = path.join(DB_DIR, "email-logs.json");
const CONFIG_FILE = path.join(DB_DIR, "email-config.json");

// Ensure DB folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

// Ensure database files exist
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ corporateEmail: process.env.BREWERY_CORPORATE_EMAIL || "kolchawwe@gmail.com" }, null, 2));
}

export function getCorporateEmail(): string {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    return config.corporateEmail || process.env.BREWERY_CORPORATE_EMAIL || "kolchawwe@gmail.com";
  } catch (err) {
    return process.env.BREWERY_CORPORATE_EMAIL || "kolchawwe@gmail.com";
  }
}

export function saveCorporateEmail(email: string): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ corporateEmail: email }, null, 2));
  } catch (err) {
    console.error("Error saving corporate email:", err);
  }
}

export function getEmailLogs(): EmailLog[] {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8")) as EmailLog[];
  } catch (err) {
    console.error("Error reading email logs:", err);
    return [];
  }
}

export function saveEmailLogs(logs: EmailLog[]): void {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Error saving email logs:", err);
  }
}

/**
 * Validates if SMTP parameters are fully configured for real deliveries.
 */
export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
}

/**
 * Builds a highly responsive and elegantly presented sales email.
 */
export function buildSalesEmailBody(order: Order): string {
  const formattedDate = new Date(order.date).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  });

  const itemRowsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #1f2937; color: #e4e4e7; font-family: sans-serif; font-size: 14px;">
        <strong>${item.product.name}</strong> <span style="color: #71717a; font-size: 12px;">(${item.product.volume})</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: center; color: #f4f4f5; font-family: monospace; font-size: 14px;">
        x${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: right; color: #f4f4f5; font-family: monospace; font-size: 14px;">
        ${currencyFormatter.format(item.product.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Venta Registrada - Cervecería Kolchawwe</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: system-ui, -apple-system, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" max-width="600" style="max-width: 600px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; margin-top: 30px; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border-bottom: 2px solid #d97706;">
              <h1 style="margin: 0; color: #fbbf24; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">🍻 NUEVA VENTA REGISTRADA</h1>
              <p style="margin: 10px 0 0 0; color: #a1a1aa; font-size: 14px; font-weight: 500; font-family: monospace;">Orden: ${order.id}</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #e4e4e7; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola Equipo Kolchawwe, se ha autorizado exitosamente una nueva transacción comercial en la tienda online. A continuación, se detallan los parámetros de entrega y facturación para gestionar el despacho inmediato.
              </p>
              
              <!-- Client and Shipping Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 25px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #fbbf24; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace;">Cliente & Información de Despacho</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; line-height: 1.5; color: #d4d4d8;">
                      <tr>
                        <td style="padding-bottom: 6px; width: 30%; color: #71717a; font-weight: 600;">Nombre Completo:</td>
                        <td style="padding-bottom: 6px; color: #ffffff; font-weight: 700;">${order.shippingDetails.fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 6px; color: #71717a; font-weight: 600;">Correo:</td>
                        <td style="padding-bottom: 6px; color: #a1a1aa;"><a href="mailto:${order.shippingDetails.email}" style="color: #fbbf24; text-decoration: none;">${order.shippingDetails.email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 6px; color: #71717a; font-weight: 600;">Teléfono:</td>
                        <td style="padding-bottom: 6px; color: #ffffff;">+56 ${order.shippingDetails.phone}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 6px; color: #71717a; font-weight: 600;">Dirección Física:</td>
                        <td style="padding-bottom: 6px; color: #ffffff; font-weight: 600;">${order.shippingDetails.address}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 6px; color: #71717a; font-weight: 600;">Comuna:</td>
                        <td style="padding-bottom: 6px; color: #ffffff; text-transform: capitalize; font-weight: 700;">${order.shippingDetails.commune}</td>
                      </tr>
                      ${order.shippingDetails.notes ? `
                      <tr>
                        <td style="padding-top: 10px; color: #71717a; font-weight: 600; vertical-align: top;">Notas del Cliente:</td>
                        <td style="padding-top: 10px; color: #fbbf24; font-style: italic; font-size: 13px; line-height: 1.4;">"${order.shippingDetails.notes}"</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Cart Products Table -->
              <h3 style="margin: 0 0 10px 0; color: #a1a1aa; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace;">Detalle del Pedido</h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 25px;">
                <thead>
                  <tr style="background-color: #18181b; border-bottom: 2px solid #27272a;">
                    <th style="padding: 10px 12px; text-align: left; color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase;">Producto</th>
                    <th style="padding: 10px 12px; text-align: center; color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase; width: 60px;">Cant.</th>
                    <th style="padding: 10px 12px; text-align: right; color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase; width: 105px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRowsHtml}
                </tbody>
              </table>

              <!-- Financial Box -->
              <table border="0" cellpadding="0" cellspacing="0" align="right" width="220" style="margin-bottom: 30px; font-family: sans-serif; font-size: 13px; color: #a1a1aa; line-height: 1.8;">
                <tr>
                  <td style="text-align: left; padding: 4px 0;">Subtotal Neto:</td>
                  <td style="text-align: right; padding: 4px 0; color: #ffffff; font-family: monospace;">${currencyFormatter.format(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="text-align: left; padding: 4px 0;">Envío local:</td>
                  <td style="text-align: right; padding: 4px 0; color: #ffffff; font-family: monospace;">${order.shippingCost === 0 ? "Gratis" : currencyFormatter.format(order.shippingCost)}</td>
                </tr>
                <tr style="border-top: 1px solid #27272a;">
                  <td style="text-align: left; padding: 10px 0 0 0; font-weight: bold; color: #fbbf24; font-size: 14px;">Total Cobrado:</td>
                  <td style="text-align: right; padding: 10px 0 0 0; font-weight: bold; color: #fbbf24; font-size: 16px; font-family: monospace;">${currencyFormatter.format(order.total)}</td>
                </tr>
              </table>
              
              <div style="clear: both;"></div>

              <hr style="border: 0; border-top: 1px solid #27272a; margin: 15px 0 25px 0;">

              <!-- Control parameters -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 11px; color: #71717a; font-family: monospace; line-height: 1.4;">
                <tr>
                  <td>Pasarela de Pago: ${order.paymentId.startsWith("MP-") ? "Mercado Pago" : "Webpay Plus"}</td>
                  <td style="text-align: right;">Código Transacción: ${order.paymentId}</td>
                </tr>
                <tr>
                  <td>Fecha de Compra: ${formattedDate}</td>
                  <td style="text-align: right;">Fulfillment SLA: Despacho Courier local 48 hrs</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.APP_URL || "http://localhost:3000"}" style="display: inline-block; background-color: #fbbf24; color: #09090b; font-weight: 800; font-size: 14px; text-decoration: none; padding: 15px 30px; border-radius: 12px; transition: background-color 0.2s;">
                  Gestionar Despacho en Panel de Control
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #18181b; border-top: 1px solid #27272a; text-align: center; color: #52525b; font-size: 11px; font-family: monospace;">
              Mensaje automático generado por Cervecería Kolchawwe Commercial Dispatcher Service.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Triggers a sales email notification, delivering a real SMTP message if configured,
 * or saving/logging a high-fidelity simulation model inside the database logs.
 */
export async function sendSalesEmailNotification(order: Order): Promise<EmailLog> {
  const corporateEmail = getCorporateEmail();
  const subject = `🍻 Nueva Venta Registrada • Pedido ${order.id} [${order.shippingDetails.fullName}]`;
  const emailBody = buildSalesEmailBody(order);

  const newLogEntry: EmailLog = {
    id: `MLG-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString(),
    toEmail: corporateEmail,
    sender: process.env.SMTP_FROM || "alertas@kolchawwe.cl",
    subject,
    body: emailBody,
    orderId: order.id,
    status: "Simulated"
  };

  if (isSmtpConfigured()) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Cervecería Kolchawwe" <alertas@kolchawwe.cl>`,
        to: corporateEmail,
        subject,
        html: emailBody
      });

      newLogEntry.status = "Sent";
      console.log(`✉️ [Mail Service] Real corporate sales notification sent successfully to: ${corporateEmail}`);
    } catch (err: any) {
      console.error(`❌ [Mail Service] Real SMTP email delivery failed:`, err);
      newLogEntry.status = "Failed";
      newLogEntry.errorMessage = err.message || String(err);
    }
  } else {
    console.log(`✉️ [Mail Service] Running in SIMULATOR mode. SMTP env settings are not configured.`);
    console.log(`✉️ [Mail Service] Logged simulated sale dispatch notification template successfully to: ${corporateEmail}`);
  }

  // Save entry in logs DB
  try {
    const logs = getEmailLogs();
    logs.unshift(newLogEntry);
    saveEmailLogs(logs.slice(0, 50)); // Cap logs history trace limit at 50 to optimize memory
  } catch (err) {
    console.error("Error committing email log record:", err);
  }

  return newLogEntry;
}

/**
 * Triggers a test email notification to verify system settings.
 */
export async function sendTestEmailNotification(targetEmail: string): Promise<EmailLog> {
  const subject = `🍻 Prueba de Notificación de Ventas • Cervecería Kolchawwe`;
  
  const testOrderMock: Order = {
    id: `CK-ORD-TEST`,
    date: new Date().toISOString(),
    items: [
      {
        product: {
          id: "beer-1",
          name: "Kolchawwe British Golden Ale",
          tagline: "Nuestra insignia de selección",
          description: "Exquisita receta artesanal...",
          category: "Lager",
          price: 3100,
          stock: 120,
          image: "",
          abv: 5.2,
          ibu: 20,
          volume: "330cc"
        },
        quantity: 3
      }
    ],
    shippingDetails: {
      fullName: "Comprador de Prueba",
      email: "prueba@cliente.cl",
      address: "Paseo de las Flores 210",
      commune: "San Fernando",
      phone: "912345678",
      notes: "Por favor dejar en conserjería."
    },
    subtotal: 9300,
    shippingCost: 3500,
    total: 12800,
    status: "Pendiente",
    paymentId: "MP-TEST-TRANSACTION-OK"
  };

  const emailBody = buildSalesEmailBody(testOrderMock);

  const newLogEntry: EmailLog = {
    id: `MLG-TEST`,
    date: new Date().toISOString(),
    toEmail: targetEmail,
    sender: process.env.SMTP_FROM || "alertas@kolchawwe.cl",
    subject,
    body: emailBody,
    status: "Simulated"
  };

  if (isSmtpConfigured()) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Cervecería Kolchawwe" <alertas@kolchawwe.cl>`,
        to: targetEmail,
        subject,
        html: emailBody
      });

      newLogEntry.status = "Sent";
    } catch (err: any) {
      newLogEntry.status = "Failed";
      newLogEntry.errorMessage = err.message || String(err);
    }
  }

  // Save log trace
  try {
    const logs = getEmailLogs();
    logs.unshift(newLogEntry);
    saveEmailLogs(logs.slice(0, 50));
  } catch (err) {
    // ignore
  }

  return newLogEntry;
}
