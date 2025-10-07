'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// 🧩 Tipado para traducciones
type CiudadanoTranslations = {
  header: { title: string; subtitle: string };
  alert: { title: string; intro: string };
  carnet: { title: string; desc: string; action: string };
  permiso: { title: string; desc: string; action: string };
  info: { title: string; points: string[] };
  buttons: { back: string; goPolicia: string };
};

// 🔹 Iconos SVG
function CarnetIcon() {
  return (
    <svg className="w-14 h-14 mb-2" viewBox="0 0 100 100" fill="none">
      <rect x="10" y="20" width="80" height="60" rx="4" fill="#0066CC" />
      <rect x="15" y="25" width="70" height="50" rx="2" fill="#4D94FF" />
      <circle cx="32" cy="45" r="8" fill="white" />
      <rect x="45" y="38" width="30" height="3" rx="1.5" fill="white" />
      <rect x="45" y="45" width="25" height="3" rx="1.5" fill="white" />
      <rect x="45" y="52" width="20" height="3" rx="1.5" fill="white" />
      <rect x="15" y="62" width="35" height="8" rx="2" fill="#FFD700" />
    </svg>
  );
}

function PermisoIcon() {
  return (
    <svg className="w-14 h-14 mb-2" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="15" width="70" height="70" rx="4" fill="white" stroke="#0066CC" strokeWidth="3" />
      <rect x="20" y="20" width="60" height="15" rx="2" fill="#0066CC" />
      <text x="50" y="31" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">PERMISO</text>
      <rect x="25" y="42" width="25" height="18" rx="2" fill="#E8F4FF" />
      <text x="37.5" y="48" fontSize="5" fill="#0066CC" textAnchor="middle">MATRÍCULA</text>
      <text x="37.5" y="56" fontSize="9" fill="#0066CC" textAnchor="middle" fontWeight="bold">1234-ABC</text>
      <rect x="55" y="42" width="20" height="18" rx="2" fill="#FFD700" />
      <circle cx="65" cy="51" r="7" fill="#0066CC" opacity="0.3" />
      <path d="M61 51 L64 54 L69 48" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export default function CiudadanoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [t, setT] = useState<CiudadanoTranslations | null>(null);

  // 🔹 Cargar traducciones dinámicamente
  useEffect(() => {
    (async () => {
      const res = await fetch(`/locales/tramites_licencias/vehiculo/ciudadano/${locale}.json`);
      const json = await res.json();
      setT(json);
    })();
  }, [locale]);

  if (!t) return <div className="p-10 text-center text-gray-500">Cargando interfaz...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header DGT */}
      <header className="bg-gradient-to-r from-[#0066CC] to-[#004A99] text-white shadow-md py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <svg className="w-7 h-7 text-[#0066CC]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55 0.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{t.header.title}</h1>
              <p className="text-[10px] text-blue-100">{t.header.subtitle}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
            <span className="bg-white/20 rounded-full px-2 py-1">👤</span>
            {locale === 'es' ? 'Ciudadano' : 'Citizen'}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-4 flex flex-col justify-start items-center text-center">
        {/* Alerta */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-2 mb-3 rounded-r-lg text-sm w-full max-w-3xl">
          <div className="flex items-start gap-2 justify-center">
            <AlertIcon />
            <div>
              <h2 className="font-bold text-gray-800">{t.alert.title}</h2>
              <p className="text-gray-700 text-xs">{t.alert.intro}</p>
            </div>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 gap-4 mb-3 max-w-3xl">
          {/* Carnet */}
          <div className="bg-white rounded-lg shadow p-3 border-t-4 border-[#0066CC] flex flex-col items-center text-center">
            <CarnetIcon />
            <h3 className="text-base font-bold mb-1">{t.carnet.title}</h3>
            <p className="text-xs text-gray-600 mb-2">{t.carnet.desc}</p>
            <div className="w-full bg-red-50 border border-red-200 rounded-md py-1 mb-2">
              <span className="text-xs font-semibold text-red-700">⚠️ {locale === 'es' ? 'TRÁMITE OBLIGATORIO' : 'MANDATORY PROCESS'}</span>
            </div>
            <button
              onClick={() => router.push(`/${locale}//tramites_licencias/vehiculo/ciudadano/carnetConducir`)}
              className="w-full bg-[#0066CC] hover:bg-[#004A99] text-white font-semibold py-1.5 rounded-full text-sm"
            >
              {t.carnet.action}
            </button>
          </div>

          {/* Permiso */}
          <div className="bg-white rounded-lg shadow p-3 border-t-4 border-[#0066CC] flex flex-col items-center text-center">
            <PermisoIcon />
            <h3 className="text-base font-bold mb-1">{t.permiso.title}</h3>
            <p className="text-xs text-gray-600 mb-2">{t.permiso.desc}</p>
            <div className="w-full bg-red-50 border border-red-200 rounded-md py-1 mb-2">
              <span className="text-xs font-semibold text-red-700">⚠️ {locale === 'es' ? 'TRÁMITE OBLIGATORIO' : 'MANDATORY PROCESS'}</span>
            </div>
            <button
              onClick={() => router.push(`/${locale}//tramites_licencias/vehiculo/ciudadano/permisoCirculacion`)}
              className="w-full bg-[#0066CC] hover:bg-[#004A99] text-white font-semibold py-1.5 rounded-full text-sm"
            >
              {t.permiso.action}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 max-w-3xl text-xs text-left">
          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t.info.title}
          </h4>
          <ul className="space-y-1 text-gray-700">
            {t.info.points.map((p, i) => <li key={i}>• {p}</li>)}
          </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-row justify-center items-center gap-3 mt-3">
          <button 
            onClick={() => router.back()}
            className="border border-[#0066CC] text-[#0066CC] px-5 py-1.5 rounded-full text-sm font-medium hover:bg-[#0066CC] hover:text-white"
          >
            {t.buttons.back}
          </button>
          <button
            onClick={() => router.push(`/${locale}//tramites_licencias/step-1`)}
            className="bg-[#004A99] hover:bg-[#003C7A] text-white px-5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
          >
            {t.buttons.goPolicia}
          </button>
        </div>
      </main>
    </div>
  );
}
