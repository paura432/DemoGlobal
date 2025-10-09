"use client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-white">
        {children}
    </div>
  );
}