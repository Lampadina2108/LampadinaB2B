// src/components/ProfileOverview.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, RefreshCw, Search, Trash2 } from "lucide-react";

// Versuche deine vorhandene API zu verwenden; fallback ist fetch
import { Api as AnyApi } from "../lib/api";
// @ts-ignore – tolerante Typen
const Api: any = AnyApi;

/* ----------------------------- Typen & Helpers ---------------------------- */

type CanonicalStatus = "pending" | "invited" | "active";

export type CustomerRow = {
  id: number;
  user_id: number;
  company_name: string;
  email: string;
  phone?: string | null;
  contact_person?: string | null;
  status?: string | null; // vom Backend: pending/invited/active/...
  created_at?: string;
};

function normalizeStatus(s?: string | null): CanonicalStatus {
  const v = String(s ?? "").trim().toLowerCase();
  if (["pending", "requested", "awaiting", "ausstehend"].includes(v)) return "pending";
  if (["invited", "invitation_sent", "eingeladen", "mail_sent", "invite_sent"].includes(v)) return "invited";
  return "active";
}

function StatusPill({ raw }: { raw?: string | null }) {
  const status = normalizeStatus(raw);
  const map: Record<CanonicalStatus, { text: string; cls: string }> = {
    pending: { text: "ausstehend", cls: "bg-amber-100 text-amber-800" },
    invited: { text: "Einladung gesendet", cls: "bg-blue-100 text-blue-800" },
    active: { text: "aktiv", cls: "bg-green-100 text-green-800" },
  };
  const m = map[status];
  return <span className={`inline-flex items-center px-2 py-1 rounded text-sm ${m.cls}`}>{m.text}</span>;
}

function getToken(): string | null {
  try {
    const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|;\s*)token=([^;]+)/) : null;
    if (m && m[1]) return decodeURIComponent(m[1]);
  } catch {}
  try {
    for (const k of ["token", "auth_token", "lampadina_token"]) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
  } catch {}
  return null;
}

const headersWithAuth = (): HeadersInit => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/* ------------------------------ Admin API Shim ---------------------------- */

const AdminApi = {
  async listCustomers(): Promise<{ list: CustomerRow[] }> {
    // 1) Versuche deine wrapper
    try {
      if (Api?.AdminApi?.listCustomers) return await Api.AdminApi.listCustomers();
      if (Api?.listCustomers) return await Api.listCustomers();
    } catch {}
    // 2) Fallback: direkte Route
    const r = await fetch("/api/admin/customers", {
      headers: { "Content-Type": "application/json", ...headersWithAuth() },
      credentials: "include",
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  },

  async approveCustomer(id: number): Promise<any> {
    try {
      if (Api?.AdminApi?.approveCustomer) return await Api.AdminApi.approveCustomer(id);
    } catch {}
    const r = await fetch(`/api/admin/customers/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headersWithAuth() },
      credentials: "include",
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  },

  async deleteCustomer(id: number): Promise<any> {
    try {
      if (Api?.AdminApi?.deleteCustomer) return await Api.AdminApi.deleteCustomer(id);
    } catch {}
    const r = await fetch(`/api/admin/customers/${id}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headersWithAuth() },
      credentials: "include",
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  },
};

/* -------------------------------- Component ------------------------------- */

export default function ProfileOverview() {
  const { state } = useAuth(); // enthält user/role
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAdmin = state.user?.role === "admin";

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminApi.listCustomers();
      setCustomers(Array.isArray(res?.list) ? res.list : []);
    } catch (e: any) {
      setError(e?.message || "Laden fehlgeschlagen");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) =>
      [c.company_name, c.email, c.phone, c.contact_person].some((v) =>
        String(v || "").toLowerCase().includes(s)
      )
    );
  }, [customers, q]);

  async function onApprove(id: number) {
    setLoading(true);
    try {
      await AdminApi.approveCustomer(id);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Kunde wirklich löschen?")) return;
    setLoading(true);
    try {
      await AdminApi.deleteCustomer(id);
      await load();
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Mein Konto</h1>
        <div className="text-gray-600">Keine Admin-Rechte.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Mein Konto</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Admin · Kundenverwaltung</h2>
          <button
            onClick={load}
            className="inline-flex items-center px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Neu laden
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche Firma, E-Mail, Telefon…"
            className="w-full pl-9 pr-3 py-2 border rounded"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Firma</th>
                <th className="py-2">E-Mail</th>
                <th className="py-2">Telefon</th>
                <th className="py-2">Ansprechpartner</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.company_name}</td>
                  <td className="py-2">{c.email}</td>
                  <td className="py-2">{c.phone || "-"}</td>
                  <td className="py-2">{c.contact_person || "-"}</td>
                  <td className="py-2">
                    <StatusPill raw={c.status as any} />
                  </td>
                  <td className="py-2">
                    <div className="flex items-center justify-end gap-2">
                      {normalizeStatus(c.status) !== "active" ? (
                        <button
                          onClick={() => onApprove(c.id)}
                          className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                          disabled={loading}
                        >
                          Freischalten & Einladen
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">bereits aktiv</span>
                      )}
                      <button
                        onClick={() => onDelete(c.id)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white inline-flex items-center"
                        disabled={loading}
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {loading ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Lade…
                      </span>
                    ) : (
                      "Keine Einträge gefunden."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
