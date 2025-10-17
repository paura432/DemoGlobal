'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRouter, usePathname } from 'next/navigation';

const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

type Phase = 'loading' | 'qr' | 'verifying' | 'error';

type LoginContent = {
  login: {
    title: string;
    subtitle: string;
    methods: {
      bankCredential: { label: string; available: boolean };
      google: { label: string; available: boolean };
      apple: { label: string; available: boolean };
      facebook: { label: string; available: boolean };
    };
    note: string;
    modal: {
      title: string;
      verifySteps: string[];
    };
    footer: {
      copyright: string;
      links: { terms: string; privacy: string };
    };
  };
};

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [content, setContent] = useState<LoginContent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [qrLink, setQrLink] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 🟦 Carga del JSON
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/locales/atributos_verificados/credenciales-bancarias/login/${locale}.json`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      setContent(data);
      setPhase('qr'); // Mostrar QR directo si ya está cargado
    })();
  }, [locale]);

  const handleBankCredentialClick = () => {
    setShowModal(true);
    startVerification();
  };

  // 🟢 Inicia verificación Procivis
  const startVerification = async () => {
    setPhase('loading');
    try {
      const res = await fetch(`${apiBase}/api/v1/verifier-back/procivis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: 'cliente' }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json?.data ?? json;
      const link = data?.appUrl;
      const sid = data?.sessionID;

      if (!link || !sid) throw new Error('Respuesta incompleta');

      setQrLink(link);
      setSessionID(sid);
      setPhase('qr');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error de conexión');
      setPhase('error');
    }
  };

  // 🔁 Polling del estado de verificación (versión Adquira)
  useEffect(() => {
    if (!sessionID || phase !== 'qr' || !content) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/verifier-status/procivis/${sessionID}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json?.data ?? json;
        const status = data?.status;

        if (status === 'success' || status === 'verified') {
          clearInterval(interval);
          setPhase('verifying');
          setActiveStep(0);

          // ✅ animación estilo Adquira
          content.login.modal.verifySteps.forEach((_, i) => {
            setTimeout(() => setActiveStep(i + 1), 800 * (i + 1));
          });

          setTimeout(() => {
            router.push(`/${locale}/atributos_verificados/credenciales-bancarias/confirmacion`);
          }, 800 * (content.login.modal.verifySteps.length + 2));
        }

        if (status === 'error' || status === 'rejected') {
          setPhase('error');
          setErrorMsg('Error en la verificación');
          clearInterval(interval);
        }
      } catch {}
    }, 1500);

    return () => clearInterval(interval);
  }, [sessionID, phase, router, locale, content]);

  if (!content) return null;
  const c = content.login;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{c.title}</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">{c.subtitle}</p>

        {/* Botón principal */}
        <button
          onClick={handleBankCredentialClick}
          className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 py-3 rounded-md font-medium text-gray-700 mb-4 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
            <path d="M2 10h20" strokeWidth="2" />
          </svg>
          {c.methods.bankCredential.label}
        </button>

        {/* Otros métodos deshabilitados */}
        {Object.entries(c.methods)
          .filter(([key]) => key !== 'bankCredential')
          .map(([key, method]) => (
            <div
              key={key}
              className="w-full border-2 border-gray-200 py-3 rounded-md font-medium text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed bg-gray-50 mb-3"
            >
              {method.label}
            </div>
          ))}

        <p className="text-xs text-center text-gray-500 mt-2">{c.note}</p>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <a href="#" className="text-blue-600 hover:underline">
            {c.footer.links.terms}
          </a>
          {' · '}
          <a href="#" className="text-blue-600 hover:underline">
            {c.footer.links.privacy}
          </a>
        </div>
      </div>

      {/* Modal QR / Verificación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 overflow-hidden">
            <div className="text-center pt-8 pb-4 px-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {c.modal?.title || 'Verificación'}
              </h2>
              <div className="w-24 border-t-2 border-gray-300 mx-auto mb-4" />
            </div>

            <div className="px-6 pb-8 text-center">
              {phase === 'loading' && (
                <div className="py-10">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#00A859] mx-auto"></div>
                  <p className="mt-6 text-gray-600 font-medium">Cargando credencial...</p>
                </div>
              )}

              {phase === 'qr' && (
                <>
                  <div className="bg-gray-50 p-6 rounded-2xl flex justify-center mb-4">
                    <QRCodeCanvas value={qrLink} size={200} level="M" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Escanea el código con tu app wallet para continuar.
                  </p>
                </>
              )}

              {/* 🟢 Bloque de verificación estilo Adquira */}
              {phase === 'verifying' && (
                <div className="py-6 text-center">
                  <h3 className="text-[#00A859] font-semibold mb-4">Validación de credenciales</h3>

                  {/* Barra de progreso */}
                  <div className="w-full h-1 bg-gray-200 rounded-full mb-4">
                    <div
                      className="h-full bg-[#00A859] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (activeStep / c.modal.verifySteps.length) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Pasos */}
                  <ul className="space-y-2 text-sm text-left inline-block">
                    {c.modal.verifySteps.map((step, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 ${
                          i < activeStep ? 'text-[#00A859]' : 'text-gray-500'
                        }`}
                      >
                        <span>{i < activeStep ? '✓' : '○'}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {phase === 'error' && (
                <div className="py-10">
                  <p className="text-red-600 font-semibold mb-2">Error en la verificación</p>
                  <p className="text-sm text-gray-500">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
