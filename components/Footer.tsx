import Link from "next/link";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/sobre", label: "Sobre" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/ecossistema", label: "Ecossistema" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/conhecimento", label: "Conhecimento" },
  { href: "/imprensa", label: "Imprensa" },
  { href: "/aplicar", label: "Aplicar" },
  { href: "/contato", label: "Contato" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111d2e] text-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/">
              <Logo className="text-white" size={28} />
            </Link>
            <p className="text-white/40 text-[13px] mt-3 leading-relaxed max-w-xs">
              Hub de Negócios e Joint Ventures sediado em Cascais, Portugal. Arquitetura FIGITAL.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[11px] text-white/25 uppercase tracking-[0.15em] font-medium mb-4">
              Navegação
            </p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-[13px] text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] text-white/25 uppercase tracking-[0.15em] font-medium mb-4">
              Contacto
            </p>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Cascais, Portugal
            </p>
            <a
              href="mailto:contato@grupo351.com"
              className="text-[13px] text-accent-light hover:text-white transition-colors duration-300 mt-3 inline-block"
            >
              contato@grupo351.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/25">
            &copy; {year} Grupo +351. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/legal/privacidade"
              className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-300"
            >
              Privacidade
            </a>
            <a
              href="/legal/termos"
              className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-300"
            >
              Termos
            </a>
            <a
              href="/admin/login"
              className="text-[11px] text-white/[0.08] hover:text-white/25 transition-colors duration-300"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
