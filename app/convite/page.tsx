"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function ConviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("Token de convite nao encontrado.");
      });
      return;
    }

    fetch("/api/platform/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          setStatus("success");
          setMessage(data.message || "Convite aceito com sucesso!");
        } else {
          setStatus("error");
          setMessage(data.error || "Erro ao aceitar convite.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro de rede. Tente novamente.");
      });
  }, [token]);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.06] p-10 max-w-md w-full text-center shadow-2xl shadow-black/20">
      {status === "loading" && (
        <div className="space-y-4">
          <Skeleton className="w-14 h-14 rounded-2xl mx-auto bg-white/[0.06]" />
          <Skeleton className="h-5 w-48 mx-auto bg-white/[0.06]" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/[0.06]" />
        </div>
      )}
      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Convite aceito</h2>
          <p className="text-white/40 text-sm mb-8">{message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-7 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all"
          >
            Ir para o Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}
      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Erro</h2>
          <p className="text-white/40 text-sm mb-8">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 bg-white/[0.06] text-white/80 px-7 py-3 rounded-xl text-sm font-medium hover:bg-white/[0.1] transition-all border border-white/[0.06]"
          >
            Fazer login
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default function ConvitePage() {
  return (
    <div className="min-h-screen bg-[#080e1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      <Suspense fallback={
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.06] p-10 max-w-md w-full text-center shadow-2xl shadow-black/20">
          <Skeleton className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-white/[0.06]" />
          <Skeleton className="h-5 w-48 mx-auto mb-2 bg-white/[0.06]" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/[0.06]" />
        </div>
      }>
        <ConviteContent />
      </Suspense>
    </div>
  );
}
