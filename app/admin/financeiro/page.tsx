"use client";

import { useEffect, useState } from "react";
import { TrendingUp, CreditCard, AlertTriangle, DollarSign } from "lucide-react";

interface FinanceiroData {
  metricas: {
    mrr: number;
    arr: number;
    churnRate: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    planCounts: Record<string, number>;
    planRevenue: Record<string, number>;
  };
  monthlyRevenue: { month: string; amount: number }[];
  subscriptions: {
    id: string;
    plano: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    criadoEm: string;
    company: { id: string; nome: string; slug: string };
  }[];
  recentPayments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    tipo: string;
    descricao: string | null;
    criadoEm: string;
    companyId: string;
  }[];
}

function formatCurrency(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(cents / 100);
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  canceled: "bg-red-100 text-red-700",
  past_due: "bg-amber-100 text-amber-700",
  trialing: "bg-blue-100 text-blue-700",
};

const paymentStatusColors: Record<string, string> = {
  succeeded: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export default function FinanceiroPage() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "subscriptions" | "payments">("overview");

  useEffect(() => {
    fetch("/api/admin/financeiro")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const { metricas } = data;
  const maxRevenue = Math.max(...data.monthlyRevenue.map((r) => r.amount), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Financeiro</h1>
        <p className="text-muted text-sm mt-1">Receita, assinaturas e pagamentos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-muted font-medium">MRR</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(metricas.mrr)}</p>
          <p className="text-[10px] text-muted mt-1">Receita recorrente mensal</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-muted font-medium">ARR</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(metricas.arr)}</p>
          <p className="text-[10px] text-muted mt-1">Receita recorrente anual</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-muted font-medium">Churn</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{metricas.churnRate}%</p>
          <p className="text-[10px] text-muted mt-1">Taxa de cancelamento (30d)</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-muted font-medium">Assinaturas</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{metricas.activeSubscriptions}</p>
          <p className="text-[10px] text-muted mt-1">de {metricas.totalSubscriptions} total</p>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Receita por Plano</h3>
          <div className="space-y-3">
            {Object.entries(metricas.planCounts).map(([plan, count]) => {
              const revenue = metricas.planRevenue[plan] || 0;
              const pct = metricas.mrr > 0 ? (revenue / metricas.mrr) * 100 : 0;
              return (
                <div key={plan} className="flex items-center gap-3">
                  <div className="w-20">
                    <p className="text-xs font-medium text-foreground capitalize">{plan}</p>
                    <p className="text-[10px] text-muted">{count} empresas</p>
                  </div>
                  <div className="flex-1 h-6 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground w-24 text-right">{formatCurrency(revenue)}</p>
                </div>
              );
            })}
            {Object.keys(metricas.planCounts).length === 0 && (
              <p className="text-xs text-muted text-center py-4">Nenhuma assinatura ativa</p>
            )}
          </div>
        </div>

        {/* Revenue Chart (bar) */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Receita Mensal (6 meses)</h3>
          <div className="flex items-end gap-2 h-40">
            {data.monthlyRevenue.map((r) => (
              <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-[9px] text-muted font-medium">{r.amount > 0 ? formatCurrency(r.amount) : ""}</p>
                <div
                  className="w-full bg-gradient-to-t from-accent to-accent-light rounded-t-md transition-all min-h-[4px]"
                  style={{ height: `${Math.max((r.amount / maxRevenue) * 100, 3)}%` }}
                />
                <p className="text-[9px] text-muted">{r.month}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-border rounded-lg overflow-hidden w-fit">
        {[
          { key: "overview", label: "Visão Geral" },
          { key: "subscriptions", label: "Assinaturas" },
          { key: "payments", label: "Pagamentos" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${tab === t.key ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "subscriptions" && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Plano</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Período</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Desde</th>
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4 text-xs font-medium text-foreground">{s.company.nome}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium capitalize">{s.plano}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                        {s.status}{s.cancelAtPeriodEnd ? " (cancela)" : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted hidden md:table-cell">
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-PT") : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted hidden md:table-cell">
                      {new Date(s.criadoEm).toLocaleDateString("pt-PT")}
                    </td>
                  </tr>
                ))}
                {data.subscriptions.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted text-sm">Nenhuma assinatura</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-bold text-foreground">{formatCurrency(p.amount, p.currency.toUpperCase())}</td>
                    <td className="py-3 px-4 text-xs text-muted capitalize">{p.tipo}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${paymentStatusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted hidden md:table-cell">{p.descricao || "—"}</td>
                    <td className="py-3 px-4 text-xs text-muted hidden md:table-cell">{new Date(p.criadoEm).toLocaleDateString("pt-PT")}</td>
                  </tr>
                ))}
                {data.recentPayments.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted text-sm">Nenhum pagamento</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "overview" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Resumo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted">Total assinaturas</p>
              <p className="text-lg font-bold text-foreground">{metricas.totalSubscriptions}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Ativas</p>
              <p className="text-lg font-bold text-emerald-600">{metricas.activeSubscriptions}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Pagamentos (50 recentes)</p>
              <p className="text-lg font-bold text-foreground">{data.recentPayments.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Receita total (pagamentos)</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(data.recentPayments.filter((p) => p.status === "succeeded").reduce((a, p) => a + p.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
