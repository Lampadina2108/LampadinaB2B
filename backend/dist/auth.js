"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_NAME = void 0;
exports.signToken = signToken;
exports.attachUser = attachUser;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.TOKEN_NAME = "lampadina_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
function signToken(user) {
    return jsonwebtoken_1.default.sign(user, JWT_SECRET, { expiresIn: "7d" });
}
function attachUser(req, _res, next) {
    var _a;
    try {
        const raw = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[exports.TOKEN_NAME];
        if (!raw)
            return next();
        const payload = jsonwebtoken_1.default.verify(raw, JWT_SECRET);
        req.user = payload;
    }
    catch (_e) {
        // ungültiges Token ignorieren
    }
    next();
}
function requireAuth(req, res, next) {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    next();
}
function requireAdmin(req, res, next) {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "admin")
        return res.status(403).json({ error: "Forbidden" });
    next();
}
