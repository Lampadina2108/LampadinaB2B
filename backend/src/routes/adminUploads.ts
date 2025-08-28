// @ts-nocheck
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();

const ROOT = '/home/lampadina/htdocs/www.lampadina.icu';
const UPLOADS_ROOT = path.join(ROOT, 'uploads');
const PRODUCTS_DIR = path.join(UPLOADS_ROOT, 'products');
const HERO_DIR = path.join(UPLOADS_ROOT, 'hero-slides');

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}
function productDir(productId: string | number) {
  return path.join(PRODUCTS_DIR, String(productId));
}
function publicUrlFromAbs(absPath: string) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join('/');
  return `/${rel}`;
}

function imageFilter(_req: express.Request, file: Express.Multer.File, cb: any) {
  const ok = /image\/(jpeg|png|webp)/.test(file.mimetype);
  cb(ok ? null : new Error('Nur JPEG/PNG/WebP erlaubt'));
}

const productStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dest = productDir(req.params.productId);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname || '').toLowerCase()) || '.jpg';
    cb(null, `${Date.now()}${ext}`);
  }
});

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
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('image');

const uploadHero = multer({
  storage: heroStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('image');

// Produktbild hochladen
router.post('/products/:productId', (req, res) => {
  uploadProduct(req, res, (err) => {
    try {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Keine Datei erhalten (Feldname: image)' });

      const fileAbs = (req.file as any).path as string;
      const imageUrl = publicUrlFromAbs(fileAbs);
      return res.json({ ok: true, imageUrl, filename: path.basename(fileAbs) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Upload fehlgeschlagen' });
    }
  });
});

// Hero-Slide hochladen
router.post('/hero-slides', (req, res) => {
  uploadHero(req, res, (err) => {
    try {
      if (err) return res.status(400).json({ ok: false, error: err.message });
      if (!req.file) return res.status(400).json({ ok: false, error: 'Keine Datei erhalten (Feldname: image)' });

      const fileAbs = (req.file as any).path as string;
      const imageUrl = publicUrlFromAbs(fileAbs);
      return res.json({ ok: true, imageUrl, filename: path.basename(fileAbs) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Upload fehlgeschlagen' });
    }
  });
});

// Produktbild löschen
router.delete('/products/:productId/:filename', (req, res) => {
  try {
    const { productId, filename } = req.params;
    const absPath = path.join(productDir(productId), filename);

    if (!absPath.startsWith(productDir(productId))) {
      return res.status(400).json({ ok: false, error: 'Ungültiger Pfad' });
    }
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ ok: false, error: 'Datei nicht gefunden' });
    }
    fs.unlinkSync(absPath);
    return res.json({ ok: true, deleted: `/uploads/products/${productId}/${filename}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Löschen fehlgeschlagen' });
  }
});

export default router;
