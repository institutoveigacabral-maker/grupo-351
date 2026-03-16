# Grupo 351 -- API Reference

## Autenticacao

### API Publica (v1)

Autenticacao via API Key:

```
Authorization: Bearer <api-key>
```

### Plataforma

Autenticacao via sessao (Google OAuth ou email/senha).
Todas as respostas incluem header `x-request-id` para rastreamento.

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
| GET | `/api/platform/me` | Perfil do usuario (cached 300s) |

### Empresas

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/companies` | Listar empresas | 120s |
| POST | `/api/platform/companies` | Criar empresa | Invalida cache |
| GET | `/api/platform/companies/:slug` | Detalhes | 300s |
| PATCH | `/api/platform/companies/:slug` | Atualizar | Invalida cache |

### Oportunidades

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/opportunities` | Listar | 120s |
| POST | `/api/platform/opportunities` | Criar | Invalida cache |
| GET | `/api/platform/opportunities/:id` | Detalhe | - |
| PUT | `/api/platform/opportunities/:id` | Atualizar | Invalida cache |
| DELETE | `/api/platform/opportunities/:id` | Remover (soft) | Invalida cache |
| POST | `/api/platform/opportunities/copilot` | IA copilot | - |

### Matches

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/matches` | Listar matches | 120s |
| POST | `/api/platform/matches` | Criar match | Invalida cache |
| POST | `/api/platform/matches/suggest` | Sugestoes IA | - |
| GET | `/api/platform/matches/:id/insights` | Insights do match | - |

### Mensagens

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/platform/messages` | Listar mensagens |
| POST | `/api/platform/messages` | Enviar mensagem |
| GET | `/api/platform/messages/stream` | SSE stream |

### Billing

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/billing` | Status da assinatura | 600s |
| POST | `/api/platform/billing` | Criar assinatura | Invalida cache |
| POST | `/api/platform/billing/portal` | Portal Stripe | - |
| GET | `/api/platform/billing/invoices` | Faturas | 600s |

### Equipe

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/team` | Listar membros | 120s |
| POST | `/api/platform/team` | Adicionar membro | Invalida cache |
| POST | `/api/platform/team/invite` | Convidar | Invalida cache |
| PATCH | `/api/platform/team/:id` | Alterar role | Invalida cache |
| DELETE | `/api/platform/team/:id` | Remover membro | Invalida cache |

### Projetos

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/projects` | Listar projetos | 300s |
| POST | `/api/platform/projects` | Criar projeto | Invalida cache |

### Reviews

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/reviews?userId=` | Reviews de um usuario | 120s |
| POST | `/api/platform/reviews` | Criar review | Invalida cache |

### API Keys

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/api-keys` | Listar keys (mascaradas) | 300s |
| POST | `/api/platform/api-keys` | Criar key | Invalida cache |
| DELETE | `/api/platform/api-keys?id=` | Revogar key | Invalida cache |

### Notificacoes

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/notifications` | Listar | 60s |
| PATCH | `/api/platform/notifications` | Marcar como lida | Invalida cache |

### Busca

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/platform/search?q=` | Busca global | 120s |

---

## Admin

### Gestao

| Metodo | Rota | Descricao | Cache |
|--------|------|-----------|-------|
| GET | `/api/admin/stats` | Dashboard stats | - |
| GET | `/api/admin/analytics` | Analytics completo | 600s |
| GET | `/api/admin/companies` | Empresas | - |
| GET | `/api/admin/users` | Usuarios | - |
| GET | `/api/admin/candidaturas` | Candidaturas | - |
| GET | `/api/admin/contatos` | Contatos | - |
| GET | `/api/admin/subscriptions` | Assinaturas | - |
| GET | `/api/admin/reunioes` | Reunioes | - |
| GET | `/api/admin/financeiro` | Financeiro | - |
| GET | `/api/admin/auditoria` | Auditoria | - |

### IA Admin

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/admin/ai` | Consulta IA |
| GET | `/api/admin/ai/historico` | Historico IA |

---

## Sistema

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/health` | Health check (DB + Redis + memoria) |
| POST | `/api/vitals` | Web Vitals reporting |
| GET | `/api/metricas` | Metricas publicas (cached 3600s) |
| POST | `/api/contato` | Formulario de contato |
| POST | `/api/nda` | NDA digital |
| GET | `/api/parceiro` | Portal do parceiro |

## Webhooks

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/webhooks/stripe` | Webhook Stripe |

---

## Headers de Seguranca

Todas as rotas incluem:
- `Strict-Transport-Security` (HSTS 2 anos + preload)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` (full directives)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, mic, geo desabilitados)
- `x-request-id` (UUID por request)

## Cache Strategy

| Tipo | TTL | Invalidacao |
|------|-----|-------------|
| User profile | 300s | Login/update |
| Notifications | 60s | Ao criar notificacao |
| Listagens publicas | 120s | Ao criar/editar/deletar |
| Perfil empresa | 300s | Ao editar empresa |
| Billing/invoices | 600s | Ao criar assinatura |
| Admin analytics | 600s | Manual |
| API keys | 300s | Ao criar/revogar |
| Reviews | 120s | Ao criar review |

*Ultima atualizacao: 16 de marco de 2026*
