import { Home, Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-8 h-8 text-[#C8102E]" />
              <span className="text-xl font-bold">Oeste Casa</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Encontre aqui o imóvel ideal para você e sua família.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#C8102E] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#C8102E] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#C8102E] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Venda</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#venda" className="hover:text-white transition-colors">Ver todos</a></li>
              <li><a href="#sobre" className="hover:text-white transition-colors">A Imobiliária</a></li>
              <li><a href="#contato-publico" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#login" className="hover:text-white transition-colors">Área do Corretor</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Locação</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#locacao" className="hover:text-white transition-colors">Ver todos</a></li>
              <li><a href="#portal" className="hover:text-white transition-colors">Página Inicial</a></li>
              <li><a href="#imoveis-lista" className="hover:text-white transition-colors">Todos os Imóveis</a></li>
              <li><a href="#login" className="hover:text-white transition-colors">Anunciar Imóvel</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Atendimento</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-[#C8102E] flex-shrink-0" />
                <span>(11) 3444-5555</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-[#C8102E] flex-shrink-0" />
                <span>contato@oestecasa.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C8102E] flex-shrink-0" />
                <span>R. Santa Teresa, 47 - Centro, Cotia - SP, 06711-170</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Oeste Casa Imobiliária | Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
