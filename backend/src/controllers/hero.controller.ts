// src/controllers/hero.controller.ts
import { Request, Response } from "express";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";

type Slide = RowDataPacket & {
  id: number;
  title: string | null;
  subtitle: string | null;
  image_url: string;
};

export async function listHeroSlides(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<Slide[]>(
      "SELECT id, title, subtitle, image_url FROM hero_slides ORDER BY id DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error("hero.list error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}
