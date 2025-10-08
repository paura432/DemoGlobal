import { DemoProvider } from '@/components/ui/demoContext';

export default function AtributosVerificadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoProvider>
    <div className="h-screen flex flex-col bg-white">

      {children}
    </div>
  </DemoProvider>
    ;
}