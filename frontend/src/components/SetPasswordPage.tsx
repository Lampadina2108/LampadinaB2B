import React, { useEffect, useState } from "react";
import { Api } from "../lib/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"loading"|"form"|"ok"|"error">("loading");
  const [error, setError] = useState<string>("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!token) throw new Error("Kein Token übergeben.");
        await Api.validatePasswordToken(token);
        setPhase("form");
      } catch (e: any) {
        setError(e?.message || "Token ungültig oder abgelaufen.");
        setPhase("error");
      }
    })();
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwd || pwd.length < 6) return setError("Passwort muss mind. 6 Zeichen haben.");
    if (pwd !== pwd2) return setError("Passwörter stimmen nicht überein.");
    setSubmitting(true);
    setError("");
    try {
      await Api.setPassword(token, pwd);
      setPhase("ok");
    } catch (e: any) {
      setError(e?.message || "Passwort konnte nicht gesetzt werden.");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="animate-pulse text-gray-500">Prüfe Token…</div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="p-4 rounded-lg border bg-red-50 border-red-200 flex items-start">
          <AlertCircle className="mt-0.5 mr-2 text-red-600" />
          <div>
            <div className="font-medium text-red-700 mb-1">Link ungültig</div>
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "ok") {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="p-4 rounded-lg border bg-green-50 border-green-200 flex items-start">
          <CheckCircle className="mt-0.5 mr-2 text-green-600" />
          <div>
            <div className="font-medium text-green-700 mb-1">Passwort gesetzt</div>
            <div className="text-sm text-green-700">Sie können sich jetzt einloggen.</div>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Zum Login
        </button>
      </div>
    );
  }

  // phase === "form"
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Passwort setzen</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="mind. 6 Zeichen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort wiederholen</label>
          <input
            type="password"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300"
        >
          {submitting ? "Speichere…" : "Passwort speichern"}
        </button>
      </form>
    </div>
  );
}
