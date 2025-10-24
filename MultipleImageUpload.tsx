import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface MultipleImageUploadProps {
  onImagesChange: (files: File[]) => void;
}

export function MultipleImageUpload({ onImagesChange }: MultipleImageUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onImagesChange(updatedPreviews.map(p => p.file));
  };

  const removeImage = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onImagesChange(updatedPreviews.map(p => p.file));
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#C8102E] transition-colors">
        <label className="flex flex-col items-center cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-700 mb-1">
            Clique para adicionar imagens
          </span>
          <span className="text-xs text-gray-500">
            Você pode selecionar múltiplas imagens de uma vez
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">{previews.length} imagem(ns) selecionada(s)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black bg-opacity-60 text-white text-xs rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
