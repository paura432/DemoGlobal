import { DemoProvider } from '@/components/ui/demoContext';

export default function AtributosVerificadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoProvider>{children}</DemoProvider>;
}