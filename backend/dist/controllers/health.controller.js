"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.health = health;
const db_1 = require("../config/db");
const env_1 = require("../config/env");
async function health(req, res) {
    var _a, _b;
    try {
        const [products] = await db_1.pool.query('SELECT COUNT(*) AS cnt FROM products');
        const count = (_b = (_a = products[0]) === null || _a === void 0 ? void 0 : _a.cnt) !== null && _b !== void 0 ? _b : 0;
        res.json({
            status: 'OK',
            api: 'Lampadina B2B',
            db: 'connected',
            products: count,
            port: env_1.ENV.PORT,
            nodeEnv: env_1.ENV.NODE_ENV,
            time: new Date().toISOString()
        });
    }
    catch (e) {
        res.status(500).json({ status: 'ERROR', error: e.message });
    }
}
