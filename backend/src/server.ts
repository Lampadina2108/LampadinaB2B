// src/server.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import apiRouter from "./routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS (Front/Back auf gleicher Domain -> nur Credentials erlauben)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// statische Uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API unter /api
app.use("/api", apiRouter);

// 404 Fallback
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = +(process.env.PORT || 3001);
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
}

export default app;
