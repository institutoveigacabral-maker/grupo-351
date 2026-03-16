"use client";

import { useEffect, useState } from "react";
import { ArrowRight, UserCheck, UserX, Globe } from "lucide-react";
import Image from "next/image";
import { DataTable, type Column } from "@/components/ui/data-table";

interface PlatformUser {
  id: string;
  email: string;
  nome: string;
  role: string;
  avatar: string | null;
  ativo: boolean;
  googleId: boolean;
  criadoEm: string;
  ultimoLogin: string | null;
  company: { id: string; nome: string; slug: string; verificada: boolean } | null;
  _count: { matches: number; opportunities: number };
}

const roleLabels: Record<string, string> = {
  empresa: "Empresa",
  parceiro: "Parceiro",
  admin: "Admin",
};

const roleColors: Record<string, string> = {
  empresa: "bg-blue-100 text-blue-700",
  parceiro: "bg-purple-100 text-purple-700",
  admin: "bg-amber-100 text-amber-700",
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  async function toggleAtivo(user: PlatformUser) {
    setToggling(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !user.ativo }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, ativo: !u.ativo } : u));
    }
    setToggling(null);
  }

  const preFiltered = users.filter((u) => {
    if (filterRole !== "todos" && u.role !== filterRole) return false;
    if (filterStatus === "ativo" && !u.ativo) return false;
    if (filterStatus === "inativo" && u.ativo) return false;
    return true;
  });

  const columns: Column<PlatformUser>[] = [
    {
      key: "user",
      label: "Utilizador",
      sortable: true,
      sortValue: (u) => u.nome.toLowerCase(),
      render: (u) => (
        <div className="flex items-center gap-3">
          {u.avatar ? (
            <Image src={u.avatar} alt={`Avatar de ${u.nome}`} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <span className="text-white text-xs font-bold">{u.nome.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{u.nome}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      hidden: "md",
      render: (u) => (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${roleColors[u.role] || "bg-gray-100 text-gray-700"}`}>
          {roleLabels[u.role] || u.role}
        </span>
      ),
    },
    {
      key: "company",
      label: "Empresa",
      hidden: "lg",
      render: (u) =>
        u.company ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-900">{u.company.nome}</span>
            {u.company.verificada && (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">V</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: "auth",
      label: "Auth",
      hidden: "md",
      render: (u) =>
        u.googleId ? <Globe className="w-4 h-4 text-blue-500" /> : <span className="text-xs text-gray-400">Email</span>,
    },
    {
      key: "activity",
      label: "Atividade",
      hidden: "lg",
      render: (u) => (
        <div className="text-xs text-gray-400">
          <span>{u._count.opportunities} oport.</span>
          <span className="mx-1">·</span>
          <span>{u._count.matches} matches</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleAtivo(u); }}
          disabled={toggling === u.id}
          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
            u.ativo
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          } ${toggling === u.id ? "opacity-50" : ""}`}
        >
          {u.ativo ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
          {u.ativo ? "Ativo" : "Inativo"}
        </button>
      ),
    },
    {
      key: "created",
      label: "Registro",
      hidden: "md",
      sortable: true,
      sortValue: (u) => new Date(u.criadoEm).getTime(),
      render: (u) => (
        <span className="text-xs text-gray-400">
          {new Date(u.criadoEm).toLocaleDateString("pt-PT")}
        </span>
      ),
    },
    {
      key: "action",
      label: "",
      render: (u) => (
        <a
          href={`/admin/usuarios/${u.id}`}
          className="text-accent hover:text-accent-light transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowRight className="w-4 h-4" />
        </a>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Utilizadores da Plataforma</h1>
        <p className="text-muted text-sm mt-1">
          {users.length} utilizador(es) — {users.filter((u) => u.ativo).length} ativos
        </p>
      </div>

      <DataTable
        columns={columns}
        data={preFiltered}
        keyExtractor={(u) => u.id}
        searchable
        searchPlaceholder="Buscar por nome, email ou empresa..."
        searchFn={(u, q) =>
          u.nome.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.company?.nome.toLowerCase().includes(q) ?? false)
        }
        emptyMessage="Nenhum utilizador encontrado"
        headerSlot={
          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/[0.06] bg-white text-sm text-gray-700"
            >
              <option value="todos">Todos os roles</option>
              <option value="empresa">Empresa</option>
              <option value="parceiro">Parceiro</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/[0.06] bg-white text-sm text-gray-700"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
