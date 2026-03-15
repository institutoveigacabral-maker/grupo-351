# Grupo 351 -- API Reference

## Autenticacao

### API Publica (v1)

Autenticacao via API Key:

```
Authorization: Bearer <api-key>
```

### Plataforma

Autenticacao via sessao (Google OAuth ou email/senha).

### Admin

Autenticacao via login admin (`POST /api/admin/login`).

---

## API Publica (v1)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/v1/companies` | Listar empresas |
| GET | `/api/v1/opportunities` | Listar oportunidades |
| POST | `/api/v1/opportunities` | Criar oportunidade |

---

## Plataforma

### Autenticacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/platform/auth/register` | Registrar usuario |
| POST | `/api/platform/auth/login` | Login |
| POST | `/api/platform/auth/logout` | Logout |
| GET | `/api/platform/auth/google` | OAuth Google |
| GET | `/api/platform/me` | Perfil do usuario |

### Empresas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/companies` | Listar empresas |
| POST | `/api/platform/companies` | Criar empresa |
| GET | `/api/platform/companies/:slug` | Detalhes |
| PATCH | `/api/platform/companies/:slug` | Atualizar |

### Oportunidades

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/opportunities` | Listar |
| POST | `/api/platform/opportunities` | Criar |
| PUT | `/api/platform/opportunities/:id` | Atualizar |
| DELETE | `/api/platform/opportunities/:id` | Remover |
| POST | `/api/platform/opportunities/copilot` | IA copilot |

### Matches

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/matches` | Listar matches |
| POST | `/api/platform/matches` | Criar match |
| POST | `/api/platform/matches/suggest` | Sugestoes IA |
| GET | `/api/platform/matches/:id/insights` | Insights do match |

### Mensagens

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/messages` | Listar mensagens |
| POST | `/api/platform/messages` | Enviar mensagem |
| GET | `/api/platform/messages/stream` | SSE stream |

### Billing

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/billing` | Status da assinatura |
| POST | `/api/platform/billing` | Criar assinatura |
| POST | `/api/platform/billing/portal` | Portal Stripe |

### Equipe

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/team` | Listar membros |
| POST | `/api/platform/team` | Adicionar membro |
| POST | `/api/platform/team/invite` | Convidar |
| PATCH | `/api/platform/team/:id` | Atualizar |
| DELETE | `/api/platform/team/:id` | Remover |

---

## Admin

### Gestao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/analytics` | Analytics |
| GET | `/api/admin/companies` | Empresas |
| GET | `/api/admin/users` | Usuarios |
| GET | `/api/admin/candidaturas` | Candidaturas |
| GET | `/api/admin/contatos` | Contatos |
| GET | `/api/admin/subscriptions` | Assinaturas |
| GET | `/api/admin/reunioes` | Reunioes |
| GET | `/api/admin/financeiro` | Financeiro |
| GET | `/api/admin/auditoria` | Auditoria |

### IA Admin

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/admin/ai` | Consulta IA |
| GET | `/api/admin/ai/historico` | Historico IA |

### Health

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/health` | Status do sistema |

---

## Webhooks

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/webhooks/stripe` | Webhook Stripe |
