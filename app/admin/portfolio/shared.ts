import {
  Printer,
  ShoppingBag,
  Brain,
  Dumbbell,
  Briefcase,
  Rocket,
  Store,
  Lightbulb,
  Wrench,
  Globe,
  Layers,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  printer: Printer,
  "shopping-bag": ShoppingBag,
  brain: Brain,
  dumbbell: Dumbbell,
  briefcase: Briefcase,
  rocket: Rocket,
  store: Store,
  lightbulb: Lightbulb,
  wrench: Wrench,
  globe: Globe,
  layers: Layers,
};

export const iconOptions = Object.keys(iconMap);

export const statusOptions = [
  "Ideacao",
  "Em estruturacao",
  "Em desenvolvimento",
  "Em operacao",
  "Consolidado",
] as const;

export const statusColor: Record<string, string> = {
  Ideacao: "bg-purple-400",
  "Em estruturacao": "bg-muted",
  "Em desenvolvimento": "bg-warning",
  "Em operacao": "bg-success",
  Consolidado: "bg-blue-500",
};

export interface Projeto {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  detalhes: string[];
  tag: string;
  status: string;
  mercado: string;
  parceiro?: string;
  controle: string;
  icon: string;
  socio?: string;
  porcentagem?: number;
  notasInternas?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const emptyProjeto: Projeto = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  detalhes: [""],
  tag: "",
  status: "Em estruturacao",
  mercado: "",
  parceiro: "",
  controle: "",
  icon: "briefcase",
  socio: "",
  porcentagem: undefined,
};

export const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/40";
