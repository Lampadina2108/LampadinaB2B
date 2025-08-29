import { Router } from "express";
import { attachUser, requireAuth, requireAdmin } from "../auth";

// Controller (so wie sie aktuell bei dir heißen)
import * as Auth from "../controllers/auth.controller";
import * as Profile from "../controllers/profile.controller";
import * as Products from "../controllers/products.controller";
import * as Categories from "../controllers/categories.controller";
import * as AdminCustomers from "../controllers/admin.customers.controller";
import * as AdminProducts from "../controllers/admin.products.controller";
import * as Password from "../controllers/password.controller";
import * as HeroSlides from "../controllers/heroSlides.controller";

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

// Einzelne Kategorie nach Slug
router.get("/categories/:slug", (req, res, next) => {
const c: any = Categories;
const fn = c.getBySlug ?? c.get ?? c.getCategory ?? null;
if (!fn) return res.status(404).json({ error: "not found" });
return fn(req, res, next);
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

// Kategorie Shortcut
router.get("/products/category/:slug", (req, res, next) => {
  const p: any = Products;
  const fn =
    p.listProducts ??
    p.list ??
    p.index ??
    p.search ??
    null;
  if (!fn) return res.status(501).json({ error: "products not implemented" });
  req.query.category = req.params.slug;
  return fn(req, res, next);
});

// Einzelnes Produkt
router.get("/products/:id", (req, res, next) => {
  const p: any = Products;
  const fn = p.get ?? p.getProduct ?? p.show ?? null;
  if (!fn) return res.status(501).json({ error: "product detail not implemented" });
  return fn(req, res, next);
});
// ---- Hero-Slides
router.get("/hero-slides", HeroSlides.list);

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

// ---- Admin: Produkte
router.get("/admin/products", requireAdmin, (req, res, next) => {
  const ctrl: any = AdminProducts;
  const fn = ctrl.listProducts ?? ctrl.list ?? ctrl.index ?? null;
  if (!fn) return res.status(501).json({ error: "listProducts not implemented" });
  return fn(req, res, next);
});

router.post("/admin/products", requireAdmin, (req, res, next) => {
  const ctrl: any = AdminProducts;
  const fn = ctrl.createProduct ?? ctrl.create ?? null;
  if (!fn) return res.status(501).json({ error: "createProduct not implemented" });
  return fn(req, res, next);
});

router.put("/admin/products/:id", requireAdmin, (req, res, next) => {
  const ctrl: any = AdminProducts;
  const fn = ctrl.updateProduct ?? ctrl.update ?? null;
  if (!fn) return res.status(501).json({ error: "updateProduct not implemented" });
  return fn(req, res, next);
});

router.delete("/admin/products/:id", requireAdmin, (req, res, next) => {
  const ctrl: any = AdminProducts;
  const fn = ctrl.deleteProduct ?? ctrl.remove ?? ctrl.delete ?? null;
  if (!fn) return res.status(501).json({ error: "deleteProduct not implemented" });
  return fn(req, res, next);
});

router.post(
  "/admin/products/:id/customer-price",
  requireAdmin,
  (req, res, next) => {
    const ctrl: any = AdminProducts;
    const fn = ctrl.setCustomerPrice ?? ctrl.setPrice ?? null;
    if (!fn) return res.status(501).json({ error: "setCustomerPrice not implemented" });
    return fn(req, res, next);
  }
);

router.get(
  "/admin/products/:id/customer-prices",
  requireAdmin,
  (req, res, next) => {
    const ctrl: any = AdminProducts;
    const fn = ctrl.listCustomerPrices ?? null;
    if (!fn) return res.status(501).json({ error: "listCustomerPrices not implemented" });
    return fn(req, res, next);
  }
);

router.delete(
  "/admin/products/:id/customer-price/:customerId",
  requireAdmin,
  (req, res, next) => {
    const ctrl: any = AdminProducts;
    const fn = ctrl.deleteCustomerPrice ?? null;
    if (!fn) return res.status(501).json({ error: "deleteCustomerPrice not implemented" });
    return fn(req, res, next);
  }
);

router.get("/admin/attributes", requireAdmin, (req, res, next) => {
  const ctrl: any = AdminProducts;
  const fn = ctrl.listAttributes ?? null;
  if (!fn) return res.status(501).json({ error: "listAttributes not implemented" });
  return fn(req, res, next);
});

export default router;
