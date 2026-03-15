"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function ConviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de convite não encontrado.");
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
    <div className="bg-white rounded-2xl border border-black/[0.04] p-8 max-w-md w-full text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Processando convite...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Convite aceito</h2>
          <p className="text-gray-600 text-sm mb-6">{message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 transition-all"
          >
            Ir para o Dashboard
          </button>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 text-sm mb-6">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
          >
            Fazer login
          </button>
        </>
      )}
    </div>
  );
}

export default function ConvitePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-2xl border border-black/[0.04] p-8 max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      }>
        <ConviteContent />
      </Suspense>
    </div>
  );
}
