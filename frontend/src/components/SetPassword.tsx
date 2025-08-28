import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

export default function SetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [valid, setValid] = useState<null | boolean>(null);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/password/validate?token=${encodeURIComponent(token)}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(await res.text());
        setValid(true);
      } catch (e: any) {
        setValid(false);
        setMsg(e?.message || "Ungültiger oder abgelaufener Link.");
      }
    })();
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pwd.length < 6) return setMsg("Passwort muss mindestens 6 Zeichen haben.");
    if (pwd !== pwd2) return setMsg("Passwörter stimmen nicht überein.");
    try {
      const res = await fetch(`/api/password/set`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pwd }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Passwort gesetzt. Sie können sich jetzt einloggen.");
      setTimeout(() => navigate("/"), 1200);
    } catch (e: any) {
      setMsg(e?.message || "Konnte Passwort nicht setzen.");
    }
  }

  if (valid === null) {
    return <div className="container mx-auto px-4 py-12">Token wird geprüft…</div>;
  }
  if (valid === false) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {msg || "Ungültiger Link."}
        </div>
        <div className="mt-6">
          <Link to="/" className="text-amber-600">Zur Startseite</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Passwort setzen</h1>
      {msg && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">
          {msg}
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Neues Passwort</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Passwort wiederholen</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
          />
        </div>
        <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded px-4 py-2">
          Speichern
        </button>
      </form>
    </div>
  );
}
