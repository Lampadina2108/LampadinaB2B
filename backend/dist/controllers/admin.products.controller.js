import { Request, Response } from "express";
import { pool } from "../db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function listProducts(req: Request, res: Response) {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const where: string[] = [];
    const params: any[] = [];
    if (search) {
      where.push("(sku LIKE ? OR name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push("category_slug = ?");
      params.push(category);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, sku, name, price, purchase_price, shipping_cost FROM products ${whereSql} ORDER BY id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { sku, name, price, purchase_price, shipping_cost, attributes } =
      req.body || {};
    if (!sku || !name)
      return res.status(400).json({ error: "missing fields" });
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO products (sku, name, price, purchase_price, shipping_cost, is_active) VALUES (?, ?, ?, ?, ?, 1)",
      [sku, name, price ?? 0, purchase_price ?? 0, shipping_cost ?? 0]
    );
    const productId = result.insertId;
    if (Array.isArray(attributes)) {
      await saveAttributes(productId, attributes);
    }
    res.json({ id: productId });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { sku, name, price, purchase_price, shipping_cost, attributes } =
      req.body || {};
    if (!id || !sku || !name)
      return res.status(400).json({ error: "bad request" });
    await pool.query<ResultSetHeader>(
      "UPDATE products SET sku=?, name=?, price=?, purchase_price=?, shipping_cost=? WHERE id=?",
      [sku, name, price ?? 0, purchase_price ?? 0, shipping_cost ?? 0, id]
    );
    if (Array.isArray(attributes)) {
      await saveAttributes(id, attributes);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "bad id" });
    await pool.query<ResultSetHeader>("DELETE FROM products WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function setCustomerPrice(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);
    const { customerId, price } = req.body || {};
    if (!productId || !customerId)
      return res.status(400).json({ error: "bad request" });
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM customer_prices WHERE customer_id=? AND product_id=? LIMIT 1",
      [customerId, productId]
    );
    if (rows.length) {
      await pool.query<ResultSetHeader>(
        "UPDATE customer_prices SET special_price=? WHERE id=?",
        [price, (rows[0] as any).id]
      );
    } else {
      await pool.query<ResultSetHeader>(
        "INSERT INTO customer_prices (customer_id, product_id, special_price) VALUES (?, ?, ?)",
        [customerId, productId, price]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("setCustomerPrice error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function listCustomerPrices(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);
    if (!productId) return res.status(400).json({ error: "bad id" });
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cp.customer_id, cp.special_price, c.company_name
       FROM customer_prices cp
       JOIN customers c ON c.id = cp.customer_id
       WHERE cp.product_id = ?
       ORDER BY c.company_name`,
      [productId]
    );
    res.json(rows);
  } catch (err) {
    console.error("listCustomerPrices error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function deleteCustomerPrice(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);
    const customerId = Number(req.params.customerId);
    if (!productId || !customerId)
      return res.status(400).json({ error: "bad request" });
    await pool.query<ResultSetHeader>(
      "DELETE FROM customer_prices WHERE product_id=? AND customer_id=?",
      [productId, customerId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteCustomerPrice error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function listAttributes(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT a.id as attribute_id, a.code, a.label, ao.id as option_id, ao.label as option_label
       FROM attributes a
       LEFT JOIN attribute_options ao ON ao.attribute_id = a.id
       ORDER BY a.id, ao.sort_order`
    );
    const map: Record<number, any> = {};
    for (const r of rows) {
      if (!map[r.attribute_id]) {
        map[r.attribute_id] = {
          id: r.attribute_id,
          code: r.code,
          label: r.label,
          options: [],
        };
      }
      if (r.option_id) {
        map[r.attribute_id].options.push({
          id: r.option_id,
          label: r.option_label,
        });
      }
    }
    res.json(Object.values(map));
  } catch (err) {
    console.error("listAttributes error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

async function saveAttributes(
  productId: number,
  attrs: { attribute_id: number; option_id: number }[]
) {
  await pool.query("DELETE FROM product_attributes WHERE product_id=?", [productId]);
  for (const a of attrs) {
    if (!a.attribute_id || !a.option_id) continue;
    await pool.query(
      "INSERT INTO product_attributes (product_id, attribute_id, option_id) VALUES (?, ?, ?)",
      [productId, a.attribute_id, a.option_id]
    );
  }
}

export default {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setCustomerPrice,
  listCustomerPrices,
  deleteCustomerPrice,
  listAttributes,
};