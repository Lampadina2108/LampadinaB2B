"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// CORS (Front/Back auf gleicher Domain -> nur Credentials erlauben)
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
// statische Uploads
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// API unter /api
app.use("/api", routes_1.default);
// 404 Fallback
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
const PORT = +(process.env.PORT || 3001);
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
}
exports.default = app;
