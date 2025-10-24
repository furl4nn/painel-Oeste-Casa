# Documentação do Banco de Dados - Sistema Imobiliário Oeste Casa

## Modelo Entidade-Relacionamento (MER)

### Entidades Principais

#### 1. **auth.users** (Supabase Auth)
Tabela nativa do Supabase para autenticação
- `id` (UUID, PK)
- `email` (text)
- `encrypted_password` (text)
- `created_at` (timestamptz)

#### 2. **profiles**
Perfis de usuários com informações adicionais
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id, UNIQUE)
- `full_name` (text, NOT NULL)
- `role` (user_role ENUM: admin, corretor, suporte)
- `phone` (text)
- `avatar_url` (text)
- `active` (boolean, DEFAULT true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### 3. **imoveis**
Cadastro completo de imóveis
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `corretor_id` (UUID, FK → corretores.id) [legado]
- `codigo_referencia` (text, UNIQUE, auto-generated)
- `titulo` (text, NOT NULL)
- `tipo` (text: Casa, Apartamento, Terreno, Comercial, Rural)
- `finalidade` (text: Venda, Locação)
- `status` (text: ativo, vendido, alugado, inativo)
- **Valores:**
  - `preco` (numeric)
  - `valor_aluguel` (text)
  - `condominio` (text)
  - `iptu` (text)
- **Localização:**
  - `endereco` (text)
  - `numero` (text)
  - `complemento` (text)
  - `bairro` (text)
  - `cidade` (text)
  - `estado` (text)
  - `cep` (text)
  - `latitude` (numeric 10,8)
  - `longitude` (numeric 11,8)
- **Medidas:**
  - `area` (numeric) [legado]
  - `area_total` (text)
  - `area_util` (text)
  - `quartos` (integer)
  - `suites` (integer)
  - `banheiros` (integer)
  - `vagas` (integer)
- **Características:**
  - `caracteristicas` (jsonb) - objeto com características como ar_condicionado, piscina, etc
  - `mobiliado` (boolean)
  - `aceita_permuta` (boolean)
  - `aceita_financiamento` (boolean)
- **Descrição:**
  - `descricao` (text)
  - `pontos_fortes` (text)
  - `observacoes` (text)
- **Mídia:**
  - `video_url` (text)
  - `tour_virtual_url` (text)
- **Controle:**
  - `destaque` (boolean)
  - `publicado` (boolean)
  - `views` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

#### 4. **imovel_images**
Imagens dos imóveis (one-to-many)
- `id` (UUID, PK)
- `imovel_id` (UUID, FK → imoveis.id)
- `url` (text, NOT NULL)
- `ordem` (integer, DEFAULT 0)
- `legenda` (text)
- `is_cover` (boolean, DEFAULT false)
- `created_at` (timestamptz)

#### 5. **tags**
Tags para categorização de imóveis
- `id` (UUID, PK)
- `nome` (text, UNIQUE, NOT NULL)
- `slug` (text, UNIQUE, NOT NULL)
- `cor` (text, DEFAULT '#3B82F6')
- `created_at` (timestamptz)

#### 6. **imovel_tags**
Relacionamento many-to-many entre imóveis e tags
- `id` (UUID, PK)
- `imovel_id` (UUID, FK → imoveis.id)
- `tag_id` (UUID, FK → tags.id)
- `created_at` (timestamptz)
- UNIQUE(imovel_id, tag_id)

#### 7. **leads**
Gerenciamento de leads do CRM
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `corretor_id` (UUID, FK → corretores.id) [legado]
- **Informações Básicas:**
  - `nome` (text, NOT NULL)
  - `email` (text)
  - `telefone` (text)
  - `whatsapp` (text)
  - `preferencia_contato` (text: email, telefone, whatsapp)
- **Origem e Classificação:**
  - `origem` (text: site, WhatsApp, Instagram, indicação, etc)
  - `status` (text: Novo, Em Atendimento, Qualificado, Convertido, Perdido)
  - `temperatura` (text: quente, morno, frio)
  - `score` (integer, DEFAULT 0)
- **Interesse:**
  - `imovel_id` (UUID, FK → imoveis.id, nullable)
  - `tipo_imovel_interesse` (text)
  - `bairros_interesse` (text[])
  - `orcamento_min` (numeric)
  - `orcamento_max` (numeric)
- **Gestão:**
  - `data_contato` (timestamptz)
  - `ultimo_contato` (timestamptz)
  - `proxima_acao` (timestamptz)
  - `observacoes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

#### 8. **lead_historico**
Histórico de todas as interações com leads
- `id` (UUID, PK)
- `lead_id` (UUID, FK → leads.id)
- `user_id` (UUID, FK → auth.users.id)
- `tipo_interacao` (text: telefone, email, whatsapp, visita, proposta, etc)
- `descricao` (text)
- `created_at` (timestamptz)

#### 9. **agendamentos**
Agendamento de visitas aos imóveis
- `id` (UUID, PK)
- `lead_id` (UUID, FK → leads.id)
- `imovel_id` (UUID, FK → imoveis.id)
- `user_id` (UUID, FK → auth.users.id)
- `data_hora` (timestamptz, NOT NULL)
- `status` (text: agendado, realizado, cancelado, remarcado)
- `observacoes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### 10. **notifications**
Sistema de notificações internas
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `titulo` (text, NOT NULL)
- `mensagem` (text)
- `tipo` (text: info, success, warning, error)
- `lida` (boolean, DEFAULT false)
- `link` (text)
- `created_at` (timestamptz)

#### 11. **activity_logs**
Auditoria completa de ações no sistema
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users.id)
- `acao` (text: criar, editar, deletar, visualizar, etc)
- `entidade` (text: imovel, lead, user, etc)
- `entidade_id` (text)
- `detalhes` (jsonb) - informações adicionais da ação
- `ip` (text)
- `created_at` (timestamptz)

---

## Relacionamentos

```
auth.users
  ├─ 1:1  → profiles
  ├─ 1:N  → imoveis
  ├─ 1:N  → leads
  ├─ 1:N  → agendamentos
  ├─ 1:N  → notifications
  ├─ 1:N  → activity_logs
  └─ 1:N  → lead_historico

imoveis
  ├─ 1:N  → imovel_images
  ├─ N:M  → tags (através de imovel_tags)
  ├─ 1:N  → agendamentos
  └─ 1:N  → leads (interesse)

leads
  ├─ 1:N  → lead_historico
  ├─ 1:N  → agendamentos
  └─ N:1  → imoveis (interesse)

tags
  └─ N:M  → imoveis (através de imovel_tags)
```

---

## Índices Criados (para Performance)

### Tabela: profiles
- `idx_profiles_user_id` (user_id)
- `idx_profiles_role` (role)

### Tabela: imoveis
- `idx_imoveis_user_id` (user_id)
- `idx_imoveis_tipo` (tipo)
- `idx_imoveis_finalidade` (finalidade)
- `idx_imoveis_cidade` (cidade)
- `idx_imoveis_bairro` (bairro)
- `idx_imoveis_status` (status)
- `idx_imoveis_destaque` (destaque)
- `idx_imoveis_publicado` (publicado)
- `idx_imoveis_codigo_referencia` (codigo_referencia)
- `idx_imoveis_preco` (preco)
- `idx_imoveis_quartos` (quartos)

### Tabela: imovel_images
- `idx_imovel_images_imovel_id` (imovel_id)
- `idx_imovel_images_ordem` (ordem)

### Tabela: tags
- `idx_tags_slug` (slug)

### Tabela: imovel_tags
- `idx_imovel_tags_imovel_id` (imovel_id)
- `idx_imovel_tags_tag_id` (tag_id)

### Tabela: leads
- `idx_leads_user_id` (user_id)
- `idx_leads_corretor_id` (corretor_id)
- `idx_leads_status` (status)
- `idx_leads_data_contato` (data_contato)
- `idx_leads_imovel_id` (imovel_id)
- `idx_leads_temperatura` (temperatura)
- `idx_leads_score` (score)
- `idx_leads_ultimo_contato` (ultimo_contato)
- `idx_leads_proxima_acao` (proxima_acao)
- `idx_leads_orcamento` (orcamento_min, orcamento_max)

### Tabela: lead_historico
- `idx_lead_historico_lead_id` (lead_id)

### Tabela: agendamentos
- `idx_agendamentos_lead_id` (lead_id)
- `idx_agendamentos_data_hora` (data_hora)

### Tabela: activity_logs
- `idx_activity_logs_user_id` (user_id)
- `idx_activity_logs_entidade` (entidade, entidade_id)

### Tabela: notifications
- `idx_notifications_user_id` (user_id)
- `idx_notifications_lida` (lida)

---

## Segurança (Row Level Security - RLS)

Todas as tabelas possuem RLS habilitado com políticas baseadas em:

1. **Autenticação**: Usuários precisam estar autenticados
2. **Propriedade**: Usuários só acessam seus próprios dados
3. **Roles**: Admins têm acesso total
4. **Público**: API pública pode visualizar imóveis publicados

### Roles de Usuário (ENUM user_role)
- `admin`: Acesso total ao sistema
- `corretor`: Acesso aos próprios imóveis e leads
- `suporte`: Acesso de visualização e suporte

---

## Triggers e Funções

### 1. handle_new_user()
Cria automaticamente um perfil quando um novo usuário é criado

### 2. update_updated_at_column()
Atualiza automaticamente o campo updated_at

### 3. generate_codigo_referencia()
Gera código de referência único para imóveis (formato: IMO000001)

---

## Migrations Aplicadas

1. `update_imoveis_schema` - Campos adicionais na tabela imoveis
2. `update_leads_table` - Novos campos para leads
3. `create_complete_system_schema` - Estrutura completa do sistema
4. `enhance_imoveis_table` - Melhorias e novos campos em imóveis
5. `enhance_leads_table` - Expansão da tabela de leads

---

## Próximas Etapas de Implementação

1. ✅ Schema do banco de dados
2. ⏳ Sistema de upload de imagens
3. ⏳ API pública para WordPress/JetEngine
4. ⏳ Dashboard analítico com gráficos
5. ⏳ Funil visual de CRM com drag-and-drop
6. ⏳ Sistema de notificações em tempo real
7. ⏳ Integração com Google Maps
8. ⏳ Sistema de agendamento de visitas
9. ⏳ Exportação de dados (Excel, CSV)
10. ⏳ Histórico de alterações

---

## Observações Técnicas

- Todas as datas/horas usam `timestamptz` (timezone aware)
- IDs são UUID v4 para melhor segurança
- Campos monetários usam `numeric` ou `text` (para formatação personalizada)
- Arrays PostgreSQL para campos multi-valor
- JSONB para dados estruturados flexíveis
- Soft deletes usando CASCADE do Supabase
