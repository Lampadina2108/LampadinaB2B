import React, { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { Calendar, Package } from "lucide-react";

type Order = { id: number; order_date: string; status: string; total_amount: number };

export default function OrderHistory() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/profile/orders`, { credentials: "include" })
      .then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json(); })
      .then((d) => setItems(d.items || []))
      .catch((e) => setErr(e?.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Lade Bestellungen…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!items.length) return <div className="p-6 text-gray-500">Keine Bestellungen vorhanden.</div>;

  return (
    <div className="p-4 space-y-3">
      {items.map(o => (
        <div key={o.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium">Bestellung #{o.id}</div>
              <div className="text-sm text-gray-600 inline-flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> {new Date(o.order_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm uppercase text-gray-500">{o.status}</div>
            <div className="font-semibold">{o.total_amount.toFixed(2)} €</div>
          </div>
        </div>
      ))}
    </div>
  );
}
