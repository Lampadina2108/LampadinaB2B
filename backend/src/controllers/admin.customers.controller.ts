import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";
import { pool } from "../db";
import { sendMail } from "../utils/mailer";
import { ENV } from "../config/env";

// LISTEN
export async function listCustomers(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.user_id, c.company_name, c.contact_person, c.phone,
              c.approval_status, c.created_at, u.email
         FROM customers c
         LEFT JOIN users u ON u.id = c.user_id
        ORDER BY c.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("listCustomers error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}

// FREISCHALTEN
export async function approveCustomer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.user_id, u.email, c.contact_person
         FROM customers c
         LEFT JOIN users u ON u.id = c.user_id
        WHERE c.id = ?
        LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "not found" });
    const { user_id: userId, email, contact_person } = row as any;

    await pool.query<ResultSetHeader>(
      `UPDATE customers
          SET approval_status='active', activated_at=NOW(), activation_sent_at=NOW()
        WHERE id = ?`,
      [id]
    );

    // neuen Aktivierungstoken erzeugen
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query(
      `INSERT INTO password_resets (user_id, token, type, expires_at)
         VALUES (?, ?, 'activation', DATE_ADD(NOW(), INTERVAL 3 DAY))`,
      [userId, token]
    );

    const base = ENV.PUBLIC_BASE_URL || ENV.FRONTEND_URL;
    const link = `${base.replace(/\/$/, "")}/activate?token=${token}`;

    try {
      await sendMail(
        email,
        "Ihr Lampadina Freischaltlink",
        `<p>Hallo ${contact_person || ""},</p><p>Ihre Registrierung wurde freigeschaltet. Bitte setzen Sie Ihr Passwort über den folgenden Link:</p><p><a href="${link}">${link}</a></p><p>Ihr Lampadina Team</p>`
      );
    } catch (e) {
      console.error("approveCustomer sendMail error:", e);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("approveCustomer error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}

// LÖSCHEN
export async function deleteCustomer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });

    await pool.query<ResultSetHeader>("DELETE FROM customers WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteCustomer error:", err);
    return res.status(500).json({ error: "internal error" });
  }
}

export default { listCustomers, approveCustomer, deleteCustomer };
