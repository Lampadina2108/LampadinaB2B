"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.dbHealth = dbHealth;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
exports.pool = promise_1.default.createPool({
    host: env_1.ENV.DB_HOST,
    port: env_1.ENV.DB_PORT,
    user: env_1.ENV.DB_USER,
    password: env_1.ENV.DB_PASSWORD,
    database: env_1.ENV.DB_NAME,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // sauberes Äquivalent zu früheren Warn-Optionen
});
async function dbHealth() {
    const conn = await exports.pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS ok');
    conn.release();
    return rows;
}
