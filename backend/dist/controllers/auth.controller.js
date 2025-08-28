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
exports.register = register;
exports.me = me;
exports.logout = logout;
const db_1 = require("../db");
const bcrypt = __importStar(require("bcrypt")); // kompatibel mit CJS/ESM
const auth_1 = require("../middleware/auth");
const mailer_1 = require("../utils/mailer");
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
async function register(req, res) {
    var _a, _b;
    try {
        const { companyName, contactPerson, email, phone, address, vatNumber, companyRegister, } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
        if (!companyName ||
            !contactPerson ||
            !email ||
            !phone ||
            !(address === null || address === void 0 ? void 0 : address.street) ||
            !(address === null || address === void 0 ? void 0 : address.zipCode) ||
            !(address === null || address === void 0 ? void 0 : address.city)) {
            return res.status(400).json({ error: "missing fields" });
        }
        const conn = await db_1.pool.getConnection();
        try {
            await conn.beginTransaction();
            const pwHash = await bcrypt.hash(Math.random().toString(36).slice(2), 10);
            const [uRes] = await conn.query(
            // Die Users-Tabelle erlaubt nur die Rollen 'admin' und 'user'
            // daher registrieren wir neue Nutzer immer als normalen 'user'
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'user')", [email, pwHash]);
            const userId = uRes.insertId;
            // ermittele vorhandene Spalten der Kundentabelle
            const [cols] = await conn.query("SHOW COLUMNS FROM customers");
            const available = new Set(cols.map((c) => c.Field));
            const customer = {
                user_id: userId,
                company_name: companyName,
                contact_person: contactPerson,
                phone,
            };
            if (available.has("vat_number") && vatNumber)
                customer.vat_number = vatNumber;
            // Einige Datenbanken verwenden 'company_register_no' statt 'company_register'
            if (available.has("company_register_no") && companyRegister)
                customer.company_register_no = companyRegister;
            else if (available.has("company_register") && companyRegister)
                customer.company_register = companyRegister;
            if (available.has("address_line1"))
                customer.address_line1 = address.street;
            else if (available.has("street"))
                customer.street = address.street;
            else if (available.has("address"))
                customer.address = address.street;
            const zip = address.zipCode;
            if (available.has("postal_code"))
                customer.postal_code = zip;
            else if (available.has("zip_code"))
                customer.zip_code = zip;
            else if (available.has("zip"))
                customer.zip = zip;
            if (available.has("city"))
                customer.city = address.city;
            if (available.has("country"))
                customer.country = (_b = address.country) !== null && _b !== void 0 ? _b : "AT";
            if (available.has("approval_status"))
                customer.approval_status = "pending";
            if (available.has("created_at"))
                customer.created_at = new Date();
            await conn.query("INSERT INTO customers SET ?", customer);
            await conn.commit();
            // Kunde über erfolgreiche Registrierung informieren
            try {
                await (0, mailer_1.sendMail)(email, "Registrierung bei Lampadina", `<p>Hallo ${contactPerson},</p><p>vielen Dank für Ihre Registrierung bei Lampadina.</p><p>Wir prüfen Ihre Angaben und senden Ihnen in Kürze einen Freischaltlink.</p><p>Ihr Lampadina Team</p>`);
            }
            catch (e) {
                console.error("register sendMail error:", e);
            }
            return res.json({ ok: true });
        }
        catch (err) {
            await conn.rollback();
            if ((err === null || err === void 0 ? void 0 : err.code) === "ER_DUP_ENTRY") {
                return res.status(409).json({ error: "email already registered" });
            }
            throw err;
        }
        finally {
            conn.release();
        }
    }
    catch (err) {
        console.error("auth.register error:", err);
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
