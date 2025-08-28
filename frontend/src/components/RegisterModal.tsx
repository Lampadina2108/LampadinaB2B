import React, { useState } from "react";
import { X, Building, Mail, Phone, User, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Api } from "../lib/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
};

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: Props) {
  const auth = (() => {
    try {
      return useAuth();
    } catch {
      return undefined as unknown as ReturnType<typeof useAuth>;
    }
  })();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    vatNumber: "",
    companyRegister: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: { street: "", zipCode: "", city: "", country: "AT" as string },
    acceptTerms: false,
    acceptPrivacy: false,
  });

  if (!isOpen) return null;

  const set = (k: string, v: any) => {
    if (k.includes(".")) {
      const [p, c] = k.split(".");
      setForm((prev) => ({ ...prev, [p]: { ...(prev as any)[p], [c]: v } }));
    } else {
      setForm((prev) => ({ ...prev, [k]: v }));
    }
    if (error) setError("");
  };

  const valid = (s: number) => {
    switch (s) {
      case 1:
        return form.companyName && form.contactPerson;
      case 2:
        return form.email && form.phone && form.address.street && form.address.zipCode && form.address.city;
      case 3:
        return form.acceptTerms && form.acceptPrivacy;
      default:
        return true;
    }
  };

  const next = () => (valid(step) ? setStep(step + 1) : setError("Bitte füllen Sie alle Pflichtfelder aus."));

  async function handleSubmit() {
    if (!valid(3)) {
      setError("Bitte AGB und Datenschutz akzeptieren.");
      return;
    }
    try {
      const payload = {
        companyName: form.companyName,
        vatNumber: form.vatNumber || undefined,
        companyRegister: form.companyRegister || undefined,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: {
          street: form.address.street,
          zipCode: form.address.zipCode,
          city: form.address.city,
          country: form.address.country || "AT",
        },
      };

      // 1) Bevorzugt über Context
      if (auth?.requestAccess) {
        const ok = await auth.requestAccess(payload as any);
        if (!ok) throw new Error(auth?.state?.error || "Antrag fehlgeschlagen");
      } else {
        // 2) Fallback: direkt über API
        await Api.requestAccess(payload as any);
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Antrag konnte nicht gesendet werden.");
    }
  }

  const isLoading = !!auth?.state?.isLoading;

  const resetAndClose = () => {
    onClose();
    setStep(1);
    setSubmitted(false);
    setError("");
    setForm({
      companyName: "",
      vatNumber: "",
      companyRegister: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: { street: "", zipCode: "", city: "", country: "AT" },
      acceptTerms: false,
      acceptPrivacy: false,
    });
  };

  if (submitted) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={resetAndClose} />
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full grid place-items-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">Antrag eingegangen!</h2>
              <p className="text-gray-700 mb-6">
                Wir haben Ihren Zugangsantrag erhalten und prüfen Ihre Angaben. Sie erhalten eine E-Mail, sobald der Zugang freigeschaltet ist.
              </p>
              <button onClick={resetAndClose} className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
                Schließen
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={resetAndClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <Building className="mr-3 text-black" size={24} />
              <h2 className="text-xl font-semibold">B2B-Zugang anfordern</h2>
            </div>
            <button onClick={resetAndClose} className="p-1 rounded hover:bg-gray-100" aria-label="Schließen">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-medium ${s <= step ? "bg-black text-white" : "bg-gray-200 text-gray-600"}`}>{s}</div>
                  {s < 3 && <div className={`w-12 h-1 mx-2 ${s < step ? "bg-black" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Firmendaten</span>
              <span>Kontakt & Adresse</span>
              <span>Bestätigung</span>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={16} />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Firmendaten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Firmenname *</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => set("companyName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="Ihre Firma GmbH"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UID-Nummer</label>
                    <input
                      type="text"
                      value={form.vatNumber}
                      onChange={(e) => set("vatNumber", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="ATU12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Firmenbuch-Nr.</label>
                    <input
                      type="text"
                      value={form.companyRegister}
                      onChange={(e) => set("companyRegister", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="FN 123456a"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ansprechpartner *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.contactPerson}
                        onChange={(e) => set("contactPerson", e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        placeholder="Max Mustermann"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Kontakt & Adresse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        placeholder="max@firma.at"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        placeholder="+43 1 234 5678"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Straße und Nr. *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.address.street}
                        onChange={(e) => set("address.street", e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                        placeholder="Musterstraße 123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PLZ *</label>
                    <input
                      type="text"
                      value={form.address.zipCode}
                      onChange={(e) => set("address.zipCode", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="1010"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ort *</label>
                    <input
                      type="text"
                      value={form.address.city}
                      onChange={(e) => set("address.city", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="Wien"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Bestätigung</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700 space-y-1">
                  <p><strong>Firma:</strong> {form.companyName || "–"}</p>
                  <p><strong>UID:</strong> {form.vatNumber || "–"}</p>
                  <p><strong>Kontakt:</strong> {form.contactPerson} ({form.email}, {form.phone})</p>
                  <p><strong>Adresse:</strong> {form.address.street}, {form.address.zipCode} {form.address.city}</p>
                </div>

                <label className="flex items-start mb-3">
                  <input type="checkbox" checked={form.acceptTerms} onChange={(e) => set("acceptTerms", e.target.checked)} className="mt-1 rounded border-gray-300 text-black focus:ring-black" />
                  <span className="ml-2 text-sm text-gray-700">Ich akzeptiere die <a href="#" className="underline">AGB</a>. *</span>
                </label>

                <label className="flex items-start">
                  <input type="checkbox" checked={form.acceptPrivacy} onChange={(e) => set("acceptPrivacy", e.target.checked)} className="mt-1 rounded border-gray-300 text-black focus:ring-black" />
                  <span className="ml-2 text-sm text-gray-700">Ich stimme der <a href="#" className="underline">Datenschutzerklärung</a> zu. *</span>
                </label>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                  Zurück
                </button>
              )}
              {step < 3 ? (
                <button onClick={next} className="ml-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  Weiter
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Antrag wird gesendet…" : "Antrag senden"}
                </button>
              )}
            </div>

            {step === 1 && (
              <div className="mt-6 text-center border-t pt-6">
                <p className="text-gray-600 text-sm">
                  Bereits registriert?{" "}
                  <button onClick={onSwitchToLogin} className="underline font-medium">
                    Hier einloggen
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
