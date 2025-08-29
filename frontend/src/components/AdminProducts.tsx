import React, { useEffect, useState } from "react";
import { AdminApi } from "../lib/api";

interface Product { id: number; sku: string; name: string; price: number; }
interface Customer { id: number; company_name: string; }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<{ id: number | null; sku: string; name: string; price: string }>({
    id: null,
    sku: "",
    name: "",
    price: "",
  });
  const [custPrice, setCustPrice] = useState<{ productId: number; customerId: number; price: string }>({
    productId: 0,
    customerId: 0,
    price: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [p, c] = await Promise.all([
      AdminApi.listProducts(),
      AdminApi.listCustomers(),
    ]);
    setProducts(p);
    setCustomers((c as any).list ?? c);
  }

  function startEdit(p: Product) {
    setForm({ id: p.id, sku: p.sku, name: p.name, price: String(p.price ?? "") });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { sku: form.sku, name: form.name, price: parseFloat(form.price) };
    if (form.id) await AdminApi.updateProduct(form.id, data);
    else await AdminApi.createProduct(data);
    setForm({ id: null, sku: "", name: "", price: "" });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Löschen?")) return;
    await AdminApi.deleteProduct(id);
    load();
  }

  async function saveCustomerPrice(e: React.FormEvent) {
    e.preventDefault();
    if (!custPrice.productId || !custPrice.customerId) return;
    await AdminApi.setCustomerPrice(
      custPrice.productId,
      custPrice.customerId,
      parseFloat(custPrice.price)
    );
    setCustPrice({ productId: 0, customerId: 0, price: "" });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold mb-4">Produkte verwalten</h1>

      <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
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
        <input
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Preis"
          className="border p-2 w-full"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {form.id ? "Aktualisieren" : "Anlegen"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm({ id: null, sku: "", name: "", price: "" })}
              className="px-4 py-2 border rounded"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">SKU</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Preis</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2 border">{p.id}</td>
              <td className="p-2 border">{p.sku}</td>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.price}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => startEdit(p)}
                  className="px-2 py-1 border rounded"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2 py-1 border rounded"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={saveCustomerPrice} className="space-y-2 max-w-md">
        <h2 className="text-lg font-semibold">Kundenspezifischer Preis</h2>
        <select
          value={custPrice.productId}
          onChange={(e) => setCustPrice({ ...custPrice, productId: Number(e.target.value) })}
          className="border p-2 w-full"
          required
        >
          <option value={0}>Produkt wählen</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={custPrice.customerId}
          onChange={(e) => setCustPrice({ ...custPrice, customerId: Number(e.target.value) })}
          className="border p-2 w-full"
          required
        >
          <option value={0}>Kunde wählen</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name}
            </option>
          ))}
        </select>
        <input
          value={custPrice.price}
          onChange={(e) => setCustPrice({ ...custPrice, price: e.target.value })}
          placeholder="Preis"
          className="border p-2 w-full"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Speichern
        </button>
      </form>
    </div>
  );
}
