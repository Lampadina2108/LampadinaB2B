"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const ROOT = '/home/lampadina/htdocs/www.lampadina.icu';
const UPLOADS_ROOT = path_1.default.join(ROOT, 'uploads');
const PRODUCTS_DIR = path_1.default.join(UPLOADS_ROOT, 'products');
const HERO_DIR = path_1.default.join(UPLOADS_ROOT, 'hero-slides');
function ensureDir(dirPath) {
    fs_1.default.mkdirSync(dirPath, { recursive: true });
}
function productDir(productId) {
    return path_1.default.join(PRODUCTS_DIR, String(productId));
}
function publicUrlFromAbs(absPath) {
    const rel = path_1.default.relative(ROOT, absPath).split(path_1.default.sep).join('/');
    return `/${rel}`;
}
function imageFilter(_req, file, cb) {
    const ok = /image\/(jpeg|png|webp)/.test(file.mimetype);
    cb(ok ? null : new Error('Nur JPEG/PNG/WebP erlaubt'));
}
const productStorage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const dest = productDir(req.params.productId);
        ensureDir(dest);
        cb(null, dest);
    },
    filename: (_req, file, cb) => {
        const ext = (path_1.default.extname(file.originalname || '').toLowerCase()) || '.jpg';
        cb(null, `${Date.now()}${ext}`);
    }
});
const heroStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        ensureDir(HERO_DIR);
        cb(null, HERO_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = (path_1.default.extname(file.originalname || '').toLowerCase()) || '.jpg';
        cb(null, `${Date.now()}${ext}`);
    }
});
const uploadProduct = (0, multer_1.default)({
    storage: productStorage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: imageFilter
}).single('image');
const uploadHero = (0, multer_1.default)({
    storage: heroStorage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: imageFilter
}).single('image');
// Produktbild hochladen
router.post('/products/:productId', (req, res) => {
    uploadProduct(req, res, (err) => {
        try {
            if (err)
                return res.status(400).json({ ok: false, error: err.message });
            if (!req.file)
                return res.status(400).json({ ok: false, error: 'Keine Datei erhalten (Feldname: image)' });
            const fileAbs = req.file.path;
            const imageUrl = publicUrlFromAbs(fileAbs);
            return res.json({ ok: true, imageUrl, filename: path_1.default.basename(fileAbs) });
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, error: 'Upload fehlgeschlagen' });
        }
    });
});
// Hero-Slide hochladen
router.post('/hero-slides', (req, res) => {
    uploadHero(req, res, (err) => {
        try {
            if (err)
                return res.status(400).json({ ok: false, error: err.message });
            if (!req.file)
                return res.status(400).json({ ok: false, error: 'Keine Datei erhalten (Feldname: image)' });
            const fileAbs = req.file.path;
            const imageUrl = publicUrlFromAbs(fileAbs);
            return res.json({ ok: true, imageUrl, filename: path_1.default.basename(fileAbs) });
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ ok: false, error: 'Upload fehlgeschlagen' });
        }
    });
});
// Produktbild löschen
router.delete('/products/:productId/:filename', (req, res) => {
    try {
        const { productId, filename } = req.params;
        const absPath = path_1.default.join(productDir(productId), filename);
        if (!absPath.startsWith(productDir(productId))) {
            return res.status(400).json({ ok: false, error: 'Ungültiger Pfad' });
        }
        if (!fs_1.default.existsSync(absPath)) {
            return res.status(404).json({ ok: false, error: 'Datei nicht gefunden' });
        }
        fs_1.default.unlinkSync(absPath);
        return res.json({ ok: true, deleted: `/uploads/products/${productId}/${filename}` });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ ok: false, error: 'Löschen fehlgeschlagen' });
    }
});
exports.default = router;
