import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Plus, Minus, ShoppingCart, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import useCart from '../hooks/useCartSafe';
import { bulkAPI, handleAPIError } from '../lib/api';

interface BulkItem {
  id: number;
  articleNumber: string;
  name: string;
  brand: string;
  price: string;
  quantity: number;
  unitType: 'piece' | 'meter';
  unitSize?: number;
  minQuantity: number;
  image: string;
  inStock: boolean;
  error?: string;
}

export default function BulkOrder() {
  const { addItem, openCart } = useCart();
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [csvInput, setCsvInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');


  const processCsvInput = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const lines = csvInput.trim().split('\n');
      const items: { articleNumber: string; quantity: number }[] = [];
      
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('artikel')) return; // Skip header
        
        const [articleNumber, quantityStr] = line.split(/[,;\t]/).map(s => s.trim());
        
        if (articleNumber && quantityStr) {
          const quantity = parseInt(quantityStr);
          if (!isNaN(quantity) && quantity > 0) {
            items.push({ articleNumber, quantity });
          }
        }
      });

      if (items.length === 0) {
        setError('Keine gültigen Artikel gefunden. Bitte überprüfen Sie das Format.');
        setIsProcessing(false);
        return;
      }

      // Process items via API
      const response = await bulkAPI.processItems(items);
      
      const newItems: BulkItem[] = response.processedItems.map((item: any) => ({
        id: item.id || Date.now() + Math.random(),
        articleNumber: item.articleNumber,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        unitType: item.unitType,
        unitSize: item.unitSize,
        minQuantity: item.minQuantity,
        image: item.image,
        inStock: item.inStock,
        error: item.error
      }));
      
      setBulkItems(newItems);
    } catch (error) {
      setError(handleAPIError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const processCsvInputOld = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const lines = csvInput.trim().split('\n');
      const newItems: BulkItem[] = [];
      
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('artikel')) return; // Skip header
        
        const [articleNumber, quantityStr] = line.split(/[,;\t]/).map(s => s.trim());
        
        if (!articleNumber || !quantityStr) return;
        
        const quantity = parseInt(quantityStr);
        
        // This would be replaced by API call
        newItems.push({
          id: Date.now() + Math.random(),
          articleNumber,
          name: 'Artikel nicht gefunden',
          brand: '-',
          price: '0.00',
          quantity,
          unitType: 'piece',
          minQuantity: 1,
          image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
          inStock: false,
          error: 'Artikel nicht im Katalog gefunden'
        });
      });
      
      setBulkItems(newItems);
      setIsProcessing(false);
    }, 1000);
  };

  const processCsvInputDemo = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const lines = csvInput.trim().split('\n');
      const newItems: BulkItem[] = [];
      
      // Demo Artikel-Datenbank
      const articleDatabase = {
        'OSR-LS5M3K': {
          id: 12,
          name: 'LED Strip 24V 3000K CRI90+ 120LED/m',
          brand: 'Osram',
          price: '24.90',
          image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
          unitType: 'meter' as const,
          unitSize: 5,
          minQuantity: 1,
          inStock: true
        },
        'SLV-232445': {
          id: 1,
          name: 'LED Wandleuchte Cube Up/Down',
          brand: 'SLV',
          price: '89.50',
          image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
          unitType: 'piece' as const,
          unitSize: undefined,
          minQuantity: 1,
          inStock: true
        },
        'BRU-AP1616': {
          id: 13,
          name: 'Alu-Profil Eckig 16x16mm mit Abdeckung',
          brand: 'Brumberg',
          price: '12.40',
          image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=200',
          unitType: 'meter' as const,
          unitSize: 2,
          minQuantity: 1,
          inStock: true
        }
      };
      
      lines.forEach((line, index) => {
        if (index === 0 && line.toLowerCase().includes('artikel')) return; // Skip header
        
        const [articleNumber, quantityStr] = line.split(/[,;\t]/).map(s => s.trim());
        
        if (!articleNumber || !quantityStr) return;
        
        const quantity = parseInt(quantityStr);
        const article = articleDatabase[articleNumber as keyof typeof articleDatabase];
        
        if (article) {
          newItems.push({
            id: article.id,
            articleNumber,
            name: article.name,
            brand: article.brand,
            price: article.price,
            quantity: Math.max(quantity, article.minQuantity),
            unitType: article.unitType,
            unitSize: article.unitSize,
            minQuantity: article.minQuantity,
            image: article.image,
            inStock: article.inStock,
            error: quantity < article.minQuantity ? `Mindestmenge: ${article.minQuantity}` : undefined
          });
        } else {
          newItems.push({
            id: Date.now() + Math.random(),
            articleNumber,
            name: 'Artikel nicht gefunden',
            brand: '-',
            price: '0.00',
            quantity,
            unitType: 'piece',
            minQuantity: 1,
            image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
            inStock: false,
            error: 'Artikel nicht im Katalog gefunden'
          });
        }
      });
      
      setBulkItems(newItems);
      setIsProcessing(false);
    }, 1000);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    setBulkItems(prev => prev.map((item, i) => {
      if (i === index) {
        const quantity = Math.max(newQuantity, item.minQuantity);
        return {
          ...item,
          quantity,
          error: quantity < item.minQuantity ? `Mindestmenge: ${item.minQuantity}` : item.error?.includes('nicht gefunden') ? item.error : undefined
        };
      }
      return item;
    }));
  };

  const removeItem = (index: number) => {
    setBulkItems(prev => prev.filter((_, i) => i !== index));
  };

  const addAllToCart = () => {
    const validItems = bulkItems.filter(item => item.inStock && !item.error);
    
    validItems.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        unitType: item.unitType,
        unitSize: item.unitSize,
        minQuantity: item.minQuantity,
        specs: []
      });
    });
    
    openCart();
  };

  const getTotalPrice = () => {
    return bulkItems
      .filter(item => item.inStock && !item.error)
      .reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const downloadTemplate = () => {
    const csvContent = "Artikelnummer,Menge\nOSR-LS5M3K,10\nSLV-232445,5\nBRU-AP1616,20";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-order-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Zurück zur Startseite
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulk-Bestellung</h1>
              <p className="text-gray-600 mt-1">
                Bestellen Sie große Mengen über CSV-Import oder Artikelnummern
              </p>
            </div>
            
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={16} className="mr-2" />
              CSV-Vorlage herunterladen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="mr-3 text-amber-500" size={24} />
                CSV-Import oder manuelle Eingabe
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artikelnummern und Mengen (CSV-Format)
                </label>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Artikelnummer,Menge&#10;OSR-LS5M3K,10&#10;SLV-232445,5&#10;BRU-AP1616,20"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={processCsvInput}
                  disabled={!csvInput.trim() || isProcessing}
                  className="flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verarbeitung...
                    </>
                  ) : (
                    <>
                      <FileText size={16} className="mr-2" />
                      Artikel verarbeiten
                    </>
                  )}
                </button>
                
                <div className="text-sm text-gray-600">
                  Format: Artikelnummer,Menge (eine pro Zeile)
                </div>
              </div>
            </div>

            {/* Results */}
            {bulkItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Verarbeitete Artikel ({bulkItems.length})
                </h3>
                
                <div className="space-y-4">
                  {bulkItems.map((item, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      item.error ? 'border-red-200 bg-red-50' : 
                      item.inStock ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {item.articleNumber}
                            </span>
                            {item.error ? (
                              <AlertCircle className="text-red-500" size={16} />
                            ) : item.inStock ? (
                              <CheckCircle className="text-green-500" size={16} />
                            ) : (
                              <AlertCircle className="text-yellow-500" size={16} />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{item.brand}</p>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.error && (
                            <p className="text-red-600 text-sm mt-1">{item.error}</p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">€{item.price}</p>
                          <p className="text-sm text-gray-600">
                            {item.unitType === 'meter' && item.unitSize ? `${item.unitSize}m Rolle` : 'Stück'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= item.minQuantity}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-16 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold">
                            €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Bestellübersicht</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Artikel gesamt:</span>
                  <span>{bulkItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Verfügbare Artikel:</span>
                  <span className="text-green-600">
                    {bulkItems.filter(item => item.inStock && !item.error).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fehlerhafte Artikel:</span>
                  <span className="text-red-600">
                    {bulkItems.filter(item => item.error).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gesamtmenge:</span>
                  <span>
                    {bulkItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Gesamtpreis:</span>
                  <span>€{getTotalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Preise exkl. MwSt. • Nur verfügbare Artikel
                </p>
              </div>
              
              <button
                onClick={addAllToCart}
                disabled={bulkItems.filter(item => item.inStock && !item.error).length === 0}
                className="w-full flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={16} className="mr-2" />
                Alle verfügbaren Artikel in den Warenkorb
              </button>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Hilfe</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• CSV-Format: Artikelnummer,Menge</li>
                <li>• Eine Zeile pro Artikel</li>
                <li>• Mindestmengen werden automatisch angepasst</li>
                <li>• Nur verfügbare Artikel werden hinzugefügt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}