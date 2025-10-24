import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ScrollToTop } from '../components/ScrollToTop';
import { Award, Users, Home, TrendingUp, Target, Heart } from 'lucide-react';

export function Sobre() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D25] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">A Imobiliária</h1>
          <p className="text-gray-100">
            Conheça nossa história e valores
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
              alt="Oeste Casa"
              className="rounded-2xl shadow-2xl"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Nossa História
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                A <strong className="text-gray-800">Oeste Casa Imobiliária</strong> nasceu do sonho de transformar a vida das pessoas através da realização do sonho da casa própria. Fundada em São Paulo, nossa missão sempre foi oferecer um atendimento humanizado e profissional, conectando famílias aos seus lares ideais.
              </p>
              <p>
                Com anos de experiência no mercado imobiliário, construímos uma trajetória sólida baseada em valores como transparência, compromisso e excelência. Nossa equipe é formada por profissionais altamente qualificados, prontos para oferecer as melhores soluções em compra, venda e locação de imóveis.
              </p>
              <p>
                Acreditamos que cada cliente é único e merece um atendimento personalizado. Por isso, trabalhamos com dedicação para entender suas necessidades e encontrar o imóvel que melhor se adapta ao seu estilo de vida e orçamento.
              </p>
              <p>
                Hoje, somos referência na região Oeste de São Paulo, oferecendo um portfólio diversificado de imóveis residenciais e comerciais, sempre com o compromisso de facilitar e tornar segura cada etapa do processo imobiliário.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Nossa Missão</h3>
            <p className="text-gray-600">
              Conectar pessoas aos seus lares ideais, oferecendo soluções imobiliárias completas com transparência, compromisso e excelência no atendimento.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Nossa Visão</h3>
            <p className="text-gray-600">
              Ser a imobiliária mais confiável e reconhecida da região, expandindo nosso alcance e mantendo a qualidade que nos diferencia no mercado.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Nossos Valores</h3>
            <p className="text-gray-600">
              Transparência em todas as negociações, compromisso com nossos clientes, excelência no atendimento e respeito às necessidades individuais.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D25] rounded-2xl p-12 text-white mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Por que escolher a Oeste Casa?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Experiência Comprovada</h3>
                <p className="text-gray-100">
                  Anos de atuação no mercado imobiliário, com centenas de negócios bem-sucedidos e clientes satisfeitos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Equipe Especializada</h3>
                <p className="text-gray-100">
                  Corretores capacitados e com profundo conhecimento do mercado local para melhor atendê-lo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Portfólio Diversificado</h3>
                <p className="text-gray-100">
                  Ampla variedade de imóveis residenciais e comerciais para atender todas as necessidades e orçamentos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Assessoria Completa</h3>
                <p className="text-gray-100">
                  Acompanhamento em todas as etapas do processo, desde a escolha até a assinatura do contrato.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Nossos Diferenciais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Atendimento Personalizado:</strong> Cada cliente recebe atenção individual e soluções sob medida para suas necessidades.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Transparência Total:</strong> Clareza em todas as informações e negociações, sem surpresas desagradáveis.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Tecnologia Avançada:</strong> Plataforma digital moderna para facilitar sua busca e agilizar processos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Suporte Jurídico:</strong> Assessoria legal para garantir segurança em todas as transações.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Facilidade de Pagamento:</strong> Diversas opções de negociação e financiamento para realizar seu sonho.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">
                <strong className="text-gray-800">Pós-venda Ativo:</strong> Acompanhamento mesmo após a conclusão do negócio, garantindo sua satisfação.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Pronto para encontrar seu imóvel ideal?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Entre em contato conosco e descubra como podemos ajudá-lo a realizar seus objetivos imobiliários.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '#contato'}
              className="px-8 py-4 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors text-lg"
            >
              Fale Conosco
            </button>
            <button
              onClick={() => window.location.href = '#portal'}
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors text-lg"
            >
              Ver Imóveis
            </button>
          </div>
        </div>
      </section>

      <WhatsAppButton />
      <ScrollToTop />
      <PublicFooter />
    </div>
  );
}
