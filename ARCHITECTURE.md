# Arquitetura do Sistema - Oeste Casa Imobiliário

## Visão Geral

Sistema completo de gestão imobiliária com CRM integrado, desenvolvido com arquitetura moderna e escalável.

## Stack Tecnológico

### Frontend
- **Framework**: React 18 + TypeScript
- **Estilização**: TailwindCSS
- **Ícones**: Lucide React
- **Build Tool**: Vite
- **Estado Global**: React Context API
- **Rotas**: Hash-based routing (sem React Router para simplicidade)

### Backend / BaaS
- **Supabase**
  - PostgreSQL Database
  - Auth (JWT)
  - Storage (para imagens)
  - Row Level Security (RLS)
  - Real-time subscriptions

### Segurança
- JWT (JSON Web Tokens) para autenticação
- Row Level Security (RLS) no PostgreSQL
- Políticas baseadas em roles (admin, corretor, suporte)
- Validação de dados no cliente e servidor
- Rate limiting na API pública

---

## Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    APRESENTAÇÃO                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React Components                                │   │
│  │  - Pages (Dashboard, CRM, Imóveis)              │   │
│  │  - Components (Navbar, Card, Charts)            │   │
│  │  - Hooks personalizados                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 LÓGICA DE NEGÓCIOS                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Context API                                     │   │
│  │  - AuthContext (autenticação)                   │   │
│  │  - NotificationContext (notificações)           │   │
│  │  - Helpers e Utilities                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    ACESSO A DADOS                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Supabase Client                                 │   │
│  │  - Queries (SELECT, INSERT, UPDATE, DELETE)     │   │
│  │  - Auth methods                                  │   │
│  │  - Storage methods                               │   │
│  │  - Real-time subscriptions                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Supabase)                           │   │
│  │  - Tables com RLS                                │   │
│  │  - Functions e Triggers                          │   │
│  │  - Indexes para performance                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
project/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Navbar.tsx
│   │   ├── Card.tsx
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── FunnelChart.tsx
│   │   └── ...
│   ├── context/            # Context API
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx (futuro)
│   ├── hooks/              # Custom hooks (futuro)
│   │   ├── usePermissions.ts
│   │   ├── useNotifications.ts
│   │   └── useFilters.ts
│   ├── lib/                # Bibliotecas e configurações
│   │   ├── supabase.ts     # Cliente Supabase + tipos
│   │   └── utils.ts        # Funções utilitárias
│   ├── pages/              # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CRM.tsx
│   │   ├── CadastrarImovel.tsx
│   │   ├── Inicio.tsx
│   │   ├── Suporte.tsx
│   │   ├── Relatorios.tsx
│   │   └── Mensagens.tsx
│   ├── App.tsx             # Componente raiz com roteamento
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── supabase/
│   └── migrations/         # Migrations do banco
├── public/                 # Arquivos estáticos
├── DATABASE_SCHEMA.md      # Documentação do banco
├── API_DOCUMENTATION.md    # Documentação da API
├── ARCHITECTURE.md         # Este arquivo
└── package.json
```

---

## Fluxo de Dados

### Fluxo de Autenticação
```
1. Usuário entra credenciais
2. AuthContext.signIn() é chamado
3. Supabase Auth verifica credenciais
4. JWT token é retornado
5. Token armazenado no localStorage
6. Profile do usuário é carregado
7. User é redirecionado para Dashboard
```

### Fluxo de CRUD (Exemplo: Criar Imóvel)
```
1. Usuário preenche formulário
2. handleSubmit() valida dados
3. supabase.from('imoveis').insert() é chamado
4. RLS verifica permissões (user_id)
5. Trigger gera codigo_referencia
6. Imóvel é inserido no banco
7. logActivity() registra ação
8. createNotification() notifica admins
9. UI é atualizada com novo imóvel
10. Usuário é redirecionado
```

---

## Segurança - Row Level Security (RLS)

### Princípios
1. **Todos os dados pertencem a um usuário**
2. **Usuários só acessam seus próprios dados**
3. **Admins têm acesso total**
4. **API pública só vê dados publicados**

### Exemplo de Política RLS
```sql
-- Usuários podem ver seus próprios imóveis
CREATE POLICY "Users can view own imoveis"
ON imoveis FOR SELECT TO authenticated
USING (auth.uid() = user_id OR
       EXISTS (SELECT 1 FROM profiles
               WHERE user_id = auth.uid()
               AND role = 'admin'));

-- API pública pode ver imóveis publicados
CREATE POLICY "Public can view published imoveis"
ON imoveis FOR SELECT TO anon
USING (publicado = true AND status = 'ativo');
```

---

## Padrões de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `Navbar.tsx`, `LeadCard.tsx`)
- **Funções**: camelCase (ex: `handleSubmit`, `loadData`)
- **Tipos**: PascalCase (ex: `type Lead = {...}`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `const MAX_IMAGES = 20`)

### Estrutura de Componente
```typescript
// Imports
import { useState, useEffect } from 'react';
import { supabase, Lead } from '../lib/supabase';

// Interfaces/Types locais
interface Props {
  // ...
}

// Componente
export function ComponentName({ prop1, prop2 }: Props) {
  // Estado
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Funções
  async function loadData() {
    // ...
  }

  // Render condicional
  if (loading) return <LoadingSpinner />;

  // JSX
  return (
    <div>
      {/* conteúdo */}
    </div>
  );
}
```

---

## Performance

### Otimizações Implementadas
1. **Índices no banco de dados** para queries frequentes
2. **Paginação** em todas as listagens
3. **Lazy loading** de imagens
4. **Debounce** em campos de busca
5. **Memoization** com useMemo/useCallback (quando necessário)

### Otimizações Futuras
1. **Code splitting** por rota
2. **Service Workers** para cache
3. **Compression** de imagens antes do upload
4. **CDN** para assets estáticos
5. **Virtual scrolling** para listas longas

---

## Escalabilidade

### Horizontal
- **Supabase** gerencia automaticamente scaling do PostgreSQL
- **Edge Functions** para lógica serverless
- **CDN** para assets estáticos

### Vertical
- **Índices compostos** para queries complexas
- **Materialized views** para agregações pesadas
- **Particionamento** de tabelas grandes (futuro)
- **Read replicas** para queries de leitura (futuro)

---

## Integrações

### Atuais
- ✅ Supabase Auth
- ✅ Supabase Database
- ✅ Supabase Storage

### Planejadas
- ⏳ Google Maps API (coordenadas e mapas)
- ⏳ WhatsApp Business API (envio de mensagens)
- ⏳ WordPress REST API (publicação de imóveis)
- ⏳ Zapier/Pabbly (automações)
- ⏳ SendGrid/Mailgun (emails transacionais)
- ⏳ Twilio (SMS e chamadas)

---

## Testes

### Estratégia de Testes (Futuro)

```
                     ┌─────────────┐
                     │   E2E Tests │  Playwright/Cypress
                     └─────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────────────┐    ┌──────────────┐
         │ Integration  │    │  Component   │  React Testing Library
         │    Tests     │    │    Tests     │
         └──────────────┘    └──────────────┘
                │                     │
         ┌──────────────────────────────┐
         │        Unit Tests            │  Vitest/Jest
         └──────────────────────────────┘
```

---

## Deploy

### Ambientes

#### Desenvolvimento
```
Frontend: http://localhost:5173 (Vite dev server)
Backend: Supabase local (Docker)
Database: PostgreSQL local
```

#### Staging
```
Frontend: https://staging.oestecasa.com.br (Vercel/Netlify)
Backend: Supabase staging project
Database: PostgreSQL staging
```

#### Produção
```
Frontend: https://painel.oestecasa.com.br (Vercel/Netlify)
Backend: Supabase production project
Database: PostgreSQL production (Supabase)
CDN: Cloudflare
```

### CI/CD Pipeline (Futuro)

```
GitHub Push
    ↓
GitHub Actions
    ↓
1. Lint & Type Check
2. Run Tests
3. Build
4. Deploy to Vercel
5. Run E2E Tests
6. Notify team
```

---

## Monitoramento e Logs

### Métricas (Futuro)
- **Performance**: Web Vitals (LCP, FID, CLS)
- **Errors**: Sentry ou similar
- **Analytics**: Google Analytics ou Plausible
- **Uptime**: UptimeRobot ou Pingdom

### Logs
- **Activity Logs**: Tabela `activity_logs` no banco
- **Error Logs**: Console + Sentry
- **Audit Trail**: Automático via triggers

---

## Manutenção

### Backups
- **Automático**: Supabase faz backup diário
- **Manual**: Script de backup sob demanda
- **Retenção**: 30 dias

### Atualizações
- **Dependências**: Verificar semanalmente (Dependabot)
- **Security patches**: Aplicar imediatamente
- **Major versions**: Planejar e testar antes

---

## Documentação

### Para Desenvolvedores
- ✅ DATABASE_SCHEMA.md - Estrutura do banco
- ✅ API_DOCUMENTATION.md - Endpoints e exemplos
- ✅ ARCHITECTURE.md - Este arquivo
- ⏳ CONTRIBUTING.md - Guia de contribuição
- ⏳ README.md - Setup e quick start

### Para Usuários
- ⏳ Manual do Usuário (PDF/Online)
- ⏳ Vídeos tutoriais
- ⏳ FAQ
- ⏳ Base de conhecimento

---

## Roadmap Técnico

### Fase 1 (Concluída)
- ✅ Schema do banco de dados
- ✅ Autenticação e roles
- ✅ CRUD de imóveis básico
- ✅ CRM de leads básico
- ✅ Dashboard simples

### Fase 2 (Em Andamento)
- ⏳ Upload de imagens múltiplas
- ⏳ Sistema de tags
- ⏳ Filtros avançados
- ⏳ Dashboard analítico completo
- ⏳ Funil visual de CRM

### Fase 3 (Planejada)
- ⏳ API pública para WordPress
- ⏳ Integração Google Maps
- ⏳ Sistema de notificações real-time
- ⏳ Agendamento de visitas
- ⏳ Histórico de interações

### Fase 4 (Futuro)
- ⏳ WhatsApp Business API
- ⏳ Comparador de imóveis
- ⏳ Importação CSV
- ⏳ Exportação Excel
- ⏳ Email marketing integrado
- ⏳ Relatórios avançados
- ⏳ App mobile (React Native)

---

## Considerações Finais

Este sistema foi projetado para ser:
- **Modular**: Fácil adicionar/remover features
- **Escalável**: Suporta crescimento de dados e usuários
- **Manutenível**: Código limpo e bem documentado
- **Seguro**: RLS + JWT + validações
- **Performático**: Índices + caching + otimizações

Para mais informações, consulte a documentação específica de cada módulo.
