"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api, type MeResponse, type NotificationsResponse } from "@/lib/api-client";

// ─── Query Keys ───

export const queryKeys = {
  me: ["me"] as const,
  notifications: ["notifications"] as const,
  company: (slug: string) => ["company", slug] as const,
  opportunities: (params?: string) => ["opportunities", params ?? ""] as const,
  opportunity: (id: string) => ["opportunity", id] as const,
  matches: ["matches"] as const,
  team: ["team"] as const,
  projects: ["projects"] as const,
  billing: ["billing"] as const,
  invoices: ["invoices"] as const,
  apiKeys: ["apiKeys"] as const,
} as const;

// ─── User / Auth ───

export function useMe(options?: Partial<UseQueryOptions<MeResponse>>) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: api.me,
    staleTime: 5 * 60 * 1000, // 5 min
    ...options,
  });
}

// ─── Notifications ───

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.notifications,
    refetchInterval: 60_000, // poll every 60s
    refetchIntervalInBackground: false, // pause when tab hidden
    staleTime: 30_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications });
      const prev = qc.getQueryData<NotificationsResponse>(queryKeys.notifications);
      if (prev) {
        qc.setQueryData<NotificationsResponse>(queryKeys.notifications, {
          ...prev,
          unreadCount: 0,
          notifications: prev.notifications.map((n) => ({ ...n, lida: true })),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.notifications, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

// ─── Opportunities ───

export function useOpportunities(params?: string) {
  return useQuery({
    queryKey: queryKeys.opportunities(params),
    queryFn: () => api.opportunities(params),
    staleTime: 60_000,
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: queryKeys.opportunity(id),
    queryFn: () => api.opportunity(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOpportunity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

export function useUpdateOpportunity(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateOpportunity(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.opportunity(id) });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteOpportunity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
}

// ─── Matches ───

export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches,
    queryFn: api.matches,
    staleTime: 2 * 60_000,
  });
}

export function useSuggestMatches() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.suggestMatches,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.matches }),
  });
}

export function useRespondMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.respondMatch(id, { action }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.matches }),
  });
}

// ─── Team ───

export function useTeam() {
  return useQuery({
    queryKey: queryKeys.team,
    queryFn: api.team,
    staleTime: 2 * 60_000,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.invite,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.removeMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team }),
  });
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.changeRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team }),
  });
}

// ─── Projects ───

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: api.projects,
    staleTime: 5 * 60_000,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

// ─── Billing ───

export function useBilling() {
  return useQuery({
    queryKey: queryKeys.billing,
    queryFn: api.billing,
    staleTime: 10 * 60_000,
  });
}

// ─── API Keys ───

export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys,
    queryFn: api.apiKeys,
    staleTime: 5 * 60_000,
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createApiKey,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.apiKeys }),
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteApiKey,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.apiKeys }),
  });
}
