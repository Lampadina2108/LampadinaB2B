// src/components/header/ProfileMenu.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, ArrowRight, User2, Store } from "lucide-react";

type Customer = {
  user_id?: number | null;
  company_name?: string | null;
  contact_person?: string | null;
};

type ProfilePayload = {
  user?: { id: number; email: string; role: string } | null;
  customer?: Customer | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  profile: ProfilePayload | null;
};

export default function ProfileMenu({ open, onClose, onLogout, profile }: Props) {
  const { state } = useAuth();
  const isAdmin = state.user?.role === "admin";

  if (!open) return null;

  const customer = profile?.customer ?? null;

  return (
    <div className="absolute right-0 mt-2 w-[760px] z-50">
      <div className="bg-white border rounded-xl shadow-xl p-5 grid grid-cols-2 gap-4">
        {/* Linke Spalte: persönlicher Kontakt + Logo-Feld */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Ihr persönlicher Kontakt</h3>
            <div className="flex">
              <img
                src="/uploads/stefan.jpg"
                alt="Stefan Müller"
                className="w-20 h-20 rounded-md object-cover mr-3"
              />
              <div className="text-sm">
                <div className="font-medium">Herr Stefan Müller</div>
                <div className="text-gray-600">Vertrieb</div>
                <div className="mt-1">+43 676 6817285</div>
                <a className="text-gray-700 underline" href="mailto:vertrieb@lampadina.icu">
                  vertrieb@lampadina.icu
                </a>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center text-sm border rounded-md px-3 py-1">
              <Store size={16} className="mr-2" />
              Ihr B2B-Partner
            </div>
          </div>

          <div className="border rounded-lg p-6 flex items-center justify-center">
            <img src="/uploads/logo_sw.svg" alt="Lampadina" className="h-14 opacity-80" />
          </div>
        </div>

        {/* Rechte Spalte: Kundendaten + Menüpunkte */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Kontaktperson</div>
                <div className="font-medium">{customer?.contact_person ?? "–"}</div>
              </div>
              <div>
                <div className="text-gray-500">Firma</div>
                <div className="font-medium">{customer?.company_name ?? "–"}</div>
              </div>
              <div>
                <div className="text-gray-500">Kundennummer</div>
                <div className="font-medium">{customer?.user_id ?? "–"}</div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg divide-y">
            <MenuRow label="Bestellungen" />
            <MenuRow label="Häufig bestellt" />
            <MenuRow label="Favoritenliste" />
            <MenuRow label="Lieferscheine" />
            <MenuRow label="Rechnungen" />
            <MenuRow label="Angebote" />

            {isAdmin && (
              <>
                <Link
                  to="/admin/customers"
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span>Adminbereich · Kundenverwaltung</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/admin/products"
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <span>Adminbereich · Produkte</span>
                  <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full inline-flex items-center justify-center border rounded-lg px-4 py-3 hover:bg-gray-50"
          >
            <LogOut size={18} className="mr-2" />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-default">
      <div className="flex items-center">
        <User2 size={16} className="mr-2 text-gray-500" />
        {label}
      </div>
      <ArrowRight size={16} className="text-gray-400" />
    </div>
  );
}
