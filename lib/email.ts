import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Grupo +351 <noreply@grupo351.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";

/** Escape HTML special characters to prevent XSS in email templates. */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailContato {
  nome: string;
  email: string;
  tipo: string;
  empresa?: string;
  orcamento?: string;
  mensagem: string;
}

interface EmailCandidatura {
  nome: string;
  email: string;
  perfil: string;
  modelo: string[];
  capitalDisponivel: string;
  motivacao: string;
}

/**
 * Envia email de confirmação ao remetente + notificação ao admin
 */
export async function sendContatoEmails(data: EmailContato) {
  if (!resend) return;

  // Confirmação para quem enviou
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: "Recebemos sua mensagem — Grupo +351",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 0; border-bottom: 1px solid #eee;">
          <h1 style="font-size: 20px; color: #0B1D32; margin: 0;">Grupo +351</h1>
        </div>
        <div style="padding: 32px 0;">
          <p>Olá <strong>${esc(data.nome)}</strong>,</p>
          <p>Recebemos sua mensagem e entraremos em contato em até <strong>48 horas úteis</strong>.</p>
          <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #666; font-size: 13px;">Resumo da sua mensagem:</p>
            <p style="margin: 0 0 4px;"><strong>Tipo:</strong> ${esc(data.tipo)}</p>
            ${data.empresa ? `<p style="margin: 0 0 4px;"><strong>Empresa:</strong> ${esc(data.empresa)}</p>` : ""}
            ${data.orcamento ? `<p style="margin: 0 0 4px;"><strong>Orçamento:</strong> ${esc(data.orcamento)}</p>` : ""}
            <p style="margin: 8px 0 0; font-size: 14px; color: #444;">${esc(data.mensagem.slice(0, 200))}${data.mensagem.length > 200 ? "..." : ""}</p>
          </div>
          <p style="color: #666; font-size: 13px;">Cascais, Portugal<br/>contato@grupo351.com</p>
        </div>
      </div>
    `,
  }).catch((err) => console.error("Email confirmação falhou:", err));

  // Notificação ao admin
  if (ADMIN_EMAIL) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nova mensagem: ${data.nome} — ${data.tipo}`,
      html: `
        <div style="font-family: system-ui, sans-serif; color: #1a1a1a;">
          <h2 style="color: #0B1D32;">Nova mensagem de contato</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nome</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.nome)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Tipo</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.tipo)}</td></tr>
            ${data.empresa ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Empresa</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.empresa)}</td></tr>` : ""}
            ${data.orcamento ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Orçamento</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.orcamento)}</td></tr>` : ""}
          </table>
          <div style="background: #f8f9fb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${esc(data.mensagem)}</p>
          </div>
          <p><a href="https://grupo351.com/admin/contatos">Ver no painel</a></p>
        </div>
      `,
    }).catch((err) => console.error("Email admin falhou:", err));
  }
}

// ─── Team Invite ───

interface TeamInviteEmail {
  to: string;
  empresaNome: string;
  convidadoPor: string;
  role: string;
  token: string;
}

export async function sendTeamInviteEmail(data: TeamInviteEmail) {
  if (!resend) return;

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://grupo351.com"}/convite?token=${data.token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.to,
    subject: `Convite para equipe — ${data.empresaNome}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 0; border-bottom: 1px solid #eee;">
          <h1 style="font-size: 20px; color: #0B1D32; margin: 0;">Grupo +351</h1>
        </div>
        <div style="padding: 32px 0;">
          <p>Olá,</p>
          <p><strong>${esc(data.convidadoPor)}</strong> convidou-o para fazer parte da equipe de <strong>${esc(data.empresaNome)}</strong> na plataforma Grupo +351.</p>
          <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px;"><strong>Empresa:</strong> ${esc(data.empresaNome)}</p>
            <p style="margin: 0;"><strong>Cargo:</strong> ${data.role === "admin" ? "Administrador" : "Membro"}</p>
          </div>
          <a href="${acceptUrl}" style="display: inline-block; background: #D4A853; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Aceitar convite
          </a>
          <p style="color: #666; font-size: 13px; margin-top: 24px;">Este convite expira em 7 dias. Se não reconhece este convite, ignore este email.</p>
          <p style="color: #666; font-size: 13px;">Cascais, Portugal<br/>contato@grupo351.com</p>
        </div>
      </div>
    `,
  }).catch((err) => console.error("Email convite equipe falhou:", err));
}

export async function sendCandidaturaEmails(data: EmailCandidatura) {
  if (!resend) return;

  // Confirmação para o candidato
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: "Candidatura recebida — Grupo +351",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 0; border-bottom: 1px solid #eee;">
          <h1 style="font-size: 20px; color: #0B1D32; margin: 0;">Grupo +351</h1>
        </div>
        <div style="padding: 32px 0;">
          <p>Olá <strong>${esc(data.nome)}</strong>,</p>
          <p>Recebemos sua candidatura para Joint Venture e ela será analisada pela equipa de governança em até <strong>5 dias úteis</strong>.</p>
          <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px;"><strong>Perfil:</strong> ${esc(data.perfil)}</p>
            <p style="margin: 0 0 4px;"><strong>Marcas de interesse:</strong> ${esc(data.modelo.join(", ") || "Não especificado")}</p>
            <p style="margin: 0 0 4px;"><strong>Capital disponível:</strong> ${esc(data.capitalDisponivel)}</p>
          </div>
          <p style="color: #666; font-size: 13px;">Próximos passos: análise do perfil, entrevista preliminar e proposta de modelo.</p>
          <p style="color: #666; font-size: 13px;">Cascais, Portugal<br/>contato@grupo351.com</p>
        </div>
      </div>
    `,
  }).catch((err) => console.error("Email confirmação candidatura falhou:", err));

  // Notificação ao admin
  if (ADMIN_EMAIL) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nova candidatura JV: ${data.nome}`,
      html: `
        <div style="font-family: system-ui, sans-serif; color: #1a1a1a;">
          <h2 style="color: #0B1D32;">Nova candidatura de Joint Venture</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nome</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.nome)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Perfil</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.perfil)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Marcas</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.modelo.join(", "))}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Capital</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${esc(data.capitalDisponivel)}</td></tr>
          </table>
          <div style="background: #f8f9fb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-weight: bold;">Motivação:</p>
            <p style="margin: 0; white-space: pre-wrap;">${esc(data.motivacao)}</p>
          </div>
          <p><a href="https://grupo351.com/admin/candidaturas">Ver no painel</a></p>
        </div>
      `,
    }).catch((err) => console.error("Email admin candidatura falhou:", err));
  }
}

// ─── Platform Workflow Emails ───

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grupo351.com";

function emailWrapper(content: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <div style="padding: 32px 0; border-bottom: 1px solid #eee;">
        <h1 style="font-size: 20px; color: #0B1D32; margin: 0;">Grupo +351</h1>
      </div>
      <div style="padding: 32px 0;">
        ${content}
        <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
          Cascais, Portugal — <a href="${BASE_URL}" style="color: #D4A853;">grupo351.com</a>
        </p>
      </div>
    </div>
  `;
}

export async function sendWelcomeEmail(data: { nome: string; email: string }) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: "Bem-vindo à plataforma Grupo +351",
    html: emailWrapper(`
      <p>Olá <strong>${esc(data.nome)}</strong>,</p>
      <p>Sua conta na plataforma Grupo +351 foi criada com sucesso.</p>
      <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-weight: bold;">Próximos passos:</p>
        <p style="margin: 0 0 4px;">1. Complete o perfil da sua empresa</p>
        <p style="margin: 0 0 4px;">2. Publique sua primeira oportunidade</p>
        <p style="margin: 0;">3. Receba matches inteligentes</p>
      </div>
      <a href="${BASE_URL}/dashboard" style="display: inline-block; background: #D4A853; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Acessar Dashboard
      </a>
    `),
  }).catch((err) => console.error("Email welcome falhou:", err));
}

export async function sendMatchFoundEmail(data: {
  nome: string;
  email: string;
  oportunidade: string;
  score: number;
  matchId: string;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Novo match: ${data.oportunidade}`,
    html: emailWrapper(`
      <p>Olá <strong>${esc(data.nome)}</strong>,</p>
      <p>Encontrámos um match para a sua oportunidade!</p>
      <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 4px;"><strong>Oportunidade:</strong> ${esc(data.oportunidade)}</p>
        <p style="margin: 0;"><strong>Score de compatibilidade:</strong> ${data.score}%</p>
      </div>
      <a href="${BASE_URL}/dashboard/matches" style="display: inline-block; background: #D4A853; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Ver match
      </a>
    `),
  }).catch((err) => console.error("Email match falhou:", err));
}

export async function sendMessageReceivedEmail(data: {
  nome: string;
  email: string;
  remetente: string;
  preview: string;
  matchId: string;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Nova mensagem de ${data.remetente}`,
    html: emailWrapper(`
      <p>Olá <strong>${esc(data.nome)}</strong>,</p>
      <p><strong>${esc(data.remetente)}</strong> enviou-lhe uma mensagem:</p>
      <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; color: #444; font-style: italic;">"${esc(data.preview.slice(0, 200))}${data.preview.length > 200 ? "..." : ""}"</p>
      </div>
      <a href="${BASE_URL}/dashboard/matches" style="display: inline-block; background: #D4A853; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Responder
      </a>
    `),
  }).catch((err) => console.error("Email message falhou:", err));
}
