"use client";

import { useState, useEffect } from "react";
import { Building2, Lightbulb, Globe, ArrowRight, X, Check } from "lucide-react";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  btnLabel: string;
}

const steps: OnboardingStep[] = [
  {
    id: "company",
    icon: Building2,
    title: "Crie o perfil da sua empresa",
    description: "Preencha os dados da sua empresa para ser encontrado por parceiros.",
    href: "/dashboard/empresa",
    btnLabel: "Criar empresa",
  },
  {
    id: "opportunity",
    icon: Lightbulb,
    title: "Publique sua primeira oportunidade",
    description: "Descreva o que procura: parceria, investimento, franquia ou fornecedor.",
    href: "/dashboard/oportunidades",
    btnLabel: "Criar oportunidade",
  },
  {
    id: "marketplace",
    icon: Globe,
    title: "Explore o marketplace",
    description: "Descubra empresas e oportunidades compatíveis com o seu perfil.",
    href: "/marketplace",
    btnLabel: "Explorar",
  },
];

interface OnboardingTourProps {
  hasCompany: boolean;
  hasOpportunity: boolean;
}

export function OnboardingTour({ hasCompany, hasOpportunity }: OnboardingTourProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem("onboarding_dismissed") === "true");
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("onboarding_dismissed", "true");
  }

  if (dismissed) return null;

  const completedSteps = [
    hasCompany,
    hasOpportunity,
    hasCompany, // marketplace is always "available"
  ];

  const allDone = hasCompany && hasOpportunity;
  if (allDone) return null;

  const progress = completedSteps.filter(Boolean).length;
  const total = steps.length;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Primeiros passos</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Complete estes passos para aproveitar ao máximo a plataforma.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 font-medium">{progress}/{total}</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const completed = completedSteps[i];
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                completed ? "bg-white/50" : "bg-white"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                completed ? "bg-emerald-100" : "bg-amber-100"
              }`}>
                {completed ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Icon className="w-4 h-4 text-amber-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
              </div>

              {!completed && (
                <Link
                  href={step.href}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-500 transition-colors"
                >
                  {step.btnLabel}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
