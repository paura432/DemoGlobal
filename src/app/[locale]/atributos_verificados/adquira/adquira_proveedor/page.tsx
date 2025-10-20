'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

type Phase = 'portal' | 'qr' | 'verifying' | 'done' | 'error';

type AdquiraProveedorContent = {
  header: {
    title: string;
    tabs: string[];
    nav: string[];
    menu: string[];
  };
  userSection: {
    title: string;
    user: string;
    companyName: string;
    cif: string;
    button: string;
  };
  notifications: {
    title: string;
    emailSettings: string;
    emailFormat: string;
    orders: string[];
  };
  qr: {
    title: string;
    subtitle: string;
    transaction: string;
    description: string;
  };
  verification: {
    title: string;
    steps: string[];
  };
  done: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    copyright: string;
    links: {
      trustCenter: string;
      ethicCode: string;
      privacyPolicy: string;
      legalNotice: string;
    };
    customerService: { label: string; emoji: string };
  };
};

export default function AdquiraProveedorPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const [phase, setPhase] = useState<Phase>('portal');
  const [qrLink, setQrLink] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [t, setT] = useState<AdquiraProveedorContent | null>(null);

  // Cargar JSON de idioma
  useEffect(() => {
    fetch(`/locales/atributos_verificados/adquira/adquira_proveedor/${locale}.json`)
      .then((r) => r.json())
      .then(setT)
      .catch(() => console.error('Error cargando traducción'));
  }, [locale]);

  // Iniciar verificación
  const startVerification = async () => {
    setPhase('qr');
    try {
      const res = await fetch(`${apiBase}/api/v1/verifier-back/procivis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: 'empresario' }),
      });
      const data = await res.json();
      const qr = data?.data?.appUrl || data?.appUrl || 'https://example.com';
      const sid = data?.data?.sessionID || data?.sessionID || 'mock';
      setQrLink(qr);
      setSessionID(sid);
    } catch {
      setQrLink('https://example.com');
      setSessionID('mock');
    }
  };

  // Polling Procivis / simulación
  useEffect(() => {
    if (!sessionID || phase !== 'qr') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/verifier-status/procivis/${sessionID}`);
        const json = await res.json();
        const status = json?.data?.status || json?.status;
        
        if (['verified', 'success'].includes(status)) {
          clearInterval(interval);
          setPhase('verifying');
          setActiveStep(0);
          
          const totalSteps = t?.verification.steps.length || 4;
          
          // Animación de los pasos
          t?.verification.steps.forEach((_, i) =>
            setTimeout(() => setActiveStep(i + 1), 800 * (i + 1))
          );
          
          // Cuando termine el último paso, establecer 'done' y redirigir
          setTimeout(() => {
            // Redirigir después de completar la última verificación
            router.push(`/${locale}/atributos_verificados/adquira/adquira_proveedor2`);
          }, 800 * (totalSteps + 1));
        }
      } catch {
        clearInterval(interval);
        setPhase('verifying');
        setActiveStep(0);
        
        const totalSteps = t?.verification.steps.length || 4;
        
        // Animación de los pasos incluso si hay error
        t?.verification.steps.forEach((_, i) =>
          setTimeout(() => setActiveStep(i + 1), 800 * (i + 1))
        );
        
        // Completar la animación y marcar como done (sin redirección en caso de error)
        setTimeout(() => {
          setPhase('done');
          // Opcionalmente, podrías mostrar un mensaje de error aquí
          // o redirigir a una página de error
        }, 800 * (totalSteps + 1));
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [sessionID, phase, t, locale, router]);

  if (!t) return null;
  const pct = Math.round((activeStep / (t.verification.steps.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-gray-800">
      {/* HEADER */}
      <header className="bg-[#e9ebe7] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/atributos_verificados/adquira.png" alt="Adquira" width={130} height={40} />
            <div className="flex gap-4">
              {t.header.nav.map((item, i) => (
                <button
                  key={i}
                  className="bg-white rounded-full shadow p-2 text-sm font-medium text-gray-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button className="text-xs bg-[#d6e4cf] text-[#4a5c3b] px-3 py-1 rounded-full hover:bg-[#c9d9c3] transition">
            {t.footer.customerService.emoji} {t.footer.customerService.label}
          </button>
        </div>
      </header>

      {/* NAV BAR NEGRA */}
      <nav className="bg-[#1e1e1e] text-white text-sm font-medium">
        <div className="max-w-7xl mx-auto px-6 py-2 flex gap-6">
          {t.header.menu.map((item, i) => (
            <span key={i} className="hover:text-[#d6e4cf] cursor-pointer">
              {item}
            </span>
          ))}
        </div>
      </nav>

      {/* BARRA BEIGE */}
      <div className="bg-[#d5d1b8] text-xs text-gray-700 py-1 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          Está viendo: <span className="font-semibold">Todos los compradores</span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto bg-white border border-gray-200 shadow-sm rounded-md p-10 mt-6">
        {/* PORTAL */}
        {phase === 'portal' && (
          <div>
            <h1 className="text-xl font-bold mb-6">{t.header.title}</h1>
            <div className="flex gap-6 text-sm font-semibold mb-6 border-b border-gray-200">
              {t.header.tabs.map((tab, i) => (
                <span
                  key={i}
                  className={`pb-1 ${
                    i === 0
                      ? 'text-[#c00000] border-b-2 border-[#c00000]'
                      : 'text-gray-600'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>

            <h2 className="text-[#c00000] font-bold text-lg mb-1">{t.userSection.title}</h2>
            <p className="text-gray-700 font-medium">{t.userSection.user}</p>
            <p className="text-gray-600 font-semibold mt-1">{t.userSection.companyName}</p>
            <p className="text-sm text-gray-500 mb-4">{t.userSection.cif}</p>

            <button
              onClick={startVerification}
              className="bg-[#808a3d] text-white px-5 py-1.5 rounded-md text-sm font-medium hover:bg-[#6e7834] transition"
            >
              {t.userSection.button}
            </button>

            <div className="mt-10">
              <h3 className="font-bold text-gray-800 mb-3">{t.notifications.title}</h3>
              <p className="text-[#c00000] font-bold text-sm mb-2">
                {t.notifications.emailSettings}
              </p>
              <p className="text-gray-600 text-sm italic mb-4">{t.notifications.emailFormat}</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {t.notifications.orders.map((o, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#808a3d] rounded-sm" /> {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* QR */}
        {phase === 'qr' && (
          <div className="text-center py-12">
            <h2 className="text-[#808a3d] font-bold text-xl mb-2">{t.qr.title}</h2>
            <p className="text-gray-700 text-sm mb-1"><b>{t.qr.transaction}</b></p>
            <p className="text-gray-600 text-sm mb-6">{t.qr.description}</p>
            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={qrLink} size={200} />
            </div>
            <p className="text-xs text-gray-500">{t.qr.subtitle}</p>
          </div>
        )}

        {/* VERIFICACIÓN */}
        {phase === 'verifying' && (
          <div className="text-center py-10">
            <h2 className="text-[#808a3d] font-bold text-xl mb-4">{t.verification.title}</h2>
            <div className="w-1/3 h-1 bg-gray-200 rounded-full mx-auto mb-4">
              <div
                className="h-full bg-[#00A859] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <ul className="space-y-1 text-sm text-left inline-block">
              {t.verification.steps.map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 ${
                    i < activeStep ? 'text-[#00A859]' : 'text-gray-500'
                  }`}
                >
                  <span>{i < activeStep ? '✓' : '○'}</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ÉXITO */}
        {phase === 'done' && (
          <div className="text-center py-10 animate-fade-in">
            <h2 className="text-[#808a3d] font-bold text-xl mb-3">{t.done.title}</h2>
            <p className="text-gray-700 text-sm mb-8">{t.done.subtitle}</p>
            <button
              onClick={() => router.push(`/${locale}/`)}
              className="bg-[#0057B8] text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-[#004c9d] transition"
            >
              {t.done.button}
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-10 text-center text-xs text-gray-600 pb-6">
        <p className="mb-2">{t.footer.copyright}</p>
        <div className="flex justify-center gap-6 flex-wrap">
          <a href="#">{t.footer.links.trustCenter}</a>
          <a href="#">{t.footer.links.ethicCode}</a>
          <a href="#">{t.footer.links.privacyPolicy}</a>
          <a href="#">{t.footer.links.legalNotice}</a>
        </div>
      </footer>
    </div>
  );
}
