"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordToken = validatePasswordToken;
exports.setPassword = setPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
/** GET /api/auth/password/validate?token=... */
async function validatePasswordToken(req, res) {
    const { token } = req.query;
    if (!token)
        return res.status(400).json({ error: "missing token" });
    const [rows] = await db_1.pool.query("SELECT pr.user_id, u.email FROM password_resets pr LEFT JOIN users u ON u.id=pr.user_id WHERE pr.token=? AND pr.expires_at>NOW() LIMIT 1", [token]);
    if (!Array.isArray(rows) || rows.length === 0)
        return res.status(400).json({ error: "invalid token" });
    res.json({ ok: true });
}
/** POST /api/auth/password/set { token, password } */
async function setPassword(req, res) {
    const { token, password } = req.body || {};
    if (!token || !password || String(password).length < 6) {
        return res.status(400).json({ error: "invalid payload" });
    }
    const [rows] = await db_1.pool.query("SELECT user_id FROM password_resets WHERE token=? AND expires_at>NOW() LIMIT 1", [token]);
    if (!Array.isArray(rows) || rows.length === 0)
        return res.status(400).json({ error: "invalid token" });
    const userId = rows[0].user_id;
    const hash = await bcryptjs_1.default.hash(String(password), 10);
    await db_1.pool.query("UPDATE users SET password_hash=? WHERE id=?", [hash, userId]);
    // activate customer
    await db_1.pool.query("UPDATE customers SET approval_status='active', activated_at=NOW() WHERE user_id=?", [userId]);
    // delete token
    await db_1.pool.query("DELETE FROM password_resets WHERE token=?", [token]);
    res.json({ ok: true });
}
