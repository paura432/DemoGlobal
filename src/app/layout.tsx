import '@/components/ui/global.css';

export const metadata = {
  title: 'TrustOS - Credenciales verificables',
  description: 'El futuro de la identidad digital',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body className="bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
