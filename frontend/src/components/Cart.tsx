import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingCart, Trash2, Package } from 'lucide-react';
import useCart from '../hooks/useCartSafe';

export default function Cart() {
  const { state, closeCart, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();

  if (!state.isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getUnitDisplay = (item: any) => {
    if (item.unitType === 'meter' && item.unitSize) {
      return `${item.unitSize}m Rolle`;
    }
    return 'Stück';
  };

  const getPriceDisplay = (item: any) => {
    if (item.unitType === 'meter' && item.unitSize) {
      const pricePerMeter = parseFloat(item.price) / item.unitSize;
      return `€${item.price} (€${pricePerMeter.toFixed(2)}/m)`;
    }
    return `€${item.price}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            Warenkorb ({state.items.length})
          </h2>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {state.items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Ihr Warenkorb ist leer</p>
              <p className="text-sm text-gray-400 mt-2">
                Fügen Sie Produkte hinzu, um mit dem Einkauf zu beginnen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">
                        {item.name}
                      </h3>
                      
                      {/* Specs */}
                      {item.specs && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.specs.slice(0, 3).map((spec, index) => (
                            <span key={index} className="bg-gray-100 px-1 py-0.5 rounded text-xs text-gray-600">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        {getPriceDisplay(item)}
                      </p>

                      {/* Unit Type Info */}
                      <p className="text-xs text-gray-500 mb-3">
                        Einheit: {getUnitDisplay(item)}
                        {item.minQuantity && item.minQuantity > 1 && (
                          <span className="ml-2 text-amber-600">
                            (Min. {item.minQuantity} {getUnitDisplay(item)})
                          </span>
                        )}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= (item.minQuantity || 1)}
                            className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-sm min-w-[50px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Total for this item */}
                      <div className="mt-2 text-right">
                        <span className="text-sm font-semibold">
                          Gesamt: {formatPrice(parseFloat(item.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Gesamtsumme:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            
            <p className="text-xs text-gray-500">
              Preise exkl. MwSt. • Nur für Geschäftskunden
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <Link 
                to="/checkout" 
               onClick={closeCart}
                className="block w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors text-center"
              >
                Zur Kasse
              </Link>
              <button 
                onClick={clearCart}
                className="w-full border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Warenkorb leeren
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}