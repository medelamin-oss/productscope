"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            borderRadius: "10px",
            padding: "12px 16px",
          },
          error: {
            style: { background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" },
          },
          success: {
            style: { background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" },
          },
        }}
      />
    </>
  );
}
