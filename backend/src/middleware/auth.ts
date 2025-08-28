// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const TOKEN_NAME = "lampadina_token";

type JWTPayload = { id: number; email: string; role: string };

export function signToken(payload: JWTPayload) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(TOKEN_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Tage
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(TOKEN_NAME, { path: "/" });
}

export interface AuthedRequest extends Request {
  user?: JWTPayload | null;
}

export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const cookieToken = (req as any).cookies?.[TOKEN_NAME];
  const token = bearer || cookieToken;
  req.user = token ? verifyToken(token) : null;
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}
