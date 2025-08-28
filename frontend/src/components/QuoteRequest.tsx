import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Minus, Send, Upload, Download, Calculator } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { quotesAPI, handleAPIError } from '../lib/api';

interface QuoteItem {
  id: number;
  name: string;
  brand: string;
  articleNumber: string;
  quantity: number;
  unitType: 'piece' | 'meter';
  unitSize?: number;
  estimatedPrice?: string;
  image: string;
  specifications: string;
}

export default function QuoteRequest() {
  const { state } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    {
      id: 1,
      name: 'LED Strip 24V 3000K CRI90+',
      brand: 'Osram',
      articleNumber: 'OSR-LS5M3K',
      quantity: 50,
      unitType: 'meter',
      unitSize: 5,
      estimatedPrice: '24.90',
      image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
      specifications: '120LED/m, CRI90+, 5m Rollen'
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mb-6">
            Bitte melden Sie sich an, um ein Angebot anzufordern.
          </p>
          <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now(),
      name: '',
      brand: '',
      articleNumber: '',
      quantity: 1,
      unitType: 'piece',
      specifications: '',
      image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200'
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateItem = (id: number, field: string, value: any) => {
    setQuoteItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: number) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await quotesAPI.createQuote({
        projectName,
        projectDescription,
        deliveryDate: deliveryDate || null,
        items: quoteItems,
        installationRequested: false, // Could be added as checkbox
        consultationRequested: false, // Could be added as checkbox
        additionalNotes: '' // Could be added as textarea
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Quote submission error:', handleAPIError(error));
      // Could show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalQuantity = () => {
    return quoteItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getEstimatedTotal = () => {
    return quoteItems.reduce((total, item) => {
      const price = parseFloat(item.estimatedPrice || '0');
      return total + (price * item.quantity);
    }, 0);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-green-600">Angebot angefordert!</h1>
          <p className="text-gray-600 mb-6">
            Vielen Dank für Ihre Anfrage. Unser Team wird Ihr Projekt prüfen und Ihnen 
            innerhalb von 24 Stunden ein individuelles Angebot zusenden.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Anfrage-Nummer:</p>
            <p className="font-mono font-bold">ANF-{Date.now().toString().slice(-6)}</p>
          </div>
          <Link to="/" className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 inline-block">
            Zurück zum Shop
          </Link>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Angebot anfordern</h1>
              <p className="text-gray-600 mt-1">
                Individuelle Angebote für größere Projekte
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Angemeldet als</p>
              <p className="font-medium">{state.user?.contactPerson}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Projektinformationen</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projektname *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="z.B. Bürobeleuchtung Hauptgebäude"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projektbeschreibung *
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Beschreiben Sie Ihr Projekt, besondere Anforderungen, Installationsort, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gewünschter Liefertermin
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Quote Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Benötigte Artikel</h2>
                <button
                  onClick={addItem}
                  className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  <Plus size={16} className="mr-2" />
                  Artikel hinzufügen
                </button>
              </div>
              
              <div className="space-y-4">
                {quoteItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Artikelname *
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Produktname"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marke
                        </label>
                        <input
                          type="text"
                          value={item.brand}
                          onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Herstellermarke"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Artikelnummer
                        </label>
                        <input
                          type="text"
                          value={item.articleNumber}
                          onChange={(e) => updateItem(item.id, 'articleNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="falls bekannt"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Menge *
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            min="1"
                          />
                          <button
                            onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spezifikationen / Besondere Anforderungen
                      </label>
                      <textarea
                        value={item.specifications}
                        onChange={(e) => updateItem(item.id, 'specifications', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="z.B. Lichtfarbe, IP-Schutzart, Abmessungen, etc."
                      />
                    </div>
                    
                    {quoteItems.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Minus size={16} className="mr-1" />
                          Entfernen
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Zusätzliche Informationen</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Besondere Wünsche oder Anmerkungen
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Installation, Montage, Sonderwünsche, Budgetrahmen, etc."
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Installation durch Lampadina gewünscht
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Beratung vor Ort gewünscht
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="mr-2 text-amber-500" size={20} />
                Anfrage-Übersicht
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Artikel gesamt:</span>
                  <span>{quoteItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gesamtmenge:</span>
                  <span>{getTotalQuantity()}</span>
                </div>
                {getEstimatedTotal() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Geschätzter Wert:</span>
                    <span>€{getEstimatedTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mb-6">
                <h4 className="font-medium mb-2">Ihre Kontaktdaten:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{state.user?.companyName}</p>
                  <p>{state.user?.contactPerson}</p>
                  <p>{state.user?.email}</p>
                  <p>{state.user?.phone}</p>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!projectName || !projectDescription || isSubmitting}
                className="w-full flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Angebot anfordern
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Unser Team meldet sich innerhalb von 24 Stunden bei Ihnen
              </p>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Angebot-Service</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Kostenlose Angebotserstellung</li>
                <li>• Individuelle Staffelpreise</li>
                <li>• Technische Beratung inklusive</li>
                <li>• Projektplanung möglich</li>
                <li>• Installation auf Anfrage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}