"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, X, Mail, Shield, UserMinus, Crown, Loader2 } from "lucide-react";

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
  dono: "bg-amber-50 text-amber-700",
  admin: "bg-blue-50 text-blue-700",
  membro: "bg-gray-50 text-gray-600",
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

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Equipe</h1>
            <p className="text-sm text-gray-400">{members.length} membro(s)</p>
          </div>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 transition-all"
        >
          {showInvite ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showInvite ? "Cancelar" : "Convidar"}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
              <select className={inputClass} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="membro">Membro</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="mt-4 bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 transition-all disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar convite"}
          </button>
        </form>
      )}

      {/* Members list */}
      <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
        <div className="px-5 py-3 border-b border-black/[0.04]">
          <h3 className="text-sm font-semibold text-gray-900">Membros</h3>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {members.map((m) => {
            const isOwner = m.userId === ownerId;
            return (
              <div key={m.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
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
                        className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600"
                      >
                        <option value="membro">Membro</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleRemove(m.id, "member")}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
          <div className="px-5 py-3 border-b border-black/[0.04]">
            <h3 className="text-sm font-semibold text-gray-900">Convites pendentes</h3>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {invites.map((inv) => (
              <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-400">
                      Expira em {new Date(inv.expiraEm).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {roleLabels[inv.role] || inv.role}
                  </span>
                  <button
                    onClick={() => handleRemove(inv.id, "invite")}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
