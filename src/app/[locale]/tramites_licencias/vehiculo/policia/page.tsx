'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { useDemo } from '@/components/ui/demoContext';

const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

type Locale = 'es' | 'en';

interface Translation {
  header: { title: string; subtitle: string };
  left: {
    title: string;
    desc: string;
    roleTitle: string;
    role: string;
    verifyTitle: string;
    doc1: string;
    doc2: string;
    doc3: string;
    back: string;
  };
  right: {
    initTitle: string;
    initDesc: string;
    startBtn: string;
    loading: string;
    qrText: string;
    waiting: string;
    verifyingTitle: string;
    completeBtn: string;
    validTitle: string;
    validDesc: string;
    finishBtn: string;
  };
  steps: string[];
  error: string;
}

interface Credenciales {
  carnet: {
    nombre: string;
    apellidos: string;
    dni: string;
    categoria: string;
    fechaExpiracion: string;
  };
  permiso: {
    marcaModelo: string;
    matricula: string;
    tipoVehiculo: string;
    seguro: string;
  };
}

interface ApiStartResponse {
  data?: { appUrl: string; sessionID: string };
  appUrl?: string;
  sessionID?: string;
}

interface ApiStatusResponse {
  data?: { status?: string };
  status?: string;
}

export default function VerificacionPolicia() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.match(/^\/(es|en)/)?.[1] as Locale) || 'es';
  const { marcarCasoCompletado } = useDemo();

  const [t, setT] = useState<Translation | null>(null);
  const [phase, setPhase] = useState<'init' | 'loading' | 'qr' | 'verifying' | 'ready' | 'error'>('init');
  const [sessionID, setSessionID] = useState('');
  const [qrLink, setQrLink] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [credenciales, setCredenciales] = useState<Credenciales | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const START_ENDPOINT = `${apiBase}/api/v1/verifier-back/procivis`;
  const STATUS_ENDPOINT = (sid: string) => `${apiBase}/api/v1/verifier-status/procivis/${sid}`;

  // 🟦 Cargar traducciones dinámicamente
  useEffect(() => {
    (async () => {
      const res = await fetch(`/locales/tramites_licencias/vehiculo/policia/${locale}.json`);
      const json = (await res.json()) as Translation;
      setT(json);
    })();
  }, [locale]);

  // 🔹 Iniciar verificación
  const handleStartVerification = async () => {
    setPhase('loading');
    setErrorMsg(null);

    try {
      const res = await fetch(START_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: 'policia' }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiStartResponse;
      const data = json.data ?? json;

      if (!data?.appUrl || !data?.sessionID) throw new Error('Respuesta incompleta');
      setQrLink(data.appUrl);
      setSessionID(data.sessionID);
      setPhase('qr');
    } catch (e) {
      const msg = e instanceof Error ? e.message : t?.error || 'Error';
      setErrorMsg(msg);
      setPhase('error');
    }
  };

  // 🔹 Polling Procivis
  useEffect(() => {
    if (!sessionID || phase !== 'qr') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(STATUS_ENDPOINT(sessionID));
        if (!res.ok) return;

        const json = (await res.json()) as ApiStatusResponse;
        const data = json.data ?? json;
        const status = data.status;

        if (status === 'success' || status === 'verified') {
          setPhase('verifying');
          setActiveStep(0);
          t?.steps?.forEach((_, i) =>
            setTimeout(() => setActiveStep(i + 1), 900 * (i + 1))
          );
          setTimeout(() => setPhase('ready'), 900 * ((t?.steps?.length ?? 4) + 1));
          clearInterval(interval);
        }

        if (['error', 'rejected', 'expired'].includes(status ?? '')) {
          setPhase('error');
          setErrorMsg(t?.error || 'Error de verificación');
          clearInterval(interval);
        }
      } catch {
        // ignorar errores de polling
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [sessionID, phase, t]);

  const handleComplete = () => {
    setCredenciales({
      carnet: {
        nombre: 'Carlos',
        apellidos: 'García López',
        dni: '12345678X',
        categoria: 'B',
        fechaExpiracion: '15/01/2034',
      },
      permiso: {
        marcaModelo: 'Seat León 1.6 TDI',
        matricula: 'ABC-1234',
        tipoVehiculo: 'Turismo',
        seguro: 'Seguro a todo riesgo',
      },
    });
    marcarCasoCompletado('verificar-documentos');
  };

  const handleFinish = () => router.push(`/`);

  if (!t)
    return <div className="p-10 text-center text-gray-500">Cargando interfaz...</div>;

  const pct = Math.round((activeStep / (t.steps?.length ?? 4)) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#0066CC] to-[#004A99] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2">
          <div className="bg-white rounded-full p-1.5">
            <svg className="w-6 h-6 text-[#0066CC]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold">{t.header.title}</h1>
            <p className="text-[10px] text-blue-100">{t.header.subtitle}</p>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* IZQUIERDA */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{t.left.title}</h1>
          <p className="text-gray-700 text-sm leading-relaxed">{t.left.desc}</p>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">{t.left.roleTitle}</p>
              <div className="bg-gray-100 px-3 py-2 rounded-md mt-1 flex items-center gap-2">
                <Image src="/tramites_licencias/policia_uso.png" alt="Policía" width={22} height={22} />
                <span>{t.left.role}</span>
              </div>
            </div>

            <div>
              <p className="font-semibold">{t.left.verifyTitle}</p>
              <div className="bg-gray-100 px-3 py-2 rounded-md mt-1 space-y-1">
                <p className={`${phase === 'ready' ? 'text-green-700' : 'text-gray-500'}`}>
                  {phase === 'ready' ? '✓' : '○'} {t.left.doc1}
                </p>
                <p className={`${phase === 'ready' ? 'text-green-700' : 'text-gray-500'}`}>
                  {phase === 'ready' ? '✓' : '○'} {t.left.doc2}
                </p>
                <p className={`${phase === 'ready' ? 'text-green-700' : 'text-gray-500'}`}>
                  {phase === 'ready' ? '✓' : '○'} {t.left.doc3}
                </p>
              </div>
            </div>
          </div>

          <Link href={`/${locale}/demoglobal`} className="text-blue-700 hover:underline text-sm">
            {t.left.back}
          </Link>
        </div>

        {/* DERECHA */}
        <div className="relative">
          {phase === 'init' && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Image src="/tramites_licencias/policia_uso.png" alt="Policías" width={70} height={70} className="mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-1">{t.right.initTitle}</h2>
              <p className="text-sm text-gray-700">{t.right.initDesc}</p>
              <button
                onClick={handleStartVerification}
                className="w-full bg-green-600 text-white py-2 mt-3 rounded hover:bg-green-700 text-sm font-medium"
              >
                {t.right.startBtn}
              </button>
            </div>
          )}

          {phase === 'loading' && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-700 text-sm">
              {t.right.loading}
            </div>
          )}

          {phase === 'qr' && (
            <div className="bg-white rounded-lg shadow p-5 text-center space-y-2">
              <p className="text-xs text-gray-700">{t.right.qrText}</p>
              <div className="flex justify-center">
                <QRCodeCanvas value={qrLink} size={130} />
              </div>
              <p className="text-[11px] text-gray-500">{t.right.waiting}</p>
            </div>
          )}

          {(phase === 'verifying' || phase === 'ready') && (
            <div className="bg-white rounded-lg shadow p-5 space-y-3">
              <p className="text-sm font-semibold text-gray-700">{t.right.verifyingTitle}</p>
              <div className="w-full h-1 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                {t.steps.map((step, i) => (
                  <li key={i} className={i < activeStep ? 'text-blue-700 font-medium' : ''}>
                    {i < activeStep ? '✓ ' : '○ '} {step}
                  </li>
                ))}
              </ul>
              {phase === 'ready' && (
                <button
                  onClick={handleComplete}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                >
                  {t.right.completeBtn}
                </button>
              )}
            </div>
          )}

          {phase === 'error' && (
            <div className="bg-white rounded-lg shadow p-5 text-center text-red-600 text-sm">
              {errorMsg || t.error}
            </div>
          )}

          {phase === 'ready' && credenciales && (
            <div className="bg-white rounded-lg shadow p-5 mt-4 space-y-2 text-sm">
              <h3 className="font-semibold text-green-700">{t.right.validTitle}</h3>
              <p className="text-gray-700">{t.right.validDesc}</p>
              <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                <p>
                  <b>Nombre:</b> {credenciales.carnet.nombre} {credenciales.carnet.apellidos}
                </p>
                <p>
                  <b>DNI:</b> {credenciales.carnet.dni}
                </p>
                <p>
                  <b>Vehículo:</b> {credenciales.permiso.marcaModelo}
                </p>
                <p>
                  <b>Matrícula:</b> {credenciales.permiso.matricula}
                </p>
              </div>
              <button
                onClick={handleFinish}
                className="w-full bg-blue-800 text-white py-2 rounded text-sm hover:bg-blue-900"
              >
                {t.right.finishBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
