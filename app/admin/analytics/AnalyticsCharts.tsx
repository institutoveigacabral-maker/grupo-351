"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  monthlyData: { month: string; users: number; companies: number; opportunities: number }[];
  funnel: { label: string; value: number }[];
  topSetores: { setor: string; count: number }[];
  topPaises: { pais: string; count: number }[];
  matchStatus: { status: string; count: number }[];
  oppTypes: { tipo: string; count: number }[];
}

const COLORS = ["#d97706", "#2563eb", "#059669", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#4f46e5"];

const matchStatusLabels: Record<string, string> = {
  sugerido: "Sugerido",
  aceito: "Aceito",
  recusado: "Recusado",
  "em-conversa": "Em conversa",
  fechado: "Fechado",
};

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const maxFunnel = Math.max(...data.funnel.map((f) => f.value), 1);

  return (
    <>
      {/* Growth Chart */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Crescimento Mensal (12 meses)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#999" }} />
            <YAxis tick={{ fontSize: 11, fill: "#999" }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eee" }}
            />
            <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} name="Utilizadores" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="companies" stroke="#7c3aed" strokeWidth={2} name="Empresas" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="opportunities" stroke="#059669" strokeWidth={2} name="Oportunidades" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Funil de Conversão</h3>
          <div className="space-y-3">
            {data.funnel.map((step, i) => {
              const pct = maxFunnel > 0 ? (step.value / maxFunnel) * 100 : 0;
              const convRate = i > 0 && data.funnel[i - 1].value > 0
                ? Math.round((step.value / data.funnel[i - 1].value) * 100)
                : 100;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <p className="text-xs font-medium text-foreground">{step.label}</p>
                    {i > 0 && (
                      <p className="text-[9px] text-muted">{convRate}% conversão</p>
                    )}
                  </div>
                  <div className="flex-1 h-8 bg-surface rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max(pct, 5)}%`,
                        background: `linear-gradient(90deg, ${COLORS[i]}, ${COLORS[i]}88)`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-white">{step.value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Setores */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Setores</h3>
          {data.topSetores.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topSetores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#999" }} />
                <YAxis dataKey="setor" type="category" tick={{ fontSize: 10, fill: "#666" }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eee" }} />
                <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} name="Empresas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Match Status Pie */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição de Deals</h3>
          {data.matchStatus.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Sem dados</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={data.matchStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data.matchStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {data.matchStatus.map((m, i) => (
                  <div key={m.status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-foreground">{matchStatusLabels[m.status] || m.status}</span>
                    <span className="text-xs font-bold text-muted">{m.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Paises */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Empresas por País</h3>
          {data.topPaises.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Sem dados</p>
          ) : (
            <div className="space-y-2">
              {data.topPaises.map((p, i) => {
                const maxPais = data.topPaises[0]?.count || 1;
                const pct = (p.count / maxPais) * 100;
                return (
                  <div key={p.pais} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-foreground w-20 shrink-0">{p.pais}</span>
                    <div className="flex-1 h-5 bg-surface rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{ width: `${Math.max(pct, 5)}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted w-8 text-right">{p.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Opportunity Types */}
        <div className="bg-white rounded-xl border border-border p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tipos de Oportunidade</h3>
          {data.oppTypes.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.oppTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: "#666" }} />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Oportunidades" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
