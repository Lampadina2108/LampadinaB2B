// src/components/header/LogoSearch.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;

  cartCount: number;

  // Auth + Profil
  auth: { user?: { id: number; email: string; role: string } | null };
  profile?: {
    user?: { id: number; email: string; role: string };
    customer?: {
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
    } | null;
  } | null;

  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
};

export default function LogoSearch({
  query,
  setQuery,
  onSearchSubmit,
  cartCount,
  auth,
  profile,
  onLogout,
  onOpenLogin,
  onOpenRegister,
}: Props) {
  // Profil-Menü lokal steuern (Anchor ist der „Mein Lampadina“-Button)
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = !!auth?.user;
  const cartBadge = useMemo(() => (cartCount > 99 ? "99+" : cartCount), [cartCount]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    }
    if (openProfile) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openProfile]);

  return (
    <header className="bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img src="/uploads/logo_color.svg" alt="Lampadina" className="h-7" />
        </Link>

        {/* Suche */}
        <form onSubmit={onSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produktsuche…"
              className="w-full rounded-xl border px-4 py-2.5 bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg border bg-gray-50 hover:bg-gray-100 text-sm"
            >
              Suchen
            </button>
          </div>
        </form>

        {/* Cart */}
        <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white rounded-full text-[10px] px-[6px] py-[2px]">
              {cartBadge}
            </span>
          )}
        </Link>

        {/* Auth – entweder Buttons oder „Mein Lampadina“ */}
        {!isLoggedIn ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="px-3 py-2 rounded-lg border hover:bg-gray-100 text-sm"
            >
              Login
            </button>
            <button
              onClick={onOpenRegister}
              className="px-3 py-2 rounded-lg border bg-black text-white hover:opacity-90 text-sm"
            >
              Zugriff anfordern
            </button>
          </div>
        ) : (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 text-sm"
            >
              <img src="/uploads/logo_sw.svg" alt="" className="h-4" />
              <span>Mein Lampadina</span>
            </button>

            <ProfileMenu
              open={openProfile}
              onClose={() => setOpenProfile(false)}
              onLogout={onLogout}
              profile={profile}
            />
          </div>
        )}
      </div>
    </header>
  );
}
