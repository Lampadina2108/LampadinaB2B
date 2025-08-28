// frontend/src/components/CategoriesBar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_BASE } from "../lib/api";

type Cat = { id: number; slug: string; name: string };

export default function CategoriesBar() {
  const { pathname } = useLocation();
  const [cats, setCats] = useState<Cat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setError(null);
      try {
        const r = await fetch(`${API_BASE}/categories`, { credentials: "include" });
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const j = await r.json();
        if (!ignore) setCats(Array.isArray(j?.list) ? j.list : []);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Fehler beim Laden");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (error) {
    // sanft degradieren – keine harte Fehlermeldung, damit die Seite „lebt“
    return null;
  }

  if (!cats.length) return null;

  return (
    <nav className="border-t">
      <div className="container mx-auto px-4 overflow-x-auto">
        <ul className="flex gap-4 py-2 text-sm min-w-max">
          {cats.map((c) => {
            const active = pathname === `/category/${c.slug}`;
            return (
              <li key={c.id}>
                <Link
                  to={`/category/${c.slug}`}
                  className={`px-2 py-1 rounded hover:text-amber-600 ${
                    active ? "text-amber-600 font-medium" : "text-gray-700"
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
