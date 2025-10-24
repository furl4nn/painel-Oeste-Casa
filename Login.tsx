import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowLeft, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [creci, setCreci] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}#reset-password`,
        });
        if (error) throw error;
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccess('');
        }, 3000);
      } else if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter no mínimo 6 caracteres');
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'corretor'
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              creci,
              whatsapp
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;
        }

        setSuccess('Conta criada com sucesso! Faça login para acessar.');
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
          setCreci('');
          setWhatsapp('');
        }, 2000);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#C8102E] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/Imagem do WhatsApp de 2025-06-23 à(s) 10.17.24_d0c601d7.jpg"
              alt="Oeste Casa"
              className="h-[180px] object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Oeste Casa
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {isForgotPassword ? 'Recuperar senha' : isSignUp ? 'Criar sua conta' : 'Acesse seu painel'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(isForgotPassword || isSignUp) && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsSignUp(false);
                  setError('');
                  setSuccess('');
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C8102E] mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome e Sobrenome
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° do CRECI
                </label>
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp/Celular
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                  minLength={6}
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8102E] text-white py-3 rounded-lg font-semibold hover:bg-[#A00D25] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Carregando...' : isForgotPassword ? 'Enviar Email' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {!isForgotPassword && !isSignUp && (
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <button
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-gray-600 hover:text-[#C8102E] hover:underline font-medium"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Ainda não tem uma conta?</p>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-[#C8102E] hover:text-[#A00D25] hover:underline font-semibold"
                >
                  Criar conta de corretor
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white text-sm mt-6 font-medium">
          Painel de Gerenciamento de Imóveis
        </p>
      </div>
    </div>
  );
}
