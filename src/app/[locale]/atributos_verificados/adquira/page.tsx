'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

type Phase = 'idle' | 'loading' | 'qr' | 'verifying' | 'ready' | 'error';

// Tipo para las traducciones (simplificado para ESLint)
interface AdquiraTranslations {
  header: {
    accessTitle: string;
    language: { es: string; en: string };
  };
  buttons: {
    companyAccreditation: string;
    login: string;
    recoverPassword: string;
    help: string;
  };
  modal: {
    waiting: string;
    title: string;
    credentialTitle: string;
    hint: string;
    verifyingTitle: string;
    error: string;
  };
}

export default function AdquiraLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [t, setT] = useState<AdquiraTranslations | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [qrLink, setQrLink] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const steps = [
    'Verificando credencial',
    'Validando expiración',
    'Confirmando validez profesional',
    'Autenticando identidad',
  ];

  // 🔤 Cargar traducciones
  useEffect(() => {
    fetch(`/locales/atributos_verificados/adquira/${locale}.json`)
      .then((res) => res.json())
      .then((data: AdquiraTranslations) => setT(data))
      .catch(() => setT(null));
  }, [locale]);

  // 🚀 Iniciar verificación
  const startVerification = async (): Promise<void> => {
    setPhase('loading');
    setErrorMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/verifier-back/procivis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: 'empresario' }),
      });
      const data: Record<string, unknown> = await res.json();

      const qr =
        (data?.data as Record<string, string>)?.appUrl ||
        (data?.appUrl as string) ||
        'https://example.com';

      const sid =
        (data?.data as Record<string, string>)?.sessionID ||
        (data?.sessionID as string) ||
        'mock';

      setQrLink(qr);
      setSessionID(sid);
      setPhase('qr');
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message);
      setPhase('error');
    }
  };

  // 🔁 Polling (Procivis / simulación)
  useEffect(() => {
    if (!sessionID || phase !== 'qr') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/verifier-status/procivis/${sessionID}`);
        const json: Record<string, unknown> = await res.json();
        const status =
          (json?.data as Record<string, string>)?.status || (json?.status as string);

        if (['verified', 'success'].includes(status)) {
          clearInterval(interval);
          setPhase('verifying');
          setActiveStep(0);

          steps.forEach((_, i) => setTimeout(() => setActiveStep(i + 1), 800 * (i + 1)));
          setTimeout(() => setPhase('ready'), 800 * (steps.length + 1));
        }
      } catch {
        // simulación visual en caso de error
        clearInterval(interval);
        setPhase('verifying');
        steps.forEach((_, i) => setTimeout(() => setActiveStep(i + 1), 800 * (i + 1)));
        setTimeout(() => setPhase('ready'), 800 * (steps.length + 1));
      }
    }, 1500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionID, phase]);

  // ⏩ Redirigir tras la verificación completada
  useEffect(() => {
    if (phase === 'ready') {
      const timer = setTimeout(() => {
        router.push(`/${locale}/atributos_verificados/adquira/adquira_proveedor`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, router, locale]);

  if (!t) return null;
  const pct = Math.round((activeStep / steps.length) * 100);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#e7eae3] overflow-hidden">
      {/* Fondo */}
      <Image
        src="/atributos_verificados/adquira_bg.png"
        alt="Fondo Adquira"
        fill
        className="object-cover opacity-30"
      />

      {/* Caja principal */}
      <div className="relative z-10 flex flex-col items-center bg-white/95 rounded-lg shadow-xl p-10 w-[90%] max-w-md border border-gray-200">
        <Image
          src="/atributos_verificados/adquira.png"
          alt="Adquira"
          width={150}
          height={50}
          className="mb-4"
        />
        <h1 className="text-lg font-semibold text-gray-800 mb-6">
          {t.header.accessTitle}
        </h1>

        <button
          onClick={startVerification}
          className="w-3/4 bg-[#808a3d] hover:bg-[#6f7833] text-white py-2.5 rounded-full font-semibold transition mb-3"
        >
          {t.buttons.companyAccreditation}
        </button>
        <button className="w-3/4 bg-[#a4162d] hover:bg-[#8d1326] text-white py-2.5 rounded-full font-semibold transition mb-3">
          {t.buttons.login}
        </button>
        <a href="#" className="text-sm text-gray-600 hover:underline mb-3">
          {t.buttons.recoverPassword}
        </a>
        <button className="text-xs bg-[#e7eae3] text-[#00A859] px-4 py-1 rounded-full hover:bg-[#d9ded5] transition">
          {t.buttons.help}
        </button>
      </div>

      {/* ==================== MODAL ==================== */}
      {phase !== 'idle' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center w-full max-w-md mx-2">
            <Image
              src="/atributos_verificados/adquira.png"
              alt="Adquira"
              width={120}
              height={40}
              className="mx-auto mb-4"
            />

            {phase === 'loading' && (
              <p className="text-gray-600">{t.modal.waiting}</p>
            )}

            {phase === 'qr' && (
              <>
                <h3 className="text-lg font-semibold text-[#808a3d] mb-2">
                  {t.modal.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t.modal.credentialTitle}
                </p>
                <div className="flex justify-center bg-gray-50 p-4 rounded-lg mb-3">
                  <QRCodeCanvas value={qrLink} size={200} />
                </div>
                <p className="text-xs text-gray-500">{t.modal.hint}</p>
              </>
            )}

            {(phase === 'verifying' || phase === 'ready') && (
              <div className="text-left">
                <h3 className="text-[#808a3d] font-semibold mb-4 text-center">
                  {t.modal.verifyingTitle}
                </h3>

                <div className="w-full h-1 bg-gray-200 rounded-full mb-4">
                  <div
                    className="h-full bg-[#00A859] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <ul className="space-y-2">
                  {steps.map((step, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 ${
                        i < activeStep ? 'text-[#00A859]' : 'text-gray-500'
                      }`}
                    >
                      <span>{i < activeStep ? '✓' : '○'}</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase === 'error' && (
              <p className="text-red-600 font-semibold">
                {errorMsg || t.modal.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Selector idioma */}
      <div className="absolute top-4 right-8 flex gap-3 text-xs font-semibold text-gray-700">
        <span className="cursor-pointer hover:underline">{t.header.language.es}</span>
        <span>|</span>
        <span className="cursor-pointer hover:underline">{t.header.language.en}</span>
      </div>
    </div>
  );
}
