import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  ordem: number;
  legenda: string;
  is_cover: boolean;
  uploading?: boolean;
}

interface Props {
  imovelId?: string;
  existingImages?: ImageFile[];
  onImagesChange?: (images: ImageFile[]) => void;
  maxImages?: number;
}

export function ImageUpload({ imovelId, existingImages = [], onImagesChange, maxImages = 20 }: Props) {
  const [images, setImages] = useState<ImageFile[]>(existingImages);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (images.length + imageFiles.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    const newImages: ImageFile[] = imageFiles.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      ordem: images.length + index,
      legenda: '',
      is_cover: images.length === 0 && index === 0,
      uploading: false
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange?.(updatedImages);

    if (imovelId) {
      await uploadImages(newImages);
    }
  };

  const uploadImages = async (imagesToUpload: ImageFile[]) => {
    setUploading(true);

    for (const image of imagesToUpload) {
      if (!image.file) continue;

      try {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${imovelId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imoveis')
          .upload(fileName, image.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('imoveis')
          .getPublicUrl(fileName);

        const { data: dbData, error: dbError } = await supabase
          .from('imovel_images')
          .insert([{
            imovel_id: imovelId,
            url: publicUrl,
            ordem: image.ordem,
            legenda: image.legenda,
            is_cover: image.is_cover
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, id: dbData.id, url: publicUrl, uploading: false }
            : img
        ));
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        alert('Erro ao fazer upload da imagem');
        setImages(prev => prev.filter(img => img.id !== image.id));
      }
    }

    setUploading(false);
  };

  const removeImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);

    if (image && !image.id.startsWith('temp-') && imovelId) {
      try {
        const { error } = await supabase
          .from('imovel_images')
          .delete()
          .eq('id', imageId);

        if (error) throw error;

        const urlParts = image.url.split('/');
        const filePath = `${imovelId}/${urlParts[urlParts.length - 1]}`;
        await supabase.storage.from('imoveis').remove([filePath]);
      } catch (error) {
        console.error('Erro ao remover imagem:', error);
        alert('Erro ao remover imagem');
        return;
      }
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const setCoverImage = async (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_cover: img.id === imageId
    }));

    setImages(updatedImages);
    onImagesChange?.(updatedImages);

    if (imovelId && !imageId.startsWith('temp-')) {
      try {
        await supabase
          .from('imovel_images')
          .update({ is_cover: false })
          .eq('imovel_id', imovelId);

        await supabase
          .from('imovel_images')
          .update({ is_cover: true })
          .eq('id', imageId);
      } catch (error) {
        console.error('Erro ao definir capa:', error);
      }
    }
  };

  const updateLegenda = async (imageId: string, legenda: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, legenda } : img
    );

    setImages(updatedImages);
    onImagesChange?.(updatedImages);

    if (imovelId && !imageId.startsWith('temp-')) {
      await supabase
        .from('imovel_images')
        .update({ legenda })
        .eq('id', imageId);
    }
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);

    const reordered = updatedImages.map((img, index) => ({
      ...img,
      ordem: index
    }));

    setImages(reordered);
    onImagesChange?.(reordered);

    if (imovelId) {
      reordered.forEach(async (img) => {
        if (!img.id.startsWith('temp-')) {
          await supabase
            .from('imovel_images')
            .update({ ordem: img.ordem })
            .eq('id', img.id);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#C8102E] bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
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
          onChange={handleChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

        <p className="text-lg font-medium text-gray-700 mb-2">
          Arraste e solte imagens aqui
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou clique para selecionar arquivos
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
          disabled={uploading || images.length >= maxImages}
        >
          {uploading ? 'Enviando...' : 'Selecionar Imagens'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          {images.length}/{maxImages} imagens • PNG, JPG até 5MB cada
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group border rounded-lg overflow-hidden bg-gray-50"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                reorderImages(fromIndex, index);
              }}
            >
              <div className="aspect-square relative">
                {image.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader className="w-8 h-8 animate-spin text-[#C8102E]" />
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={image.legenda || `Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>

                {image.is_cover && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#C8102E] text-white text-xs font-semibold rounded">
                    CAPA
                  </div>
                )}

                {!image.is_cover && (
                  <button
                    type="button"
                    onClick={() => setCoverImage(image.id)}
                    className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
                  >
                    Definir como capa
                  </button>
                )}
              </div>

              <div className="p-2">
                <input
                  type="text"
                  placeholder="Legenda (opcional)"
                  value={image.legenda}
                  onChange={(e) => updateLegenda(image.id, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                  disabled={uploading}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
