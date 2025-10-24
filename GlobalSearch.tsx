import { useState, useEffect, useRef } from 'react';
import { Search, Home, Users, MapPin, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface SearchResult {
  type: 'imovel' | 'lead';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function GlobalSearch({ value, onChange, onClose, isMobile }: GlobalSearchProps) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, user]);

  async function performSearch(searchTerm: string) {
    if (!user) return;

    setLoading(true);
    setShowResults(true);

    try {
      const searchLower = searchTerm.toLowerCase();

      const [imoveisRes, leadsRes] = await Promise.all([
        supabase
          .from('imoveis')
          .select('id, titulo, bairro, cidade, tipo, preco')
          .eq('user_id', user.id)
          .or(`titulo.ilike.%${searchTerm}%,endereco.ilike.%${searchTerm}%,bairro.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`)
          .limit(5),
        supabase
          .from('leads')
          .select('id, nome, email, telefone, status')
          .eq('corretor_id', user.id)
          .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`)
          .limit(5)
      ]);

      const searchResults: SearchResult[] = [];

      if (imoveisRes.data) {
        searchResults.push(
          ...imoveisRes.data.map((imovel) => ({
            type: 'imovel' as const,
            id: imovel.id,
            title: imovel.titulo,
            subtitle: `${imovel.bairro}, ${imovel.cidade} • R$ ${Number(imovel.preco).toLocaleString('pt-BR')}`,
            link: `#perfil`
          }))
        );
      }

      if (leadsRes.data) {
        searchResults.push(
          ...leadsRes.data.map((lead) => ({
            type: 'lead' as const,
            id: lead.id,
            title: lead.nome,
            subtitle: `${lead.email || lead.telefone || ''} • ${lead.status}`,
            link: `#crm`
          }))
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectResult(link: string) {
    window.location.href = link;
    setShowResults(false);
    onChange('');
    if (onClose) onClose();
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar imóveis, leads..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowResults(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Buscando...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1">Tente buscar por título, cidade, nome ou email</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelectResult(result.link)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    result.type === 'imovel' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {result.type === 'imovel' ? (
                      <Home className={`w-4 h-4 ${result.type === 'imovel' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <Users className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{result.title}</p>
                    <p className="text-xs text-gray-600 truncate">{result.subtitle}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {result.type === 'imovel' ? 'Imóvel' : 'Lead'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
