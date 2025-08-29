"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
const db_1 = require("../db");
async function list(_req, res, next) {
    try {
        const [rows] = await db_1.pool.query(`SELECT id, title, subtitle, image_url
       FROM hero_slides
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`);
        return res.json(rows);
    }
    catch (err) {
        return next(err);
    }
}
