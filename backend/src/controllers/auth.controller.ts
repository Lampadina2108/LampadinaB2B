// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { pool } from "../db";
import * as bcrypt from "bcrypt"; // kompatibel mit CJS/ESM
import { AuthedRequest, setAuthCookie, clearAuthCookie, signToken } from "../middleware/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { sendMail } from "../utils/mailer";

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

export async function register(req: Request, res: Response) {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      vatNumber,
      companyRegister,
    } = req.body ?? {};

    if (
      !companyName ||
      !contactPerson ||
      !email ||
      !phone ||
      !address?.street ||
      !address?.zipCode ||
      !address?.city
    ) {
      return res.status(400).json({ error: "missing fields" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const pwHash = await bcrypt.hash(Math.random().toString(36).slice(2), 10);
      const [uRes] = await conn.query<ResultSetHeader>(
        // Die Users-Tabelle erlaubt nur die Rollen 'admin' und 'user'
        // daher registrieren wir neue Nutzer immer als normalen 'user'
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'user')",
        [email, pwHash],
      );
      const userId = uRes.insertId;

      // ermittele vorhandene Spalten der Kundentabelle
      const [cols] = await conn.query<RowDataPacket[]>("SHOW COLUMNS FROM customers");
      const available = new Set(cols.map((c: any) => c.Field));

      const customer: Record<string, any> = {
        user_id: userId,
        company_name: companyName,
        contact_person: contactPerson,
        phone,
      };

      if (available.has("vat_number") && vatNumber) customer.vat_number = vatNumber;
      // Einige Datenbanken verwenden 'company_register_no' statt 'company_register'
      if (available.has("company_register_no") && companyRegister)
        customer.company_register_no = companyRegister;
      else if (available.has("company_register") && companyRegister)
        customer.company_register = companyRegister;

      if (available.has("address_line1")) customer.address_line1 = address.street;
      else if (available.has("street")) customer.street = address.street;
      else if (available.has("address")) customer.address = address.street;

      const zip = address.zipCode;
      if (available.has("postal_code")) customer.postal_code = zip;
      else if (available.has("zip_code")) customer.zip_code = zip;
      else if (available.has("zip")) customer.zip = zip;

      if (available.has("city")) customer.city = address.city;
      if (available.has("country")) customer.country = address.country ?? "AT";
      if (available.has("approval_status")) customer.approval_status = "pending";
      if (available.has("created_at")) customer.created_at = new Date();

      await conn.query("INSERT INTO customers SET ?", customer);
      await conn.commit();

      // Kunde über erfolgreiche Registrierung informieren
      try {
        await sendMail(
          email,
          "Registrierung bei Lampadina",
          `<p>Hallo ${contactPerson},</p><p>vielen Dank für Ihre Registrierung bei Lampadina.</p><p>Wir prüfen Ihre Angaben und senden Ihnen in Kürze einen Freischaltlink.</p><p>Ihr Lampadina Team</p>`
        );
        await sendMail(
          "vertrieb@lampadina.icu",
          "Neue Kundenregistrierung",
          `<p>Es hat sich ein neuer Kunde registriert.</p><ul><li>Firma: ${companyName}</li><li>Ansprechpartner: ${contactPerson}</li><li>E-Mail: ${email}</li><li>Telefon: ${phone}</li></ul>`
        );

      } catch (e) {
        console.error("register sendMail error:", e);
      }

      return res.json({ ok: true });
    } catch (err: any) {
      await conn.rollback();
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "email already registered" });
      }
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("auth.register error:", err);
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
