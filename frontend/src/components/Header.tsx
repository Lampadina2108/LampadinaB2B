// Orchestrates the whole header (lädt Kategorien/Profil + fügt Subkomponenten zusammen)

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

// Versuche deinen bestehenden API-Wrapper zu benutzen; Fallback auf /api
import { Api as AnyApi } from "../lib/api";
// @ts-ignore – flexible Wrapper
const Api: any = AnyApi;

import LogoSearch from "./header/LogoSearch";
import NavPrimary from "./header/NavPrimary";
import InfoBar from "./header/InfoBar";

// ---- types -----------------------------------------------------------------

export type Category = { id: number; name: string; slug: string };

export type ProfilePayload = {
  user?: { id: number; email: string; role: string };
  customer?:
    | {
        id: number;
        user_id?: number;
        company_name?: string;
        contact_person?: string;
        phone?: string;
        address_line1?: string;
        postal_code?: string;
        city?: string;
        country?: string;
        created_at?: string;
        approval_status?: string | null;
        activation_sent_at?: string | null;
        activated_at?: string | null;
      }
    | null;
};

// ---- helpers ---------------------------------------------------------------

async function getCategoriesAny(): Promise<Category[]> {
  try {
    const res =
      (await Api?.getCategories?.()) ??
      (await Api?.listCategories?.()) ??
      (await Api?.categories?.list?.());
    if (Array.isArray(res)) return res as Category[];
    if (res?.items && Array.isArray(res.items)) return res.items as Category[];
    if (res?.list && Array.isArray(res.list)) return res.list as Category[];
  } catch {
    /* ignore – dann Fallback fetch */
  }
  try {
    const r = await fetch("/api/categories", { credentials: "include" });
    if (!r.ok) throw new Error();
    const j = await r.json();
    if (Array.isArray(j)) return j as Category[];
    if (j?.items && Array.isArray(j.items)) return j.items as Category[];
    if (j?.list && Array.isArray(j.list)) return j.list as Category[];
  } catch {
    /* ignore */
  }
  return [];
}

// ---- component -------------------------------------------------------------

export default function Header() {
  const navigate = useNavigate();
  const { state: auth, logout } = useAuth();
  const { getTotalItems } = useCart();

  const [query, setQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [cats, setCats] = useState<Category[]>([]);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);

  const cartCount = useMemo(() => getTotalItems?.() ?? 0, [getTotalItems]);

  // Kategorien 1x laden
  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await getCategoriesAny();
      if (alive) setCats(list);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Profil laden, wenn eingeloggt
  useEffect(() => {
    if (!auth.user) {
      setProfile(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const p =
          (await Api?.getProfile?.()) ??
          (await Api?.profile?.get?.()) ??
          (await fetch("/api/profile", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : null
          ));
        if (alive) setProfile(p);
      } catch {
        if (alive) setProfile(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [auth.user]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = query.trim();
    if (!s) return;
    navigate(`/search?q=${encodeURIComponent(s)}`);
  }

  return (
    <>
      <LogoSearch
        query={query}
        setQuery={setQuery}
        onSearchSubmit={onSearchSubmit}
        cartCount={cartCount}
        auth={auth}
        profile={profile}
        onLogout={logout}
        onOpenLogin={() => setShowLogin(true)}
        onOpenRegister={() => setShowRegister(true)}
      />

      <NavPrimary cats={cats} />

      <InfoBar />

      {/* Modals */}
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterModal
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
}
