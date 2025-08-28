import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ProductComparison() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Zurück zur Startseite
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Produktvergleich</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Produktvergleich wird implementiert...</p>
        </div>
      </div>
    </div>
  );
}