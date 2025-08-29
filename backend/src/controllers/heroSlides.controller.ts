import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, subtitle, image_url
       FROM hero_slides
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

