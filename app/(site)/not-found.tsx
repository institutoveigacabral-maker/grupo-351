import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="pt-16 min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-8xl font-bold text-border mb-4 font-display">404</p>
        <h1 className="text-3xl font-bold text-primary font-display mb-4">
          Página não encontrada
        </h1>
        <p className="text-muted text-lg mb-8 max-w-md mx-auto">
          A página que procura não existe ou foi movida. Volte à página inicial
          para continuar a navegar.
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-light transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
