import React, { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Api } from "../lib/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
};

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: Props) {
  const auth = (() => {
    try {
      return useAuth();
    } catch {
      return undefined as unknown as ReturnType<typeof useAuth>;
    }
  })();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    try {
      // 1) Bevorzugt: über Context
      if (auth?.login) {
        const ok = await auth.login(email.trim(), pw);
        if (ok) return onClose();
        throw new Error(auth.state?.error || "Ungültige Anmeldedaten");
      }

      // 2) Fallback: direkt über API
      const { token } = await Api.login(email.trim(), pw);
      // Der Api.login speichert den Token bereits; optional kannst du auth?.me() nachladen
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Anmeldung fehlgeschlagen. Ungültige Anmeldedaten.");
    }
  }

  const isLoading = !!auth?.state?.isLoading;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">B2B Anmeldung</h2>
            <button aria-label="Schließen" className="p-1 rounded hover:bg-gray-100" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form className="p-6 space-y-4" onSubmit={onSubmit}>
            {(err || auth?.state?.error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {err || auth?.state?.error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">E-Mail-Adresse *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="name@firma.at"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passwort *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border rounded focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isLoading ? "Anmelden…" : "Anmelden"}
            </button>

            <div className="pt-4 text-center text-sm text-gray-600 border-t">
              Noch kein Geschäftskonto?{" "}
              <button
                type="button"
                className="text-black font-medium underline"
                onClick={onSwitchToRegister}
              >
                Jetzt Zugang anfordern
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
