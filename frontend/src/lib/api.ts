// src/lib/api.ts
// Zentrale API-Utilities fürs Frontend

export const API_BASE = "/api";

/** ---------- Token Utilities (für optionale Bearer-Nutzung) ---------- */
const LS_KEY = "lampadina_token";

export function saveToken(token: string | null | undefined) {
  if (!token) return clearToken();
  try {
    localStorage.setItem(LS_KEY, token);
  } catch {}
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

/** ---------- Hilfsfunktionen ---------- */
export function toNum(input: any, fallback = 0): number {
  if (typeof input === "number" && isFinite(input)) return input;
  if (typeof input === "string") {
    // Komma zulassen (EU-Format)
    const s = input.replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function formatPrice(value: number | string | null | undefined): string {
  const n = toNum(value, NaN);
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Liefert eine absolute URL für Upload-/Bildpfade */
export function cdn(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  // akzeptiere schon führende Slashes
  return `/${String(path).replace(/^\/+/, "")}`;
}

/** Querystring Builder */
function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** zentraler Fetch-Wrapper */
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  // Falls ein (optionaler) Bearer genutzt werden soll
  if (token && !("Authorization" in headers)) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // wichtig für HttpOnly-Cookie-Session
    ...init,
    headers,
  });

  // Versuche JSON zu lesen – auch bei Fehlern
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignorieren – z.B. bei leerem Body
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data as T;
}

/** ---------- API-Funktionen ---------- */

type Category = { id: number; slug: string; name: string };

type Product = {
  id: number;
  name: string;
  image_url?: string | null;
  price?: number | string | null;
  unit?: string | null;
  sku?: string | null;
};

type ProductListResponse = {
  items: Product[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export const Api = {
  // Auth
  login(email: string, password: string) {
    return request<{ ok?: true; user?: any; token?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((res) => {
      // Wenn dein Backend zusätzlich ein Token zurückgibt, im LocalStorage ablegen
      if (res?.token) saveToken(res.token);
      return res;
    });
  },
  logout() {
    clearToken();
    return request<{ ok: true }>("/auth/logout", { method: "POST" });
  },
  me() {
    return request<{ user: { id: number; email: string; role: string }; customer?: any }>(
      "/auth/me",
      { method: "GET" },
    );
  },
  requestAccess(payload: {
    companyName: string;
    vatNumber?: string;
    companyRegister?: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: { street: string; zipCode: string; city: string; country?: string };
  }) {
    return request<{ ok: true }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Kategorien
  listCategories() {
    return request<Category[]>("/categories");
  },
  getCategory(slug: string) {
    return request<Category>(`/categories/${encodeURIComponent(slug)}`);
  },

  // Produkte
  listProducts(params: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    sort?: string; // z.B. "name:asc" oder "price:desc"
  }) {
    const { search, category, page = 1, pageSize = 24, sort = "name:asc" } = params || {};
    const query = qs({ search, category, page, pageSize, sort });
    return request<ProductListResponse>(`/products${query}`).then((r) => {
      // defensiv: Preise numerisch machen
      const items = (r.items ?? []).map((p) => ({
        ...p,
        price: toNum(p.price, NaN),
      }));
      return { ...r, items };
    });
  },

  // Hero Slides (Admin)
  listHeroSlides() {
    return request<{ id: number; title?: string; subtitle?: string; image_url: string }[]>(
      "/hero-slides",
    );
  },

  // Profil (optional genutzt)
  getProfile() {
    return request("/profile");
  },
};

// Optionaler Admin-Wrapper (für bestehende Imports)
export const AdminApi = {
  listCustomers() {
    return request<{ list: any[] }>("/admin/customers");
  },
  approveAndInvite(id: number) {
    return request(`/admin/customers/${id}/approve`, { method: "POST" });
  },
  deleteCustomer(id: number) {
    return request(`/admin/customers/${id}/delete`, { method: "POST" });
  },
};

// Default-Export zusätzlich anbieten, falls irgendwo "import Api from ..." genutzt wird
export default Api;
