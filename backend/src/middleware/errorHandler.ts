import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
