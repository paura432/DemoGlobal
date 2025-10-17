'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';
import '@/components/ui/global.css';
import FooterDemo from '@/components/ui/footer';

export default function HealthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showFooter, setShowFooter] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.classList.add('loaded');
  }, []);

  useEffect(() => {
    setShowFooter(false);
    
    const checkContent = () => {
      if (mainRef.current) {
        const hasContent = mainRef.current.textContent && 
                          mainRef.current.textContent.trim().length > 100;
        
        if (hasContent) {
          clearTimeout(fallbackTimer);
          setTimeout(() => setShowFooter(true), 50);
          return true;
        }
      }
      return false;
    };

    const checkInterval = setInterval(() => {
      if (checkContent()) {
        clearInterval(checkInterval);
      }
    }, 100);

    const fallbackTimer = setTimeout(() => {
      clearInterval(checkInterval);
      setShowFooter(true);
    }, 1500);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  const hideLayout =
    pathname === '/' || 
    pathname === '/en' || 
    pathname === '/es' ||
    /^\/(es|en)\/demoglobal$/.test(pathname || '') ||
    pathname?.includes('/credenciales-profesionales/ministerio') ||
    pathname?.includes('/titulos_academicos/shopyfy') ||
    pathname?.includes('/tramites_licencias/vehiculo') ||
    pathname?.includes('/atributos_verificados/ministerio') ||
    pathname?.includes('/atributos_verificados/adquira') ||
    pathname?.includes('/atributos_verificados/credenciales-bancarias');

  if (hideLayout) {
    return <div className="bg-white">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
  
      <main ref={mainRef} className="flex justify-center w-full flex-grow">
          <div className="w-full max-w-[1000px] px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
      </main>
      
      {showFooter && (
        <div className="mt-auto">
          <FooterDemo />
        </div>
      )}
    </div>
  );
}