"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, X, Mail, Shield, UserMinus, Crown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonPage } from "@/components/ui/skeleton";

interface Member {
  id: string;
  userId: string;
  nome: string;
  email: string;
  avatar: string | null;
  role: string;
  ultimoLogin: string | null;
  criadoEm: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  criadoEm: string;
  expiraEm: string;
}

const roleLabels: Record<string, string> = { dono: "Dono", admin: "Admin", membro: "Membro" };
const roleColors: Record<string, string> = {
  dono: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
  admin: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10",
  membro: "bg-gray-50 text-gray-600 ring-1 ring-gray-600/10",
};

export default function EquipePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [ownerId, setOwnerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("membro");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTeam = useCallback(() => {
    fetch("/api/platform/team")
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.members || []);
        setInvites(data.invites || []);
        setOwnerId(data.ownerId || "");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);

    try {
      const res = await fetch("/api/platform/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar convite");
        return;
      }
      setSuccess(`Convite enviado para ${inviteEmail}`);
      setInviteEmail("");
      setShowInvite(false);
      loadTeam();
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(id: string, type: "member" | "invite") {
    const label = type === "member" ? "membro" : "convite";
    if (!confirm(`Remover este ${label}?`)) return;

    const res = await fetch(`/api/platform/team/${id}`, { method: "DELETE" });
    if (res.ok) loadTeam();
  }

  async function handleRoleChange(id: string, newRole: string) {
    await fetch(`/api/platform/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    loadTeam();
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all placeholder:text-gray-300";

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Equipe" description={`${members.length} membro(s)`}>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all"
        >
          {showInvite ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showInvite ? "Cancelar" : "Convidar"}
        </button>
      </PageHeader>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email *</label>
              <input
                type="email"
                className={inputClass}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="membro@empresa.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cargo</label>
              <select className={inputClass} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="membro">Membro</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="mt-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar convite"}
          </button>
        </form>
      )}

      {/* Members list */}
      <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-black/[0.04] bg-gray-50/50">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Membros</h3>
        </div>
        <div className="divide-y divide-black/[0.03]">
          {members.map((m) => {
            const isOwner = m.userId === ownerId;
            return (
              <div key={m.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500">
                    {m.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{m.nome}</p>
                      {isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${roleColors[isOwner ? "dono" : m.role] || roleColors.membro}`}>
                    {isOwner ? "Dono" : roleLabels[m.role] || m.role}
                  </span>
                  {!isOwner && (
                    <div className="flex items-center gap-1">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="membro">Membro</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleRemove(m.id, "member")}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Remover membro"
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
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-black/[0.04] bg-amber-50/30">
            <h3 className="text-[10px] font-semibold text-amber-600/70 uppercase tracking-wider">Convites pendentes</h3>
          </div>
          <div className="divide-y divide-black/[0.03]">
            {invites.map((inv) => (
              <div key={inv.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
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
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/10">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {roleLabels[inv.role] || inv.role}
                  </span>
                  <button
                    onClick={() => handleRemove(inv.id, "invite")}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title="Cancelar convite"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
