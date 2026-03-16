"use client";

import { useEffect, useState } from "react";
import { FolderKanban, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPage } from "@/components/ui/skeleton";

interface Project {
  id: string;
  nome: string;
  descricao: string | null;
  status: string;
  criadoEm: string;
  match: {
    opportunity: { titulo: string; tipo: string };
    fromUser: { nome: string };
    toUser: { nome: string };
  };
  members: { company: { nome: string; slug: string }; role: string }[];
  tasks: Task[];
}

interface Task {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  prazo: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ativo: { label: "Ativo", color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10", icon: Clock },
  pausado: { label: "Pausado", color: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10", icon: AlertCircle },
  concluido: { label: "Concluido", color: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 ring-1 ring-red-600/10", icon: AlertCircle },
};

const taskStatusColors: Record<string, string> = {
  pendente: "bg-gray-100 text-gray-600",
  "em-progresso": "bg-blue-50 text-blue-700",
  concluida: "bg-emerald-50 text-emerald-700",
};

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/projects")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader icon={FolderKanban} iconBg="bg-purple-50" iconColor="text-purple-600" title="Projetos" description={`${projects.length} projeto(s)`} />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto ainda"
          description="Projetos sao criados quando um match e aceito e ambas as partes iniciam uma parceria."
        />
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const st = statusConfig[project.status] || statusConfig.ativo;
            const Icon = st.icon;
            const totalTasks = project.tasks.length;
            const doneTasks = project.tasks.filter((t) => t.status === "concluida").length;
            const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

            return (
              <div key={project.id} className="group bg-white rounded-2xl border border-black/[0.04] p-6 hover:shadow-xl hover:shadow-black/[0.03] hover:border-black/[0.06] transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{project.nome}</h3>
                    {project.descricao && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.descricao}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Origem: {project.match.opportunity.titulo}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${st.color}`}>
                    <Icon className="w-3 h-3" /> {st.label}
                  </span>
                </div>

                {/* Membros */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.members.map((m) => (
                    <span key={m.company.slug} className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full ring-1 ring-gray-100">
                      {m.company.nome}
                      <span className="text-gray-400 ml-1">({m.role})</span>
                    </span>
                  ))}
                </div>

                {/* Progresso de tarefas */}
                {totalTasks > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tarefas</span>
                      <span className="text-xs font-medium text-gray-600">{doneTasks}/{totalTasks}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tarefas recentes */}
                {project.tasks.length > 0 && (
                  <div className="space-y-1.5">
                    {project.tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            task.status === "concluida" ? "bg-emerald-500" :
                            task.status === "em-progresso" ? "bg-blue-500" : "bg-gray-300"
                          }`} />
                          <span className={`text-sm ${task.status === "concluida" ? "text-gray-400 line-through" : "text-gray-700"}`}>
                            {task.titulo}
                          </span>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${taskStatusColors[task.status] || taskStatusColors.pendente}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Datas */}
                <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-300">
                  Criado em {new Date(project.criadoEm).toLocaleDateString("pt-PT")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
