import { Router } from "express";
import { attachUser, requireAuth, requireAdmin } from "../auth";

// Controller (so wie sie aktuell bei dir heißen)
import * as Auth from "../controllers/auth.controller";
import * as Profile from "../controllers/profile.controller";
import * as Products from "../controllers/products.controller";
import * as Categories from "../controllers/categories.controller";
import * as AdminCustomers from "../controllers/admin.customers.controller";
import * as Password from "../controllers/password.controller";

const router = Router();

// sorgt dafür, dass req.user aus dem Cookie gesetzt wird
router.use(attachUser);

// ---- Health
router.get("/health", (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// ---- Auth
router.post("/auth/login", Auth.login);

// Fallback: nimm, was der Auth-Controller tatsächlich exportiert (register / registerUser / signup / create)
router.post("/auth/register", (req, res, next) => {
  const a: any = Auth;
  const fn =
    a.register ??
    a.registerUser ??
    a.signup ??
    a.create ??
    null;
  if (!fn) return res.status(501).json({ error: "register not implemented" });
  return fn(req, res, next);
});

router.get("/auth/me", requireAuth, Auth.me);

// Passwort setzen / validieren
router.get("/auth/password/validate", Password.validatePasswordToken);
router.post("/auth/password/set", Password.setPassword);

// ---- Profil (liefert user + customer)
router.get("/profile", requireAuth, Profile.getProfile);

// ---- Kategorien (bei dir heißt die Funktion meist list oder listCategories)
router.get("/categories", (req, res, next) => {
  const c: any = Categories;
  const fn = c.list ?? c.listCategories ?? c.index;
  return fn ? fn(req, res, next) : res.json([]);
});

// ---- Produkte (listProducts / list / index / search – nimm was vorhanden ist)
router.get("/products", (req, res, next) => {
  const p: any = Products;
  const fn =
    p.listProducts ??
    p.list ??
    p.index ??
    p.search ??
    null;
  if (!fn) return res.status(501).json({ error: "products not implemented" });
  return fn(req, res, next);
});

// Hero-Slides (verhindert 404 im Frontend – gern später durch echten Controller ersetzen)
router.get("/hero-slides", (_req, res) => res.json([]));

// ---- Admin: Kundenverwaltung
router.get(
  "/admin/customers",
  requireAdmin,
  (req, res, next) => {
    const ctrl: any = AdminCustomers;
    const fn =
      ctrl.listCustomers ??
      ctrl.list ??
      ctrl.index ??
      null;
    if (!fn) return res.status(501).json({ error: "listCustomers not implemented" });
    return fn(req, res, next);
  }
);

router.post(
  "/admin/customers/:id/approve",
  requireAdmin,
  (req, res, next) => {
    const ctrl: any = AdminCustomers;
    const fn =
      ctrl.approveCustomer ??
      ctrl.approve ??
      null;
    if (!fn) return res.status(501).json({ error: "approveCustomer not implemented" });
    return fn(req, res, next);
  }
);

router.post(
  "/admin/customers/:id/delete",
  requireAdmin,
  (req, res, next) => {
    const ctrl: any = AdminCustomers;
    const fn =
      ctrl.deleteCustomer ??
      ctrl.remove ??
      ctrl.delete ??
      null;
    if (!fn) return res.status(501).json({ error: "deleteCustomer not implemented" });
    return fn(req, res, next);
  }
);

export default router;
