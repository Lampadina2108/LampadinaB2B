import React, { useState, useRef } from 'react';
import { Upload, X, Star, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  productId: number;
  onImagesUploaded: () => void;
}

interface UploadedImage {
  imageId: number;
  imageUrl: string;
  filename: string;
}

export default function ImageUpload({ productId, onImagesUploaded }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    uploadImages(Array.from(files));
  };

  const uploadImages = async (files: File[]) => {
    setIsUploading(true);
    setMessage(null);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('lampadina_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Bitte melden Sie sich an' });
        return;
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:5000/api/upload/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload fehlgeschlagen');
      }

      const result = await response.json();
      setMessage({ 
        type: 'success', 
        text: `${result.images.length} Bild(er) erfolgreich hochgeladen!` 
      });
      
      onImagesUploaded(); // Refresh parent component
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Upload fehlgeschlagen' 
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ImageIcon className="mr-3 text-amber-500" size={24} />
        Produktbilder hochladen
      </h3>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <Check className="mr-2" size={16} />
          ) : (
            <AlertCircle className="mr-2" size={16} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-amber-500 bg-amber-50' 
            : 'border-gray-300 hover:border-amber-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-gray-600">Bilder werden hochgeladen...</p>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto text-gray-400" size={48} />
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Bilder hier ablegen oder klicken zum Auswählen
              </p>
              <p className="text-sm text-gray-600">
                Unterstützte Formate: JPEG, PNG, WebP (max. 5MB pro Bild)
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Bilder auswählen
            </button>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Upload-Hinweise:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mehrere Bilder gleichzeitig möglich</li>
          <li>• Erstes Bild wird automatisch als Hauptbild gesetzt</li>
          <li>• Bilder werden in `/server/uploads/products/` gespeichert</li>
          <li>• URLs werden automatisch in der Datenbank gespeichert</li>
          <li>• Maximale Dateigröße: 5MB pro Bild</li>
        </ul>
      </div>
    </div>
  );
}