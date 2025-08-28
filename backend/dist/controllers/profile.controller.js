"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
const db_1 = require("../db");
async function getProfile(req, res) {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const uid = req.user.id;
        // User
        const [uRows] = await db_1.pool.query("SELECT id, email, role FROM users WHERE id = ? LIMIT 1", [uid]);
        const user = uRows[0] || null;
        // Customer (per user_id)
        const [cRows] = await db_1.pool.query(`SELECT id, user_id, company_name, contact_person, phone,
              address_line1, postal_code, city, country,
              approval_status, activation_sent_at, activated_at, created_at
         FROM customers
        WHERE user_id = ?
        LIMIT 1`, [uid]);
        const customer = cRows[0] || null;
        return res.json({ user, customer });
    }
    catch (err) {
        console.error("getProfile error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
exports.default = { getProfile };
