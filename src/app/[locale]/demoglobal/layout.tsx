"use client";

import '@/components/ui/global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-white">
        {children}
    </div>
  );
}