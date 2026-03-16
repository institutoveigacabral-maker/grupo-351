"use client";

import { Toaster as SonnerToaster } from "sonner";

export { toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className:
          "!bg-white !border !border-black/[0.06] !shadow-lg !shadow-black/[0.08] !rounded-xl !text-sm !text-gray-900 !font-sans",
        descriptionClassName: "!text-gray-500 !text-xs",
      }}
      closeButton
      richColors
      expand={false}
      duration={4000}
    />
  );
}
