"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.setCustomerPrice = setCustomerPrice;
exports.listCustomerPrices = listCustomerPrices;
exports.deleteCustomerPrice = deleteCustomerPrice;
exports.listAttributes = listAttributes;
const db_1 = require("../db");
async function listProducts(req, res) {
    try {
        const search = String(req.query.search || "").trim();
        const category = String(req.query.category || "").trim();
        const where = [];
        const params = [];
        if (search) {
            where.push("(sku LIKE ? OR name LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            where.push("category_slug = ?");
            params.push(category);
        }
        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
        const [rows] = await db_1.pool.query(`SELECT id, sku, name, price, purchase_price, shipping_cost FROM products ${whereSql} ORDER BY id DESC`, params);
        res.json(rows);
    }
    catch (err) {
        console.error("listProducts error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function createProduct(req, res) {
    try {
        const { sku, name, price, purchase_price, shipping_cost, attributes } = req.body || {};
        if (!sku || !name)
            return res.status(400).json({ error: "missing fields" });
        const [result] = await db_1.pool.query("INSERT INTO products (sku, name, price, purchase_price, shipping_cost, is_active) VALUES (?, ?, ?, ?, ?, 1)", [sku, name, price !== null && price !== void 0 ? price : 0, purchase_price !== null && purchase_price !== void 0 ? purchase_price : 0, shipping_cost !== null && shipping_cost !== void 0 ? shipping_cost : 0]);
        const productId = result.insertId;
        if (Array.isArray(attributes)) {
            await saveAttributes(productId, attributes);
        }
        res.json({ id: productId });
    }
    catch (err) {
        console.error("createProduct error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function updateProduct(req, res) {
    try {
        const id = Number(req.params.id);
        const { sku, name, price, purchase_price, shipping_cost, attributes } = req.body || {};
        if (!id || !sku || !name)
            return res.status(400).json({ error: "bad request" });
        await db_1.pool.query("UPDATE products SET sku=?, name=?, price=?, purchase_price=?, shipping_cost=? WHERE id=?", [sku, name, price !== null && price !== void 0 ? price : 0, purchase_price !== null && purchase_price !== void 0 ? purchase_price : 0, shipping_cost !== null && shipping_cost !== void 0 ? shipping_cost : 0, id]);
        if (Array.isArray(attributes)) {
            await saveAttributes(id, attributes);
        }
        res.json({ ok: true });
    }
    catch (err) {
        console.error("updateProduct error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function deleteProduct(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id)
            return res.status(400).json({ error: "bad id" });
        await db_1.pool.query("DELETE FROM products WHERE id=?", [id]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error("deleteProduct error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function setCustomerPrice(req, res) {
    try {
        const productId = Number(req.params.id);
        const { customerId, price } = req.body || {};
        if (!productId || !customerId)
            return res.status(400).json({ error: "bad request" });
        const [rows] = await db_1.pool.query("SELECT id FROM customer_prices WHERE customer_id=? AND product_id=? LIMIT 1", [customerId, productId]);
        if (rows.length) {
            await db_1.pool.query("UPDATE customer_prices SET special_price=? WHERE id=?", [price, rows[0].id]);
        }
        else {
            await db_1.pool.query("INSERT INTO customer_prices (customer_id, product_id, special_price) VALUES (?, ?, ?)", [customerId, productId, price]);
        }
        res.json({ ok: true });
    }
    catch (err) {
        console.error("setCustomerPrice error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function listCustomerPrices(req, res) {
    try {
        const productId = Number(req.params.id);
        if (!productId)
            return res.status(400).json({ error: "bad id" });
        const [rows] = await db_1.pool.query(`SELECT cp.customer_id, cp.special_price, c.company_name
       FROM customer_prices cp
       JOIN customers c ON c.id = cp.customer_id
       WHERE cp.product_id = ?
       ORDER BY c.company_name`, [productId]);
        res.json(rows);
    }
    catch (err) {
        console.error("listCustomerPrices error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function deleteCustomerPrice(req, res) {
    try {
        const productId = Number(req.params.id);
        const customerId = Number(req.params.customerId);
        if (!productId || !customerId)
            return res.status(400).json({ error: "bad request" });
        await db_1.pool.query("DELETE FROM customer_prices WHERE product_id=? AND customer_id=?", [productId, customerId]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error("deleteCustomerPrice error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function listAttributes(_req, res) {
    try {
        const [rows] = await db_1.pool.query(`SELECT a.id as attribute_id, a.code, a.label, ao.id as option_id, ao.label as option_label
       FROM attributes a
       LEFT JOIN attribute_options ao ON ao.attribute_id = a.id
       ORDER BY a.id, ao.sort_order`);
        const map = {};
        for (const r of rows) {
            if (!map[r.attribute_id]) {
                map[r.attribute_id] = {
                    id: r.attribute_id,
                    code: r.code,
                    label: r.label,
                    options: [],
                };
            }
            if (r.option_id) {
                map[r.attribute_id].options.push({
                    id: r.option_id,
                    label: r.option_label,
                });
            }
        }
        res.json(Object.values(map));
    }
    catch (err) {
        console.error("listAttributes error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function saveAttributes(productId, attrs) {
    await db_1.pool.query("DELETE FROM product_attributes WHERE product_id=?", [productId]);
    for (const a of attrs) {
        if (!a.attribute_id || !a.option_id)
            continue;
        await db_1.pool.query("INSERT INTO product_attributes (product_id, attribute_id, option_id) VALUES (?, ?, ?)", [productId, a.attribute_id, a.option_id]);
    }
}
exports.default = {
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setCustomerPrice,
    listCustomerPrices,
    deleteCustomerPrice,
    listAttributes,
};
