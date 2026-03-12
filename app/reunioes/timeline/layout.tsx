import { Suspense } from "react";

export const metadata = {
  title: "Reunioes - Grupo +351",
};

export default function ReunioesLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  }>{children}</Suspense>;
}
