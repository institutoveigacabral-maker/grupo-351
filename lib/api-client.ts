/** Typed API client — eliminates hardcoded URLs and standardizes error handling */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {}
    throw new ApiError(
      res.status,
      (data.error as string) || `Erro ${res.status}`,
      data,
    );
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Platform API ───

export const api = {
  // Auth
  me: () => request<MeResponse>("/api/platform/me"),
  logout: () => request("/api/platform/auth/logout", { method: "POST" }),

  // Notifications
  notifications: () => request<NotificationsResponse>("/api/platform/notifications"),
  markAllRead: () =>
    request("/api/platform/notifications", {
      method: "PATCH",
      body: JSON.stringify({ markAllRead: true }),
    }),

  // Company
  company: (slug: string) => request<Company>(`/api/platform/companies/${slug}`),
  createCompany: (data: Record<string, unknown>) =>
    request<Company>("/api/platform/companies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCompany: (slug: string, data: Record<string, unknown>) =>
    request<Company>(`/api/platform/companies/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Opportunities
  opportunities: (params?: string) =>
    request<OpportunitiesResponse>(`/api/platform/opportunities${params ? `?${params}` : ""}`),
  opportunity: (id: string) => request<Opportunity>(`/api/platform/opportunities/${id}`),
  createOpportunity: (data: Record<string, unknown>) =>
    request<Opportunity>("/api/platform/opportunities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateOpportunity: (id: string, data: Record<string, unknown>) =>
    request(`/api/platform/opportunities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteOpportunity: (id: string) =>
    request(`/api/platform/opportunities/${id}`, { method: "DELETE" }),

  // Matches
  matches: () => request<MatchesResponse>("/api/platform/matches"),
  suggestMatches: () => request("/api/platform/matches/suggest", { method: "POST" }),
  respondMatch: (id: string, data: { action: string }) =>
    request(`/api/platform/matches/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Team
  team: () => request<TeamResponse>("/api/platform/team"),
  invite: (data: { email: string; role: string }) =>
    request("/api/platform/team", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeMember: (id: string) =>
    request(`/api/platform/team/${id}`, { method: "DELETE" }),
  changeRole: (id: string, role: string) =>
    request(`/api/platform/team/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // Projects
  projects: () => request<ProjectsResponse>("/api/platform/projects"),
  createProject: (data: Record<string, unknown>) =>
    request("/api/platform/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Billing
  billing: () => request<BillingResponse>("/api/platform/billing"),
  invoices: () => request("/api/platform/billing/invoices"),
  createCheckout: (planId: string) =>
    request<{ url: string }>("/api/platform/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),

  // API Keys
  apiKeys: () => request<ApiKeysResponse>("/api/platform/api-keys"),
  createApiKey: (data: { nome: string }) =>
    request("/api/platform/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteApiKey: (id: string) =>
    request(`/api/platform/api-keys/${id}`, { method: "DELETE" }),
} as const;

// ─── Types ───

export interface MeResponse {
  id: string;
  nome: string;
  email: string;
  role: string;
  company?: {
    id: string;
    slug: string;
    nome: string;
    setor: string;
    estagio: string;
    verificada: boolean;
  } | null;
}

export interface Company {
  slug: string;
  nome: string;
  tagline?: string;
  descricao?: string;
  setor: string;
  pais: string;
  cidade?: string;
  website?: string;
  linkedin?: string;
  estagio: string;
  faturamento?: string;
  interesses: string[];
}

export interface Opportunity {
  id: string;
  titulo: string;
  tipo: string;
  setor: string;
  descricao: string;
  requisitos?: string;
  budget?: string;
  localizacao?: string;
  status: string;
  criadoEm: string;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total?: number;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface Match {
  id: string;
  status: string;
  score?: number;
  fromUser: { id: string; nome: string };
  toUser: { id: string; nome: string };
  opportunity: { id: string; titulo: string; tipo: string; setor: string };
  criadoEm: string;
}

export interface TeamResponse {
  members: TeamMember[];
  invites: TeamInvite[];
  ownerId: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  nome: string;
  email: string;
  avatar: string | null;
  role: string;
  ultimoLogin: string | null;
  criadoEm: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  criadoEm: string;
  expiraEm: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface Project {
  id: string;
  nome: string;
  descricao?: string;
  status: string;
  criadoEm: string;
}

export interface BillingResponse {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  usage?: Record<string, number>;
}

export interface ApiKeysResponse {
  keys: ApiKey[];
}

export interface ApiKey {
  id: string;
  nome: string;
  prefix: string;
  criadoEm: string;
  ultimoUso?: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  criadoEm: string;
}
