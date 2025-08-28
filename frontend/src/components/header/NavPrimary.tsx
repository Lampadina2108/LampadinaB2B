// src/components/header/NavPrimary.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type Cat = { id: number; slug: string; name: string };

type Props = {
  cats: Cat[];
};

export default function NavPrimary({ cats }: Props) {
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef<number | null>(null);

  // Öffnen/Schließen mit kleinem Delay gegen Flackern
  const openWithDelay = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(true), 80);
  };
  const closeWithDelay = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

  // Schließen bei Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <ul className="flex items-center gap-8 h-12 text-sm font-medium">
          {/* Kategorien – Hauptreiter */}
          <li
            className="relative"
            onMouseEnter={openWithDelay}
            onMouseLeave={closeWithDelay}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={open}
              className={`px-1 py-2 outline-none ${
                open ? "text-neutral-900" : "text-neutral-700"
              } hover:text-neutral-900`}
              onClick={() => setOpen((v) => !v)}
              onFocus={openWithDelay}
              onBlur={closeWithDelay}
            >
              Kategorien <span className="ml-1">▾</span>
            </button>

            {/* Dropdown */}
            {open && (
              <div
                className="absolute left-0 top-full z-40 w-[780px] max-w-[calc(100vw-2rem)] translate-y-2 rounded-xl border border-neutral-200 bg-white shadow-xl"
                onMouseEnter={openWithDelay}
                onMouseLeave={closeWithDelay}
              >
                <div className="p-4">
                  {!cats?.length ? (
                    <div className="text-sm text-neutral-500 p-6">
                      Keine Kategorien verfügbar.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                      {cats.map((c) => (
                        <Link
                          key={c.id}
                          to={`/category/${c.slug}`}
                          className="group flex flex-col rounded-lg border border-neutral-200 hover:border-neutral-300 focus:ring-2 focus:ring-black/10"
                          onClick={() => setOpen(false)}
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-neutral-50">
                            <img
                              src={`/uploads/categories/${c.slug}.jpg`}
                              alt={c.name}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/uploads/categories/placeholder.jpg";
                              }}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          </div>
                          <div className="px-2 py-2 text-center text-sm text-neutral-800">
                            {c.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </li>

          {/* Weitere Reiter – rein statisch */}
          <li>
            <Link to="/services" className="text-neutral-700 hover:text-neutral-900">
              Services
            </Link>
          </li>
          <li>
            <Link to="/aktionen" className="text-neutral-700 hover:text-neutral-900">
              Aktionen
            </Link>
          </li>
          <li>
            <Link to="/news" className="text-neutral-700 hover:text-neutral-900">
              News
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
