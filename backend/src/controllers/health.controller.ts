import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ENV } from '../config/env';

export async function health(req: Request, res: Response) {
  try {
    const [products] = await pool.query('SELECT COUNT(*) AS cnt FROM products');
    const count = (products as any)[0]?.cnt ?? 0;

    res.json({
      status: 'OK',
      api: 'Lampadina B2B',
      db: 'connected',
      products: count,
      port: ENV.PORT,
      nodeEnv: ENV.NODE_ENV,
      time: new Date().toISOString()
    });
  } catch (e: any) {
    res.status(500).json({ status: 'ERROR', error: e.message });
  }
}
