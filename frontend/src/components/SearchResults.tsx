import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Api, formatPrice, toNum } from "../lib/api";

type Product = {
  id: number;
  name: string;
  image_url?: string | null;
  price?: number | string | null;
};

export default function SearchResults() {
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr(null);
      setLoading(true);
      try {
        const res = await Api.listProducts({
          search: q,
          page: 1,
          pageSize: 48,
          sort: "name:asc",
        });
        if (!alive) return;
        const safe = (res.items ?? []).map((p: any) => ({
          ...p,
          price: toNum(p?.price, NaN),
        }));
        setItems(safe);
      } catch (e: any) {
        setErr(e?.message || "Fehler");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">
        Suche: <span className="text-slate-600">{q || "—"}</span>
      </h1>

      {err && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2">
          {JSON.stringify({ error: err })}
        </div>
      )}
      {loading && <div className="text-slate-500">Lade…</div>}
      {!loading && items.length === 0 && !err && (
        <div className="text-slate-500">Keine Produkte gefunden.</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((p) => (
          <article key={p.id} className="rounded border bg-white hover:shadow-sm transition p-3">
            <div className="aspect-square w-full bg-slate-50 rounded flex items-center justify-center overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="object-contain w-full h-full" />
              ) : (
                <span className="text-slate-400 text-sm">kein Bild</span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-2">{p.name}</h3>
            <div className="mt-2 font-semibold">{formatPrice(p.price)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
