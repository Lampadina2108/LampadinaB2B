"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_NAME = void 0;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.setAuthCookie = setAuthCookie;
exports.clearAuthCookie = clearAuthCookie;
exports.attachUser = attachUser;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.TOKEN_NAME = "lampadina_token";
function signToken(payload) {
    const secret = process.env.JWT_SECRET || "dev-secret";
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "30d" });
}
function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET || "dev-secret";
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch {
        return null;
    }
}
function setAuthCookie(res, token) {
    res.cookie(exports.TOKEN_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Tage
    });
}
function clearAuthCookie(res) {
    res.clearCookie(exports.TOKEN_NAME, { path: "/" });
}
function attachUser(req, _res, next) {
    var _a, _b;
    const bearer = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\s+/i, "");
    const cookieToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b[exports.TOKEN_NAME];
    const token = bearer || cookieToken;
    req.user = token ? verifyToken(token) : null;
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
