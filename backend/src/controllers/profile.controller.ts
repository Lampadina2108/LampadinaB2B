// Liefert User + Customer-Datensatz für das eingeloggte Konto
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db";

type ReqUser = Request & { user?: { id: number; email: string; role: string } };

export async function getProfile(req: ReqUser, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const uid = req.user.id;

    // User
    const [uRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, role FROM users WHERE id = ? LIMIT 1",
      [uid]
    );
    const user = uRows[0] || null;

    // Customer (per user_id)
    const [cRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, user_id, company_name, contact_person, phone,
              address_line1, postal_code, city, country,
              approval_status, activation_sent_at, activated_at, created_at
         FROM customers
        WHERE user_id = ?
        LIMIT 1`,
      [uid]
    );
    const customer = cRows[0] || null;

    return res.json({ user, customer });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}

export default { getProfile };
