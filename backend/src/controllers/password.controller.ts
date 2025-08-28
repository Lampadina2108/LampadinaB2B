import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";

/** GET /api/auth/password/validate?token=... */
export async function validatePasswordToken(req: Request, res: Response) {
  const { token } = req.query as any;
  if (!token) return res.status(400).json({ error: "missing token" });

  const [rows] = await pool.query<any[]>(
    "SELECT pr.user_id, u.email FROM password_resets pr LEFT JOIN users u ON u.id=pr.user_id WHERE pr.token=? AND pr.expires_at>NOW() LIMIT 1",
    [token]
  );
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "invalid token" });
  res.json({ ok: true });
}

/** POST /api/auth/password/set { token, password } */
export async function setPassword(req: Request, res: Response) {
  const { token, password } = req.body || {};
  if (!token || !password || String(password).length < 6) {
    return res.status(400).json({ error: "invalid payload" });
  }
  const [rows] = await pool.query<any[]>(
    "SELECT user_id FROM password_resets WHERE token=? AND expires_at>NOW() LIMIT 1",
    [token]
  );
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "invalid token" });
  const userId = rows[0].user_id;

  const hash = await bcrypt.hash(String(password), 10);
  await pool.query("UPDATE users SET password_hash=? WHERE id=?", [hash, userId]);

  // activate customer
  await pool.query("UPDATE customers SET approval_status='active', activated_at=NOW() WHERE user_id=?", [userId]);

  // delete token
  await pool.query("DELETE FROM password_resets WHERE token=?", [token]);

  res.json({ ok: true });
}
