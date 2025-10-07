'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

const PASOS = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] as const;

type BlockId = 'import' | 'qr';

type Block = {
  id: BlockId;
  titulo: string;
  instrucciones: string[];
  video?: string;
  poster?: string;
  credencialImagen?: string;
  qrHeaderImage?: string;
  boton?: string;
};

type Step3Json = {
  bloques: Block[];
};

const UI = {
  es: {
    back: 'Atrás',
    next: 'Siguiente',
    gotoMinistry: 'Ir a Ministerio',
    generating: 'Generando QR…',
    preparing: 'Preparando QR',
  },
  en: {
    back: 'Back',
    next: 'Next',
    gotoMinistry: 'Go to Ministry',
    generating: 'Generating QR…',
    preparing: 'Preparing QR',
  }
} as const;

function TickSmall() {
  return (
    <svg
      className="mt-[4px] w-3 h-3 text-blue-600 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m8 12 3 3 5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MediaCard({ mediaSrc, poster }: { mediaSrc: string; poster?: string }) {
  return (
    <div className="rounded-xl shadow-lg overflow-hidden bg-black/5">
      <div className="w-[280px] h-[200px] md:w-[320px] md:h-[220px] lg:w-[360px] lg:h-[240px]">
        <video
          key={mediaSrc}
          src={mediaSrc}
          poster={poster}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
        />
      </div>
    </div>
  );
}

export default function Step3() {
  const pathname = usePathname();
  const router = useRouter();
  const match = pathname.match(/^\/(es|en)/);
  const locale = (match ? (match[1] as 'es' | 'en') : 'es');

  const [t, setT] = useState<Step3Json | null>(null);
  const [subIdx, setSubIdx] = useState(0);
  const [issuing, setIssuing] = useState(false);
  const [issuedWrapQr, setIssuedWrapQr] = useState('');
  const hasIssuedRef = useRef(false);
  const QR_SIZE = 160;

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/locales//tramites_licencias/step-3/${locale}.json`,
        { cache: 'no-store' }
      );
      const data = (await res.json()) as Step3Json;
      setT(data);
    })();
  }, [locale]);

  const blocks = t?.bloques ?? [];
  const block = blocks[Math.max(0, Math.min(subIdx, blocks.length - 1))];

  // Simulación de emisión de credencial al entrar en el bloque "qr"
  useEffect(() => {
    if (!block) return;
    if (block.id !== 'qr') {
      hasIssuedRef.current = false;
      return;
    }
    if (hasIssuedRef.current) return;
    hasIssuedRef.current = true;

    setIssuing(true);
    setTimeout(() => {
      setIssuedWrapQr('https://example.org/credencial-emitida'); // mock QR
      setIssuing(false);
    }, 1500);
  }, [block]);

  const goTo = (step: typeof PASOS[number]) =>
    router.push(pathname.replace(/step-\d+(.*)?$/, `${step}$1`));

  const goBack = () => {
    if (subIdx > 0) setSubIdx((p) => p - 1);
    else goTo('step-2');
  };

  const goNext = () => {
    if (subIdx < blocks.length - 1) setSubIdx((p) => p + 1);
    else goTo('step-4');
  };

  if (!block) return null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        {/* pasos arriba */}
        <div className="w-full flex justify-center pt-1 pb-6">
          <div className="flex gap-2 items-center">
            {PASOS.map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${
                    i === 2
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  {i + 1}
                </div>
                {i < PASOS.length - 1 && (
                  <div className="w-8 h-[2px] bg-gray-300 mx-1 sm:mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* contenido */}
        <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-h-[300px]">
            {/* izquierda */}
            <div className="min-h-[280px] mt-2">
              <h2
                className="text-2xl font-semibold text-gray-800 mb-4"
                dangerouslySetInnerHTML={{ __html: block.titulo }}
              />
              <ul className="mb-5 space-y-3">
                {block.instrucciones.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 items-start text-sm text-gray-600 leading-relaxed"
                  >
                    <TickSmall />
                    <span
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* derecha */}
            <div className="flex justify-center lg:justify-end">
              {block.id === 'import' && block.video && (
                <MediaCard mediaSrc={block.video} poster={block.poster} />
              )}

              {block.id === 'qr' && (
                <div className="rounded-2xl shadow-lg bg-white border border-gray-200 p-5">
                  <div className="w-[180px] md:w-[220px] lg:w-[260px] mx-auto grid place-items-center">
                    {block.qrHeaderImage && (
                      <Image
                        src={block.qrHeaderImage}
                        alt="Colegio de Médicos"
                        width={160}
                        height={160}
                        className="w-[180px] h-auto object-contain mb-3"
                      />
                    )}
                    {issuedWrapQr ? (
                      <div className="flex flex-col items-center">
                        <QRCodeCanvas
                          value={issuedWrapQr}
                          size={QR_SIZE}
                          className="rounded border shadow"
                        />
                        {issuing && (
                          <span className="mt-1 text-xs text-gray-400">
                            {UI[locale].generating}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {issuing ? UI[locale].generating : UI[locale].preparing}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* navegación */}
        <div className="w-full max-w-[1020px] px-4 sm:px-10 pt-5">
          <hr className="mb-10 border-gray-200" />
          <div className="flex justify-between items-center mb-16">
            <button
              onClick={goBack}
              className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full text-sm font-medium transition hover:bg-blue-50"
            >
              {UI[locale].back}
            </button>
            <div className="flex-1 flex justify-center">
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium transition"
              >
                {block.boton ?? (subIdx < blocks.length - 1 ? UI[locale].next : UI[locale].gotoMinistry)}
              </button>
            </div>
            <div className="w-[110px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
