"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
const db_1 = require("../db");
function parseSort(raw) {
    var _a;
    const safe = String(raw !== null && raw !== void 0 ? raw : "").trim().toLowerCase();
    const [field, dirRaw] = safe.split(":");
    const dir = dirRaw === "desc" ? "DESC" : "ASC";
    const map = {
        name: "p.name",
        price: "p.price",
        created: "p.created_at",
        created_at: "p.created_at",
    };
    return `${(_a = map[field]) !== null && _a !== void 0 ? _a : "p.name"} ${dir}`;
}
/**
 * GET /api/products
 * Query:
 *  - search: string
 *  - category | cat: slug
 *  - page (default 1), pageSize (default 24, max 100)
 *  - sort: name:asc | price:desc | created_at:asc
 */
async function list(req, res) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : "1"), 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(String((_b = req.query.pageSize) !== null && _b !== void 0 ? _b : "24"), 10) || 24, 1), 100);
        const offset = (page - 1) * pageSize;
        const search = String((_c = req.query.search) !== null && _c !== void 0 ? _c : "").trim();
        const category = String((_e = (_d = req.query.category) !== null && _d !== void 0 ? _d : req.query.cat) !== null && _e !== void 0 ? _e : "")
            .trim()
            .toLowerCase();
        const orderBy = parseSort(String(req.query.sort));
        const where = ["p.is_active = 1"];
        const params = [];
        if (category) {
            where.push("p.category_slug = ?");
            params.push(category);
        }
        if (search) {
            where.push("(p.name LIKE ? OR p.sku LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }
        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
        const sqlCount = `SELECT COUNT(*) AS cnt FROM products p ${whereSql}`;
        const [cntRows] = await db_1.pool.query(sqlCount, params);
        const total = Number((_g = (_f = cntRows[0]) === null || _f === void 0 ? void 0 : _f.cnt) !== null && _g !== void 0 ? _g : 0);
        const sqlData = `
      SELECT
        p.id, p.sku, p.name, p.category_slug, p.brand, p.description,
        p.price, p.stock_quantity, p.created_at,
        COALESCE(
          MAX(CASE WHEN i.is_primary = 1 THEN i.image_url END),
          MAX(i.image_url)
        ) AS image_url
      FROM products p
      LEFT JOIN product_images i ON i.product_id = p.id
      ${whereSql}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`;
        const [rows] = await db_1.pool.query(sqlData, [...params, pageSize, offset]);
        // rows ist bereits typisiert, nur sauber als JSON zurückgeben
        res.json({ items: rows, total, page, pageSize });
    }
    catch (err) {
        console.error("products.list error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
