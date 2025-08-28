import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Search, Filter, Trash2, ShoppingCart, Star, Grid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useCart from '../hooks/useCartSafe';

// Demo Favoriten - würden normalerweise aus der Datenbank kommen
const demoFavorites = [
  {
    id: 1,
    name: 'LED Wandleuchte Cube Up/Down',
    brand: 'SLV',
    price: '89.50',
    uvpPrice: '125.00',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['IP54', '3000K', '680lm', '8.5W'],
    category: 'Wandleuchten',
    inStock: true,
    dateAdded: '2024-03-15',
    unitType: 'piece' as const,
    unitSize: undefined,
    minQuantity: 1
  },
  {
    id: 12,
    name: 'LED Strip 24V 3000K CRI90+ 120LED/m',
    brand: 'Osram',
    price: '24.90',
    uvpPrice: '32.50',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['24V', '3000K', '120LED/m', 'CRI90+', '5m'],
    category: 'LED Band',
    inStock: true,
    dateAdded: '2024-03-10',
    unitType: 'meter' as const,
    unitSize: 5,
    minQuantity: 1
  },
  {
    id: 13,
    name: 'Alu-Profil Eckig 16x16mm mit Abdeckung',
    brand: 'Brumberg',
    price: '12.40',
    uvpPrice: '18.90',
    image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['16x16mm', '2m', 'Aluminium', 'Matt', 'Abdeckung'],
    category: 'Alu Profile',
    inStock: false,
    dateAdded: '2024-03-05',
    unitType: 'meter' as const,
    unitSize: 2,
    minQuantity: 1
  },
  {
    id: 4,
    name: 'Einbaustrahler LED 8W 3000K schwenkbar',
    brand: 'SLV',
    price: '34.50',
    uvpPrice: '49.90',
    image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['8W', '3000K', '680lm', 'Schwenkbar', 'IP20'],
    category: 'Einbaustrahler',
    inStock: true,
    dateAdded: '2024-02-28',
    unitType: 'piece' as const,
    unitSize: undefined,
    minQuantity: 1
  }
];

export default function Favorites() {
  const { state } = useAuth();
  const { addItem, openCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState(demoFavorites);

  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mb-6">
            Bitte melden Sie sich an, um Ihre Favoriten zu sehen.
          </p>
          <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const filteredFavorites = favorites.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(favorites.map(product => product.category))];

  const removeFavorite = (productId: number) => {
    setFavorites(prev => prev.filter(product => product.id !== productId));
  };

  const addToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      unitType: product.unitType,
      unitSize: product.unitSize,
      minQuantity: product.minQuantity,
      specs: product.specs
    });
    openCart();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-AT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Heart className="mr-3 text-red-500" size={28} />
                Meine Favoriten
              </h1>
              <p className="text-gray-600 mt-1">
                Ihre gespeicherten Lieblingsprodukte
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
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-xl font-semibold mb-2">Noch keine Favoriten</h2>
            <p className="text-gray-600 mb-6">
              Fügen Sie Produkte zu Ihren Favoriten hinzu, um sie hier zu sehen.
            </p>
            <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
              Produkte entdecken
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Favoriten durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">Alle Kategorien</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredFavorites.length} von {favorites.length} Favoriten
              </div>
            </div>

            {/* Products */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }`}>
              {filteredFavorites.map((product) => (
                <FavoriteCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                  onRemove={removeFavorite}
                  onAddToCart={addToCart}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {filteredFavorites.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <Search className="mx-auto mb-4 text-gray-400" size={48} />
                <h2 className="text-xl font-semibold mb-2">Keine Favoriten gefunden</h2>
                <p className="text-gray-600">
                  Keine Favoriten entsprechen Ihrer Suche "{searchTerm}".
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Favorite Card Component
function FavoriteCard({ product, viewMode, onRemove, onAddToCart, formatDate }: any) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="flex">
          <img
            src={product.image}
            alt={product.name}
            className="w-48 h-32 object-cover flex-shrink-0"
          />
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.specs.map((spec: string, index: number) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span>{product.rating}</span>
                    <span className="ml-1">({product.reviews})</span>
                  </div>
                  <div className={`flex items-center ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {product.inStock ? 'Auf Lager' : 'Nicht verfügbar'}
                  </div>
                  <span>Hinzugefügt: {formatDate(product.dateAdded)}</span>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">€{product.price}</span>
                  <span className="text-sm text-gray-500 line-through">€{product.uvpPrice}</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Nur für Geschäftskunden</p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex items-center px-3 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={14} className="mr-1" />
                    In den Warenkorb
                  </button>
                  <button
                    onClick={() => onRemove(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`px-2 py-1 text-white text-xs rounded ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
            {product.inStock ? 'Auf Lager' : 'Nicht verfügbar'}
          </span>
        </div>

        <button
          onClick={() => onRemove(product.id)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.specs.slice(0, 3).map((spec: string, index: number) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
              {spec}
            </span>
          ))}
        </div>

        <div className="flex items-center mb-3 text-sm">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span className="text-gray-600">{product.rating} ({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">€{product.price}</span>
              <span className="text-sm text-gray-500 line-through">€{product.uvpPrice}</span>
            </div>
            <p className="text-xs text-gray-600">Nur für Geschäftskunden</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          Hinzugefügt: {formatDate(product.dateAdded)}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} className="mr-2" />
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}