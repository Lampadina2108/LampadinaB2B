"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.pingDB = pingDB;
// src/db.ts
require("dotenv/config");
const promise_1 = __importDefault(require("mysql2/promise"));
const { DB_HOST = "localhost", DB_USER = "root", DB_PASSWORD = "", DB_NAME = "", DB_PORT = "3306", } = process.env;
exports.pool = promise_1.default.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4_general_ci",
    supportBigNumbers: true,
});
async function pingDB() {
    const [rows] = await exports.pool.query("SELECT 1 AS ok");
    return Array.isArray(rows);
}
