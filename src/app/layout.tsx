"use client";

import '@/components/ui/global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
