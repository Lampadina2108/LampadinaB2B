import { Request, Response } from "express";
import { pool } from "../db";
import type { RowDataPacket } from "mysql2/promise";

export async function list(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, slug, name FROM categories ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error("categories.list error:", err);
    res.status(500).json({ error: "internal error" });
  }
}

export async function getBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params as { slug: string };
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, slug, name FROM categories WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("categories.getBySlug error:", err);
    res.status(500).json({ error: "internal error" });
  }
}
