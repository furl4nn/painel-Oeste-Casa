# API Documentation - Sistema Imobiliário Oeste Casa

## Base URL
```
Produção: https://seu-dominio.com/api
Desenvolvimento: http://localhost:3000/api
```

## Autenticação

### Headers Obrigatórios (Rotas Privadas)
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Headers Públicos (API WordPress)
```http
Content-Type: application/json
X-API-Key: {API_KEY} (opcional para rate limiting)
```

---

## 1. AUTENTICAÇÃO

### 1.1 Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "full_name": "Nome do Usuário",
      "role": "corretor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

### 1.2 Logout
```http
POST /auth/logout
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 1.3 Refresh Token
```http
POST /auth/refresh
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "novo_token...",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

---

## 2. IMÓVEIS

### 2.1 Listar Imóveis (Privado)
```http
GET /imoveis?page=1&limit=20&tipo=Casa&cidade=São Paulo
```

**Query Parameters:**
- `page` (int): Página atual (default: 1)
- `limit` (int): Itens por página (default: 20, max: 100)
- `tipo` (string): Filtrar por tipo
- `finalidade` (string): Venda ou Locação
- `cidade` (string): Filtrar por cidade
- `bairro` (string): Filtrar por bairro
- `preco_min` (number): Preço mínimo
- `preco_max` (number): Preço máximo
- `quartos` (int): Número de quartos
- `status` (string): ativo, vendido, alugado, inativo
- `destaque` (boolean): true/false
- `search` (string): Busca textual

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imoveis": [
      {
        "id": "uuid",
        "codigo_referencia": "IMO000001",
        "titulo": "Apartamento 3 Quartos no Centro",
        "tipo": "Apartamento",
        "finalidade": "Venda",
        "preco": "450000.00",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estado": "SP",
        "quartos": 3,
        "banheiros": 2,
        "vagas": 2,
        "area_util": "85",
        "destaque": true,
        "publicado": true,
        "imagens": [
          {
            "id": "uuid",
            "url": "https://...",
            "ordem": 0,
            "is_cover": true
          }
        ],
        "tags": [
          {
            "id": "uuid",
            "nome": "Pronto para morar",
            "cor": "#10B981"
          }
        ],
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20
    }
  }
}
```

### 2.2 Obter Imóvel por ID
```http
GET /imoveis/{id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigo_referencia": "IMO000001",
    "titulo": "Apartamento 3 Quartos no Centro",
    "tipo": "Apartamento",
    "finalidade": "Venda",
    "preco": "450000.00",
    "valor_aluguel": "",
    "condominio": "350.00",
    "iptu": "120.00",
    "endereco": "Rua das Flores",
    "numero": "123",
    "complemento": "Apto 45",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "latitude": -23.550520,
    "longitude": -46.633308,
    "area_total": "100",
    "area_util": "85",
    "quartos": 3,
    "suites": 1,
    "banheiros": 2,
    "vagas": 2,
    "caracteristicas": {
      "piscina": true,
      "churrasqueira": true,
      "academia": false,
      "portaria_24h": true
    },
    "mobiliado": false,
    "aceita_permuta": false,
    "aceita_financiamento": true,
    "descricao": "Lindo apartamento...",
    "pontos_fortes": "Localização privilegiada...",
    "observacoes": "",
    "video_url": "https://youtube.com/...",
    "tour_virtual_url": "",
    "destaque": true,
    "publicado": true,
    "views": 245,
    "imagens": [...],
    "tags": [...],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:20:00Z"
  }
}
```

### 2.3 Criar Imóvel
```http
POST /imoveis
```

**Request Body:**
```json
{
  "titulo": "Casa 4 Quartos com Piscina",
  "tipo": "Casa",
  "finalidade": "Venda",
  "preco": "850000",
  "endereco": "Rua das Palmeiras",
  "numero": "456",
  "bairro": "Jardim América",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "quartos": 4,
  "suites": 2,
  "banheiros": 3,
  "vagas": 3,
  "area_total": "300",
  "area_util": "250",
  "descricao": "Linda casa...",
  "caracteristicas": {
    "piscina": true,
    "churrasqueira": true
  },
  "tags": ["tag_uuid_1", "tag_uuid_2"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigo_referencia": "IMO000123",
    ...
  }
}
```

### 2.4 Atualizar Imóvel
```http
PUT /imoveis/{id}
```

### 2.5 Deletar Imóvel
```http
DELETE /imoveis/{id}
```

### 2.6 Upload de Imagens
```http
POST /imoveis/{id}/images
Content-Type: multipart/form-data
```

**Form Data:**
- `images[]`: Array de arquivos (max 20 imagens)
- `legenda[]`: Array de legendas (opcional)
- `ordem[]`: Array de ordens (opcional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.../image1.jpg",
        "ordem": 0,
        "legenda": "Fachada"
      }
    ]
  }
}
```

---

## 3. LEADS (CRM)

### 3.1 Listar Leads
```http
GET /leads?page=1&limit=20&status=Novo
```

**Query Parameters:**
- `page`, `limit`, `search`
- `status`: Novo, Em Atendimento, Qualificado, Convertido, Perdido
- `temperatura`: quente, morno, frio
- `origem`: site, WhatsApp, Instagram, etc

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "uuid",
        "nome": "João Silva",
        "email": "joao@example.com",
        "telefone": "(11) 99999-9999",
        "whatsapp": "(11) 99999-9999",
        "origem": "WhatsApp",
        "status": "Novo",
        "temperatura": "quente",
        "score": 85,
        "imovel_interesse": {
          "id": "uuid",
          "titulo": "Apartamento 3 Quartos"
        },
        "ultimo_contato": "2024-01-20T10:00:00Z",
        "proxima_acao": "2024-01-22T14:00:00Z",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

### 3.2 Criar Lead
```http
POST /leads
```

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "(11) 99999-9999",
  "whatsapp": "(11) 99999-9999",
  "origem": "WhatsApp",
  "status": "Novo",
  "imovel_id": "uuid",
  "tipo_imovel_interesse": "Apartamento",
  "orcamento_min": 300000,
  "orcamento_max": 500000,
  "bairros_interesse": ["Centro", "Jardins"],
  "observacoes": "Cliente interessado em apartamento de 3 quartos"
}
```

### 3.3 Atualizar Status do Lead
```http
PATCH /leads/{id}/status
```

**Request Body:**
```json
{
  "status": "Qualificado",
  "temperatura": "quente"
}
```

### 3.4 Histórico de Interações
```http
GET /leads/{id}/historico
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "historico": [
      {
        "id": "uuid",
        "tipo_interacao": "whatsapp",
        "descricao": "Cliente respondeu demonstrando interesse",
        "user_name": "Maria Corretora",
        "created_at": "2024-01-20T15:30:00Z"
      }
    ]
  }
}
```

### 3.5 Adicionar Interação
```http
POST /leads/{id}/historico
```

**Request Body:**
```json
{
  "tipo_interacao": "telefone",
  "descricao": "Ligação de follow-up. Cliente confirmou visita."
}
```

---

## 4. AGENDAMENTOS

### 4.1 Listar Agendamentos
```http
GET /agendamentos?data_inicio=2024-01-20&data_fim=2024-01-31
```

### 4.2 Criar Agendamento
```http
POST /agendamentos
```

**Request Body:**
```json
{
  "lead_id": "uuid",
  "imovel_id": "uuid",
  "data_hora": "2024-01-25T14:00:00Z",
  "observacoes": "Visita agendada com o cliente"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "lead": {...},
    "imovel": {...},
    "data_hora": "2024-01-25T14:00:00Z",
    "status": "agendado"
  }
}
```

### 4.3 Atualizar Status do Agendamento
```http
PATCH /agendamentos/{id}/status
```

**Request Body:**
```json
{
  "status": "realizado"
}
```

---

## 5. DASHBOARD & ANALYTICS

### 5.1 Métricas Gerais
```http
GET /dashboard/metrics
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_imoveis": 125,
    "imoveis_ativos": 98,
    "imoveis_vendidos": 27,
    "total_leads": 342,
    "leads_novos": 45,
    "leads_qualificados": 78,
    "leads_convertidos": 32,
    "agendamentos_mes": 56,
    "views_total": 12540,
    "valor_medio_imoveis": 520000
  }
}
```

### 5.2 Leads por Status (Funil)
```http
GET /dashboard/funil-leads
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "Novo": 45,
    "Em Atendimento": 67,
    "Qualificado": 78,
    "Proposta": 34,
    "Negociação": 21,
    "Convertido": 32,
    "Perdido": 65
  }
}
```

### 5.3 Imóveis por Tipo
```http
GET /dashboard/imoveis-por-tipo
```

### 5.4 Valor Médio por Bairro
```http
GET /dashboard/valor-por-bairro?cidade=São Paulo
```

---

## 6. API PÚBLICA (WORDPRESS / JETENGINE)

### 6.1 Listar Imóveis Públicos
```http
GET /public/imoveis?cidade=São Paulo&tipo=Apartamento
```

**Headers:**
```http
X-API-Key: sua_chave_api (opcional)
```

**Query Parameters:**
- `tipo`: Casa, Apartamento, Terreno, Comercial, Rural
- `finalidade`: Venda, Locação
- `cidade`, `bairro`, `estado`
- `preco_min`, `preco_max`
- `quartos_min`, `quartos_max`
- `tags`: array de slugs de tags
- `destaque`: true/false
- `page`, `limit`
- `orderBy`: preco, created_at, views
- `order`: asc, desc

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imoveis": [
      {
        "id": "uuid",
        "codigo": "IMO000001",
        "titulo": "Apartamento 3 Quartos",
        "slug": "apartamento-3-quartos-centro",
        "tipo": "Apartamento",
        "finalidade": "Venda",
        "preco": 450000,
        "preco_formatado": "R$ 450.000,00",
        "endereco_completo": "Rua das Flores, 123 - Centro, São Paulo/SP",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estado": "SP",
        "quartos": 3,
        "banheiros": 2,
        "vagas": 2,
        "area_util": 85,
        "imagem_destaque": "https://...",
        "imagens": [...],
        "tags": ["pronto-para-morar", "proximo-metro"],
        "descricao_curta": "Lindo apartamento...",
        "coordenadas": {
          "lat": -23.550520,
          "lng": -46.633308
        },
        "link": "https://seu-site.com/imovel/IMO000001"
      }
    ],
    "total": 45,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

### 6.2 Obter Imóvel Público por Código
```http
GET /public/imoveis/{codigo_referencia}
```

**Response:** Retorna dados completos do imóvel em formato otimizado para JetEngine

---

## 7. TAGS

### 7.1 Listar Tags
```http
GET /tags
```

### 7.2 Criar Tag
```http
POST /tags
```

**Request Body:**
```json
{
  "nome": "Pronto para morar",
  "cor": "#10B981"
}
```

---

## 8. NOTIFICAÇÕES

### 8.1 Listar Notificações do Usuário
```http
GET /notifications?lida=false
```

### 8.2 Marcar como Lida
```http
PATCH /notifications/{id}/ler
```

---

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida sem retorno
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `422 Unprocessable Entity`: Validação falhou
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Server Error`: Erro no servidor

---

## Formato de Erro Padrão

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {
      "email": ["O email é obrigatório"],
      "telefone": ["O telefone deve ter 11 dígitos"]
    }
  }
}
```

---

## Rate Limiting

- **Rotas Públicas**: 100 requisições por minuto por IP
- **Rotas Autenticadas**: 1000 requisições por minuto por usuário

Headers de resposta:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Integração com WordPress/JetEngine

### Exemplo de Configuração no JetEngine

```php
// functions.php do tema WordPress

add_filter('jet-engine/listings/data/object-fields-groups', function($groups) {
    $groups['oeste-casa-api'] = [
        'label' => 'Oeste Casa Imóveis',
        'fields' => [
            'codigo' => 'Código',
            'titulo' => 'Título',
            'tipo' => 'Tipo',
            'preco_formatado' => 'Preço',
            'endereco_completo' => 'Endereço',
            'quartos' => 'Quartos',
            'banheiros' => 'Banheiros',
            'area_util' => 'Área Útil',
            'imagem_destaque' => 'Imagem',
            'link' => 'Link'
        ]
    ];
    return $groups;
});

// Função para buscar imóveis da API
function get_oeste_casa_imoveis($args = []) {
    $api_url = 'https://seu-dominio.com/api/public/imoveis';
    $response = wp_remote_get($api_url . '?' . http_build_query($args));

    if (is_wp_error($response)) {
        return [];
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body['data']['imoveis'] ?? [];
}
```

---

## Webhooks (Futuro)

Endpoints para receber notificações de eventos:

- `imovel.created`
- `imovel.updated`
- `imovel.deleted`
- `lead.created`
- `lead.status_changed`
- `agendamento.created`

---

## Versionamento da API

A API usa versionamento por URL:
- `/api/v1/imoveis` - Versão 1 (atual)
- `/api/v2/imoveis` - Versão 2 (futura)

---

## Suporte e Contato

Para dúvidas ou problemas com a API:
- Email: suporte@oestecasa.com.br
- Documentação completa: https://docs.oestecasa.com.br
