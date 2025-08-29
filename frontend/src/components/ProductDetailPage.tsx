import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Api, cdn, formatPrice } from "../lib/api";
import useCart from "../hooks/useCartSafe";
import { useAuth } from "../contexts/AuthContext";

interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
}

interface ProductAttribute {
  code: string;
  label: string;
  value: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | null;
  images: ProductImage[];
  attributes: ProductAttribute[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { state } = useAuth();

  useEffect(() => {
    if (!id) return;
    Api.getProduct(id)
      .then((p: Product) => {
        setProduct(p);
        const primary = p.images.find((i) => i.is_primary) || p.images[0];
        setMainImage(primary ? primary.url : "");
      })
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) return <div>Laden...</div>;

  const handleAdd = () => {
    add({ ...product }, qty);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        {mainImage && (
          <img
            src={cdn(mainImage)}
            alt={product.name}
            className="w-full rounded object-contain mb-4"
          />
        )}
        <div className="flex gap-2 flex-wrap">
          {product.images.map((img) => (
            <button
              key={img.id}
              className={`border rounded p-1 hover:opacity-80 ${
                mainImage === img.url ? "border-blue-500" : "border-gray-200"
              }`}
              onClick={() => setMainImage(img.url)}
            >
              <img
                src={cdn(img.url)}
                className="w-16 h-16 object-contain"
                alt=""
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>
        {state.user ? (
          <p className="text-xl text-gray-800 mb-4">
            {formatPrice(product.price)}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Preis nur für angemeldete Benutzer
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-2 py-1 border rounded"
          >
            -
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-2 py-1 border rounded"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          In den Warenkorb
        </button>

        {product.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Beschreibung</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
      </div>

      <div className="md:col-span-2 mt-10">
        <h2 className="text-lg font-semibold mb-4">Produktdetails</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <tbody>
              {product.attributes.map((attr) => (
                <tr key={attr.code} className="border-t">
                  <th className="text-left p-2 font-medium w-1/2">
                    {attr.label}
                  </th>
                  <td className="p-2">{attr.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
