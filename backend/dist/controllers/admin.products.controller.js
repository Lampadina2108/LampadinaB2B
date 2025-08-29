"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.setCustomerPrice = setCustomerPrice;
const db_1 = require("../db");
async function listProducts(_req, res) {
    try {
        const [rows] = await db_1.pool.query("SELECT id, sku, name, price FROM products ORDER BY id DESC");
        res.json(rows);
    }
    catch (err) {
        console.error("listProducts error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function createProduct(req, res) {
    try {
        const { sku, name, price } = req.body || {};
        if (!sku || !name)
            return res.status(400).json({ error: "missing fields" });
        const [result] = await db_1.pool.query("INSERT INTO products (sku, name, price, is_active) VALUES (?, ?, ?, 1)", [sku, name, price !== null && price !== void 0 ? price : 0]);
        res.json({ id: result.insertId });
    }
    catch (err) {
        console.error("createProduct error:", err);
        res.status(500).json({ error: "internal error" });
    }
}
async function updateProduct(req, res) {
    try {
        const id = Number(req.params.id);
        const { sku, name, price } = req.body || {};
        if (!id || !sku || !name)
            return res.status(400).json({ error: "bad request" });
        await db_1.pool.query("UPDATE products SET sku=?, name=?, price=? WHERE id=?", [sku, name, price !== null && price !== void 0 ? price : 0, id]);
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
exports.default = {
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setCustomerPrice,
};
