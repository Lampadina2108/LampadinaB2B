// src/db.ts
import "dotenv/config";
import mysql, { Pool } from "mysql2/promise";

const {
  DB_HOST = "localhost",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "",
  DB_PORT = "3306",
} = process.env;

export const pool: Pool = mysql.createPool({
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

export async function pingDB() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return Array.isArray(rows);
}
