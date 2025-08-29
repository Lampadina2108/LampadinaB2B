import React, { useEffect, useState } from "react";
import { AdminApi, Api, formatPrice, toNum } from "../lib/api";

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  purchase_price: number;
  shipping_cost: number;
}

interface AttributeDef {
  id: number;
  code: string;
  label: string;
  options: { id: number; label: string }[];
}

interface CustomerPrice {
  customer_id: number;
  company_name: string;
  special_price: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<AttributeDef[]>([]);
  const emptyForm = {
    id: null as number | null,
    sku: "",
    name: "",
    purchase_price: "",
    shipping_cost: "",
    price: "",
    markup: "",
    attributes: {} as Record<number, string>,
    customerPrices: [] as CustomerPrice[],
    newCustomerId: "",
    newCustomerPrice: "",
  };
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  async function loadAll() {
    const [p, c, a] = await Promise.all([
      AdminApi.listProducts({ search: filter }),
      AdminApi.listCustomers(),
      AdminApi.listAttributes(),
    ]);
    setProducts(p);
    setCustomers((c as any).list ?? c);
    setAttributes(a);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function resetForm() {
    setForm(emptyForm);
  }

  function startEdit(p: Product) {
    Api.getProduct(String(p.id)).then(async (detail: any) => {
      const attrMap: Record<number, string> = {};
      for (const a of detail.attributes || []) {
        const def = attributes.find((d) => d.code === a.code);
        if (def) {
          const opt = def.options.find((o) => o.label === a.value);
          if (opt) attrMap[def.id] = String(opt.id);
        }
      }
      const prices = await AdminApi.listCustomerPrices(p.id);
      setForm({
        id: p.id,
        sku: p.sku,
        name: p.name,
        purchase_price: String(p.purchase_price ?? ""),
        shipping_cost: String(p.shipping_cost ?? ""),
        price: String(p.price ?? ""),
        markup: "",
        attributes: attrMap,
        customerPrices: prices,
        newCustomerId: "",
        newCustomerPrice: "",
      });
    });
  }

  function marginInfo() {
    const pp = toNum(form.purchase_price);
    const sc = toNum(form.shipping_cost);
    const price = toNum(form.price);
    const cost = pp + sc;
    const margin = price - cost;
    const pct = cost ? (margin / cost) * 100 : 0;
    return { cost, margin, pct, warning: margin < 0 };
  }

  useEffect(() => {
    const pp = toNum(form.purchase_price);
    const sc = toNum(form.shipping_cost);
    const m = toNum(form.markup, NaN);
    if (!isNaN(m)) {
      const price = (pp + sc) * (1 + m / 100);
      setForm((f) => ({ ...f, price: price.toFixed(2) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.markup]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const attrsArray = Object.entries(form.attributes)
      .filter(([_, v]) => v)
      .map(([aId, oId]) => ({
        attribute_id: Number(aId),
        option_id: Number(oId),
      }));
    const data = {
      sku: form.sku,
      name: form.name,
      price: toNum(form.price),
      purchase_price: toNum(form.purchase_price),
      shipping_cost: toNum(form.shipping_cost),
      attributes: attrsArray,
    };
    if (form.id) await AdminApi.updateProduct(form.id, data);
    else await AdminApi.createProduct(data);
    resetForm();
    loadAll();
  }

  async function deleteProduct(id: number) {
    if (!confirm("Löschen?")) return;
    await AdminApi.deleteProduct(id);
    loadAll();
  }

  async function saveCustomerPrice() {
    if (!form.id || !form.newCustomerId) return;
    await AdminApi.setCustomerPrice(
      form.id,
      Number(form.newCustomerId),
      toNum(form.newCustomerPrice)
    );
    const prices = await AdminApi.listCustomerPrices(form.id);
    setForm((f) => ({
      ...f,
      customerPrices: prices,
      newCustomerId: "",
      newCustomerPrice: "",
    }));
  }

  async function removeCustomerPrice(customerId: number) {
    if (!form.id) return;
    await AdminApi.deleteCustomerPrice(form.id, customerId);
    const prices = await AdminApi.listCustomerPrices(form.id);
    setForm((f) => ({ ...f, customerPrices: prices }));
  }

  const info = marginInfo();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold mb-4">Produkte verwalten</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Suche"
          className="border p-2"
        />
        <button onClick={loadAll} className="px-4 py-2 border rounded">
          Filter
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 border">SKU</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">EK</th>
            <th className="p-2 border">Versand</th>
            <th className="p-2 border">VK</th>
            <th className="p-2 border">Marge %</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const cost = (p.purchase_price ?? 0) + (p.shipping_cost ?? 0);
            const margin = (p.price ?? 0) - cost;
            const pct = cost ? (margin / cost) * 100 : 0;
            return (
              <tr key={p.id} className="border-t">
                <td className="p-2 border">{p.sku}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{formatPrice(p.purchase_price)}</td>
                <td className="p-2 border">{formatPrice(p.shipping_cost)}</td>
                <td className="p-2 border">{formatPrice(p.price)}</td>
                <td className="p-2 border">{pct.toFixed(1)}%</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="px-2 py-1 border rounded"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="px-2 py-1 border rounded"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 max-w-xl">
        <h2 className="text-lg font-semibold">
          {form.id ? `Produkt #${form.id} bearbeiten` : "Neues Produkt"}
        </h2>
        <input
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          placeholder="SKU"
          className="border p-2 w-full"
          required
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          className="border p-2 w-full"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.purchase_price}
            onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
            placeholder="Einkaufspreis"
            className="border p-2"
          />
          <input
            value={form.shipping_cost}
            onChange={(e) => setForm({ ...form, shipping_cost: e.target.value })}
            placeholder="Lieferkosten"
            className="border p-2"
          />
          <input
            value={form.markup}
            onChange={(e) => setForm({ ...form, markup: e.target.value })}
            placeholder="Aufschlag %"
            className="border p-2"
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Verkaufspreis"
            className="border p-2"
          />
        </div>
        <div className={info.warning ? "text-red-600" : "text-gray-600"}>
          {`Kosten: ${formatPrice(info.cost)} | Marge: ${formatPrice(info.margin)} (${info.pct.toFixed(1)}%)`}
          {info.warning && " – Preis unter Einkauf + Versand"}
        </div>
        <div className="space-y-2">
          {attributes.map((a) => (
            <div key={a.id}>
              <label className="block text-sm mb-1">{a.label}</label>
              <select
                className="border p-2 w-full"
                value={form.attributes[a.id] || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attributes: { ...form.attributes, [a.id]: e.target.value },
                  })
                }
              >
                <option value="">—</option>
                {a.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Speichern
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded"
            >
              Abbrechen
            </button>
          )}
        </div>

        {form.id && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Kundenspezifische Preise</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-1 border">Kunde</th>
                  <th className="p-1 border">Preis</th>
                  <th className="p-1 border"></th>
                </tr>
              </thead>
              <tbody>
                {form.customerPrices.map((cp) => (
                  <tr key={cp.customer_id} className="border-t">
                    <td className="p-1 border">{cp.company_name}</td>
                    <td className="p-1 border">
                      {formatPrice(cp.special_price)}
                    </td>
                    <td className="p-1 border text-right">
                      <button
                        type="button"
                        onClick={() => removeCustomerPrice(cp.customer_id)}
                        className="px-2 py-1 border rounded"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 items-center">
              <select
                value={form.newCustomerId}
                onChange={(e) =>
                  setForm({ ...form, newCustomerId: e.target.value })
                }
                className="border p-2 flex-1"
              >
                <option value="">Kunde wählen</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
              <input
                value={form.newCustomerPrice}
                onChange={(e) =>
                  setForm({ ...form, newCustomerPrice: e.target.value })
                }
                placeholder="Preis"
                className="border p-2 w-32"
              />
              <button
                type="button"
                onClick={saveCustomerPrice}
                className="px-4 py-2 border rounded"
              >
                Speichern
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}