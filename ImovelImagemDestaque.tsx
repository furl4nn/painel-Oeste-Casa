import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Home } from 'lucide-react';

interface ImovelImagemDestaqueProps {
  imovelId: string;
  className?: string;
}

export function ImovelImagemDestaque({ imovelId, className = "w-20 h-20" }: ImovelImagemDestaqueProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImagemDestaque();
  }, [imovelId]);

  async function loadImagemDestaque() {
    try {
      const { data, error } = await supabase
        .from('imovel_images')
        .select('url')
        .eq('imovel_id', imovelId)
        .eq('is_cover', true)
        .maybeSingle();

      if (error) throw error;

      if (data?.url) {
        setImageUrl(data.url);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem destaque:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse`}>
        <Home className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Home className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden flex-shrink-0`}>
      <img
        src={imageUrl}
        alt="Imagem destaque"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
