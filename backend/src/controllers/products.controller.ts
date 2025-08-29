import { Request, Response } from "express";
import { pool } from "../db";
import type { RowDataPacket } from "mysql2/promise";
import type { AuthedRequest } from "../auth";

interface ProductRowPacket extends RowDataPacket {
  id: number;
  sku: string;
  name: string;
  category_slug: string | null;
  brand: string | null;
  description: string | null;
  price: number | null;
  stock_quantity: number | null;
  created_at: string;
  image_url: string | null;
}

function parseSort(raw: string | undefined) {
  const safe = String(raw ?? "").trim().toLowerCase();
  const [field, dirRaw] = safe.split(":");
  const dir = dirRaw === "desc" ? "DESC" : "ASC";

  const map: Record<string, string> = {
    name: "p.name",
    price: "p.price",
    created: "p.created_at",
    created_at: "p.created_at",
  };

  return `${map[field] ?? "p.name"} ${dir}`;
}

/**
 * GET /api/products
 * Query:
 *  - search: string
 *  - category | cat: slug
 *  - page (default 1), pageSize (default 24, max 100)
 *  - sort: name:asc | price:desc | created_at:asc
 */
export async function list(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(String(req.query.pageSize ?? "24"), 10) || 24, 1),
      100
    );
    const offset = (page - 1) * pageSize;

    const search = String(req.query.search ?? "").trim();
    const category = String(req.query.category ?? req.query.cat ?? "")
      .trim()
      .toLowerCase();

    const orderBy = parseSort(String(req.query.sort));

    const where: string[] = ["p.is_active = 1"];
    const params: any[] = [];

    if (category) {
      where.push("p.category_slug = ?");
      params.push(category);
    }
    if (search) {
      where.push("(p.name LIKE ? OR p.sku LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sqlCount = `SELECT COUNT(*) AS cnt FROM products p ${whereSql}`;
    const [cntRows] = await pool.query<RowDataPacket[]>(sqlCount, params);
    const total = Number((cntRows[0] as any)?.cnt ?? 0);

    const sqlData = `
      SELECT
        p.id, p.sku, p.name, p.category_slug, p.brand, p.description,
        p.price, p.stock_quantity, p.created_at,
        COALESCE(
          MAX(CASE WHEN i.is_primary = 1 THEN i.image_url END),
          MAX(i.image_url)
        ) AS image_url
      FROM products p
      LEFT JOIN product_images i ON i.product_id = p.id
      ${whereSql}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`;

    const [rows] = await pool.query<ProductRowPacket[]>(
      sqlData,
      [...params, pageSize, offset]
    );

    // rows ist bereits typisiert, nur sauber als JSON zurückgeben
    res.json({ items: rows, total, page, pageSize });
  } catch (err) {
    console.error("products.list error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

/**
 * GET /api/products/:id
 * Liefert ein Produkt inklusive Bilder und Attribute.
 * Preis wird nur geliefert, wenn der Benutzer eingeloggt ist. Ist ein
 * kundenspezifischer Preis vorhanden, wird dieser verwendet.
 */
export async function get(req: AuthedRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (!id) return res.status(400).json({ error: "invalid id" });

    // Basisdaten des Produkts
    const [prodRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, sku, name, description, category_slug, brand, price, stock_quantity
       FROM products WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!prodRows.length) return res.status(404).json({ error: "not found" });
    const product: any = prodRows[0];

    // Preis nur für angemeldete Nutzer ermitteln
    if (req.user) {
      const [priceRows] = await pool.query<RowDataPacket[]>(
        `SELECT COALESCE(cp.special_price, p.price) AS price
         FROM products p
         LEFT JOIN customers c ON c.user_id = ?
         LEFT JOIN customer_prices cp ON cp.product_id = p.id AND cp.customer_id = c.id
         WHERE p.id = ?`,
        [req.user.id, id]
      );
      product.price = priceRows.length ? priceRows[0].price : product.price;
    } else {
      product.price = null;
    }

    // Bilder
    const [imageRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, image_url, is_primary
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order, id`,
      [id]
    );
    product.images = imageRows.map((r) => ({
      id: r.id,
      url: r.image_url,
      is_primary: r.is_primary === 1,
    }));

    // Attribute
    const [attrRows] = await pool.query<RowDataPacket[]>(
      `SELECT a.code, a.label, ao.label AS value
       FROM product_attributes pa
       JOIN attributes a ON pa.attribute_id = a.id
       JOIN attribute_options ao ON pa.option_id = ao.id
       WHERE pa.product_id = ?
       ORDER BY a.id`,
      [id]
    );
    product.attributes = attrRows.map((r) => ({
      code: r.code,
      label: r.label,
      value: r.value,
    }));

    res.json(product);
  } catch (err) {
    console.error("products.get error:", err);
    res.status(500).json({ error: "internal error" });
  }
}
