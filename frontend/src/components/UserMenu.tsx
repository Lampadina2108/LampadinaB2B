import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, Settings, FileText, LogOut, Building, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu() {
  const { state, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!state.isAuthenticated || !state.user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200"
      >
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <User size={16} className="text-amber-600" />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-gray-900">{state.user.contactPerson}</p>
          <p className="text-xs text-gray-500">{state.user.companyName}</p>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{state.user.contactPerson}</p>
                  <p className="text-sm text-gray-500">{state.user.email}</p>
                </div>
              </div>
              
              {/* Company Info */}
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <div className="flex items-center text-sm text-gray-600">
                  <Building size={14} className="mr-2" />
                  <span>{state.user.companyName}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">UID: {state.user.vatNumber}</p>
              </div>

              {/* Account Status */}
              <div className="mt-2">
                {state.user.isApproved ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    ✓ Konto freigeschaltet
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    ⏳ Freischaltung ausstehend
                  </span>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link to="/profile" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <User size={16} className="mr-3 text-gray-400" />
                Mein Profil
              </Link>
              
              <Link to="/orders" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <FileText size={16} className="mr-3 text-gray-400" />
                Bestellhistorie
              </Link>
              
              <Link to="/invoices" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <FileText size={16} className="mr-3 text-gray-400" />
                Rechnungen
              </Link>
              
              <Link to="/projects" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <FileText size={16} className="mr-3 text-gray-400" />
                Projektlisten
              </Link>
              
              <Link to="/bulk-order" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <FileText size={16} className="mr-3 text-gray-400" />
                Bulk-Bestellung
              </Link>
              
              <Link to="/quote-request" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <FileText size={16} className="mr-3 text-gray-400" />
                Angebot anfordern
              </Link>
              
              <Link to="/compare" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <FileText size={16} className="mr-3 text-gray-400" />
                Produktvergleich
              </Link>
              
              <Link to="/favorites" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <Heart size={16} className="mr-3 text-gray-400" />
                Favoriten
              </Link>
              
              <Link to="/settings" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <Settings size={16} className="mr-3 text-gray-400" />
                Einstellungen
              </Link>
              
              {state.user?.role === 'admin' && (
                <Link to="/admin" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Settings size={16} className="mr-3 text-gray-400" />
                  Bilder verwalten
                </Link>
              )}
              
              {state.user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Settings size={16} className="mr-3 text-gray-400" />
                  Warenwirtschaft Dashboard
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 py-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut size={16} className="mr-3" />
                Abmelden
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}