# 🔐 Informações Importantes do Sistema

## ⚠️ Mantenha este arquivo seguro!

---

## 🗄️ Banco de Dados Supabase

### URL do Projeto:
```
https://scstzupuvhsullpsoqxv.supabase.co
```

### Dashboard Supabase:
```
https://supabase.com/dashboard/project/scstzupuvhsullpsoqxv
```

### Anon Key (Pública - pode compartilhar):
```
Está no arquivo .env
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:
1. **profiles** - Perfis de usuários
2. **imoveis** - Cadastro de imóveis
3. **imovel_images** - Imagens dos imóveis
4. **leads** - Leads/Clientes potenciais
5. **lead_historico** - Histórico de interações
6. **tags** - Tags para categorização
7. **imovel_tags** - Relação imóveis-tags
8. **agendamentos** - Visitas agendadas
9. **activity_logs** - Logs de atividades
10. **notifications** - Notificações do sistema

### Storage Bucket:
- **Nome:** `imoveis`
- **Uso:** Upload de fotos dos imóveis
- **Políticas:** Configuradas para autenticação

---

## 👥 Roles de Usuário

### Admin
- Acesso total ao sistema
- Pode criar e gerenciar corretores
- Visualiza todos os imóveis
- Acessa todos os relatórios

### Corretor
- Cadastra e gerencia seus próprios imóveis
- Acessa CRM e leads
- Visualiza relatórios próprios
- Upload de imagens

### Suporte
- Acesso ao sistema de mensagens
- Visualização de imóveis
- Suporte aos usuários

---

## 🎨 Design System

### Cores:
- **Vermelho Principal:** #C8102E
- **Preto:** #1A1A1A
- **Cinza Escuro:** #2A2A2A
- **Background:** #F6F8FB

### Tipografia:
- Font: System UI (padrão)
- Logo: 180px de altura
- Responsivo e moderno

---

## 📸 Sistema de Imagens

### 3 Níveis de Upload:

**1. Imagem Destaque**
- 1 foto principal
- Marca: `is_cover: true`
- Upload no cadastro

**2. Galeria Principal**
- Múltiplas imagens
- Upload em lote
- Preview instantâneo

**3. Upload Posterior**
- Adicionar mais imagens depois
- Via página de perfil

---

## 🔧 Manutenção

### Backup Recomendado:
1. Configure backup automático no Supabase
2. Frequência: Diária
3. Retenção: 7 dias mínimo

### Monitoramento:
- Logs disponíveis no Supabase Dashboard
- Activity logs no sistema
- Netlify Analytics (se habilitado)

---

## 📞 Links Úteis

### Documentação:
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [React Docs](https://react.dev)

### Suporte:
- Supabase: support@supabase.io
- Netlify: support@netlify.com

---

## 🚀 Como Adicionar Funcionalidades

### 1. Adicionar Nova Página:
1. Criar arquivo em `/src/pages/NomePagina.tsx`
2. Importar no `/src/App.tsx`
3. Adicionar case no switch
4. Adicionar link na Navbar

### 2. Adicionar Nova Tabela:
1. Criar migration no Supabase
2. Configurar RLS policies
3. Adicionar tipo no `/src/lib/supabase.ts`
4. Criar componentes de UI

### 3. Adicionar Nova Funcionalidade:
1. Criar componente em `/src/components/`
2. Importar onde necessário
3. Adicionar lógica de estado
4. Conectar com Supabase

---

## ✅ Status das Migrações

### Aplicadas:
1. ✅ `20251014141036_update_imoveis_schema.sql`
2. ✅ `20251014142403_update_leads_table.sql`
3. ✅ `20251014144207_create_complete_system_schema.sql`
4. ✅ `20251014144234_enhance_imoveis_table.sql`
5. ✅ `20251014144258_enhance_leads_table.sql`
6. ✅ `20251014145309_setup_storage_for_images.sql`
7. ✅ `fix_profiles_rls_policies` - Correção de recursão
8. ✅ `fix_all_recursive_policies` - Correção adicional

---

## 🔒 Segurança

### Boas Práticas Implementadas:
- ✅ RLS habilitado em todas as tabelas
- ✅ Policies restritivas por padrão
- ✅ Autenticação obrigatória
- ✅ Validação no frontend e backend
- ✅ Storage com políticas de acesso
- ✅ Sem secrets expostos no código

### Recomendações:
1. Nunca exponha a SERVICE_ROLE_KEY
2. Use ANON_KEY apenas no frontend
3. Revise políticas RLS regularmente
4. Monitore logs de acesso
5. Configure rate limiting (Netlify)

---

## 📊 Métricas de Performance

### Build:
- JavaScript: 358.17 KB (97 KB gzip)
- CSS: 20.19 KB (4.42 KB gzip)
- Tempo de build: ~3 segundos
- Módulos: 1559

### Otimizações:
- ✅ Code splitting automático
- ✅ Lazy loading de rotas
- ✅ Compressão gzip
- ✅ Assets otimizados
- ✅ CSS minificado

---

## 🎯 Primeiros Passos Após Deploy

1. **Crie um usuário admin:**
   - Registre-se via interface
   - No Supabase Dashboard, altere o role para 'admin'

2. **Configure o sistema:**
   - Cadastre alguns corretores
   - Adicione imóveis de exemplo
   - Teste todas as funcionalidades

3. **Customize:**
   - Adicione seu domínio no Netlify
   - Configure SMTP para emails (opcional)
   - Ative analytics (opcional)

---

## 📱 Compatibilidade

### Navegadores Suportados:
- ✅ Chrome (últimas 2 versões)
- ✅ Firefox (últimas 2 versões)
- ✅ Safari (últimas 2 versões)
- ✅ Edge (últimas 2 versões)

### Dispositivos:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

---

**Sistema Oeste Casa - Completo e Pronto para Uso!** 🏠✨

*Última atualização: 14 de Outubro de 2025*
