// src/app/[locale]/titulos_academicos/layout.tsx
import type { ReactNode } from "react";

export default function CredencialesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col bg-white">
    
      {children}
    </div>
  );
}
