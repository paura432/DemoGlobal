'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';
import '@/components/ui/global.css';

export default function HealthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const hideLayout =
  !!pathname?.match(/\/credenciales-profesionales\/ministerio(?:\/|$)/) ||
  !!pathname?.match(/\/titulos_academicos\/shopyfy(?:\/|$)/);

  if (hideLayout) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-16 flex-shrink-0">
        <Header />
      </div>
      <main className="flex-1 overflow-hidden flex justify-center">
        <div className="w-full max-w-[1000px] px-4 sm:px-10 flex flex-col h-full">
          {children}
        </div>
      </main>
    </div>
  );
}