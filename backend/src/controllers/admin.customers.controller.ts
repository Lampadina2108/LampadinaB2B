import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db";

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

    await pool.query<ResultSetHeader>(
      `UPDATE customers
          SET approval_status='active', activated_at=NOW()
        WHERE id = ?`,
      [id]
    );

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
