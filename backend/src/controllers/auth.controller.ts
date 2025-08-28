// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { pool } from "../db";
import * as bcrypt from "bcrypt"; // kompatibel mit CJS/ESM
import { AuthedRequest, setAuthCookie, clearAuthCookie, signToken } from "../middleware/auth";
import { RowDataPacket } from "mysql2";

type UserRow = RowDataPacket & { id: number; email: string; password_hash: string; role: string };

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);
    return res.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("auth.login error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}

export async function me(req: AuthedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // optional: Kundendaten aus customers
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, company_name, contact_person, user_id FROM customers WHERE user_id = ? LIMIT 1",
      [req.user.id]
    );
    const customer = rows[0] ?? null;

    return res.json({ user: req.user, customer });
  } catch (err) {
    console.error("auth.me error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.json({ ok: true });
}
