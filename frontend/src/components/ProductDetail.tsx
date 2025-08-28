import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Truck, Shield, Award, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import useCart from '../hooks/useCartSafe';

// Demo Produktdaten
const demoProducts = {
  'led-wandleuchte-cube': {
    id: 1,
    name: 'LED Wandleuchte Cube Up/Down',
    brand: 'SLV',
    sku: 'SLV-232445',
    price: '89.50',
    originalPrice: '125.00',
    description: 'Moderne LED-Wandleuchte mit Up/Down-Lichtverteilung. Perfekt für die Akzentbeleuchtung von Fassaden und Eingangsbereichen. Hochwertige Verarbeitung mit IP54-Schutz für den Außenbereich.',
    longDescription: 'Die SLV LED Wandleuchte Cube überzeugt durch ihr minimalistisches Design und ihre hervorragende Lichtqualität. Das kubische Gehäuse aus hochwertigem Aluminium ist in verschiedenen Farben erhältlich und fügt sich harmonisch in moderne Architektur ein. Die integrierte LED-Technologie sorgt für eine lange Lebensdauer und niedrigen Energieverbrauch.',
    images: [
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    specifications: {
      'Schutzart': 'IP54',
      'Farbtemperatur': '3000K (Warmweiß)',
      'Lichtstrom': '680 lm',
      'Leistung': '8.5W',
      'Spannung': '230V AC',
      'Material': 'Aluminium, pulverbeschichtet',
      'Abmessungen': '100 x 100 x 120 mm',
      'Gewicht': '0.8 kg',
      'Lebensdauer': '50.000 Stunden',
      'Dimmbar': 'Ja (mit geeignetem Dimmer)',
      'Abstrahlwinkel': '2x 30°',
      'Energieeffizienzklasse': 'A+'
    },
    features: [
      'Wetterfest durch IP54-Schutz',
      'Energiesparende LED-Technologie',
      'Wartungsfreier Betrieb',
      'Einfache Montage',
      'Hochwertige Materialien',
      '5 Jahre Herstellergarantie'
    ],
    stock: 24,
    category: 'Wandleuchten',
    tags: ['LED', 'Außenbereich', 'Up/Down', 'Modern', 'IP54'],
    unitType: 'piece' as const,
    unitSize: undefined,
    minQuantity: 1
  },
  'led-strip-5m-3000k': {
    id: 12,
    name: 'LED Strip 24V 3000K CRI90+ 120LED/m',
    brand: 'Osram',
    sku: 'OSR-LS5M3K',
    price: '24.90',
    originalPrice: '32.50',
    description: 'Hochwertiger LED-Streifen mit 120 LEDs pro Meter und hervorragender Farbwiedergabe (CRI90+). Perfekt für professionelle Beleuchtungsanwendungen in Geschäften, Hotels und Büros.',
    longDescription: 'Dieser premium LED-Strip von Osram bietet mit 120 LEDs pro Meter eine gleichmäßige und helle Ausleuchtung. Die hohe Farbwiedergabe von CRI90+ sorgt für natürliche Farbdarstellung. Der Strip ist auf einer 5-Meter-Rolle geliefert und kann alle 5cm geschnitten werden. Ideal für Alu-Profile und professionelle Installationen.',
    images: [
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    specifications: {
      'Spannung': '24V DC',
      'Farbtemperatur': '3000K (Warmweiß)',
      'LED-Dichte': '120 LEDs/m',
      'Leistung': '14.4W/m (72W total)',
      'Lichtstrom': '1200 lm/m (6000 lm total)',
      'Farbwiedergabe': 'CRI90+',
      'Schnittlänge': '5cm',
      'Rollenlänge': '5 Meter',
      'Breite': '10mm',
      'Schutzart': 'IP20',
      'Lebensdauer': '50.000 Stunden',
      'Dimmbar': 'Ja (mit 24V Dimmer)'
    },
    features: [
      'Hohe LED-Dichte für gleichmäßiges Licht',
      'Hervorragende Farbwiedergabe CRI90+',
      'Schneidbar alle 5cm',
      'Selbstklebende Rückseite',
      'Für Alu-Profile geeignet',
      '3 Jahre Herstellergarantie'
    ],
    stock: 45,
    category: 'LED Band',
    tags: ['LED Strip', '24V', '3000K', 'CRI90+', 'Professionell'],
    unitType: 'meter' as const,
    unitSize: 5, // 5 meter roll
    minQuantity: 1 // minimum 1 roll (5m)
  },
  'alu-profil-2m-16x16': {
    id: 13,
    name: 'Alu-Profil Eckig 16x16mm mit Abdeckung',
    brand: 'Brumberg',
    sku: 'BRU-AP1616',
    price: '12.40',
    description: 'Hochwertiges Aluminium-Profil für LED-Strips mit matter Abdeckung. Perfekt für saubere und professionelle LED-Installationen in Möbeln, Regalen und Nischen.',
    longDescription: 'Das Brumberg Alu-Profil bietet eine elegante Lösung für die Integration von LED-Strips. Das eloxierte Aluminium sorgt für optimale Wärmeableitung und verlängert die Lebensdauer der LEDs. Die matte Abdeckung verhindert Punktlicht und sorgt für gleichmäßige Lichtverteilung. Inklusive Endkappen und Montageclips.',
    images: [
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    specifications: {
      'Material': 'Aluminium, eloxiert',
      'Abmessungen': '16 x 16mm',
      'Länge': '2 Meter',
      'Abdeckung': 'Matt, opal',
      'Geeignet für Strip-Breite': 'bis 12mm',
      'Montageart': 'Aufbau oder Einbau',
      'Farbe': 'Aluminium natur',
      'Gewicht': '0.15 kg/m',
      'Lieferumfang': 'Profil + Abdeckung + 2x Endkappen',
      'Montageclips': 'Optional erhältlich',
      'Schneidbar': 'Ja, mit Metallsäge'
    },
    features: [
      'Optimale Wärmeableitung',
      'Gleichmäßige Lichtverteilung',
      'Einfache Montage',
      'Inklusive Endkappen',
      'Für LED-Strips bis 12mm Breite',
      'Professionelle Optik'
    ],
    stock: 78,
    category: 'Alu Profile',
    tags: ['Alu Profil', '16x16mm', '2m', 'Matt', 'LED Strip'],
    unitType: 'meter' as const,
    unitSize: 2, // 2 meter profile
    minQuantity: 1 // minimum 1 profile (2m)
  }
};

// Häufig zusammen gekauft
const bundleProducts = [
  {
    id: 5,
    name: 'LED Dimmer 230V Phasenabschnitt',
    brand: 'SLV',
    price: '45.20',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
    reason: 'Für stufenlose Helligkeitsregelung',
    unitType: 'piece' as const,
    unitSize: undefined,
    minQuantity: 1,
    specs: ['230V', 'Phasenanschnitt', '10-300W']
  },
  {
    id: 6,
    name: 'Wandhalterung Aluminium',
    brand: 'SLV',
    price: '12.90',
    image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=200',
    reason: 'Für sichere Wandmontage',
    unitType: 'piece' as const,
    unitSize: undefined,
    minQuantity: 1,
    specs: ['Aluminium', 'Wetterfest', 'Universal']
  },
  {
    id: 7,
    name: 'Kabelverbinder IP68',
    brand: 'Wago',
    price: '8.50',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
    reason: 'Wasserdichte Kabelverbindung',
    unitType: 'piece' as const,
    unitSize: undefined,
    minQuantity: 1,
    specs: ['IP68', '3-polig', 'Wago']
  }
];

// Produktfamilie
const productFamily = [
  {
    id: 8,
    name: 'LED Wandleuchte Cube Up/Down - Anthrazit',
    brand: 'SLV',
    price: '89.50',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
    specs: ['IP54', '3000K', '680lm', '8.5W'],
    variant: 'Anthrazit'
  },
  {
    id: 9,
    name: 'LED Wandleuchte Cube Up/Down - Weiß',
    brand: 'SLV',
    price: '89.50',
    image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=200',
    specs: ['IP54', '3000K', '680lm', '8.5W'],
    variant: 'Weiß'
  },
  {
    id: 10,
    name: 'LED Wandleuchte Cube Up/Down - 4000K',
    brand: 'SLV',
    price: '94.50',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=200',
    specs: ['IP54', '4000K', '720lm', '8.5W'],
    variant: 'Kaltweiß'
  },
  {
    id: 11,
    name: 'LED Wandleuchte Cube Single Down',
    brand: 'SLV',
    price: '67.90',
    image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=200',
    specs: ['IP54', '3000K', '340lm', '4.5W'],
    variant: 'Single Down'
  }
];

const relatedProducts = [
  {
    id: 2,
    name: 'LED Panel Deckenleuchte 60x60cm',
    brand: 'Osram',
    price: '156.90',
    image: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['IP20', '4000K', '4200lm', '42W']
  },
  {
    id: 3,
    name: 'LED-Schienensystem 3-Phasen 2m',
    brand: 'Paulmann',
    price: '78.30',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['IP20', 'Aluminium', '2m', '3-Phasen']
  },
  {
    id: 4,
    name: 'LED-Profil Aluminium Eckig 2m',
    brand: 'Brumberg',
    price: '24.80',
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=400',
    specs: ['Aluminium', '16x16mm', '2m', 'Matt']
  }
];

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem, openCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = demoProducts[slug as keyof typeof demoProducts];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h1>
          <Link to="/" className="text-amber-500 hover:text-amber-600">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      unitType: product.unitType,
      unitSize: product.unitSize,
      minQuantity: product.minQuantity,
      specs: Object.values(product.specifications).slice(0, 4)
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-amber-500">Home</Link>
            <span>/</span>
            <span className="text-gray-400">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Zurück zur Übersicht
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              
              {/* Image Navigation */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Heart size={20} className="text-gray-600" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                  <Share2 size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-amber-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-600">Artikel-Nr.: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-3xl font-bold text-gray-900">€{product.price}</span>
                <span className="text-lg text-gray-500 line-through">€{product.originalPrice}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">-28%</span>
              </div>
              <p className="text-sm text-gray-600">Preise exkl. MwSt. • Nur für Geschäftskunden</p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Auf Lager ({product.stock} Stück)</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Truck size={16} className="mr-1" />
                  Versand in 1-2 Werktagen
                </div>
                <div className="flex items-center">
                  <Shield size={16} className="mr-1" />
                  5 Jahre Garantie
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Menge:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>In den Warenkorb</span>
              </button>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Produktvorteile</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <Award size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Beschreibung' },
                { id: 'specifications', label: 'Technische Daten' },
                { id: 'delivery', label: 'Versand & Lieferung' },
                { id: 'family', label: 'Produktfamilie' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">{product.description}</p>
                <p className="text-gray-700">{product.longDescription}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Truck className="text-amber-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">Standardversand</h4>
                    <p className="text-gray-600">Lieferung in 1-2 Werktagen innerhalb Österreichs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="text-amber-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">Garantie</h4>
                    <p className="text-gray-600">5 Jahre Herstellergarantie auf alle LED-Produkte</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div>
                <p className="text-gray-600 mb-6">
                  Entdecken Sie häufig benötigtes Zubehör für eine einfache und professionelle Installation.
                </p>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Package className="mr-3 text-amber-500" size={24} />
                    Häufig benötigtes Zubehör
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Diese Artikel werden oft zusammen mit diesem Produkt benötigt und erleichtern die Installation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bundleProducts.map((bundleProduct) => (
                      <BundleProductCard key={bundleProduct.id} product={bundleProduct} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Ähnliche Produkte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">{relatedProduct.brand}</p>
                  <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {relatedProduct.specs.map((spec, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nur für Geschäftskunden</span>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bundle Product Card Component with quantity selector
function BundleProductCard({ product }: { product: any }) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      quantity: quantity,
      unitType: product.unitType,
      unitSize: product.unitSize,
      minQuantity: product.minQuantity,
      specs: product.specs
    });
    openCart();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-32 object-cover rounded mb-3"
      />
      <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>
      <p className="text-xs text-gray-600 mb-3">{product.reason}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900">€{product.price}</span>
        <div className="flex items-center border border-gray-300 rounded">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 hover:bg-gray-50"
          >
            <Minus size={12} />
          </button>
          <span className="px-2 py-1 text-sm min-w-[40px] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-1 hover:bg-gray-50"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      
      <button 
        onClick={handleAddToCart}
        className="w-full px-3 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 flex items-center justify-center space-x-1"
      >
        <ShoppingCart size={14} />
        <span>In den Warenkorb ({quantity}x)</span>
      </button>
    </div>
  );
}