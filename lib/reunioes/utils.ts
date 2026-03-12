export function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function daysSince(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function cleanName(name: string) {
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
}

export function healthScore(project: {
  dataUltima: string;
  prioridade: string;
  checkDone: number;
  checkTotal: number;
  totalAcoes: number;
  responsavel: string;
}): number {
  let score = 0;
  const days = daysSince(project.dataUltima);

  // Recency (30%)
  if (days <= 7) score += 30;
  else if (days <= 14) score += 21;
  else if (days <= 30) score += 12;
  else score += 3;

  // Checklist progress (25%)
  if (project.checkTotal > 0) {
    score += Math.round((project.checkDone / project.checkTotal) * 25);
  } else {
    score += 10;
  }

  // Has actions defined (20%)
  if (project.totalAcoes > 10) score += 20;
  else if (project.totalAcoes > 5) score += 15;
  else if (project.totalAcoes > 0) score += 10;

  // Has responsible (15%)
  if (project.responsavel) score += 15;

  // Priority alignment - higher priority with activity = better (10%)
  const prioWeight = { critica: 10, alta: 8, media: 6, baixa: 4 };
  if (days <= 14) score += prioWeight[project.prioridade as keyof typeof prioWeight] || 4;

  return Math.min(100, score);
}

export function healthColor(score: number) {
  if (score >= 70) return { ring: "stroke-emerald-500", text: "text-emerald-600", bg: "bg-emerald-500" };
  if (score >= 40) return { ring: "stroke-amber-500", text: "text-amber-600", bg: "bg-amber-500" };
  return { ring: "stroke-red-500", text: "text-red-500", bg: "bg-red-500" };
}
