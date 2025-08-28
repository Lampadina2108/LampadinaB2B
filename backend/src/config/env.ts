// backend/src/config/env.ts
import * as dotenv from "dotenv";
dotenv.config();

type Env = {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;

  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  JWT_SECRET: string;

  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER: string;
  SMTP_PASS: string;

  MAIL_FROM: string;
  ADMIN_EMAIL: string;
  PUBLIC_BASE_URL: string;
  MAIL_DEBUG: boolean;
};

function bool(v: any, def = false) {
  if (v === undefined || v === null || v === "") return def;
  return String(v).toLowerCase() === "true";
}

export const ENV: Readonly<Env> = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3001),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",

  DB_HOST: process.env.DB_HOST ?? "localhost",
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_USER: process.env.DB_USER ?? "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: process.env.DB_NAME ?? "",

  JWT_SECRET: process.env.JWT_SECRET ?? "devsecret",

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_SECURE: bool(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",

  MAIL_FROM: process.env.MAIL_FROM ?? "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL ?? "",
  MAIL_DEBUG: bool(process.env.MAIL_DEBUG, false),
});
