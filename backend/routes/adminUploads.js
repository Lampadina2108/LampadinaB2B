// routes/adminUploads.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

/* ---------------------------------------------------
   Pfade (an dein System angepasst)
--------------------------------------------------- */
const ROOT = '/home/lampadina/htdocs/www.lampadina.icu';
const UPLOADS_ROOT = path.join(ROOT, 'uploads');
const PRODUCTS_DIR = path.join(UPLOADS_ROOT, 'products');      // /uploads/products/:productId/...
const HERO_DIR = path.join(UPLOADS_ROOT, 'hero-slides');       // /uploads/hero-slides/...

/* ---------------------------------------------------
   Hilfsfunktionen
--------------------------------------------------- */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function productDir(productId) {
  return path.join(PRODUCTS_DIR, String(productId));
}

function publicUrlFromAbs(absPath) {
  // abs: /home/.../www.lampadina.icu/uploads/...
  // url: /uploads/...
  const rel = path.relative(ROOT, absPath).split(path.sep).join('/');
  return `/${rel}`;
}

/* ---------------------------------------------------
   Multer-Setup (Dateien direkt auf Platte)
--------------------------------------------------- */

// Einheitliche Filterung: nur Bilder
function imageFilter(_req, file, cb) {
  const ok = /image\/(jpeg|png|webp)/.test(file.mimetype);
  cb(ok ? null : new Error('Nur JPEG/PNG/WebP erlaubt'), ok);
}

// Produktbilder: Zielverzeichnis hängt von :productId ab
const productStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dest = productDir(req.params.productId);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    // Dateiname: <timestamp><ext>
    const ext = (path.extname(file.originalname || '').toLowerCase()) || '.jpg';
    cb(null, `${Date.now()}${ext}`);
  }
});

// Hero-Slides: flach in /uploads/hero-slides
const heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(HERO_DIR);
    cb(null, HERO_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname || '').toLowerCase()) || '.jpg';
    cb(null, `${Date.now()}${ext}`);
  }
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: imageFilter
}).single('image');

const uploadHero = multer({
  storage: heroStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('image');

/* ---------------------------------------------------
   ROUTES
--------------------------------------------------- */

/**
 * Produktbild hochladen
 * POST /api/admin/uploads/products/:productId
 * Body (multipart/form-data): image=<file>
 */
router.post('/products/:productId', (req, res) => {
  uploadProduct(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Keine Datei erhalten (Feldname: image)' });

      const fileAbs = req.file.path;            // absoluter Pfad
      const imageUrl = publicUrlFromAbs(fileAbs); // /uploads/products/:id/<filename>

      // Optional: In DB speichern (Beispiel – nur wenn du hier DB-Zugriff hast)
      // await req.db.execute(
      //   `INSERT INTO product_images (product_id, image_url, sort_order)
      //    VALUES (?, ?, (SELECT COALESCE(MAX(sort_order),0)+1 FROM product_images WHERE product_id=?))`,
      //   [req.params.productId, imageUrl, req.params.productId]
      // );

      return res.json({ ok: true, imageUrl, filename: path.basename(fileAbs) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Upload fehlgeschlagen' });
    }
  });
});

/**
 * Hero-Slide Bild hochladen
 * POST /api/admin/uploads/hero-slides
 * Body (multipart/form-data): image=<file>
 */
router.post('/hero-slides', (req, res) => {
  uploadHero(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Keine Datei erhalten (Feldname: image)' });

      const fileAbs = req.file.path;
      const imageUrl = publicUrlFromAbs(fileAbs); // /uploads/hero-slides/<filename>

      // Optional: DB-Eintrag in hero_slides anlegen
      // await req.db.execute(
      //   `INSERT INTO hero_slides (title, subtitle, image_url, sort_order, is_active)
      //    VALUES (?, ?, ?, ?, ?)`,
      //   ['Titel', 'Untertitel', imageUrl, 0, 1]
      // );

      return res.json({ ok: true, imageUrl, filename: path.basename(fileAbs) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Upload fehlgeschlagen' });
    }
  });
});

/**
 * Produktbild löschen
 * DELETE /api/admin/uploads/products/:productId/:filename
 */
router.delete('/products/:productId/:filename', async (req, res) => {
  try {
    const { productId, filename } = req.params;
    const absPath = path.join(productDir(productId), filename);

    if (!absPath.startsWith(productDir(productId))) {
      // primitive Sicherheit gegen Pfad-Manipulation
      return res.status(400).json({ ok: false, error: 'Ungültiger Pfad' });
    }

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ ok: false, error: 'Datei nicht gefunden' });
    }

    fs.unlinkSync(absPath);

    // Optional: passenden DB-Eintrag entfernen
    // await req.db.execute(
    //   `DELETE FROM product_images WHERE product_id = ? AND image_url = ?`,
    //   [productId, `/uploads/products/${productId}/${filename}`]
    // );

    return res.json({ ok: true, deleted: `/uploads/products/${productId}/${filename}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Löschen fehlgeschlagen' });
  }
});

module.exports = router;
