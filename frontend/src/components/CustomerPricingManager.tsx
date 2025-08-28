import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Euro, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CustomerPrice {
  id: number;
  company_id: number;
  product_id: number;
  custom_price: number;
  min_quantity: number;
  valid_from: string;
  valid_until: string | null;
  notes: string;
  company_name: string;
  product_name: string;
  article_number: string;
  standard_price: number;
}

interface Company {
  id: number;
  company_name: string;
  vat_number: string;
  is_approved: boolean;
}

interface Product {
  id: number;
  name: string;
  article_number: string;
  brand_name: string;
  purchase_price: number;
}

export default function CustomerPricingManager() {
  const { state } = useAuth();
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<CustomerPrice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newPrice, setNewPrice] = useState({
    company_id: '',
    product_id: '',
    custom_price: '',
    min_quantity: 1,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('lampadina_token');
      
      // Load customer prices
      const pricesResponse = await fetch('http://localhost:5000/api/admin/customer-pricing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load companies
      const companiesResponse = await fetch('http://localhost:5000/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load products
      const productsResponse = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json();
        setCustomerPrices(pricesData);
      }

      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrice = async () => {
    try {
      const token = localStorage.getItem('lampadina_token');
      const response = await fetch('http://localhost:5000/api/admin/customer-pricing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId: parseInt(newPrice.company_id),
          productId: parseInt(newPrice.product_id),
          customPrice: parseFloat(newPrice.custom_price),
          minQuantity: newPrice.min_quantity,
          validFrom: newPrice.valid_from,
          validUntil: newPrice.valid_until || null,
          notes: newPrice.notes
        })
      });

      if (response.ok) {
        loadData();
        setShowAddModal(false);
        setNewPrice({
          company_id: '',
          product_id: '',
          custom_price: '',
          min_quantity: 1,
          valid_from: new Date().toISOString().split('T')[0],
          valid_until: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to add customer price:', error);
    }
  };

  const handleDeletePrice = async (priceId: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Kundenpreis löschen möchten?')) {
      return;
    }

    try {
      const token = localStorage.getItem('lampadina_token');
      const response = await fetch(`http://localhost:5000/api/admin/customer-pricing/${priceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to delete customer price:', error);
    }
  };

  const filteredPrices = customerPrices.filter(price =>
    price.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.article_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-AT');
  };

  if (!state.isAuthenticated || state.user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Nur Administratoren haben Zugang zu diesem Bereich.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Euro className="mr-3 text-amber-500" size={28} />
            Kundenspezifische Preise
          </h2>
          <p className="text-gray-600 mt-1">
            Verwalten Sie individuelle Preise für Ihre B2B-Kunden
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          <Plus size={16} className="mr-2" />
          Neuen Kundenpreis hinzufügen
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kunde oder Produkt suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customer Prices Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Kundenpreise ({filteredPrices.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Kundenpreise...</p>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="p-8 text-center">
            <Euro className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold mb-2">Keine Kundenpreise gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Keine Preise entsprechen Ihrer Suche.' : 'Noch keine kundenspezifischen Preise definiert.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standardpreis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kundenpreis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ersparnis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gültig bis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrices.map((price) => {
                  const savings = price.standard_price - price.custom_price;
                  const savingsPercent = (savings / price.standard_price) * 100;
                  
                  return (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {price.company_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Min. Menge: {price.min_quantity}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {price.product_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {price.article_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(price.standard_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(price.custom_price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-medium">
                          -{formatPrice(savings)} ({savingsPercent.toFixed(1)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {price.valid_until ? formatDate(price.valid_until) : 'Unbegrenzt'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingPrice(price)}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePrice(price.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Price Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Neuen Kundenpreis hinzufügen</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kunde *
                    </label>
                    <select
                      value={newPrice.company_id}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, company_id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Kunde auswählen</option>
                      {companies.filter(c => c.is_approved).map(company => (
                        <option key={company.id} value={company.id}>
                          {company.company_name} ({company.vat_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Produkt *
                    </label>
                    <select
                      value={newPrice.product_id}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, product_id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Produkt auswählen</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.article_number} - {product.name} (€{product.purchase_price})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kundenpreis (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPrice.custom_price}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, custom_price: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mindestmenge
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newPrice.min_quantity}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, min_quantity: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gültig ab
                    </label>
                    <input
                      type="date"
                      value={newPrice.valid_from}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, valid_from: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gültig bis (optional)
                    </label>
                    <input
                      type="date"
                      value={newPrice.valid_until}
                      onChange={(e) => setNewPrice(prev => ({ ...prev, valid_until: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notizen
                  </label>
                  <textarea
                    value={newPrice.notes}
                    onChange={(e) => setNewPrice(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500"
                    placeholder="Grund für den Sonderpreis..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddPrice}
                  disabled={!newPrice.company_id || !newPrice.product_id || !newPrice.custom_price}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300"
                >
                  Kundenpreis hinzufügen
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}