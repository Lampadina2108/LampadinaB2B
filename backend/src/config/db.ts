import mysql from 'mysql2/promise';
import { ENV } from './env';

export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // sauberes Äquivalent zu früheren Warn-Optionen
});

export async function dbHealth() {
  const conn = await pool.getConnection();
  const [rows] = await conn.query('SELECT 1 AS ok');
  conn.release();
  return rows;
}
