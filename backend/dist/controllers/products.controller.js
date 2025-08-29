"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.get = get;
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
        let priceSelect = "NULL AS price";
        let joinPrice = "";
        const finalParams = [...params];
        if (req.user) {
            priceSelect = "COALESCE(cp.special_price, p.price) AS price";
            joinPrice =
                " LEFT JOIN customers c ON c.user_id = ? LEFT JOIN customer_prices cp ON cp.product_id = p.id AND cp.customer_id = c.id";
            finalParams.push(req.user.id);
        }
        const sqlData = `
      SELECT
        p.id, p.sku, p.name, p.category_slug, p.brand, p.description,
        ${priceSelect}, p.stock_quantity, p.created_at,
        COALESCE(
          MAX(CASE WHEN i.is_primary = 1 THEN i.image_url END),
          MAX(i.image_url)
        ) AS image_url
      FROM products p
      LEFT JOIN product_images i ON i.product_id = p.id
      ${joinPrice}
      ${whereSql}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`;
        finalParams.push(pageSize, offset);
        const [rows] = await db_1.pool.query(sqlData, finalParams);
        // Wenn kein User eingeloggt ist, sicherstellen, dass Preis null ist
        const items = rows.map((r) => ({ ...r, price: req.user ? r.price : null }));
        res.json({ items, total, page, pageSize });
    }
    catch (err) {
        console.error("products.list error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
/**
 * GET /api/products/:id
 * Liefert ein Produkt inklusive Bilder und Attribute.
 * Preis wird nur geliefert, wenn der Benutzer eingeloggt ist. Ist ein
 * kundenspezifischer Preis vorhanden, wird dieser verwendet.
 */
async function get(req, res) {
    try {
        const id = parseInt(String(req.params.id), 10);
        if (!id)
            return res.status(400).json({ error: "invalid id" });
        // Basisdaten des Produkts
        const [prodRows] = await db_1.pool.query(`SELECT id, sku, name, description, category_slug, brand, price, stock_quantity
       FROM products WHERE id = ? LIMIT 1`, [id]);
        if (!prodRows.length)
            return res.status(404).json({ error: "not found" });
        const product = prodRows[0];
        // Preis nur für angemeldete Nutzer ermitteln
        if (req.user) {
            const [priceRows] = await db_1.pool.query(`SELECT COALESCE(cp.special_price, p.price) AS price
         FROM products p
         LEFT JOIN customers c ON c.user_id = ?
         LEFT JOIN customer_prices cp ON cp.product_id = p.id AND cp.customer_id = c.id
         WHERE p.id = ?`, [req.user.id, id]);
            product.price = priceRows.length ? priceRows[0].price : product.price;
        }
        else {
            product.price = null;
        }
        // Bilder
        const [imageRows] = await db_1.pool.query(`SELECT id, image_url, is_primary
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order, id`, [id]);
        product.images = imageRows.map((r) => ({
            id: r.id,
            url: r.image_url,
            is_primary: r.is_primary === 1,
        }));
        // Attribute
        const [attrRows] = await db_1.pool.query(`SELECT a.code, a.label, ao.label AS value
       FROM product_attributes pa
       JOIN attributes a ON pa.attribute_id = a.id
       JOIN attribute_options ao ON pa.option_id = ao.id
       WHERE pa.product_id = ?
       ORDER BY a.id`, [id]);
        product.attributes = attrRows.map((r) => ({
            code: r.code,
            label: r.label,
            value: r.value,
        }));
        res.json(product);
    }
    catch (err) {
        console.error("products.get error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
