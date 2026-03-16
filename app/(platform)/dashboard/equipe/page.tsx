"use client";

import { useState } from "react";
import { Users, Plus, X, Mail, Shield, UserMinus, Crown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { useTeam, useInviteMember, useRemoveMember, useChangeRole } from "@/hooks/queries";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";

const roleLabels: Record<string, string> = { dono: "Dono", admin: "Admin", membro: "Membro" };
const roleBadgeVariant: Record<string, "warning" | "blue" | "default"> = {
  dono: "warning",
  admin: "blue",
  membro: "default",
};

export default function EquipePage() {
  const { data: teamData, isLoading } = useTeam();
  const inviteMutation = useInviteMember();
  const removeMutation = useRemoveMember();
  const roleMutation = useChangeRole();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("membro");
  const [error, setError] = useState("");

  const members = teamData?.members ?? [];
  const invites = teamData?.invites ?? [];
  const ownerId = teamData?.ownerId ?? "";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await inviteMutation.mutateAsync({ email: inviteEmail, role: inviteRole });
      toast.success(`Convite enviado para ${inviteEmail}`);
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao enviar convite");
    }
  }

  async function handleRemove(id: string, type: "member" | "invite") {
    const label = type === "member" ? "membro" : "convite";
    if (!confirm(`Remover este ${label}?`)) return;
    removeMutation.mutate(id);
  }

  function handleRoleChange(id: string, newRole: string) {
    roleMutation.mutate({ id, role: newRole });
  }

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Equipe" description={`${members.length} membro(s)`}>
        <Button
          onClick={() => setShowInvite(!showInvite)}
          variant={showInvite ? "secondary" : "primary"}
        >
          {showInvite ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showInvite ? "Cancelar" : "Convidar"}
        </Button>
      </PageHeader>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Invite form */}
      {showInvite && (
        <Card>
          <form onSubmit={handleInvite}>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField label="Email" htmlFor="invite-email" required>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="membro@empresa.com"
                    required
                    aria-required="true"
                  />
                </FormField>
              </div>
              <FormField label="Cargo" htmlFor="invite-role">
                <Select id="invite-role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="membro">Membro</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormField>
            </div>
            <div className="mt-4">
              <Button type="submit" loading={inviteMutation.isPending}>
                Enviar convite
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Members list */}
      <Card padding="none">
        <div className="px-5 py-3.5 border-b border-black/[0.04] bg-gray-50/50">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Membros</h3>
        </div>
        <div className="divide-y divide-black/[0.03]">
          {members.map((m) => {
            const isOwner = m.userId === ownerId;
            return (
              <div key={m.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500" aria-hidden="true">
                    {m.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{m.nome}</p>
                      {isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" aria-label="Proprietario" />}
                    </div>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={roleBadgeVariant[isOwner ? "dono" : m.role] || "default"} size="md">
                    {isOwner ? "Dono" : roleLabels[m.role] || m.role}
                  </Badge>
                  {!isOwner && (
                    <div className="flex items-center gap-1">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/20"
                        aria-label={`Alterar cargo de ${m.nome}`}
                      >
                        <option value="membro">Membro</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleRemove(m.id, "member")}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        aria-label={`Remover ${m.nome}`}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pending invites */}
      {invites.length > 0 && (
        <Card padding="none">
          <div className="px-5 py-3.5 border-b border-black/[0.04] bg-amber-50/30">
            <h3 className="text-[10px] font-semibold text-amber-600/70 uppercase tracking-wider">Convites pendentes</h3>
          </div>
          <div className="divide-y divide-black/[0.03]">
            {invites.map((inv) => (
              <div key={inv.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center" aria-hidden="true">
                    <Mail className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-400">
                      Expira em {new Date(inv.expiraEm).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning" size="md">
                    <Shield className="w-3 h-3 mr-1" />
                    {roleLabels[inv.role] || inv.role}
                  </Badge>
                  <button
                    onClick={() => handleRemove(inv.id, "invite")}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    aria-label={`Cancelar convite para ${inv.email}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
