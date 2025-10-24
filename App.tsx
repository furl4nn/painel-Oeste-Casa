import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import { Inicio } from './pages/Inicio';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { CadastrarImovel } from './pages/CadastrarImovel';
import { Suporte } from './pages/Suporte';
import { CRM } from './pages/CRM';
import { Relatorios } from './pages/Relatorios';
import { Mensagens } from './pages/Mensagens';
import { Corretores } from './pages/Corretores';
import { Perfil } from './pages/Perfil';
import { ResetPassword } from './pages/ResetPassword';
import { ImovelPublicoNovo } from './pages/ImovelPublicoNovo';
import { Notificacoes } from './pages/Notificacoes';
import { Agenda } from './pages/Agenda';
import { PortalHome } from './pages/PortalHome';
import { ImoveisListaMelhorada } from './pages/ImoveisListaMelhorada';
import { Venda } from './pages/Venda';
import { Locacao } from './pages/Locacao';
import { Sobre } from './pages/Sobre';
import { ContatoPublico } from './pages/ContatoPublico';
import { Admin } from './pages/Admin';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('portal');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  const publicPages = ['', 'portal', 'imoveis-lista', 'venda', 'locacao', 'sobre', 'contato-publico'];
  const isPublicPage = publicPages.includes(currentPage.split('?')[0]) || currentPage.startsWith('imovel-publico');

  if (currentPage.startsWith('imovel-publico')) {
    return <ImovelPublicoNovo />;
  }

  if (currentPage === '' || currentPage === 'portal') {
    return <PortalHome />;
  }

  if (currentPage.startsWith('imoveis-lista')) {
    return <ImoveisListaMelhorada />;
  }

  if (currentPage === 'venda') {
    return <Venda />;
  }

  if (currentPage === 'locacao') {
    return <Locacao />;
  }

  if (currentPage === 'sobre') {
    return <Sobre />;
  }

  if (currentPage === 'contato-publico') {
    return <ContatoPublico />;
  }

  if (!user && !isPublicPage && currentPage !== 'reset-password') {
    return <Login />;
  }

  if (currentPage === 'reset-password') {
    return <ResetPassword />;
  }

  switch (currentPage) {
    case 'inicio':
      return <Inicio />;
    case 'dashboard':
      return <Dashboard />;
    case 'suporte':
      return <Suporte />;
    case 'crm':
      return <CRM />;
    case 'relatorios':
      return <Relatorios />;
    case 'mensagens':
      return <Mensagens />;
    case 'cadastrar-imovel':
      return <CadastrarImovel />;
    case 'corretores':
      return <Corretores />;
    case 'perfil':
      return <Perfil />;
    case 'notificacoes':
      return <Notificacoes />;
    case 'agenda':
      return <Agenda />;
    case 'admin':
      return <Admin />;
    default:
      return <Inicio />;
  }
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
