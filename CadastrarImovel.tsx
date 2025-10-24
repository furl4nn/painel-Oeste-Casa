import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase, logActivity } from '../lib/supabase';
import { Save, X } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { MultipleImageUpload } from '../components/MultipleImageUpload';
import { useToast } from '../components/ToastContainer';

export function CadastrarImovel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imovelId, setImovelId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagemDestaque, setImagemDestaque] = useState<string>('');
  const [imagemDestaqueFile, setImagemDestaqueFile] = useState<File | null>(null);
  const [galeria, setGaleria] = useState<File[]>([]);
  const [cidades, setCidades] = useState<{id: string, nome: string}[]>([]);
  const [bairros, setBairros] = useState<{id: string, nome: string, cidade_id: string}[]>([]);
  const [bairrosFiltrados, setBairrosFiltrados] = useState<{id: string, nome: string}[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'Casa',
    tipo_permuta: '',
    finalidade: 'Venda',
    titulo: '',
    descricao: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    preco: '',
    condominio: '',
    iptu: '',
    area_total: '',
    area_util: '',
    quartos: '',
    suites: '',
    banheiros: '',
    vagas: '',
    mobiliado: false,
    aceita_permuta: false,
    aceita_financiamento: false,
    ar_condicionado: false,
    armarios: false,
    piscina: false,
    churrasqueira: false,
    academia: false,
    area_servico: false,
    despensa: false,
    escritorio: false,
    sala_jantar: false,
    sala_estar: false,
    sala_tv: false,
    jardim: false,
    quintal: false,
    varanda: false,
    sacada: false,
    elevador: false,
    portaria_24h: false,
    salao_festas: false,
    playground: false,
    quadra_esportes: false,
    pet_friendly: false,
    observacoes: '',
    pontos_fortes: ''
  });

  useEffect(() => {
    loadCidades();
    loadBairros();
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const editId = params.get('edit');

    if (editId && user) {
      setIsEditMode(true);
      setImovelId(editId);
      loadImovelData(editId);
    }
  }, [user]);

  useEffect(() => {
    if (formData.cidade) {
      const cidadeSelecionada = cidades.find(c => c.nome === formData.cidade);
      if (cidadeSelecionada) {
        const bairrosDaCidade = bairros.filter(b => b.cidade_id === cidadeSelecionada.id);
        setBairrosFiltrados(bairrosDaCidade);
      }
    } else {
      setBairrosFiltrados([]);
    }
  }, [formData.cidade, cidades, bairros]);

  async function loadCidades() {
    try {
      const { data, error } = await supabase
        .from('cidades')
        .select('id, nome')
        .order('nome');
      if (error) throw error;
      if (data) setCidades(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  }

  async function loadBairros() {
    try {
      const { data, error } = await supabase
        .from('bairros')
        .select('id, nome, cidade_id')
        .order('nome');
      if (error) throw error;
      if (data) setBairros(data);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
    }
  }

  async function loadImovelData(id: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;

      const { data: imagemDestaqueData } = await supabase
        .from('imovel_images')
        .select('url')
        .eq('imovel_id', id)
        .eq('is_cover', true)
        .maybeSingle();

      if (imagemDestaqueData?.url) {
        setImagemDestaque(imagemDestaqueData.url);
      }

      if (data) {
        const caracteristicas = data.caracteristicas as any || {};
        setFormData({
          tipo: data.tipo,
          tipo_permuta: data.tipo_permuta || '',
          finalidade: data.finalidade,
          titulo: data.titulo,
          descricao: data.descricao || '',
          endereco: data.endereco,
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep || '',
          preco: data.preco,
          condominio: data.condominio || '',
          iptu: data.iptu || '',
          area_total: data.area_total || '',
          area_util: data.area_util || '',
          quartos: data.quartos?.toString() || '',
          suites: data.suites?.toString() || '',
          banheiros: data.banheiros?.toString() || '',
          vagas: data.vagas?.toString() || '',
          mobiliado: data.mobiliado || false,
          aceita_permuta: data.aceita_permuta || false,
          aceita_financiamento: data.aceita_financiamento || false,
          ar_condicionado: caracteristicas.ar_condicionado || false,
          armarios: caracteristicas.armarios || false,
          piscina: caracteristicas.piscina || false,
          churrasqueira: caracteristicas.churrasqueira || false,
          academia: caracteristicas.academia || false,
          area_servico: caracteristicas.area_servico || false,
          despensa: caracteristicas.despensa || false,
          escritorio: caracteristicas.escritorio || false,
          sala_jantar: caracteristicas.sala_jantar || false,
          sala_estar: caracteristicas.sala_estar || false,
          sala_tv: caracteristicas.sala_tv || false,
          jardim: caracteristicas.jardim || false,
          quintal: caracteristicas.quintal || false,
          varanda: caracteristicas.varanda || false,
          sacada: caracteristicas.sacada || false,
          elevador: caracteristicas.elevador || false,
          portaria_24h: caracteristicas.portaria_24h || false,
          salao_festas: caracteristicas.salao_festas || false,
          playground: caracteristicas.playground || false,
          quadra_esportes: caracteristicas.quadra_esportes || false,
          pet_friendly: caracteristicas.pet_friendly || false,
          observacoes: data.observacoes || '',
          pontos_fortes: data.pontos_fortes || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar imóvel:', error);
      showToast('Erro ao carregar dados do imóvel', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagemDestaqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagemDestaqueFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemDestaque(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImagemDestaque = async (imovelId: string) => {
    if (!imagemDestaqueFile) return null;

    try {
      const fileExt = imagemDestaqueFile.name.split('.').pop();
      const fileName = `${imovelId}/destaque-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(fileName, imagemDestaqueFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imoveis')
        .getPublicUrl(fileName);

      await supabase
        .from('imovel_images')
        .insert([{
          imovel_id: imovelId,
          url: publicUrl,
          ordem: -1,
          legenda: 'Imagem Destaque',
          is_cover: true
        }]);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem destaque:', error);
      return null;
    }
  };

  const uploadGaleriaImagens = async (imovelId: string) => {
    if (galeria.length === 0) return;

    try {
      for (let i = 0; i < galeria.length; i++) {
        const file = galeria[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${imovelId}/galeria-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('imoveis')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('imoveis')
          .getPublicUrl(fileName);

        await supabase
          .from('imovel_images')
          .insert([{
            imovel_id: imovelId,
            url: publicUrl,
            ordem: i,
            legenda: `Imagem ${i + 1}`,
            is_cover: false
          }]);
      }
    } catch (error) {
      console.error('Erro ao fazer upload da galeria:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    try {
      const imovelData = {
        user_id: user.id,
        tipo: formData.tipo,
        tipo_permuta: formData.tipo_permuta || null,
        finalidade: formData.finalidade,
        titulo: formData.titulo,
        descricao: formData.descricao,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        preco: formData.preco,
        condominio: formData.condominio,
        iptu: formData.iptu,
        area_total: formData.area_total,
        area_util: formData.area_util,
        quartos: parseInt(formData.quartos) || 0,
        suites: parseInt(formData.suites) || 0,
        banheiros: parseInt(formData.banheiros) || 0,
        vagas: parseInt(formData.vagas) || 0,
        mobiliado: formData.mobiliado,
        aceita_permuta: formData.aceita_permuta,
        aceita_financiamento: formData.aceita_financiamento,
        caracteristicas: {
          ar_condicionado: formData.ar_condicionado,
          armarios: formData.armarios,
          piscina: formData.piscina,
          churrasqueira: formData.churrasqueira,
          academia: formData.academia,
          area_servico: formData.area_servico,
          despensa: formData.despensa,
          escritorio: formData.escritorio,
          sala_jantar: formData.sala_jantar,
          sala_estar: formData.sala_estar,
          sala_tv: formData.sala_tv,
          jardim: formData.jardim,
          quintal: formData.quintal,
          varanda: formData.varanda,
          sacada: formData.sacada,
          elevador: formData.elevador,
          portaria_24h: formData.portaria_24h,
          salao_festas: formData.salao_festas,
          playground: formData.playground,
          quadra_esportes: formData.quadra_esportes,
          pet_friendly: formData.pet_friendly
        },
        observacoes: formData.observacoes,
        pontos_fortes: formData.pontos_fortes
      };

      if (isEditMode && imovelId) {
        const { error } = await supabase
          .from('imoveis')
          .update(imovelData)
          .eq('id', imovelId);

        if (error) throw error;

        await logActivity('editar', 'imovel', imovelId, { titulo: formData.titulo });

        if (imagemDestaqueFile) {
          await uploadImagemDestaque(imovelId);
        }

        if (galeria.length > 0) {
          await uploadGaleriaImagens(imovelId);
        }

        showToast('Imóvel atualizado com sucesso!', 'success');
      } else {
        const { data, error } = await supabase
          .from('imoveis')
          .insert([imovelData])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          await logActivity('criar', 'imovel', data.id, { titulo: formData.titulo });

          if (imagemDestaqueFile) {
            await uploadImagemDestaque(data.id);
          }

          if (galeria.length > 0) {
            await uploadGaleriaImagens(data.id);
          }

          setImovelId(data.id);
        }

        showToast('Imóvel cadastrado com sucesso!', 'success');
      }

      window.location.href = '#perfil';
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      showToast('Erro ao salvar imóvel. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {isEditMode ? 'Editar Imóvel' : 'Cadastrar Imóvel'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Imagem Destaque</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Adicione uma imagem principal que será exibida como destaque do imóvel
                </p>

                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagemDestaqueChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    />
                  </div>

                  {imagemDestaque && (
                    <div className="relative">
                      <img
                        src={imagemDestaque}
                        alt="Preview Destaque"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-[#C8102E]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagemDestaque('');
                          setImagemDestaqueFile(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações Básicas</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Imóvel</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  >
                    <option value="Casa">Casa</option>
                    <option value="Casa de Praia">Casa de Praia</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Chácara">Chácara</option>
                    <option value="Galpão / Barracão">Galpão / Barracão</option>
                    <option value="Kitnet">Kitnet</option>
                    <option value="Loja">Loja</option>
                    <option value="Sala">Sala</option>
                    <option value="Sobrado">Sobrado</option>
                    <option value="Terreno">Terreno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Finalidade</label>
                  <select
                    name="finalidade"
                    value={formData.finalidade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  >
                    <option value="Venda">Venda</option>
                    <option value="Locação">Locação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título do Anúncio</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Localização</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <select
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  >
                    <option value="">Selecione uma cidade</option>
                    {cidades.map(cidade => (
                      <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                  <select
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                    disabled={!formData.cidade}
                  >
                    <option value="">Selecione um bairro</option>
                    {bairrosFiltrados.map(bairro => (
                      <option key={bairro.id} value={bairro.nome}>{bairro.nome}</option>
                    ))}
                  </select>
                  {!formData.cidade && (
                    <p className="text-xs text-gray-500 mt-1">Selecione uma cidade primeiro</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Valores</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor de {formData.finalidade}</label>
                  <input
                    type="text"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condomínio</label>
                  <input
                    type="text"
                    name="condominio"
                    value={formData.condominio}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IPTU</label>
                  <input
                    type="text"
                    name="iptu"
                    value={formData.iptu}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Medidas</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área Total (m²)</label>
                  <input
                    type="text"
                    name="area_total"
                    value={formData.area_total}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área Útil (m²)</label>
                  <input
                    type="text"
                    name="area_util"
                    value={formData.area_util}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quartos</label>
                  <input
                    type="number"
                    name="quartos"
                    value={formData.quartos}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suítes</label>
                  <input
                    type="number"
                    name="suites"
                    value={formData.suites}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banheiros</label>
                  <input
                    type="number"
                    name="banheiros"
                    value={formData.banheiros}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vagas</label>
                  <input
                    type="number"
                    name="vagas"
                    value={formData.vagas}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Características</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="ar_condicionado"
                    checked={formData.ar_condicionado}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Ar Condicionado</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="armarios"
                    checked={formData.armarios}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Armários</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="piscina"
                    checked={formData.piscina}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Piscina</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="churrasqueira"
                    checked={formData.churrasqueira}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Churrasqueira</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="academia"
                    checked={formData.academia}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Academia</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="area_servico"
                    checked={formData.area_servico}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Área de Serviço</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="despensa"
                    checked={formData.despensa}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Despensa</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="escritorio"
                    checked={formData.escritorio}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Escritório</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sala_jantar"
                    checked={formData.sala_jantar}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Sala de Jantar</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sala_estar"
                    checked={formData.sala_estar}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Sala de Estar</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sala_tv"
                    checked={formData.sala_tv}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Sala de TV</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="jardim"
                    checked={formData.jardim}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Jardim</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="quintal"
                    checked={formData.quintal}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Quintal</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="varanda"
                    checked={formData.varanda}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Varanda</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="sacada"
                    checked={formData.sacada}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Sacada</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="elevador"
                    checked={formData.elevador}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Elevador</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="portaria_24h"
                    checked={formData.portaria_24h}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Portaria 24h</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="salao_festas"
                    checked={formData.salao_festas}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Salão de Festas</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="playground"
                    checked={formData.playground}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Playground</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="quadra_esportes"
                    checked={formData.quadra_esportes}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Quadra de Esportes</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="pet_friendly"
                    checked={formData.pet_friendly}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Pet Friendly</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Características Personalizadas</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="mobiliado"
                    checked={formData.mobiliado}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Mobiliado</span>
                </label>

                <div className="md:col-span-3">
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      name="aceita_permuta"
                      checked={formData.aceita_permuta}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                    />
                    <span className="text-sm text-gray-700 font-semibold">Aceita Permuta</span>
                  </label>
                  {formData.aceita_permuta && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Imóvel Desejado na Permuta
                      </label>
                      <select
                        name="tipo_permuta"
                        value={formData.tipo_permuta}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="Casa">Casa</option>
                        <option value="Casa de Praia">Casa de Praia</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Chácara">Chácara</option>
                        <option value="Galpão / Barracão">Galpão / Barracão</option>
                        <option value="Kitnet">Kitnet</option>
                        <option value="Loja">Loja</option>
                        <option value="Sala">Sala</option>
                        <option value="Sobrado">Sobrado</option>
                        <option value="Terreno">Terreno</option>
                      </select>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="aceita_financiamento"
                    checked={formData.aceita_financiamento}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span className="text-sm text-gray-700">Aceita Financiamento</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Descrição</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do Imóvel</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                    placeholder="Descreva o imóvel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pontos Fortes</label>
                  <textarea
                    name="pontos_fortes"
                    value={formData.pontos_fortes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                    placeholder="Destaque os pontos fortes do imóvel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Galeria de Imagens</h2>
              <p className="text-sm text-gray-600 mb-4">
                Adicione múltiplas fotos do imóvel (além da imagem destaque)
              </p>
              <MultipleImageUpload onImagesChange={setGaleria} />
            </div>

            {imovelId && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Mais Imagens</h2>
                <ImageUpload imovelId={imovelId} />
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.location.href = '#dashboard'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Salvando...' : 'Salvar Imóvel'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
