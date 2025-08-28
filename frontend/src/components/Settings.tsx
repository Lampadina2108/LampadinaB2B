import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Save, Bell, Eye, Euro, Globe, Shield, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { settingsAPI, handleAPIError } from '../lib/api';

interface SettingsData {
  // Preise & Anzeige
  priceDisplay: 'einkauf' | 'uvp';
  showPriceComparison: boolean;
  showStockStatus: boolean;
  showProductRatings: boolean;
  
  // Benachrichtigungen
  emailNotifications: {
    orderConfirmation: boolean;
    shippingUpdates: boolean;
    invoiceReminders: boolean;
    productUpdates: boolean;
    promotions: boolean;
  };
  
  smsNotifications: {
    orderConfirmation: boolean;
    shippingUpdates: boolean;
    urgentUpdates: boolean;
  };
  
  // Sprache & Region
  language: 'de' | 'en';
  currency: 'EUR' | 'USD';
  dateFormat: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  
  // Bestellungen & Checkout
  defaultDeliveryMethod: 'standard' | 'express' | 'pickup';
  defaultPaymentMethod: 'invoice' | 'transfer' | 'card';
  saveDeliveryAddress: boolean;
  autoFillContactData: boolean;
  
  // Datenschutz & Sicherheit
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  twoFactorAuth: boolean;
  
  // Katalog & Suche
  itemsPerPage: 12 | 24 | 48;
  defaultSortOrder: 'name' | 'price-low' | 'price-high';
  showOutOfStock: boolean;
  compactView: boolean;
}

export default function Settings() {
  const { state } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [settings, setSettings] = useState<SettingsData>({
    // Preise & Anzeige
    priceDisplay: 'einkauf',
    showPriceComparison: true,
    showStockStatus: true,
    showProductRatings: true,
    
    // Benachrichtigungen
    emailNotifications: {
      orderConfirmation: true,
      shippingUpdates: true,
      invoiceReminders: true,
      productUpdates: false,
      promotions: false,
    },
    
    smsNotifications: {
      orderConfirmation: false,
      shippingUpdates: true,
      urgentUpdates: true,
    },
    
    // Sprache & Region
    language: 'de',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    
    // Bestellungen & Checkout
    defaultDeliveryMethod: 'standard',
    defaultPaymentMethod: 'invoice',
    saveDeliveryAddress: true,
    autoFillContactData: true,
    
    // Datenschutz & Sicherheit
    dataProcessingConsent: true,
    marketingConsent: false,
    analyticsConsent: true,
    twoFactorAuth: false,
    
    // Katalog & Suche
    itemsPerPage: 24,
    defaultSortOrder: 'name' as 'name' | 'price-low' | 'price-high',
    showOutOfStock: true,
    compactView: false,
  });

  // Load settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await settingsAPI.getSettings();
        
        // Map database fields to frontend structure
        setSettings({
          priceDisplay: userSettings.price_display,
          showPriceComparison: userSettings.show_price_comparison,
          showStockStatus: userSettings.show_stock_status,
          showProductRatings: userSettings.show_product_ratings,
          
          emailNotifications: {
            orderConfirmation: userSettings.email_order_confirmation,
            shippingUpdates: userSettings.email_shipping_updates,
            invoiceReminders: userSettings.email_invoice_reminders,
            productUpdates: userSettings.email_product_updates,
            promotions: userSettings.email_promotions,
          },
          
          smsNotifications: {
            orderConfirmation: userSettings.sms_order_confirmation,
            shippingUpdates: userSettings.sms_shipping_updates,
            urgentUpdates: userSettings.sms_urgent_updates,
          },
          
          language: userSettings.language,
          currency: userSettings.currency,
          dateFormat: userSettings.date_format,
          
          defaultDeliveryMethod: userSettings.default_delivery_method,
          defaultPaymentMethod: userSettings.default_payment_method,
          saveDeliveryAddress: userSettings.save_delivery_address,
          autoFillContactData: userSettings.auto_fill_contact_data,
          
          dataProcessingConsent: userSettings.data_processing_consent,
          marketingConsent: userSettings.marketing_consent,
          analyticsConsent: userSettings.analytics_consent,
          twoFactorAuth: userSettings.two_factor_auth,
          
          itemsPerPage: userSettings.items_per_page,
          defaultSortOrder: userSettings.default_sort_order,
          showOutOfStock: userSettings.show_out_of_stock,
          compactView: userSettings.compact_view,
        });
      } catch (error) {
        console.error('Failed to load settings:', handleAPIError(error));
      } finally {
        setIsLoading(false);
      }
    };

    if (state.isAuthenticated) {
      loadSettings();
    }
  }, [state.isAuthenticated]);
  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mb-6">
            Bitte melden Sie sich an, um Ihre Einstellungen zu verwalten.
          </p>
          <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const handleSettingChange = (category: string, setting: string, value: any) => {
    if (category === 'root') {
      setSettings(prev => ({ ...prev, [setting]: value }));
    } else {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof SettingsData],
          [setting]: value
        }
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Map frontend structure to database fields
      const settingsData = {
        priceDisplay: settings.priceDisplay,
        showPriceComparison: settings.showPriceComparison,
        showStockStatus: settings.showStockStatus,
        showProductRatings: settings.showProductRatings,
        
        emailOrderConfirmation: settings.emailNotifications.orderConfirmation,
        emailShippingUpdates: settings.emailNotifications.shippingUpdates,
        emailInvoiceReminders: settings.emailNotifications.invoiceReminders,
        emailProductUpdates: settings.emailNotifications.productUpdates,
        emailPromotions: settings.emailNotifications.promotions,
        
        smsOrderConfirmation: settings.smsNotifications.orderConfirmation,
        smsShippingUpdates: settings.smsNotifications.shippingUpdates,
        smsUrgentUpdates: settings.smsNotifications.urgentUpdates,
        
        language: settings.language,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        
        defaultDeliveryMethod: settings.defaultDeliveryMethod,
        defaultPaymentMethod: settings.defaultPaymentMethod,
        saveDeliveryAddress: settings.saveDeliveryAddress,
        autoFillContactData: settings.autoFillContactData,
        
        dataProcessingConsent: settings.dataProcessingConsent,
        marketingConsent: settings.marketingConsent,
        analyticsConsent: settings.analyticsConsent,
        twoFactorAuth: settings.twoFactorAuth,
        
        itemsPerPage: settings.itemsPerPage,
        defaultSortOrder: settings.defaultSortOrder,
        showOutOfStock: settings.showOutOfStock,
        compactView: settings.compactView,
      };

      await settingsAPI.updateSettings(settingsData);
      setMessage({ type: 'success', text: 'Einstellungen erfolgreich gespeichert!' });
    } catch (error) {
      setMessage({ type: 'error', text: handleAPIError(error) });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Einstellungen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Zurück zur Startseite
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <SettingsIcon className="mr-3 text-amber-500" size={28} />
                Einstellungen
              </h1>
              <p className="text-gray-600 mt-1">
                Personalisieren Sie Ihr B2B-Einkaufserlebnis
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Angemeldet als</p>
              <p className="font-medium">{state.user?.contactPerson}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Preise & Anzeige */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Euro className="mr-3 text-amber-500" size={24} />
              Preise & Anzeige
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preisanzeige
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceDisplay"
                      value="einkauf"
                      checked={settings.priceDisplay === 'einkauf'}
                      onChange={(e) => handleSettingChange('root', 'priceDisplay', e.target.value)}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm">Einkaufspreise anzeigen (empfohlen für B2B)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceDisplay"
                      value="uvp"
                      checked={settings.priceDisplay === 'uvp'}
                      onChange={(e) => handleSettingChange('root', 'priceDisplay', e.target.value)}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm">UVP-Preise anzeigen</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showPriceComparison}
                    onChange={(e) => handleSettingChange('root', 'showPriceComparison', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Preisvergleich anzeigen</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showStockStatus}
                    onChange={(e) => handleSettingChange('root', 'showStockStatus', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Lagerbestand anzeigen</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showProductRatings}
                    onChange={(e) => handleSettingChange('root', 'showProductRatings', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Produktbewertungen anzeigen</span>
                </label>
              </div>
            </div>
          </div>

          {/* Benachrichtigungen */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Bell className="mr-3 text-amber-500" size={24} />
              Benachrichtigungen
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Mail className="mr-2 text-gray-600" size={20} />
                  E-Mail Benachrichtigungen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.emailNotifications).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('emailNotifications', key, e.target.checked)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm">
                        {key === 'orderConfirmation' && 'Bestellbestätigungen'}
                        {key === 'shippingUpdates' && 'Versand-Updates'}
                        {key === 'invoiceReminders' && 'Rechnungserinnerungen'}
                        {key === 'productUpdates' && 'Produkt-Updates'}
                        {key === 'promotions' && 'Aktionen & Angebote'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Smartphone className="mr-2 text-gray-600" size={20} />
                  SMS Benachrichtigungen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.smsNotifications).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('smsNotifications', key, e.target.checked)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm">
                        {key === 'orderConfirmation' && 'Bestellbestätigungen'}
                        {key === 'shippingUpdates' && 'Versand-Updates'}
                        {key === 'urgentUpdates' && 'Dringende Updates'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sprache & Region */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Globe className="mr-3 text-amber-500" size={24} />
              Sprache & Region
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprache
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('root', 'language', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Währung
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('root', 'currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datumsformat
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('root', 'dateFormat', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bestellungen & Checkout */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <SettingsIcon className="mr-3 text-amber-500" size={24} />
              Bestellungen & Checkout
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Versandart
                  </label>
                  <select
                    value={settings.defaultDeliveryMethod}
                    onChange={(e) => handleSettingChange('root', 'defaultDeliveryMethod', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="standard">Standardversand</option>
                    <option value="express">Expressversand</option>
                    <option value="pickup">Selbstabholung</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Zahlungsart
                  </label>
                  <select
                    value={settings.defaultPaymentMethod}
                    onChange={(e) => handleSettingChange('root', 'defaultPaymentMethod', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="invoice">Rechnung</option>
                    <option value="transfer">Vorauskasse</option>
                    <option value="card">Kreditkarte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.saveDeliveryAddress}
                    onChange={(e) => handleSettingChange('root', 'saveDeliveryAddress', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Lieferadresse speichern</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoFillContactData}
                    onChange={(e) => handleSettingChange('root', 'autoFillContactData', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Kontaktdaten automatisch ausfüllen</span>
                </label>
              </div>
            </div>
          </div>

          {/* Katalog & Suche */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Eye className="mr-3 text-amber-500" size={24} />
              Katalog & Suche
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artikel pro Seite
                  </label>
                  <select
                    value={settings.itemsPerPage}
                    onChange={(e) => handleSettingChange('root', 'itemsPerPage', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value={12}>12 Artikel</option>
                    <option value={24}>24 Artikel</option>
                    <option value={48}>48 Artikel</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Sortierung
                  </label>
                  <select
                    value={settings.defaultSortOrder}
                    onChange={(e) => handleSettingChange('root', 'defaultSortOrder', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Preis aufsteigend</option>
                    <option value="price-high">Preis absteigend</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showOutOfStock}
                    onChange={(e) => handleSettingChange('root', 'showOutOfStock', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Nicht verfügbare Artikel anzeigen</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.compactView}
                    onChange={(e) => handleSettingChange('root', 'compactView', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm">Kompakte Ansicht</span>
                </label>
              </div>
            </div>
          </div>

          {/* Datenschutz & Sicherheit */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="mr-3 text-amber-500" size={24} />
              Datenschutz & Sicherheit
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={settings.dataProcessingConsent}
                  onChange={(e) => handleSettingChange('root', 'dataProcessingConsent', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium">Datenverarbeitung zustimmen</span>
                  <p className="text-xs text-gray-500">Erforderlich für die Nutzung unserer Services</p>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={settings.marketingConsent}
                  onChange={(e) => handleSettingChange('root', 'marketingConsent', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium">Marketing-E-Mails erhalten</span>
                  <p className="text-xs text-gray-500">Informationen über neue Produkte und Angebote</p>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={settings.analyticsConsent}
                  onChange={(e) => handleSettingChange('root', 'analyticsConsent', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium">Analytics zulassen</span>
                  <p className="text-xs text-gray-500">Hilft uns, unsere Website zu verbessern</p>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('root', 'twoFactorAuth', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium">Zwei-Faktor-Authentifizierung aktivieren</span>
                  <p className="text-xs text-gray-500">Zusätzliche Sicherheit für Ihr Konto</p>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-8 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Einstellungen speichern
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}