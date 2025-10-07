'use client';

import { DemoProvider } from '@/components/ui/demoContext';
import Image from 'next/image';

export default function AtributosVerificadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Header estilo DGT */}
        {/* <header className="bg-orange-500 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 px-4">
            <Image
              src="/images/dgt-logo.png" // 👉 pon aquí el logo de la DGT o uno genérico
              alt="DGT"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-white text-lg font-bold tracking-wide">
              Dirección General de Tráfico
            </h1>
          </div>
        </header> */}

        {/* Contenido de la demo */}
        <main className="flex-1">{children}</main>

        {/* Footer opcional */}
        {/* <footer className="bg-orange-600 text-white text-sm py-2 text-center">
          Demo de credenciales verificables · Telefónica Tech · DGT
        </footer> */}
      </div>
    </DemoProvider>
  );
}
