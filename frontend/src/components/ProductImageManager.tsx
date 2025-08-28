import React, { useState, useEffect } from 'react';
import { Star, Trash2, Upload, Eye, Edit } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

interface ProductImageManagerProps {
  productId: number;
}

export default function ProductImageManager({ productId }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const loadImages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/images`);
      if (response.ok) {
        const imageData = await response.json();
        setImages(imageData);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [productId]);

  const setPrimaryImage = async (imageId: number) => {
    try {
      const token = localStorage.getItem('lampadina_token');
      const response = await fetch(`http://localhost:5000/api/upload/image/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadImages(); // Refresh images
      }
    } catch (error) {
      console.error('Failed to set primary image:', error);
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Bild löschen möchten?')) {
      return;
    }

    try {
      const token = localStorage.getItem('lampadina_token');
      const response = await fetch(`http://localhost:5000/api/upload/image/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadImages(); // Refresh images
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Images */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Aktuelle Produktbilder ({images.length})</h3>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            <Upload size={16} className="mr-2" />
            {showUpload ? 'Upload schließen' : 'Bilder hochladen'}
          </button>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Upload className="mx-auto mb-4" size={48} />
            <p>Noch keine Bilder hochgeladen</p>
            <p className="text-sm mt-2">Laden Sie Bilder hoch, um sie hier zu sehen</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.alt_text}
                  className="w-full h-48 object-cover"
                />
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                    <Star size={12} className="mr-1" />
                    Hauptbild
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {!image.is_primary && (
                    <button
                      onClick={() => setPrimaryImage(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Als Hauptbild setzen"
                    >
                      <Star size={16} className="text-amber-500" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.open(image.image_url, '_blank')}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Vollbild anzeigen"
                  >
                    <Eye size={16} className="text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Bild löschen"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>

                {/* Image Info */}
                <div className="p-3 bg-white">
                  <p className="text-sm font-medium truncate">{image.alt_text || 'Produktbild'}</p>
                  <p className="text-xs text-gray-500">Reihenfolge: {image.sort_order}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Component */}
      {showUpload && (
        <ImageUpload 
          productId={productId} 
          onImagesUploaded={() => {
            loadImages();
            setShowUpload(false);
          }} 
        />
      )}
    </div>
  );
}