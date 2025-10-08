'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HomeButton from '@/components/ui/HomeButton';

const PASOS = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] as const;

type Step4T = {
  step4: {
    title: string;
    subtitle: string;
    intro: string;
    bullets: string[];
    mock: { image: string; alt: string; caption?: string };
    cta: string;
  };
};

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

function DesktopMock({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="w-full flex flex-col items-center">
      <div
        className="relative rounded-[18px] bg-[#0f1115] border-[10px] border-[#0f172a] shadow-[0_16px_40px_rgba(0,0,0,0.18)] overflow-hidden"
        style={{ width: 'clamp(210px, 34vw, 400px)', maxWidth: '92vw' }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-1.5 w-14 rounded-full bg-gray-700/60" />

        <div className="relative bg-[#0f1115]" style={{ aspectRatio: '16 / 9' }}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width:1024px) 36vw, 94vw"
            className="object-contain"
          />
        </div>
      </div>

      <div className="mx-auto h-2 w-[24%] bg-[#1f2937] rounded-b-2xl mt-1.5" />
      <div className="mx-auto h-3 w-[32%] bg-[#e5e7eb] rounded-b-3xl shadow-inner" />

      {caption && (
        <figcaption className="text-center text-xs text-gray-500 mt-1.5 lg:hidden">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function Step4() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const currentStep = PASOS.findIndex((s) => pathname.includes(s));

  const [s4, setS4] = useState<Step4T | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rol = localStorage.getItem('rol') || 'ciudadano';
        const url = `/locales/tramites_licencias/step-4/${rol}-${locale}.json`;

        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d4 = (await res.json()) as Step4T;
        setS4(d4);
      } catch (e) {
        console.error('❌ Error cargando JSON Step-4:', e);
        setS4(null);
      }
    })();
  }, [locale]);

  const c = s4?.step4;
  if (!c) return null;

  const goBack = () => {
    const rol = localStorage.getItem('rol') || 'ciudadano';
    if(rol === 'ciudadano')
      router.push(`/${locale}/tramites_licencias/step-3`);
    else
      router.push(`/${locale}/tramites_licencias/step-1`);
  }
  const goNext = () => {
    const rol = localStorage.getItem('rol') || 'ciudadano';
    if(rol === 'ciudadano')
      router.push(`/${locale}/tramites_licencias/vehiculo/ciudadano`);
    else
      router.push(`/${locale}/tramites_licencias/vehiculo/policia`);
  }

  return (
    <div className="h-screen flex flex-col bg-white">
    
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        {/* Progreso */}
        {/* Progreso con HomeButton */}
        <div className="w-full flex justify-center pt-1 pb-6 relative">
          {/* Botón Home alineado con el progreso */}
          <div className="absolute left-3 sm:left-8 lg:left-14 top-1">
            <HomeButton />
          </div>
          
          <div className="flex gap-2 items-center">
            {PASOS.map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${
                    i === currentStep
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

        {/* Contenido */}
        <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-h-[300px]">
            <div className="min-h-[280px]">
              <h2
                className="text-2xl font-semibold text-gray-800 mb-1"
                dangerouslySetInnerHTML={{ __html: c.title }}
              />

              {c.subtitle && (
                <p
                  className="text-sm text-gray-500 mb-4"
                  dangerouslySetInnerHTML={{ __html: c.subtitle }}
                />
              )}

              <ul className="mb-1 space-y-3">
                {c.bullets.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 items-start text-sm text-gray-700 leading-relaxed"
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

            <div className="flex justify-center lg:justify-end">
              <DesktopMock
                src={c.mock.image}
                alt={c.mock.alt}
                caption={c.mock.caption}
              />
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="w-full max-w-[1020px] px-4 sm:px-10 pt-5">
          <hr className="mb-10 border-gray-200" />
          <div className="flex justify-between items-center mb-16">
            <button
              onClick={goBack}
              className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full text-sm font-medium transition hover:bg-blue-50"
            >
              {locale === 'en' ? 'Back' : 'Atrás'}
            </button>
            <div className="flex-1 flex justify-center">
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium transition"
              >
                {c.cta}
              </button>
            </div>
            <div className="w-[110px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
