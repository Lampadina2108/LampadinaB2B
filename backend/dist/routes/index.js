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
const express_1 = require("express");
const auth_1 = require("../auth");
// Controller (so wie sie aktuell bei dir heißen)
const Auth = __importStar(require("../controllers/auth.controller"));
const Profile = __importStar(require("../controllers/profile.controller"));
const Products = __importStar(require("../controllers/products.controller"));
const Categories = __importStar(require("../controllers/categories.controller"));
const AdminCustomers = __importStar(require("../controllers/admin.customers.controller"));
const Password = __importStar(require("../controllers/password.controller"));
const router = (0, express_1.Router)();
// sorgt dafür, dass req.user aus dem Cookie gesetzt wird
router.use(auth_1.attachUser);
// ---- Health
router.get("/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
// ---- Auth
router.post("/auth/login", Auth.login);
// Fallback: nimm, was der Auth-Controller tatsächlich exportiert (register / registerUser / signup / create)
router.post("/auth/register", (req, res, next) => {
    var _a, _b, _c, _d;
    const a = Auth;
    const fn = (_d = (_c = (_b = (_a = a.register) !== null && _a !== void 0 ? _a : a.registerUser) !== null && _b !== void 0 ? _b : a.signup) !== null && _c !== void 0 ? _c : a.create) !== null && _d !== void 0 ? _d : null;
    if (!fn)
        return res.status(501).json({ error: "register not implemented" });
    return fn(req, res, next);
});
router.get("/auth/me", auth_1.requireAuth, Auth.me);
// Passwort setzen / validieren
router.get("/auth/password/validate", Password.validatePasswordToken);
router.post("/auth/password/set", Password.setPassword);
// ---- Profil (liefert user + customer)
router.get("/profile", auth_1.requireAuth, Profile.getProfile);
// ---- Kategorien (bei dir heißt die Funktion meist list oder listCategories)
router.get("/categories", (req, res, next) => {
    var _a, _b;
    const c = Categories;
    const fn = (_b = (_a = c.list) !== null && _a !== void 0 ? _a : c.listCategories) !== null && _b !== void 0 ? _b : c.index;
    return fn ? fn(req, res, next) : res.json([]);
});
// ---- Produkte (listProducts / list / index / search – nimm was vorhanden ist)
router.get("/products", (req, res, next) => {
    var _a, _b, _c, _d;
    const p = Products;
    const fn = (_d = (_c = (_b = (_a = p.listProducts) !== null && _a !== void 0 ? _a : p.list) !== null && _b !== void 0 ? _b : p.index) !== null && _c !== void 0 ? _c : p.search) !== null && _d !== void 0 ? _d : null;
    if (!fn)
        return res.status(501).json({ error: "products not implemented" });
    return fn(req, res, next);
});
// Hero-Slides (verhindert 404 im Frontend – gern später durch echten Controller ersetzen)
router.get("/hero-slides", (_req, res) => res.json([]));
// ---- Admin: Kundenverwaltung
router.get("/admin/customers", auth_1.requireAdmin, (req, res, next) => {
    var _a, _b, _c;
    const ctrl = AdminCustomers;
    const fn = (_c = (_b = (_a = ctrl.listCustomers) !== null && _a !== void 0 ? _a : ctrl.list) !== null && _b !== void 0 ? _b : ctrl.index) !== null && _c !== void 0 ? _c : null;
    if (!fn)
        return res.status(501).json({ error: "listCustomers not implemented" });
    return fn(req, res, next);
});
router.post("/admin/customers/:id/approve", auth_1.requireAdmin, (req, res, next) => {
    var _a, _b;
    const ctrl = AdminCustomers;
    const fn = (_b = (_a = ctrl.approveCustomer) !== null && _a !== void 0 ? _a : ctrl.approve) !== null && _b !== void 0 ? _b : null;
    if (!fn)
        return res.status(501).json({ error: "approveCustomer not implemented" });
    return fn(req, res, next);
});
router.post("/admin/customers/:id/delete", auth_1.requireAdmin, (req, res, next) => {
    var _a, _b, _c;
    const ctrl = AdminCustomers;
    const fn = (_c = (_b = (_a = ctrl.deleteCustomer) !== null && _a !== void 0 ? _a : ctrl.remove) !== null && _b !== void 0 ? _b : ctrl.delete) !== null && _c !== void 0 ? _c : null;
    if (!fn)
        return res.status(501).json({ error: "deleteCustomer not implemented" });
    return fn(req, res, next);
});
exports.default = router;
