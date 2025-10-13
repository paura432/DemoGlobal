"use client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-white">
        {children}
    </div>
  );
}