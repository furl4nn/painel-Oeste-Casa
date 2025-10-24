import { useState, useEffect } from 'react';
import { Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlobalSearch } from './GlobalSearch';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const menuItems = [
    { label: 'Início', href: '#inicio' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'CRM', href: '#crm' },
    { label: 'Relatórios', href: '#relatorios' },
    { label: 'Mensagens', href: '#mensagens' },
    { label: 'Corretores', href: '#corretores' },
    { label: 'Suporte', href: '#suporte' },
    { label: 'Perfil', href: '#perfil' }
  ];

  if (profile?.role === 'admin') {
    menuItems.splice(6, 0, { label: 'Admin', href: '#admin' });
  }

  return (
    <div>
      <div className="bg-[#C8102E] text-white py-2 px-6">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <span className="font-semibold text-sm md:text-base">PAINEL ADMINISTRATIVO OESTE CASA</span>
            <span className="text-xs md:text-sm hidden sm:block">Gestão completa de imóveis</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm font-semibold">{currentTime}</span>
            <span className="text-xs md:text-sm hidden md:block">{currentDate}</span>
          </div>
        </div>
      </div>

      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <img
                  src="/Imagem do WhatsApp de 2025-06-23 à(s) 10.17.24_d0c601d7.jpg"
                  alt="Oeste Casa"
                  className="h-[80px] md:h-[120px] object-contain"
                />
              </div>

              <div className="hidden lg:flex items-center gap-6">
                {menuItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-[#C8102E] font-medium transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#cadastrar-imovel"
                  className="px-4 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  Cadastrar Imóvel
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              <div className="hidden lg:block w-64">
                <GlobalSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              <NotificationDropdown />

              <div className="hidden md:flex items-center gap-2 pl-4 border-l">
                <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{profile?.full_name || 'Usuário'}</p>
                  <button
                    onClick={signOut}
                    className="text-xs text-gray-500 hover:text-[#C8102E]"
                  >
                    Sair
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-3 lg:hidden">
              <GlobalSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onClose={() => setShowSearch(false)}
                isMobile
              />
            </div>
          )}
        </div>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto animate-slide-in-right">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="w-12 h-12 bg-[#C8102E] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{profile?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-gray-600">{profile?.role || 'corretor'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#C8102E] rounded-lg font-medium transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-6 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}
