import { DemoProvider } from '@/components/ui/demoContext';

export default function AtributosVerificadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-white">
      <DemoProvider>
      {children}
      </DemoProvider>
    </div>
  );
}