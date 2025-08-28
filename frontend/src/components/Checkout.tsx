import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, CreditCard, FileText, Building, MapPin, Phone, Mail, User, Calendar } from 'lucide-react';
import useCart from '../hooks/useCartSafe';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutData {
  // Firmendaten
  companyName: string;
  vatNumber: string;
  companyRegister: string;
  
  // Kontaktperson
  contactPerson: string;
  email: string;
  phone: string;
  
  // Rechnungsadresse
  billingAddress: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  };
  
  // Lieferadresse
  deliveryAddress: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
    contactPerson: string;
    phone: string;
    deliveryNotes: string;
  };
  
  // Optionen
  sameAsbilling: boolean;
  paymentMethod: 'invoice' | 'transfer' | 'card';
  deliveryMethod: 'standard' | 'express' | 'pickup';
  orderNotes: string;
}

export default function Checkout() {
  const { state, getTotalPrice, clearCart } = useCart();
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    companyName: '',
    vatNumber: '',
    companyRegister: '',
    contactPerson: '',
    email: '',
    phone: '',
    billingAddress: {
      street: '',
      zipCode: '',
      city: '',
      country: 'Österreich'
    },
    deliveryAddress: {
      street: '',
      zipCode: '',
      city: '',
      country: 'Österreich',
      contactPerson: '',
      phone: '',
      deliveryNotes: ''
    },
    sameAsBinding: true,
    paymentMethod: 'invoice',
    deliveryMethod: 'standard',
    orderNotes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getDeliveryPrice = () => {
    switch (checkoutData.deliveryMethod) {
      case 'express': return 15.90;
      case 'pickup': return 0;
      default: return 5.90;
    }
  };

  const getTotalWithDelivery = () => {
    return getTotalPrice() + getDeliveryPrice();
  };

  const getVAT = () => {
    return getTotalWithDelivery() * 0.20; // 20% MwSt
  };

  const getFinalTotal = () => {
    return getTotalWithDelivery() + getVAT();
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCheckoutData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CheckoutData],
          [child]: value
        }
      }));
    } else {
      setCheckoutData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setCheckoutData(prev => ({
      ...prev,
      sameAsBinding: checked,
      deliveryAddress: checked ? {
        ...prev.billingAddress,
        contactPerson: prev.contactPerson,
        phone: prev.phone,
        deliveryNotes: ''
      } : {
        street: '',
        zipCode: '',
        city: '',
        country: 'Österreich',
        contactPerson: '',
        phone: '',
        deliveryNotes: ''
      }
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
       return checkoutData.contactPerson && checkoutData.email && checkoutData.phone;
      case 2:
        return checkoutData.billingAddress.street && checkoutData.billingAddress.zipCode && 
               checkoutData.billingAddress.city && 
               (checkoutData.sameAsBinding || 
                (checkoutData.deliveryAddress.street && checkoutData.deliveryAddress.zipCode && 
                 checkoutData.deliveryAddress.city));
      case 3:
        return checkoutData.paymentMethod && checkoutData.deliveryMethod;
      default:
        return true;
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOrderComplete(true);
    clearCart();
    setIsSubmitting(false);
  };

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="text-gray-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4">Ihr Warenkorb ist leer</h1>
          <p className="text-gray-600 mb-6">Fügen Sie Produkte hinzu, um eine Bestellung aufzugeben.</p>
          <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Weiter einkaufen
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-green-600">Bestellung erfolgreich!</h1>
          <p className="text-gray-600 mb-6">
            Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungsmail mit allen Details.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Bestellnummer:</p>
            <p className="font-mono font-bold">LMP-{Date.now().toString().slice(-6)}</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Zurück zum Shop
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Bestellung aufgeben</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-amber-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Firmendaten</span>
            <span>Adressen</span>
            <span>Zahlung & Versand</span>
            <span>Bestätigung</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Step 1: Firmendaten */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Building className="mr-3 text-amber-500" size={24} />
                    Firmendaten
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firmenname *
                      </label>
                      <input
                        type="text"
                       value={authState.user?.companyName || 'Musterfirma GmbH'}
                       readOnly
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                     <p className="text-xs text-gray-500 mt-1">Aus Ihren Registrierungsdaten übernommen</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UID-Nummer *
                      </label>
                      <input
                        type="text"
                       value={authState.user?.vatNumber || 'ATU78681179'}
                       readOnly
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firmenbuchnummer
                      </label>
                      <input
                        type="text"
                       value={authState.user?.companyRegister || 'FN 123456a'}
                       readOnly
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kontaktperson *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.contactPerson || authState.user?.contactPerson || ''}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Max Mustermann"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        value={checkoutData.email || authState.user?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="max@firma.at"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={checkoutData.phone || authState.user?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="+43 1 234 5678"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Adressen */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <MapPin className="mr-3 text-amber-500" size={24} />
                    Rechnungs- und Lieferadresse
                  </h2>
                  
                  {/* Rechnungsadresse */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Rechnungsadresse</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Straße und Hausnummer *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.billingAddress.street}
                          onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Musterstraße 123"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PLZ *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.billingAddress.zipCode}
                          onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="1010"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ort *
                        </label>
                        <input
                          type="text"
                          value={checkoutData.billingAddress.city}
                          onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Wien"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lieferadresse */}
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="sameAsBinding"
                        checked={checkoutData.sameAsBinding}
                        onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="sameAsBinding" className="ml-2 text-sm text-gray-700">
                        Lieferadresse ist gleich der Rechnungsadresse
                      </label>
                    </div>

                    {!checkoutData.sameAsBinding && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Lieferadresse</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Straße und Hausnummer *
                            </label>
                            <input
                              type="text"
                              value={checkoutData.deliveryAddress.street}
                              onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Lieferstraße 456"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              PLZ *
                            </label>
                            <input
                              type="text"
                              value={checkoutData.deliveryAddress.zipCode}
                              onChange={(e) => handleInputChange('deliveryAddress.zipCode', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="1020"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ort *
                            </label>
                            <input
                              type="text"
                              value={checkoutData.deliveryAddress.city}
                              onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Wien"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ansprechpartner vor Ort
                            </label>
                            <input
                              type="text"
                              value={checkoutData.deliveryAddress.contactPerson}
                              onChange={(e) => handleInputChange('deliveryAddress.contactPerson', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Max Mustermann"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefon vor Ort
                            </label>
                            <input
                              type="tel"
                              value={checkoutData.deliveryAddress.phone}
                              onChange={(e) => handleInputChange('deliveryAddress.phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="+43 1 234 5678"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Lieferhinweise
                            </label>
                            <textarea
                              value={checkoutData.deliveryAddress.deliveryNotes}
                              onChange={(e) => handleInputChange('deliveryAddress.deliveryNotes', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              placeholder="Besondere Hinweise für die Lieferung..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Zahlung & Versand */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard className="mr-3 text-amber-500" size={24} />
                    Zahlung & Versand
                  </h2>
                  
                  {/* Zahlungsart */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Zahlungsart</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="invoice"
                          checked={checkoutData.paymentMethod === 'invoice'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Rechnung (empfohlen)</div>
                          <div className="text-sm text-gray-600">Zahlung nach Erhalt der Rechnung (14 Tage Zahlungsziel)</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={checkoutData.paymentMethod === 'transfer'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Vorauskasse</div>
                          <div className="text-sm text-gray-600">Überweisung vor Versand (2% Skonto)</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={checkoutData.paymentMethod === 'card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium">Kreditkarte</div>
                          <div className="text-sm text-gray-600">Sofortige Zahlung per Kreditkarte</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Versandart */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Versandart</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="standard"
                            checked={checkoutData.deliveryMethod === 'standard'}
                            onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium">Standardversand</div>
                            <div className="text-sm text-gray-600">Lieferung in 2-3 Werktagen</div>
                          </div>
                        </div>
                        <div className="font-medium">€5.90</div>
                      </label>
                      
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="express"
                            checked={checkoutData.deliveryMethod === 'express'}
                            onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium">Expressversand</div>
                            <div className="text-sm text-gray-600">Lieferung am nächsten Werktag</div>
                          </div>
                        </div>
                        <div className="font-medium">€15.90</div>
                      </label>
                      
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="pickup"
                            checked={checkoutData.deliveryMethod === 'pickup'}
                            onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium">Selbstabholung</div>
                            <div className="text-sm text-gray-600">Abholung in unserem Lager</div>
                          </div>
                        </div>
                        <div className="font-medium text-green-600">Kostenlos</div>
                      </label>
                    </div>
                  </div>

                  {/* Bestellnotizen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bestellnotizen (optional)
                    </label>
                    <textarea
                      value={checkoutData.orderNotes}
                      onChange={(e) => handleInputChange('orderNotes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Besondere Wünsche oder Anmerkungen zu Ihrer Bestellung..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Bestätigung */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <FileText className="mr-3 text-amber-500" size={24} />
                    Bestellung bestätigen
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Firmendaten Zusammenfassung */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Firmendaten</h3>
                      <p className="text-sm text-gray-600">
                       {authState.user?.companyName || 'Musterfirma GmbH'}<br />
                       UID: {authState.user?.vatNumber || 'ATU78681179'}<br />
                        Kontakt: {checkoutData.contactPerson || authState.user?.contactPerson}<br />
                        {checkoutData.email || authState.user?.email} • {checkoutData.phone || authState.user?.phone}
                      </p>
                    </div>

                    {/* Adressen Zusammenfassung */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Lieferung</h3>
                      <p className="text-sm text-gray-600">
                        {checkoutData.sameAsBinding ? checkoutData.billingAddress.street : checkoutData.deliveryAddress.street}<br />
                        {checkoutData.sameAsBinding ? checkoutData.billingAddress.zipCode : checkoutData.deliveryAddress.zipCode} {checkoutData.sameAsBinding ? checkoutData.billingAddress.city : checkoutData.deliveryAddress.city}
                      </p>
                    </div>

                    {/* Zahlung & Versand Zusammenfassung */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Zahlung & Versand</h3>
                      <p className="text-sm text-gray-600">
                        Zahlung: {checkoutData.paymentMethod === 'invoice' ? 'Rechnung' : 
                                 checkoutData.paymentMethod === 'transfer' ? 'Vorauskasse' : 'Kreditkarte'}<br />
                        Versand: {checkoutData.deliveryMethod === 'standard' ? 'Standardversand (2-3 Tage)' :
                                 checkoutData.deliveryMethod === 'express' ? 'Expressversand (1 Tag)' : 'Selbstabholung'}
                      </p>
                    </div>

                    {/* AGB */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          required
                          className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Ich habe die <a href="#" className="text-amber-500 hover:text-amber-600">Allgemeinen Geschäftsbedingungen</a> und 
                          <a href="#" className="text-amber-500 hover:text-amber-600"> Datenschutzbestimmungen</a> gelesen und akzeptiere diese.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Zurück
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!validateStep(currentStep)}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed ml-auto"
                  >
                    Weiter
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-auto flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Bestellung wird verarbeitet...
                      </>
                    ) : (
                      'Bestellung verbindlich aufgeben'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Bestellübersicht</h3>
              
              {/* Products */}
              <div className="space-y-3 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}x €{item.price}</p>
                    </div>
                    <p className="text-sm font-medium">
                      €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Zwischensumme:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Versand:</span>
                  <span>{formatPrice(getDeliveryPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Netto:</span>
                  <span>{formatPrice(getTotalWithDelivery())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MwSt. (20%):</span>
                  <span>{formatPrice(getVAT())}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Gesamt:</span>
                  <span>{formatPrice(getFinalTotal())}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center text-sm text-amber-800">
                  <Calendar className="mr-2" size={16} />
                  <span>
                    Voraussichtliche Lieferung: {
                      checkoutData.deliveryMethod === 'express' ? 'Morgen' :
                      checkoutData.deliveryMethod === 'pickup' ? 'Sofort abholbereit' :
                      'In 2-3 Werktagen'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}