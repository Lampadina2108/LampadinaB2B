import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type CustomerRow = {
  id: number;
  user_id?: number | null;
  company_name?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  approval_status?: "pending" | "active" | string | null;
  created_at?: string | null;
};

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "forbidden" }
  | { kind: "ready"; items: CustomerRow[] };

async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (r.status === 401 || r.status === 403) {
    // Wir signalisieren dem UI, dass kein Zugriff besteht
    throw Object.assign(new Error("forbidden"), { code: r.status });
  }
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(text || `HTTP ${r.status}`);
  }
  return r.json();
}

export default function AdminPanel() {
  const { state } = useAuth();
  const [load, setLoad] = useState<LoadState>({ kind: "idle" });
  const [q, setQ] = useState("");

  const isAdmin = state.user?.role === "admin";

  async function loadAll() {
    try {
      setLoad({ kind: "loading" });
      const items = await getJSON<CustomerRow[]>("/api/admin/customers");
      setLoad({ kind: "ready", items });
    } catch (e: any) {
      if (e?.code === 401 || e?.code === 403) {
        setLoad({ kind: "forbidden" });
      } else {
        setLoad({ kind: "error", message: e?.message || "Unbekannter Fehler" });
      }
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function approve(id: number) {
    try {
      await getJSON(`/api/admin/customers/${id}/approve`, { method: "POST" });
      await loadAll();
    } catch (e: any) {
      alert(e?.message || "Freischalten fehlgeschlagen");
    }
  }

  async function remove(id: number) {
    if (!confirm("Diesen Kunden wirklich löschen?")) return;
    try {
      await getJSON(`/api/admin/customers/${id}/delete`, { method: "POST" });
      await loadAll();
    } catch (e: any) {
      alert(e?.message || "Löschen fehlgeschlagen");
    }
  }

  const filtered = useMemo(() => {
    if (load.kind !== "ready") return [];
    const term = q.trim().toLowerCase();
    if (!term) return load.items;
    return load.items.filter((r) => {
      const line =
        `${r.company_name ?? ""} ${r.contact_person ?? ""} ${r.phone ?? ""} ${r.email ?? ""}`.toLowerCase();
      return line.includes(term);
    });
  }, [load, q]);

  // --- RENDER --------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin · Kundenverwaltung</h1>
        <button
          onClick={loadAll}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-gray-50"
          title="Neu laden"
        >
          <RefreshCw size={16} /> Neu laden
        </button>
      </div>

      {!isAdmin && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
          <ShieldAlert size={18} />
          <span>Kein Zugriff. Nur für Administratoren.</span>
        </div>
      )}

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border pl-9 pr-3 py-2"
          placeholder="Suche Firma, E-Mail, Telefon…"
        />
      </div>

      {/* Statusflächen */}
      {load.kind === "loading" && (
        <div className="rounded-md border bg-white p-6 text-gray-500">Lade…</div>
      )}
      {load.kind === "forbidden" && (
        <div className="rounded-md border bg-white p-6 text-red-600">
          Zugriff verweigert (401/403). Bitte als Admin einloggen.
        </div>
      )}
      {load.kind === "error" && (
        <div className="rounded-md border bg-white p-6 text-red-600">
          Fehler: {load.message}
        </div>
      )}

      {load.kind === "ready" && (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Firma</th>
                <th className="px-3 py-2 text-left">E-Mail</th>
                <th className="px-3 py-2 text-left">Telefon</th>
                <th className="px-3 py-2 text-left">Ansprechpartner</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                    Keine Einträge gefunden.
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{c.company_name ?? "—"}</td>
                  <td className="px-3 py-2">{c.email ?? "—"}</td>
                  <td className="px-3 py-2">{c.phone ?? "—"}</td>
                  <td className="px-3 py-2">{c.contact_person ?? "—"}</td>
                  <td className="px-3 py-2">
                    {c.approval_status === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-green-700">
                        <CheckCircle2 size={14} /> Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-amber-700">
                        • Offen
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {c.approval_status !== "active" && (
                      <button
                        onClick={() => approve(c.id)}
                        className="mr-2 rounded-md border px-2 py-1 hover:bg-gray-50"
                        title="Freischalten + Einladung"
                      >
                        Freischalten
                      </button>
                    )}
                    <button
                      onClick={() => remove(c.id)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-red-600 hover:bg-red-50"
                      title="Löschen"
                    >
                      <Trash2 size={14} /> Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
