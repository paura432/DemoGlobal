'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

type Phase = 'loading' | 'qr' | 'error';

const QR_SIZE = 150;

type PermisoTranslations = {
  header: { title: string; subtitle: string };
  loading: { issuing: string; generating: string };
  qr: { title: string; instruction: string; button: string; hint: string };
  error: { title: string; retry: string };
  footer: string;
};

export default function PermisoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [t, setT] = useState<PermisoTranslations | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedWrapQr, setIssuedWrapQr] = useState('');
  const hasIssuedRef = useRef(false);

  // 🌍 Cargar traducciones dinámicamente
  useEffect(() => {
    (async () => {
      const res = await fetch(`/locales/tramites_licencias/vehiculo/ciudadano/permisoCirculacion/${locale}.json`);
      const json = await res.json();
      setT(json);
    })();
  }, [locale]);

  // 🔹 Emitir credencial
  const issueCredential = async () => {
    try {
      setIssuing(true);
      setIssueError(null);
      setIssuedWrapQr('');

      const apiurl = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';
      const payload = {
        schema: 'permisoCirculacion',
        credential: {
          Nombre: 'Carlos',
          Apellidos: 'García López',
          FechaMatriculación: '2022-03-15',
          Marca: 'Seat León 1.6 TDI',
          Matricula: 'ABC1234',
          Seguro: 'Activo',
          TipoVehículo: 'Turismo'
        }
      };

      const res = await fetch(`${apiurl}/api/v1/createCredential/procivis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setIssuedWrapQr(data.urls.appUrl);
      setPhase('qr');
    } catch (e: unknown) {
      const error = e as Error;
      setIssueError(error?.message ?? 'Error al emitir credencial');
      setPhase('error');
    } finally {
      setIssuing(false);
    }
  };

  useEffect(() => {
    if (hasIssuedRef.current) return;
    hasIssuedRef.current = true;
    issueCredential();
  }, []);

  // ✅ Botón al completar escaneo
  const handleScanComplete = () => {
    localStorage.setItem('permisoCompleted', 'true');
    router.push(`/${locale}/tramites_licencias/vehiculo/ciudadano`);
  };

  if (!t) return <div className="p-10 text-center text-gray-500">Cargando interfaz...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0066CC] to-[#004A99] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center gap-2">
          <div className="bg-white rounded-full p-1.5">
            <svg className="w-6 h-6 text-[#0066CC]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55 0.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold">{t.header.title}</h1>
            <p className="text-[10px] text-blue-100">{t.header.subtitle}</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-sm">
          {/* Loading */}
          {phase === 'loading' && (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">
                {issuing ? t.loading.issuing : t.loading.generating}
              </p>
            </div>
          )}

          {/* QR */}
          {phase === 'qr' && issuedWrapQr && (
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">{t.qr.title}</h2>
              <p className="text-xs text-gray-700 text-center mb-2">{t.qr.instruction}</p>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border-2 border-[#0066CC] flex justify-center mb-2">
                <QRCodeCanvas value={issuedWrapQr} size={QR_SIZE} />
              </div>

              <div className="text-center mt-3">
                <button
                  onClick={handleScanComplete}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-sm rounded-full font-medium transition"
                >
                  {t.qr.button}
                </button>
                <p className="text-[10px] text-gray-500 mt-1">{t.qr.hint}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="bg-white rounded-xl shadow-md p-5 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-xs text-red-600 mb-3">{issueError || t.error.title}</p>
              <button
                onClick={() => {
                  hasIssuedRef.current = false;
                  issueCredential();
                }}
                className="text-blue-600 text-xs hover:underline"
              >
                {t.error.retry}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-3 text-center text-[11px]">
        {t.footer}
      </footer>
    </div>
  );
}
