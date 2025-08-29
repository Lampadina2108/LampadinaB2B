import { Request, Response } from "express";
import { pool } from "../db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function listProducts(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, sku, name, price FROM products ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { sku, name, price } = req.body || {};
    if (!sku || !name)
      return res.status(400).json({ error: "missing fields" });
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO products (sku, name, price, is_active) VALUES (?, ?, ?, 1)",
      [sku, name, price ?? 0]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { sku, name, price } = req.body || {};
    if (!id || !sku || !name)
      return res.status(400).json({ error: "bad request" });
    await pool.query<ResultSetHeader>(
      "UPDATE products SET sku=?, name=?, price=? WHERE id=?",
      [sku, name, price ?? 0, id]
    );
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

export default {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setCustomerPrice,
};
