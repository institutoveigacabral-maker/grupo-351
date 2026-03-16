"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy-load recharts (~50KB) — only downloaded when analytics page is visited
const AnalyticsCharts = dynamic(
  () => import("./AnalyticsCharts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-6 h-72 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ))}
      </div>
    ),
  }
);

interface AnalyticsData {
  monthlyData: { month: string; users: number; companies: number; opportunities: number }[];
  funnel: { label: string; value: number }[];
  topSetores: { setor: string; count: number }[];
  topPaises: { pais: string; count: number }[];
  matchStatus: { status: string; count: number }[];
  oppTypes: { tipo: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Analytics</h1>
        <p className="text-muted text-sm mt-1">Métricas e tendências da plataforma</p>
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
