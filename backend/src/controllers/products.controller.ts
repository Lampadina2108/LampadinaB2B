import { Request, Response } from "express";
import { pool } from "../db";
import type { RowDataPacket } from "mysql2/promise";

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
