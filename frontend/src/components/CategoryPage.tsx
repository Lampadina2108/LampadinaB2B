import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import useCart from "../hooks/useCartSafe";
import { Api, formatPrice, toNum } from "../lib/api";

type Category = { id: number; slug: string; name: string };
type Product = {
  id: number;
  name: string;
  image_url?: string | null;
  price?: number | string | null;
  unit?: string | null;
  sku?: string | null;
};

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [sp] = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const page = Number(sp.get("page") || 1);
  const sort = sp.get("sort") || "name:asc";

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const cat = await Api.getCategory(slug);
        if (!alive) return;
        setCategory(cat);

        const res = await Api.listProducts({ category: slug, page, pageSize: 24, sort });
        if (!alive) return;
        // defensive: Stelle sicher, dass price numerisch ist
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
  }, [slug, page, sort]);

  const title = category?.name || "Kategorie";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/" className="text-slate-600 hover:text-slate-900 inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Zurück
        </Link>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2">
          {JSON.stringify({ error: err })}
        </div>
      )}

      {loading && <div className="text-slate-500">Lade…</div>}

      {!loading && items.length === 0 && !err && (
        <div className="text-slate-500">Keine Produkte gefunden.</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="rounded border bg-white hover:shadow-sm transition p-3 block"
          >
            <div className="aspect-square w-full bg-slate-50 rounded flex items-center justify-center overflow-hidden">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="object-contain w-full h-full"
                  loading="lazy"
                />
              ) : (
                <span className="text-slate-400 text-sm">kein Bild</span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-2">{p.name}</h3>
            <div className="mt-1 text-[13px] text-slate-500">{p.sku ?? ""}</div>
            <div className="mt-2 font-semibold">{formatPrice(p.price)}</div>
            {p.unit && <div className="text-xs text-slate-500">/{p.unit}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
