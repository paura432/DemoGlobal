'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';
import '@/components/ui/global.css';
import FooterDemo from '@/components/ui/footer';


export default function HealthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add('loaded');
  }, []);
  
  const hideLayout =
    !!pathname?.match(/\/credenciales-profesionales\/ministerio(?:\/|$)/) ||
    !!pathname?.match(/\/titulos_academicos\/shopyfy(?:\/|$)/) ||
    !!pathname?.match(/\/tramites_licencias\/vehiculo(?:\/|$)/);

  if (hideLayout) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header con altura flexible */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Main content responsive */}
      <main className="flex-1 flex justify-center w-full">
        {!!pathname?.match(/demoglobal(?:\/|$)/) ? (
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-8 flex flex-col">
            {children}
          </div>
         ) : (
          <div className="w-full max-w-[1000px] max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 flex flex-coll">
            {children}
          </div>
        )}
      </main>

      <FooterDemo />
    </div>
  );
}

