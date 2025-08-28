"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
// backend/src/config/env.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function bool(v, def = false) {
    if (v === undefined || v === null || v === "")
        return def;
    return String(v).toLowerCase() === "true";
}
exports.ENV = Object.freeze({
    NODE_ENV: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : "development",
    PORT: Number((_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3001),
    FRONTEND_URL: (_c = process.env.FRONTEND_URL) !== null && _c !== void 0 ? _c : "http://localhost:5173",
    DB_HOST: (_d = process.env.DB_HOST) !== null && _d !== void 0 ? _d : "localhost",
    DB_PORT: Number((_e = process.env.DB_PORT) !== null && _e !== void 0 ? _e : 3306),
    DB_USER: (_f = process.env.DB_USER) !== null && _f !== void 0 ? _f : "root",
    DB_PASSWORD: (_g = process.env.DB_PASSWORD) !== null && _g !== void 0 ? _g : "",
    DB_NAME: (_h = process.env.DB_NAME) !== null && _h !== void 0 ? _h : "",
    JWT_SECRET: (_j = process.env.JWT_SECRET) !== null && _j !== void 0 ? _j : "devsecret",
    SMTP_HOST: (_k = process.env.SMTP_HOST) !== null && _k !== void 0 ? _k : "",
    SMTP_PORT: Number((_l = process.env.SMTP_PORT) !== null && _l !== void 0 ? _l : 587),
    SMTP_SECURE: bool(process.env.SMTP_SECURE, false),
    SMTP_USER: (_m = process.env.SMTP_USER) !== null && _m !== void 0 ? _m : "",
    SMTP_PASS: (_o = process.env.SMTP_PASS) !== null && _o !== void 0 ? _o : "",
    MAIL_FROM: (_p = process.env.MAIL_FROM) !== null && _p !== void 0 ? _p : "",
    ADMIN_EMAIL: (_q = process.env.ADMIN_EMAIL) !== null && _q !== void 0 ? _q : "",
    PUBLIC_BASE_URL: (_r = process.env.PUBLIC_BASE_URL) !== null && _r !== void 0 ? _r : "",
    MAIL_DEBUG: bool(process.env.MAIL_DEBUG, false),
});
