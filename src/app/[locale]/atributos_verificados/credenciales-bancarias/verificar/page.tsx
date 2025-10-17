'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRouter, usePathname } from 'next/navigation';

const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

type Phase = 'loading' | 'qr' | 'verifying' | 'error';

type VerifyContent = {
  verify: {
    title: string;
    credentialTitle: string;
    loading: string;
    howToUseTitle: string;
    steps: string[];
    waiting: string;
    verifying: string;
    verifySteps: string[];
    completed: string;
    redirecting: string;
    error: {
      title: string;
      message: string;
      retry: string;
    };
  };
};

function CheckCircle() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path
        d="M14.2 7.6 9 12.8 6.6 10.3"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PendingCircle() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5">
      <circle cx="10" cy="10" r="7.75" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
    </svg>
  );
}

export default function BankVerificationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [phase, setPhase] = useState<Phase>('loading');
  const [qrLink, setQrLink] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [content, setContent] = useState<VerifyContent | null>(null);

  // Cargar JSON dinámico
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/locales/atributos_verificados/credenciales-bancarias/verificar/${locale}.json`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      setContent(data);
    })();
  }, [locale]);

  // Comenzar verificación
  useEffect(() => {
    if (content) startVerification();
  }, [content]);

  const progress = content?.verify?.verifySteps
    ? Math.round((activeStep / content.verify.verifySteps.length) * 100)
    : 0;

  const startVerification = async () => {
    setPhase('loading');
    try {
      const res = await fetch(`${apiBase}/api/v1/verifier-back/procivis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: 'credencial_bancaria' }),
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

  // Polling Procivis
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
          setPhase('verifying');
          setActiveStep(0);

          content.verify.verifySteps.forEach((_, i) => {
            setTimeout(() => setActiveStep(i + 1), 800 * (i + 1));
          });

          setTimeout(() => {
            router.push(`/${locale}/atributos_verificados/credenciales-bancarias/confirmacion`);
          }, 800 * (content.verify.verifySteps.length + 1));

          clearInterval(interval);
        }

        if (status === 'error' || status === 'rejected') {
          setPhase('error');
          setErrorMsg(content.verify.error.message);
          clearInterval(interval);
        }
      } catch {}
    }, 1500);

    return () => clearInterval(interval);
  }, [sessionID, phase, router, locale, content]);

  if (!content) return null;
  const c = content.verify;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8">
        {/* Cabecera */}
        <div className="text-center pb-4">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">{c.title}</h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-9 h-9 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
              <path d="M2 10h20" strokeWidth="2" />
            </svg>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{c.credentialTitle}</h3>
          </div>
          <div className="w-20 border-t-2 border-gray-300 mx-auto" />
        </div>

        {/* Fase: loading */}
        {phase === 'loading' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto" />
            <p className="mt-6 text-gray-600 font-medium">{c.loading}</p>
          </div>
        )}

        {/* Fase: QR */}
        {phase === 'qr' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl flex justify-center">
              <QRCodeCanvas value={qrLink} size={200} level="M" />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 mb-3">{c.howToUseTitle}</p>
              <div className="bg-blue-50 rounded-lg p-4 text-left max-w-sm mx-auto">
                <ol className="space-y-2 text-sm text-gray-700">
                  {c.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span>{c.waiting}</span>
            </div>
          </div>
        )}

        {/* Fase: verificando */}
        {phase === 'verifying' && (
          <div className="space-y-6 py-4">
            <h4 className="font-bold text-lg text-center text-gray-700 mb-4">{c.verifying}</h4>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <ul className="space-y-3">
              {c.verifySteps.map((label, i) => (
                <li key={i} className="flex items-center gap-3 justify-center">
                  {i < activeStep ? <CheckCircle /> : <PendingCircle />}
                  <span
                    className={`text-sm ${
                      i < activeStep ? 'text-gray-900 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {activeStep === c.verifySteps.length && (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900">{c.completed}</p>
                <p className="text-sm text-gray-600 mt-1">{c.redirecting}</p>
              </div>
            )}
          </div>
        )}

        {/* Fase: error */}
        {phase === 'error' && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{c.error.title}</h3>
            <p className="text-red-600 mb-6">{errorMsg || c.error.message}</p>
            <button
              onClick={startVerification}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {c.error.retry}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
