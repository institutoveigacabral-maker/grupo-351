"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, ArrowRight, Settings, Sparkles, Receipt, FileText, Zap, Users, Bot, Code } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPage } from "@/components/ui/skeleton";

interface PlanData {
  id: string;
  nome: string;
  preco: number;
  features: string[];
  limites: { oportunidades: number; matchesIA: boolean; apiAccess: boolean; membros: number };
}

interface BillingData {
  currentPlan: string;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  plans: PlanData[];
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  tipo: string;
  descricao: string | null;
  criadoEm: string;
}

export default function PlanoPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"planos" | "faturas">("planos");

  useEffect(() => {
    Promise.all([
      fetch("/api/platform/billing").then((r) => r.json()),
      fetch("/api/platform/billing/invoices").then((r) => r.json()),
    ]).then(([billing, inv]) => {
      setData(billing);
      setInvoices(inv.invoices || []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleCheckout(planId: string) {
    setActionLoading(planId);
    try {
      const res = await fetch("/api/platform/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", planId }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else if (error) alert(error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleManage() {
    setActionLoading("manage");
    try {
      const res = await fetch("/api/platform/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manage" }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else if (error) alert(error);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading || !data) return <SkeletonPage />;

  const currentPlanData = data.plans.find((p) => p.id === data.currentPlan);
  const limitIcons = [
    { icon: Zap, label: "Oportunidades", value: currentPlanData?.limites.oportunidades === -1 ? "Ilimitado" : String(currentPlanData?.limites.oportunidades || 0) },
    { icon: Users, label: "Membros", value: currentPlanData?.limites.membros === -1 ? "Ilimitado" : String(currentPlanData?.limites.membros || 0) },
    { icon: Bot, label: "Matches IA", value: currentPlanData?.limites.matchesIA ? "Ativo" : "Inativo" },
    { icon: Code, label: "API", value: currentPlanData?.limites.apiAccess ? "Ativo" : "Inativo" },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader icon={CreditCard} iconBg="bg-violet-50" iconColor="text-violet-600" title="Plano e faturamento" description={`Plano atual: ${data.currentPlan}`} />

      {/* Subscription info + limits */}
      {data.subscription && (
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.subscription.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <p className="text-sm font-medium text-gray-900 capitalize">{data.subscription.status}</p>
              </div>
              {data.subscription.currentPeriodEnd && (
                <p className="text-xs text-gray-400 mt-1">
                  {data.subscription.cancelAtPeriodEnd ? "Cancela em" : "Renova em"}{" "}
                  {new Date(data.subscription.currentPeriodEnd).toLocaleDateString("pt-PT")}
                </p>
              )}
            </div>
            <button
              onClick={handleManage}
              disabled={actionLoading === "manage"}
              className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all disabled:opacity-50 ring-1 ring-gray-200/60"
            >
              <Settings className="w-4 h-4" />
              Gerir assinatura
            </button>
          </div>
          {currentPlanData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-black/[0.04]">
              {limitIcons.map(({ icon: LIcon, label, value }) => (
                <div key={label} className="text-center p-3 bg-gray-50/80 rounded-xl">
                  <LIcon className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("planos")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "planos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Planos
        </button>
        <button
          onClick={() => setTab("faturas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${tab === "faturas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Faturas ({invoices.length})
        </button>
      </div>

      {tab === "planos" && (
        <div className="grid md:grid-cols-3 gap-5">
          {data.plans.map((plan) => {
            const isCurrent = plan.id === data.currentPlan;
            const isPopular = plan.id === "growth";

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 relative transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.04] ${
                  isPopular
                    ? "border-amber-200 bg-gradient-to-b from-amber-50/50 to-white shadow-lg shadow-amber-500/[0.06]"
                    : "border-black/[0.04] bg-white"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[10px] font-bold px-3.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                      <Sparkles className="w-3 h-3" /> Popular
                    </span>
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 text-lg">{plan.nome}</h3>
                <div className="mt-2 mb-5">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">
                    {plan.preco === 0 ? "Gratis" : `${plan.preco / 100}€`}
                  </span>
                  {plan.preco > 0 && <span className="text-sm text-gray-400 ml-1">/mes</span>}
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full text-center py-2.5 rounded-xl bg-gray-50 text-gray-400 text-sm font-medium ring-1 ring-gray-100">
                    Plano atual
                  </div>
                ) : plan.preco === 0 ? (
                  <div className="w-full text-center py-2.5 rounded-xl bg-gray-50 text-gray-300 text-sm">
                    Incluido
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={actionLoading === plan.id}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                      isPopular
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/20"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {actionLoading === plan.id ? "Processando..." : "Assinar"}
                    {!actionLoading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "faturas" && (
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-sm">
          {invoices.length === 0 ? (
            <EmptyState icon={FileText} title="Nenhuma fatura encontrada" description="Suas faturas aparecerão aqui após a primeira cobrança." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.04] bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Descricao</th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(inv.criadoEm).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-medium">
                        {inv.descricao || inv.tipo}
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-semibold tabular-nums">
                        {(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                          inv.status === "succeeded" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10" :
                          inv.status === "pending" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10" :
                          "bg-red-50 text-red-700 ring-1 ring-red-600/10"
                        }`}>
                          {inv.status === "succeeded" ? "Pago" : inv.status === "pending" ? "Pendente" : "Falhou"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
