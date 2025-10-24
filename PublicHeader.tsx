import { Home, Phone, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white text-gray-800 shadow-sm">
      <div className="bg-[#C8102E] py-1 text-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+551134445555" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="w-4 h-4" />
              <span>(11) 3444-5555</span>
            </a>
            <a href="mailto:contato@oestecasa.com.br" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Mail className="w-4 h-4" />
              <span>contato@oestecasa.com.br</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '#login'}
              className="px-4 py-1 border border-white rounded hover:bg-white hover:text-[#C8102E] transition-colors text-sm"
            >
              Acessar
            </button>
            <button
              onClick={() => window.location.href = '#login'}
              className="px-4 py-1 bg-white text-[#C8102E] rounded hover:bg-gray-100 transition-colors text-sm font-semibold"
            >
              Entrar em Contato
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#portal" className="flex items-center gap-2">
            <img
              src="/Imagem do WhatsApp de 2025-06-23 à(s) 10.17.24_d0c601d7.jpg"
              alt="Oeste Casa"
              className="h-16 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/oeste-casa-logo.svg";
              }}
            />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#venda" className="hover:text-[#C8102E] transition-colors font-medium">
              Venda
            </a>
            <a href="#locacao" className="hover:text-[#C8102E] transition-colors font-medium">
              Locação
            </a>
            <a href="#sobre" className="hover:text-[#C8102E] transition-colors font-medium">
              A Imobiliária
            </a>
            <a href="#contato-publico" className="hover:text-[#C8102E] transition-colors font-medium">
              Contato
            </a>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-gray-800 rounded transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-gray-200 pt-4">
            <a href="#venda" className="hover:text-[#C8102E] transition-colors font-medium">
              Venda
            </a>
            <a href="#locacao" className="hover:text-[#C8102E] transition-colors font-medium">
              Locação
            </a>
            <a href="#sobre" className="hover:text-[#C8102E] transition-colors font-medium">
              A Imobiliária
            </a>
            <a href="#contato-publico" className="hover:text-[#C8102E] transition-colors font-medium">
              Contato
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
