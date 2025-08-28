import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Building, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileManagement() {
  const { state, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [formData, setFormData] = useState({
    contactPerson: state.user?.contactPerson || '',
    email: state.user?.email || '',
    phone: state.user?.phone || '',
    address: {
      street: state.user?.address?.street || '',
      zipCode: state.user?.address?.zipCode || '',
      city: state.user?.address?.city || '',
      country: state.user?.address?.country || 'Österreich'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mb-6">
            Bitte melden Sie sich an, um Ihr Profil zu verwalten.
          </p>
          <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const success = await updateProfile({
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });

      if (success) {
        setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Speichern der Daten.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ein unerwarteter Fehler ist aufgetreten.' });
    }

    setIsSaving(false);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Die neuen Passwörter stimmen nicht überein.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Das neue Passwort muss mindestens 6 Zeichen lang sein.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordChange(false);
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      contactPerson: state.user?.contactPerson || '',
      email: state.user?.email || '',
      phone: state.user?.phone || '',
      address: {
        street: state.user?.address?.street || '',
        zipCode: state.user?.address?.zipCode || '',
        city: state.user?.address?.city || '',
        country: state.user?.address?.country || 'Österreich'
      }
    });
    setIsEditing(false);
    setMessage(null);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Profil verwalten</h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie Ihre Kontaktdaten und Einstellungen
              </p>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                state.user.isApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {state.user.isApproved ? '✓ Konto freigeschaltet' : '⏳ Freischaltung ausstehend'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="text-green-500 mr-3" size={20} />
            ) : (
              <AlertCircle className="text-red-500 mr-3" size={20} />
            )}
            <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Persönliche Daten</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Bearbeiten
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Company Info (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Building className="mr-2 text-gray-600" size={20} />
                    Firmendaten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">Firmenname</label>
                      <p className="font-medium">{state.user.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">UID-Nummer</label>
                      <p className="font-medium">{state.user.vatNumber}</p>
                    </div>
                    {state.user.companyRegister && (
                      <div>
                        <label className="block text-gray-600 mb-1">Firmenbuchnummer</label>
                        <p className="font-medium">{state.user.companyRegister}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-gray-600 mb-1">Registriert seit</label>
                      <p className="font-medium">
                        {new Date(state.user.registrationDate).toLocaleDateString('de-AT')}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Firmendaten können nur durch unser Support-Team geändert werden.
                  </p>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ansprechpartner *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      disabled={!isEditing}
                      className={`pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                      placeholder="Max Mustermann"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail-Adresse *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                      placeholder="max@firma.at"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-600' : ''
                      }`}
                      placeholder="+43 1 234 5678"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <MapPin className="mr-2 text-gray-600" size={20} />
                    Adresse
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Straße und Hausnummer *
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : ''
                        }`}
                        placeholder="Musterstraße 123"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PLZ *
                      </label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : ''
                        }`}
                        placeholder="1010"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ort *
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-50 text-gray-600' : ''
                        }`}
                        placeholder="Wien"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-3 pt-6 border-t">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Speichern...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Änderungen speichern
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Passwort ändern</h3>
              
              {!showPasswordChange ? (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Passwort ändern
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktuelles Passwort
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Neues Passwort
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passwort bestätigen
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:bg-gray-300"
                    >
                      {isSaving ? 'Speichern...' : 'Passwort ändern'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Konto-Informationen</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Registriert seit:</span>
                  <p className="font-medium">
                    {new Date(state.user.registrationDate).toLocaleDateString('de-AT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {state.user.lastLogin && (
                  <div>
                    <span className="text-gray-600">Letzte Anmeldung:</span>
                    <p className="font-medium">
                      {new Date(state.user.lastLogin).toLocaleDateString('de-AT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}