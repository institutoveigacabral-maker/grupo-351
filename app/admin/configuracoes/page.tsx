"use client";

import { useEffect, useState } from "react";
import { Save, Settings, Bell, CreditCard, Globe } from "lucide-react";

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateSetting(key: string, value: unknown) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Configurações</h1>
          <p className="text-muted text-sm mt-1">Configurações gerais da plataforma</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-accent text-white hover:bg-accent-light"
          } disabled:opacity-50`}
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Geral */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Geral</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nome da plataforma</label>
            <input
              type="text"
              className={inputClass}
              value={(settings["plataforma.nome"] as string) || ""}
              onChange={(e) => updateSetting("plataforma.nome", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Email de contato</label>
            <input
              type="email"
              className={inputClass}
              value={(settings["plataforma.email_contato"] as string) || ""}
              onChange={(e) => updateSetting("plataforma.email_contato", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings["plataforma.manutencao"]}
                onChange={(e) => updateSetting("plataforma.manutencao", e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Modo manutenção</p>
                <p className="text-xs text-muted">Bloqueia acesso à plataforma para utilizadores</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Planos */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Planos e Preços</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Growth (centavos EUR)</label>
            <input
              type="number"
              className={inputClass}
              value={(settings["planos.growth.preco"] as number) || 0}
              onChange={(e) => updateSetting("planos.growth.preco", parseInt(e.target.value))}
            />
            <p className="text-[10px] text-muted mt-1">{((settings["planos.growth.preco"] as number) / 100).toFixed(2)} EUR/mês</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Enterprise (centavos EUR)</label>
            <input
              type="number"
              className={inputClass}
              value={(settings["planos.enterprise.preco"] as number) || 0}
              onChange={(e) => updateSetting("planos.enterprise.preco", parseInt(e.target.value))}
            />
            <p className="text-[10px] text-muted mt-1">{((settings["planos.enterprise.preco"] as number) / 100).toFixed(2)} EUR/mês</p>
          </div>
        </div>
      </div>

      {/* Notificacoes */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Notificações Admin</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "notificacoes.novo_user", label: "Novo utilizador", desc: "Notificar quando um utilizador se registar" },
            { key: "notificacoes.nova_candidatura", label: "Nova candidatura", desc: "Notificar quando uma candidatura for submetida" },
            { key: "notificacoes.deal_fechado", label: "Deal fechado", desc: "Notificar quando um match for marcado como fechado" },
            { key: "notificacoes.pagamento", label: "Novo pagamento", desc: "Notificar quando um pagamento for processado" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings[item.key]}
                onChange={(e) => updateSetting(item.key, e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
