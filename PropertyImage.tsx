import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Home } from 'lucide-react';

interface PropertyImageProps {
  imovelId: string;
  className?: string;
  alt?: string;
}

export function PropertyImage({ imovelId, className = '', alt = 'Imóvel' }: PropertyImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [imovelId]);

  async function loadImage() {
    try {
      const { data, error } = await supabase
        .from('imovel_images')
        .select('url')
        .eq('imovel_id', imovelId)
        .eq('is_cover', true)
        .maybeSingle();

      if (error) throw error;

      if (data && data.url) {
        setImageUrl(data.url);
      } else {
        const { data: anyImage } = await supabase
          .from('imovel_images')
          .select('url')
          .eq('imovel_id', imovelId)
          .order('ordem', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (anyImage && anyImage.url) {
          setImageUrl(anyImage.url);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar imagem:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <Home className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}>
        <Home className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
