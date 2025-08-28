"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = listCustomers;
exports.approveCustomer = approveCustomer;
exports.deleteCustomer = deleteCustomer;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const mailer_1 = require("../utils/mailer");
const env_1 = require("../config/env");
// LISTEN
async function listCustomers(_req, res) {
    try {
        const [rows] = await db_1.pool.query(`SELECT c.id, c.user_id, c.company_name, c.contact_person, c.phone,
              c.approval_status, c.created_at, u.email
         FROM customers c
         LEFT JOIN users u ON u.id = c.user_id
        ORDER BY c.created_at DESC`);
        return res.json(rows);
    }
    catch (err) {
        console.error("listCustomers error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
// FREISCHALTEN
async function approveCustomer(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "bad id" });
        const [rows] = await db_1.pool.query(`SELECT c.user_id, u.email, c.contact_person
         FROM customers c
         LEFT JOIN users u ON u.id = c.user_id
        WHERE c.id = ?
        LIMIT 1`, [id]);
        const row = rows[0];
        if (!row)
            return res.status(404).json({ error: "not found" });
        const { user_id: userId, email, contact_person } = row;
        await db_1.pool.query(`UPDATE customers
          SET approval_status='active', activated_at=NOW(), activation_sent_at=NOW()
        WHERE id = ?`, [id]);
        // neuen Aktivierungstoken erzeugen
        const token = crypto_1.default.randomBytes(32).toString("hex");
        await db_1.pool.query(`INSERT INTO password_resets (user_id, token, type, expires_at)
         VALUES (?, ?, 'activation', DATE_ADD(NOW(), INTERVAL 3 DAY))`, [userId, token]);
        const base = env_1.ENV.PUBLIC_BASE_URL || env_1.ENV.FRONTEND_URL;
        const link = `${base.replace(/\/$/, "")}/activate?token=${token}`;
        try {
            await (0, mailer_1.sendMail)(email, "Ihr Lampadina Freischaltlink", `<p>Hallo ${contact_person || ""},</p><p>Ihre Registrierung wurde freigeschaltet. Bitte setzen Sie Ihr Passwort über den folgenden Link:</p><p><a href="${link}">${link}</a></p><p>Ihr Lampadina Team</p>`);
        }
        catch (e) {
            console.error("approveCustomer sendMail error:", e);
        }
        return res.json({ ok: true });
    }
    catch (err) {
        console.error("approveCustomer error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
// LÖSCHEN
async function deleteCustomer(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "bad id" });
        await db_1.pool.query("DELETE FROM customers WHERE id = ?", [id]);
        return res.json({ ok: true });
    }
    catch (err) {
        console.error("deleteCustomer error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
exports.default = { listCustomers, approveCustomer, deleteCustomer };
