# 🚀 InstarNews - Sistema Multi-Tenant de Gerenciamento de Notícias

Sistema completo de gerenciamento de notícias multi-tenant com Laravel 12, React 18, PostgreSQL 15 e Docker.

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com)

---

## 📑 Índice

- [Características](#-características)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Rápida](#-instalação-rápida)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [URLs e Acessos](#-urls-e-acessos)
- [Credenciais de Teste](#-credenciais-de-teste)
- [API Endpoints](#-api-endpoints)
- [Frontend - Páginas React](#-frontend---páginas-react)
- [Testes](#-testes)
- [Multi-Tenancy](#-multi-tenancy)
- [Segurança e Boas Práticas](#-segurança-e-boas-práticas)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Características

### Backend (Laravel 12)
- ✅ **Arquitetura em Camadas**: Controller → Request → Service → Action → Model
- ✅ **Autenticação JWT**: Token-based authentication com refresh token
- ✅ **Multi-Tenancy**: Isolamento completo de dados por tenant
- ✅ **UUIDs**: Identificadores públicos seguros
- ✅ **Exceptions Customizadas**: Tratamento de erros padronizado
- ✅ **Activity Logs**: Rastreamento completo de ações
- ✅ **Policies**: Autorização granular por recurso
- ✅ **Form Requests**: Validação robusta de entrada
- ✅ **API RESTful**: Endpoints padronizados
- ✅ **Swagger/OpenAPI**: Documentação interativa automática

### Frontend (React 18)
- ✅ **Vite**: Build tool moderna e rápida
- ✅ **React Router**: Navegação SPA
- ✅ **Context API**: Gerenciamento de estado global
- ✅ **Tailwind CSS**: Design system moderno e responsivo
- ✅ **Axios**: Cliente HTTP configurado
- ✅ **Toast Notifications**: Feedback visual de ações
- ✅ **Componentização**: Componentes reutilizáveis
- ✅ **Protected Routes**: Rotas autenticadas

### DevOps
- ✅ **Docker & Docker Compose**: Ambiente completamente containerizado
- ✅ **Auto-inicialização**: Migrations, seeds e JWT automáticos
- ✅ **Hot Reload**: Vite HMR para desenvolvimento
- ✅ **PostgreSQL 15**: Banco de dados robusto e escalável

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Docker**: versão 20.10 ou superior
- **Docker Compose**: versão 2.0 ou superior
- **Git**: para clonar o repositório

### Verificar instalação

```bash
docker --version
docker-compose --version
git --version
```

---

## 🚀 Instalação Rápida

### 1. Clone o repositório

```bash
git clone <repository-url>
cd instar
```

### 2. Configure o ambiente

```bash
cp env.example .env
```

> **Nota**: As configurações padrão já estão otimizadas para desenvolvimento local.

### 3. Inicie os containers

```bash
docker-compose up --build
```

**Aguarde até ver a mensagem:**
```
Server started on [http://0.0.0.0:8000]
```

⏱️ **Tempo estimado**: 5-10 minutos na primeira vez.

### 4. Acesse o sistema

- **Frontend (Interface Web)**: http://localhost:5173
- **API Backend**: http://localhost:8000/api
- **Documentação Swagger**: http://localhost:8000/api/documentation

---

## 🏗️ Arquitetura

### Stack Tecnológica

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  React 18 + Vite + Tailwind CSS + React Router          │
│  Porta: 5173 (Vite Dev Server com HMR)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API (axios)
                       ↓
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Laravel)                     │
│  Laravel 12 + PHP 8.3 + JWT Auth                        │
│  Porta: 8000 (Laravel Artisan Serve)                    │
└──────────────────────┬──────────────────────────────────┘
                       │ Eloquent ORM
                       ↓
┌─────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                   │
│  PostgreSQL 15                                           │
│  Porta: 5432                                             │
└─────────────────────────────────────────────────────────┘
```

### Padrão de Camadas (Clean Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                       HTTP Request                       │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  CONTROLLER (Api/NewsController)                        │
│  - Recebe requisição HTTP                               │
│  - Delega para Service                                  │
│  - Retorna Response (JSON)                              │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  REQUEST (CreateNewsRequest)                            │
│  - Valida dados de entrada                              │
│  - Regras de validação Laravel                          │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  SERVICE (NewsService)                                  │
│  - Lógica de negócio                                    │
│  - Autorização (Policies)                               │
│  - Orquestra Actions                                    │
│  - Tratamento de exceções                               │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  ACTION (CreateNewsAction)                              │
│  - Operação atômica única                               │
│  - Single Responsibility                                │
│  - Reutilizável                                         │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  MODEL (News)                                           │
│  - Eloquent ORM                                         │
│  - Relacionamentos                                      │
│  - Traits (LogsActivity, UsesUuid)                      │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                 │
└─────────────────────────────────────────────────────────┘
```

### Exceções Customizadas

```php
try {
    $service->create($data);
} catch (NotFoundException $e) {
    return response()->json(['error' => $e->getMessage()], 404);
} catch (UnauthorizedException $e) {
    return response()->json(['error' => $e->getMessage()], 403);
} catch (BusinessException $e) {
    return response()->json(['error' => $e->getMessage()], 400);
} catch (ValidationException $e) {
    return response()->json(['error' => $e->getMessage()], 422);
}
```

---

## 📂 Estrutura do Projeto

### Backend (Laravel)

```
app/
├── Actions/                    # Operações atômicas
│   ├── News/
│   │   ├── CreateNewsAction.php
│   │   ├── UpdateNewsAction.php
│   │   └── DeleteNewsAction.php
│   ├── Tenant/
│   │   ├── CreateTenantAction.php
│   │   ├── UpdateTenantAction.php
│   │   └── DeleteTenantAction.php
│   └── User/
│       ├── CreateUserAction.php
│       ├── UpdateUserAction.php
│       ├── DeleteUserAction.php
│       ├── AttachUserToTenantAction.php
│       └── DetachUserFromTenantAction.php
│
├── DTO/                        # Data Transfer Objects
│   ├── News/NewsData.php
│   ├── Tenant/TenantData.php
│   └── User/UserData.php
│
├── Exceptions/                 # Exceções customizadas
│   ├── BusinessException.php
│   ├── NotFoundException.php
│   ├── UnauthorizedException.php
│   └── ValidationException.php
│
├── Helpers/                    # Classes auxiliares
│   └── ResponseFormatter.php
│
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── ActivityLogController.php
│   │       ├── AuthController.php
│   │       ├── NewsController.php
│   │       ├── TenantController.php
│   │       ├── TenantUserController.php
│   │       └── UserController.php
│   │
│   ├── Middleware/
│   │   └── TenantMiddleware.php
│   │
│   └── Requests/
│       ├── Auth/LoginRequest.php
│       ├── News/
│       │   ├── CreateNewsRequest.php
│       │   └── UpdateNewsRequest.php
│       ├── Tenant/
│       │   ├── CreateTenantRequest.php
│       │   └── UpdateTenantRequest.php
│       └── User/
│           ├── CreateUserRequest.php
│           └── UpdateUserRequest.php
│
├── Models/
│   ├── ActivityLog.php
│   ├── News.php
│   ├── Tenant.php
│   └── User.php
│
├── Policies/
│   ├── NewsPolicy.php
│   └── TenantPolicy.php
│
├── Services/
│   ├── ActivityLogService.php
│   ├── AuthService.php
│   ├── NewsService.php
│   ├── TenantService.php
│   └── UserService.php
│
└── Traits/
    ├── LogsActivity.php        # Activity logging automático
    └── UsesUuid.php            # UUIDs como chave primária

database/
├── factories/
│   ├── NewsFactory.php
│   ├── TenantFactory.php
│   └── UserFactory.php
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 2024_01_01_000003_create_tenants_table.php
│   ├── 2024_01_01_000004_create_tenant_user_table.php
│   ├── 2024_01_01_000005_create_news_table.php
│   ├── 2024_01_01_000006_add_soft_deletes_to_tables.php
│   └── 2024_01_01_000007_create_activity_logs_table.php
└── seeders/
    └── DatabaseSeeder.php      # Cria 5 usuários de teste

routes/
├── api.php                     # Todas as rotas da API
├── web.php                     # SPA fallback route
└── console.php
```

### Frontend (React)

```
resources/
├── css/
│   └── app.css                 # Tailwind CSS
│
├── js/
│   ├── app.jsx                 # Entry point
│   ├── App.jsx                 # Rotas principais
│   │
│   ├── components/
│   │   ├── Breadcrumb.jsx
│   │   ├── Layout.jsx          # Layout principal com navbar
│   │   ├── Pagination.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── config/
│   │   └── axios.js            # Configuração do axios
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Gerenciamento de autenticação
│   │   └── ToastContext.jsx    # Sistema de notificações
│   │
│   └── pages/
│       ├── ActivityLogs.jsx    # Logs de atividade (Super Admin)
│       ├── Dashboard.jsx       # Dashboard principal
│       ├── Login.jsx           # Página de login
│       ├── NewsForm.jsx        # Criar/Editar notícia
│       ├── NewsList.jsx        # Listar notícias
│       ├── TenantDetail.jsx    # Detalhes do tenant
│       ├── TenantsList.jsx     # Listar tenants (Super Admin)
│       ├── UserForm.jsx        # Criar/Editar usuário
│       └── UsersList.jsx       # Listar usuários
│
└── views/
    └── welcome.blade.php       # Template base (SPA)
```

---

## 🌐 URLs e Acessos

### Desenvolvimento Local

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend (React)** | http://localhost:5173 | Interface web principal (Vite dev server) |
| **Backend API** | http://localhost:8000/api | API REST Laravel |
| **Swagger/OpenAPI** | http://localhost:8000/api/documentation | Documentação interativa da API |
| **PostgreSQL** | localhost:5432 | Banco de dados (acesso via cliente SQL) |

### Containers Docker

| Container | Nome | Porta | Status |
|-----------|------|-------|--------|
| Laravel | `laravel_app` | 8000 | `docker ps` |
| PostgreSQL | `postgres_db` | 5432 | `docker ps` |
| Node/Vite | `node_vite` | 5173 | `docker ps` |

---

## 🔑 Credenciais de Teste

Os seeders criam automaticamente os seguintes usuários:

### 🔴 Super Administrador (Acesso Total)

```
Email: admin@example.com
Senha: password

Permissões:
✓ Gerenciar todos os tenants
✓ Gerenciar todos os usuários
✓ Visualizar activity logs
✓ CRUD completo em news de qualquer tenant
```

### 🟢 Tenant A

**Administrador:**
```
Email: admin.a@example.com
Senha: password
Tenant: Tenant A
Role: admin
```

**Editor:**
```
Email: editor.a@example.com
Senha: password
Tenant: Tenant A
Role: editor
```

### 🔵 Tenant B

**Administrador:**
```
Email: admin.b@example.com
Senha: password
Tenant: Tenant B
Role: admin
```

**Editor:**
```
Email: editor.b@example.com
Senha: password
Tenant: Tenant B
Role: editor
```

---

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/login` | Login com email/senha | ❌ |
| `POST` | `/api/logout` | Logout (invalida token) | ✅ |
| `POST` | `/api/refresh` | Refresh JWT token | ✅ |
| `GET` | `/api/me` | Dados do usuário autenticado | ✅ |

### News (Notícias)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| `GET` | `/api/news` | Listar notícias | ✅ | Todos |
| `POST` | `/api/news` | Criar notícia | ✅ | Todos |
| `GET` | `/api/news/{uuid}` | Ver notícia | ✅ | Tenant member |
| `PUT` | `/api/news/{uuid}` | Atualizar notícia | ✅ | Tenant member |
| `DELETE` | `/api/news/{uuid}` | Deletar notícia | ✅ | Admin ou autor |

**Filtros disponíveis:**
- `?tenant_uuid={uuid}` - Filtrar por tenant
- `?author_uuid={uuid}` - Filtrar por autor
- `?search={termo}` - Busca em título/conteúdo
- `?per_page={n}` - Paginação

### Tenants

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| `GET` | `/api/tenants` | Listar tenants | ✅ | Super Admin |
| `POST` | `/api/tenants` | Criar tenant | ✅ | Super Admin |
| `GET` | `/api/tenants/{uuid}` | Ver tenant | ✅ | Super Admin |
| `PUT` | `/api/tenants/{uuid}` | Atualizar tenant | ✅ | Super Admin |
| `DELETE` | `/api/tenants/{uuid}` | Deletar tenant | ✅ | Super Admin |

**Gerenciamento de usuários:**
- `POST /api/tenants/{uuid}/users` - Adicionar usuário ao tenant
- `DELETE /api/tenants/{uuid}/users/{user_uuid}` - Remover usuário

### Users

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| `GET` | `/api/users` | Listar usuários | ✅ | Todos |
| `POST` | `/api/users` | Criar usuário | ✅ | Admin |
| `GET` | `/api/users/{uuid}` | Ver usuário | ✅ | Admin |
| `PUT` | `/api/users/{uuid}` | Atualizar usuário | ✅ | Admin ou próprio |
| `DELETE` | `/api/users/{uuid}` | Deletar usuário | ✅ | Admin |

**Regras de negócio:**
- ❌ Não pode deletar usuário com notícias associadas
- ❌ Não pode mudar tenant de usuário com notícias

### Activity Logs

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| `GET` | `/api/logs` | Listar logs | ✅ | Super Admin |
| `GET` | `/api/logs/{uuid}` | Ver log | ✅ | Super Admin |

**Filtros disponíveis:**
- `?tenant_uuid={uuid}` - Filtrar por tenant
- `?user_uuid={uuid}` - Filtrar por usuário
- `?log_type={type}` - Filtrar por tipo (created, updated, deleted)
- `?model_type={model}` - Filtrar por modelo

### Exemplo de Uso (cURL)

```bash
# 1. Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Resposta: { "token": "eyJ0eXAiOiJKV1QiLCJhbGc...", ... }

# 2. Listar notícias
curl -X GET http://localhost:8000/api/news \
  -H "Authorization: Bearer {seu-token-aqui}"

# 3. Criar notícia
curl -X POST http://localhost:8000/api/news \
  -H "Authorization: Bearer {seu-token-aqui}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Minha Notícia",
    "content": "Conteúdo da notícia...",
    "tenant_uuid": "abc-123-..."
  }'
```

---

## 🎨 Frontend - Páginas React

### Estrutura de Rotas

```javascript
/                       → Redirect to /login
/login                  → LoginPage (pública)
/dashboard              → Dashboard (protegida)
/news                   → NewsList (protegida)
/news/create            → NewsForm (protegida)
/news/edit/:uuid        → NewsForm (protegida)
/users                  → UsersList (protegida)
/users/create           → UserForm (protegida, admin)
/users/edit/:uuid       → UserForm (protegida, admin)
/tenants                → TenantsList (protegida, super admin)
/tenants/:uuid          → TenantDetail (protegida, super admin)
/logs                   → ActivityLogs (protegida, super admin)
```

### Páginas Implementadas

#### 1. **Login** (`/login`)
- Autenticação com email/senha
- Validação de campos
- Redirecionamento automático após login
- Toast notifications

#### 2. **Dashboard** (`/dashboard`)
- Cards com contagens (News, Tenants, Users, Logs)
- Visibilidade condicional por perfil
- Links diretos para seções
- Design responsivo

#### 3. **Lista de Notícias** (`/news`)
- Tabela paginada
- Filtros: Tenant, Autor, Busca textual
- Botões: Visualizar, Editar, Excluir
- Badges de tenant
- Confirmação de exclusão

#### 4. **Formulário de Notícia** (`/news/create`, `/news/edit/:uuid`)
- Criação e edição
- Seleção de tenant (Super Admin)
- Validação de campos
- Feedback visual

#### 5. **Lista de Usuários** (`/users`)
- Tabela paginada
- Filtro por tenant
- Contador de notícias associadas
- Botão de exclusão condicional (bloqueia se tem notícias)
- Badges de role

#### 6. **Formulário de Usuário** (`/users/create`, `/users/edit/:uuid`)
- Criação e edição
- Seleção de tenant e role
- Campo tenant bloqueado se usuário tem notícias
- Validação de email único
- Toggle de Super Admin

#### 7. **Lista de Tenants** (`/tenants`)
- Tabela paginada (Super Admin only)
- Busca por nome/domínio
- Contador de usuários
- Botões: Detalhes, Editar, Excluir

#### 8. **Detalhes do Tenant** (`/tenants/:uuid`)
- Informações completas
- Lista de usuários associados
- Gerenciar membros (adicionar/remover)

#### 9. **Activity Logs** (`/logs`)
- Tabela paginada (Super Admin only)
- Filtros: Tenant, Usuário, Tipo de ação, Modelo
- Badges coloridos por tipo de ação
- **Botão "Visualizar Detalhes"** com modal
- Modal exibe: UUID, Data/Hora, Tipo, Modelo, Usuário, Tenant, Descrição, Valores Antigos, Valores Novos

### Componentes Reutilizáveis

- **Layout.jsx**: Navbar com menu e logout
- **Breadcrumb.jsx**: Navegação hierárquica
- **Pagination.jsx**: Paginação customizável
- **ProtectedRoute.jsx**: HOC para rotas autenticadas

---

## 🧪 Testes

### Executar Testes

```bash
# Dentro do container
docker exec -it laravel_app php artisan test

# Ou com Pest diretamente
docker exec -it laravel_app ./vendor/bin/pest
```

### Testes Implementados

#### Feature Tests

```
tests/Feature/
├── AuthTest.php           # Login, logout, refresh, me
├── NewsTest.php           # CRUD de notícias + autorização
├── TenantTest.php         # CRUD de tenants (Super Admin)
├── UserTest.php           # CRUD de usuários + permissões
└── ExampleTest.php        # Teste básico
```

#### Cobertura de Testes

- ✅ **Autenticação**: Login, logout, refresh token, me
- ✅ **News**: CRUD completo + autorização multi-tenant
- ✅ **Tenants**: CRUD (apenas Super Admin)
- ✅ **Users**: CRUD + regras de negócio
- ✅ **Policies**: Testes de autorização
- ✅ **Multi-tenancy**: Isolamento de dados

### Executar com Coverage

```bash
docker exec -it laravel_app php artisan test --coverage
```

---

## 🏢 Multi-Tenancy

### Como Funciona

1. **Associação**: Cada usuário pertence a um ou mais tenants via tabela pivot `tenant_user`
2. **Role por Tenant**: Cada associação tem um `role` (admin ou editor)
3. **Middleware**: `TenantMiddleware` valida acesso em cada requisição
4. **Super Admin**: Usuários com `is_super_admin = true` ignoram restrições

### Fluxo de Requisição

```
Request → TenantMiddleware
    ↓
Verifica autenticação
    ↓
Se Super Admin → Permite tudo
    ↓
Se usuário normal → Valida acesso ao tenant
    ↓
Injeta tenant_id na requisição
    ↓
Controller → Service (usa tenant_id)
```

### Regras de Acesso

| Recurso | Super Admin | Tenant Admin | Tenant Editor |
|---------|-------------|--------------|---------------|
| Ver tenants | ✅ Todos | ❌ | ❌ |
| Criar tenants | ✅ | ❌ | ❌ |
| Ver news | ✅ Todos | ✅ Seu tenant | ✅ Seu tenant |
| Criar news | ✅ | ✅ | ✅ |
| Editar news | ✅ | ✅ | ✅ |
| Deletar news | ✅ | ✅ | ✅ Próprias |
| Ver usuários | ✅ Todos | ✅ Seu tenant | ✅ Seu tenant |
| Criar usuários | ✅ | ✅ | ❌ |
| Ver logs | ✅ | ❌ | ❌ |

---

## 🔒 Segurança e Boas Práticas

### Implementadas

#### 1. **UUIDs como Identificadores Públicos**
```php
// ❌ Evita expor IDs sequenciais
GET /api/news/123

// ✅ Usa UUIDs
GET /api/news/9a5f2c3e-8b7d-4e1a-9c2b-3f4e5d6a7b8c
```

#### 2. **Ocultação de Campos Sensíveis**
```php
// Models usam $hidden
protected $hidden = ['id', 'password', 'tenant_id'];
```

#### 3. **JWT com Refresh Token**
- Token expira em 60 minutos
- Refresh token válido por 14 dias
- Logout invalida tokens

#### 4. **Form Requests (Validação)**
```php
// Valida antes de chegar no controller
CreateNewsRequest::class
UpdateNewsRequest::class
```

#### 5. **Policies (Autorização)**
```php
// Autorização granular
NewsPolicy: view, create, update, delete
TenantPolicy: viewAny, create, update, delete
```

#### 6. **Exceptions Customizadas**
- `NotFoundException` → 404
- `UnauthorizedException` → 403
- `BusinessException` → 400
- `ValidationException` → 422

#### 7. **Activity Logs**
- Rastreamento automático via Trait
- Registra: created, updated, deleted
- Armazena old_values e new_values
- Filtra dados sensíveis (password, tokens)

#### 8. **CORS Configurado**
```php
// Apenas origens específicas em produção
'allowed_origins' => ['http://localhost:5173']
```

#### 9. **Rate Limiting**
```php
// Laravel throttle middleware
'api' => ['throttle:60,1']
```

#### 10. **Soft Deletes**
```php
// Não deleta fisicamente, marca como deleted_at
use SoftDeletes;
```

### Checklist de Produção

Antes de deploy em produção:

- [ ] Mudar `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] Alterar todas as senhas padrão
- [ ] Gerar novo `JWT_SECRET`
- [ ] Configurar `CORS` apropriado
- [ ] Habilitar HTTPS
- [ ] Configurar backups automáticos
- [ ] Rate limiting mais restritivo
- [ ] Logs centralizados
- [ ] Monitoring e alertas
- [ ] Desabilitar Swagger em produção

---

## 🛠️ Comandos Úteis

### Docker

```bash
# Iniciar containers
docker-compose up

# Iniciar em background
docker-compose up -d

# Rebuild completo
docker-compose up --build

# Parar containers
docker-compose down

# Parar e remover volumes (limpa banco)
docker-compose down -v

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f node

# Status dos containers
docker-compose ps

# Reiniciar um serviço
docker-compose restart app
```

### Laravel (dentro do container)

```bash
# Acessar bash do container
docker exec -it laravel_app bash

# Migrations
docker exec -it laravel_app php artisan migrate
docker exec -it laravel_app php artisan migrate:fresh --seed

# Seeders
docker exec -it laravel_app php artisan db:seed

# Cache
docker exec -it laravel_app php artisan cache:clear
docker exec -it laravel_app php artisan config:clear
docker exec -it laravel_app php artisan route:clear
docker exec -it laravel_app php artisan view:clear

# JWT
docker exec -it laravel_app php artisan jwt:secret --force

# Swagger
docker exec -it laravel_app php artisan l5-swagger:generate

# Rotas
docker exec -it laravel_app php artisan route:list

# Testes
docker exec -it laravel_app php artisan test

# Code Style (Laravel Pint)
docker exec -it laravel_app ./vendor/bin/pint
```

### Composer

```bash
# Instalar dependências
docker exec -it laravel_app composer install

# Atualizar dependências
docker exec -it laravel_app composer update

# Adicionar pacote
docker exec -it laravel_app composer require nome/pacote
```

### NPM (Node/Vite)

```bash
# Reinstalar dependências
docker-compose restart node

# Ver logs do Vite
docker-compose logs -f node

# Build para produção
docker exec -it node_vite npm run build
```

### PostgreSQL

```bash
# Acessar psql
docker exec -it postgres_db psql -U laravel -d laravel

# Backup
docker exec -it postgres_db pg_dump -U laravel laravel > backup.sql

# Restore
docker exec -i postgres_db psql -U laravel laravel < backup.sql
```

---

## 🐛 Troubleshooting

### Problema: Erro de permissão no Laravel

**Solução:**
```bash
docker exec -it laravel_app chmod -R 775 storage bootstrap/cache
docker exec -it laravel_app chown -R www-data:www-data storage bootstrap/cache
```

### Problema: JWT Secret não configurado

**Sintoma:** `The token could not be parsed from the request`

**Solução:**
```bash
docker exec -it laravel_app php artisan jwt:secret --force
```

### Problema: APP_KEY não configurado

**Sintoma:** `No application encryption key has been specified`

**Solução:**
```bash
docker exec -it laravel_app php artisan key:generate
```

### Problema: Migrations não executaram

**Solução:**
```bash
docker exec -it laravel_app php artisan migrate:fresh --seed
```

### Problema: Vite não conecta (HMR)

**Sintoma:** Frontend carrega mas não atualiza automaticamente

**Solução:**
```bash
# Verificar se porta 5173 está livre
lsof -i :5173

# Reiniciar container node
docker-compose restart node

# Verificar logs
docker-compose logs -f node
```

### Problema: PostgreSQL connection refused

**Solução:**
```bash
# Verificar se container db está rodando
docker-compose ps

# Verificar credenciais no .env
DB_HOST=db  # Nome do serviço no docker-compose
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret

# Reiniciar db
docker-compose restart db
```

### Problema: Swagger não aparece

**Solução:**
```bash
docker exec -it laravel_app php artisan l5-swagger:generate
```

### Problema: Frontend não carrega React

**Solução:**
```bash
# Limpar cache do navegador (Ctrl+F5)

# Verificar se Vite está rodando
docker-compose logs node

# Rebuild assets
docker-compose restart node
```

### Problema: Porta já em uso

**Sintoma:** `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solução:**
```bash
# Encontrar processo usando a porta
sudo lsof -i :8000
sudo lsof -i :5173

# Matar processo
sudo kill -9 <PID>

# Ou mudar porta no docker-compose.yml
```

### Problema: Limpar tudo e recomeçar

```bash
# Limpeza completa
docker-compose down -v
docker system prune -a
rm -rf vendor node_modules .env
cp env.example .env

# Rebuild
docker-compose up --build
```

---

## 📚 Documentação Adicional

- **[QUICKSTART.md](QUICKSTART.md)**: Guia rápido em 3 minutos
- **[INSTALLATION.md](INSTALLATION.md)**: Guia detalhado passo a passo
- **[PERMISSIONS.md](PERMISSIONS.md)**: Sistema de permissões
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**: Resumo técnico do projeto

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é open-source sob a licença MIT.

---

## 👨‍💻 Tecnologias

- **Backend**: Laravel 12, PHP 8.3, PostgreSQL 15
- **Frontend**: React 18, Vite, Tailwind CSS
- **Auth**: JWT (tymon/jwt-auth)
- **Docs**: Swagger/OpenAPI (darkaonline/l5-swagger)
- **DevOps**: Docker, Docker Compose
- **Testing**: Pest PHP

---

## 🎯 Status do Projeto

✅ **Pronto para Produção** - Arquitetura sólida, testes implementados, documentação completa.

---

**Desenvolvido com ❤️ seguindo as melhores práticas de Clean Architecture**

