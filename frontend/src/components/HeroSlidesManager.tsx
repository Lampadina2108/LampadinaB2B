// src/components/HeroSlidesManager.tsx
import React, { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

type Slide = {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
};

// Lokaler Ersatz für den früheren `cdn()`-Helper.
// - Lässt absolute URLs unverändert.
// - Wandelt relative Pfade (z.B. "uploads/hero/slide1.jpg") in absolute um,
//   indem "/api" vom API_BASE abgeschnitten wird.
function toCDN(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE.replace(/\/api\/?$/, ""); // https://domain.tld
  return `${origin}/${path.replace(/^\/+/, "")}`;
}

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [i, setI] = useState(0);

  // Slides laden
  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/hero-slides`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Slide[]) => {
        if (alive) setSlides(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setSlides([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Auto-Slide
  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  if (!slides.length) return null;

  const s = slides[i];
  const imgSrc = toCDN(s.image_url);

  return (
    <div className="relative w-full h-56 md:h-80 overflow-hidden rounded-xl bg-gray-100">
      {imgSrc && (
        <img src={imgSrc} alt={s.title || "Hero"} className="w-full h-full object-cover" />
      )}

      {(s.title || s.subtitle) && (
        <div className="absolute inset-0 bg-black/30 flex items-end">
          <div className="p-4 text-white">
            {s.title && <h2 className="text-xl md:text-2xl font-semibold">{s.title}</h2>}
            {s.subtitle && <p className="text-sm md:text-base">{s.subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
