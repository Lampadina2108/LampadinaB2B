"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHeroSlides = listHeroSlides;
const db_1 = require("../db");
async function listHeroSlides(_req, res) {
    try {
        const [rows] = await db_1.pool.query("SELECT id, title, subtitle, image_url FROM hero_slides ORDER BY id DESC");
        return res.json(rows);
    }
    catch (err) {
        console.error("hero.list error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
