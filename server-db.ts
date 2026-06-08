/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from "pg";
const { Pool } = pg;
import { Product, Order, ShippingConfig } from "./src/types.ts";

const connectionString = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;

if (connectionString) {
  console.log("⚡ [Database] PostgreSQL DATABASE_URL detected. Initializing pg Pool...");
  pool = new Pool({
    connectionString,
    // Render's native PostgreSQL and external connections generally require SSL enabled.
    // If not local, configure SSL connection without strict self-signed cert rejection.
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false }
  });

  pool.on("error", (err) => {
    console.error("⚠️ [Database] Unexpected error on idle PostgreSQL client:", err);
  });
} else {
  console.log("📁 [Database] No DATABASE_URL found. Falling back to local JSON directory persistence.");
}

/**
 * Validates, creates, and seeds all required relational databases tables on startup
 */
export async function initializePostgres(seedProducts: any[]) {
  if (!pool) return;

  try {
    const client = await pool.connect();
    console.log("🔌 [Database] DB Connected. Bootstrapping schemas and initial indexes...");

    // 1. Create Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline TEXT,
        description TEXT,
        category VARCHAR(100),
        price INTEGER NOT NULL,
        stock INTEGER NOT NULL,
        image TEXT,
        abv NUMERIC,
        ibu INTEGER,
        volume VARCHAR(50)
      );
    `);

    // 2. Create Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(100) NOT NULL,
        items JSONB NOT NULL,
        shipping_details JSONB NOT NULL,
        subtotal INTEGER NOT NULL,
        shipping_cost INTEGER NOT NULL,
        total INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_id VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Shipping Configuration Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipping_config (
        id VARCHAR(50) PRIMARY KEY,
        base_price INTEGER NOT NULL,
        free_shipping_threshold INTEGER NOT NULL
      );
    `);

    // --- SEED TABLES IF EMPTY ---
    
    // Seed products
    const { rows: prodCountRows } = await client.query("SELECT COUNT(*) FROM products");
    if (parseInt(prodCountRows[0].count, 10) === 0) {
      console.log("🌱 [Database] Seeding initial Kolchawwe recipes to PostgreSQL...");
      for (const p of seedProducts) {
        await client.query(
          `INSERT INTO products (id, name, tagline, description, category, price, stock, image, abv, ibu, volume)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [p.id, p.name, p.tagline, p.description, p.category, p.price, p.stock, p.image, p.abv, p.ibu, p.volume]
        );
      }
      console.log("🌱 [Database] Products seeded successfully.");
    }

    // Seed configuration
    const { rows: configCountRows } = await client.query("SELECT COUNT(*) FROM shipping_config");
    if (parseInt(configCountRows[0].count, 10) === 0) {
      console.log("🌱 [Database] Seeding default delivery configuration to PostgreSQL...");
      await client.query(
        `INSERT INTO shipping_config (id, base_price, free_shipping_threshold)
         VALUES ($1, $2, $3)`,
        ["global_config", 3500, 25000]
      );
      console.log("🌱 [Database] Delivery configuration seeded successfully.");
    }

    client.release();
    console.log("✅ [Database] PostgreSQL tables synchronized and ready for queries.");
  } catch (err) {
    console.error("❌ [Database] Failed to bootstrap PostgreSQL database:", err);
  }
}

/**
 * Retrieve current active products
 */
export async function getProductsDb(getProductsFileFallback: () => Product[]): Promise<Product[]> {
  if (!pool) return getProductsFileFallback();
  try {
    const { rows } = await pool.query(
      "SELECT id, name, tagline, description, category, price, stock, image, CAST(abv AS float) as abv, ibu, volume FROM products"
    );
    return rows as Product[];
  } catch (err) {
    console.error("⚠️ [Database] error executing 'getProductsDb', using file storage fallback:", err);
    return getProductsFileFallback();
  }
}

/**
 * Replace / Bulk update products securely
 */
export async function saveProductsDb(productsList: Product[], saveProductsFileFallback: (p: Product[]) => void): Promise<boolean> {
  if (!pool) {
    saveProductsFileFallback(productsList);
    return true;
  }
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Delete products not included in the updated list
      const idsToKeep = productsList.map((p) => p.id);
      if (idsToKeep.length > 0) {
        await client.query(
          "DELETE FROM products WHERE id NOT IN (" + idsToKeep.map((_, i) => `$${i + 1}`).join(",") + ")",
          idsToKeep
        );
      } else {
        await client.query("DELETE FROM products");
      }

      // Upsert current list
      for (const p of productsList) {
        await client.query(
          `INSERT INTO products (id, name, tagline, description, category, price, stock, image, abv, ibu, volume)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             tagline = EXCLUDED.tagline,
             description = EXCLUDED.description,
             category = EXCLUDED.category,
             price = EXCLUDED.price,
             stock = EXCLUDED.stock,
             image = EXCLUDED.image,
             abv = EXCLUDED.abv,
             ibu = EXCLUDED.ibu,
             volume = EXCLUDED.volume`,
          [p.id, p.name, p.tagline, p.description, p.category, p.price, p.stock, p.image, p.abv, p.ibu, p.volume]
        );
      }

      await client.query("COMMIT");
      return true;
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("⚠️ [Database] error executing 'saveProductsDb':", err);
    return false;
  }
}

/**
 * Get all past orders
 */
export async function getOrdersDb(getOrdersFileFallback: () => Order[]): Promise<Order[]> {
  if (!pool) return getOrdersFileFallback();
  try {
    const { rows } = await pool.query(
      "SELECT id, date, items, shipping_details as s_details, subtotal, shipping_cost, total, status, payment_id FROM orders ORDER BY created_at DESC, date DESC"
    );
    return rows.map((r: any) => ({
      id: r.id,
      date: r.date,
      items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
      shippingDetails: typeof r.s_details === "string" ? JSON.parse(r.s_details) : r.s_details,
      subtotal: r.subtotal,
      shippingCost: r.shipping_cost,
      total: r.total,
      status: r.status,
      paymentId: r.payment_id
    })) as Order[];
  } catch (err) {
    console.error("⚠️ [Database] error executing 'getOrdersDb', using file storage fallback:", err);
    return getOrdersFileFallback();
  }
}

/**
 * Replace / Bulk rewrite orders
 */
export async function saveOrdersDb(ordersList: Order[], saveOrdersFileFallback: (o: Order[]) => void): Promise<boolean> {
  if (!pool) {
    saveOrdersFileFallback(ordersList);
    return true;
  }
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const idsToKeep = ordersList.map((o) => o.id);
      if (idsToKeep.length > 0) {
        await client.query(
          "DELETE FROM orders WHERE id NOT IN (" + idsToKeep.map((_, i) => `$${i + 1}`).join(",") + ")",
          idsToKeep
        );
      } else {
        await client.query("DELETE FROM orders");
      }

      for (const o of ordersList) {
        await client.query(
          `INSERT INTO orders (id, date, items, shipping_details, subtotal, shipping_cost, total, status, payment_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             date = EXCLUDED.date,
             items = EXCLUDED.items,
             shipping_details = EXCLUDED.shipping_details,
             subtotal = EXCLUDED.subtotal,
             shipping_cost = EXCLUDED.shipping_cost,
             total = EXCLUDED.total,
             status = EXCLUDED.status,
             payment_id = EXCLUDED.payment_id`,
          [
            o.id,
            o.date,
            JSON.stringify(o.items),
            JSON.stringify(o.shippingDetails),
            o.subtotal,
            o.shippingCost,
            o.total,
            o.status,
            o.paymentId
          ]
        );
      }

      await client.query("COMMIT");
      return true;
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("⚠️ [Database] error executing 'saveOrdersDb':", err);
    return false;
  }
}

/**
 * Get core shipping configurations setup
 */
export async function getShippingConfigDb(getShippingConfigFileFallback: () => ShippingConfig): Promise<ShippingConfig> {
  if (!pool) return getShippingConfigFileFallback();
  try {
    const { rows } = await pool.query(
      "SELECT base_price, free_shipping_threshold FROM shipping_config WHERE id = 'global_config'"
    );
    if (rows.length > 0) {
      return {
        basePrice: rows[0].base_price,
        freeShippingThreshold: rows[0].free_shipping_threshold
      };
    }
    return getShippingConfigFileFallback();
  } catch (err) {
    console.error("⚠️ [Database] error executing 'getShippingConfigDb', using file fallback:", err);
    return getShippingConfigFileFallback();
  }
}

/**
 * Update core delivery configuration parameters
 */
export async function saveShippingConfigDb(config: ShippingConfig, saveShippingConfigFileFallback: (c: ShippingConfig) => void): Promise<boolean> {
  if (!pool) {
    saveShippingConfigFileFallback(config);
    return true;
  }
  try {
    await pool.query(
      `INSERT INTO shipping_config (id, base_price, free_shipping_threshold)
       VALUES ('global_config', $1, $2)
       ON CONFLICT (id) DO UPDATE SET
         base_price = EXCLUDED.base_price,
         free_shipping_threshold = EXCLUDED.free_shipping_threshold`,
      [config.basePrice, config.freeShippingThreshold]
    );
    return true;
  } catch (err) {
    console.error("⚠️ [Database] error executing 'saveShippingConfigDb':", err);
    return false;
  }
}
