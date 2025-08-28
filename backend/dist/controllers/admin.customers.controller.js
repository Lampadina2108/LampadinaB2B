"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = listCustomers;
exports.approveCustomer = approveCustomer;
exports.deleteCustomer = deleteCustomer;
const db_1 = require("../db");
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
        await db_1.pool.query(`UPDATE customers
          SET approval_status='active', activated_at=NOW()
        WHERE id = ?`, [id]);
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
