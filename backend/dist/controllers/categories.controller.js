"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getBySlug = getBySlug;
const db_1 = require("../db");
async function list(_req, res) {
    try {
        const [rows] = await db_1.pool.query("SELECT id, slug, name FROM categories ORDER BY name");
        res.json(rows);
    }
    catch (err) {
        console.error("categories.list error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function getBySlug(req, res) {
    try {
        const { slug } = req.params;
        const [rows] = await db_1.pool.query("SELECT id, slug, name FROM categories WHERE slug = ? LIMIT 1", [slug]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "not found" });
        }
        res.json(rows[0]);
    }
    catch (err) {
        console.error("categories.getBySlug error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
