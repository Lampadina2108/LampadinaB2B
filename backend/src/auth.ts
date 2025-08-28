// src/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const TOKEN_NAME = "lampadina_token";

export type JwtUser = {
  id: number;
  email: string;
  role: "admin" | "user";
};

export type AuthedRequest = Request & { user?: JwtUser };

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(user: JwtUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const raw = req.cookies?.[TOKEN_NAME];
    if (!raw) return next();
    const payload = jwt.verify(raw, JWT_SECRET) as JwtUser;
    req.user = payload;
  } catch (_e) {
    // ungültiges Token ignorieren
  }
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
