import React, { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { FileText } from "lucide-react";

type Invoice = { id: number; invoice_date: string; total_amount: number };

export default function InvoiceManagement() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/profile/invoices`, { credentials: "include" })
      .then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json(); })
      .then((d) => setItems(d.items || []))
      .catch((e) => setErr(e?.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Lade Rechnungen…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!items.length) return <div className="p-6 text-gray-500">Keine Rechnungen vorhanden.</div>;

  return (
    <div className="p-4 grid gap-3">
      {items.map(inv => (
        <div key={inv.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium">Rechnung #{inv.id}</div>
              <div className="text-sm text-gray-600">{new Date(inv.invoice_date).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="font-semibold">{inv.total_amount.toFixed(2)} €</div>
        </div>
      ))}
    </div>
  );
}
