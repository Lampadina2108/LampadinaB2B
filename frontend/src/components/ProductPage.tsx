import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE, cdn } from "../lib/api";

type Attr = { code: string; label: string; value: string; option_label?: string };
type Img = { id: number; image_url: string };
type Product = {
  id: number; sku: string; name: string; description?: string | null;
  price?: number | null; brand?: string | null; images?: Img[]; attributes?: Attr[];
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Product | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    fetch(`${API_BASE}/products/${id}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data) => setP(data))
      .catch((e) => setErr(e?.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-gray-500">Lade…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!p) return null;

  const img = p.images && p.images[0]?.image_url;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="aspect-square bg-gray-50">
          <img src={cdn(img || "")} alt={p.name} className="w-full h-full object-cover" />
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500">SKU: {p.sku}</div>
        <h1 className="text-2xl font-semibold mb-1">{p.name}</h1>
        <div className="text-sm text-gray-600 mb-4">{p.brand || "—"}</div>
        {p.price == null ? (
          <div className="text-sm text-gray-500 mb-4">Bitte einloggen, um Preise zu sehen</div>
        ) : (
          <div className="text-2xl font-semibold mb-4">{p.price.toFixed(2)} €</div>
        )}
        <p className="text-gray-700 mb-6">{p.description}</p>

        {p.attributes && p.attributes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Produktparameter</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {p.attributes.map((a, idx) => (
                <div key={idx} className="flex justify-between border-b py-1">
                  <span className="text-gray-600">{a.label}</span>
                  <span className="font-medium">{a.option_label || a.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
