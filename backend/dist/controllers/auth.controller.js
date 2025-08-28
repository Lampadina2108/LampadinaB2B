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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
exports.logout = logout;
const db_1 = require("../db");
const bcrypt = __importStar(require("bcrypt")); // kompatibel mit CJS/ESM
const auth_1 = require("../middleware/auth");
async function login(req, res) {
    var _a;
    try {
        const { email, password } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
        if (!email || !password)
            return res.status(400).json({ error: "Missing credentials" });
        const [rows] = await db_1.pool.query("SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1", [email]);
        const user = rows[0];
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = (0, auth_1.signToken)({ id: user.id, email: user.email, role: user.role });
        (0, auth_1.setAuthCookie)(res, token);
        return res.json({ user: { id: user.id, email: user.email, role: user.role } });
    }
    catch (err) {
        console.error("auth.login error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
async function me(req, res) {
    var _a;
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        // optional: Kundendaten aus customers
        const [rows] = await db_1.pool.query("SELECT id, company_name, contact_person, user_id FROM customers WHERE user_id = ? LIMIT 1", [req.user.id]);
        const customer = (_a = rows[0]) !== null && _a !== void 0 ? _a : null;
        return res.json({ user: req.user, customer });
    }
    catch (err) {
        console.error("auth.me error:", err);
        return res.status(500).json({ error: "internal error" });
    }
}
async function logout(_req, res) {
    (0, auth_1.clearAuthCookie)(res);
    res.json({ ok: true });
}
