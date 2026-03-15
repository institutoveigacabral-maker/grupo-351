"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-2xl backdrop-saturate-[180%] rounded-2xl border border-black/[0.06] shadow-2xl shadow-black/[0.08] p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-semibold text-[14px] mb-0.5">
                  Utilizamos cookies
                </p>
                <p className="text-muted text-[13px] leading-relaxed">
                  Este site utiliza cookies essenciais. Ao continuar, concorda com a{" "}
                  <a href="/legal/privacidade" className="text-accent hover:underline">
                    Política de Privacidade
                  </a>.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={decline}
                  className="px-4 py-2 text-[13px] font-medium text-muted hover:text-foreground rounded-xl hover:bg-black/[0.04] transition-all duration-300"
                >
                  Recusar
                </button>
                <button
                  onClick={accept}
                  className="px-5 py-2 text-[13px] font-medium text-white bg-primary rounded-xl hover:bg-primary-light active:scale-[0.97] transition-all duration-300"
                >
                  Aceitar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
