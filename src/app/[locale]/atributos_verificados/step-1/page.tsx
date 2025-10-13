'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HomeButton from '@/components/ui/HomeButton';

type Step1Translations = {
  conoceLabel: string;
  perfiles: {
    cliente: {
      nombre: string;
      label: string;
      descripcion: string;
      icono: string;
      video: string;
    };
    empresario: {
      nombre: string;
      label: string;
      descripcion: string;
      icono: string;
      video: string;
    };
  };
  buttons: { back: string; next: string };
};

type Rol = 'cliente' | 'empresario';
const pasos = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] as const;

export default function Step1() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const currentStep = pasos.findIndex((s) => pathname.includes(s));

  const [t, setT] = useState<Step1Translations | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Rol>('cliente');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/locales/atributos_verificados/step-1/${locale}.json`, { cache: 'no-store' });
      const data = (await res.json()) as Step1Translations;
      setT(data);
      setLoaded(true);
    })();
  }, [locale]);

  useEffect(() => {
    if (!loaded || !t) return;
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => void 0);
    }
  }, [loaded, selected, t]);

  if (!loaded || !t) return <div className="min-h-screen grid place-items-center">Cargando...</div>;

  const currentProfile = t.perfiles[selected];

  const goNext = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atributos_rol', selected);
    }
    const next = pasos[currentStep + 1];
    if (next) router.push(`/${locale}/atributos_verificados/${next}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center py-6">
        {/* Progreso */}
        <div className="w-full flex justify-center pt-1 pb-6 relative">
          <div className="absolute left-3 sm:left-8 lg:left-14 top-1">
            <HomeButton />
          </div>
          <div className="flex gap-2 items-center">
            {pasos.map((_, i) => (
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
                {i < pasos.length - 1 && <div className="w-8 h-[2px] bg-gray-300 mx-1 sm:mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="min-h-[280px] mt-2">
              {/* Selector de roles */}
              <div className="flex gap-6 mb-5">
                {(['cliente', 'empresario'] as Rol[]).map((rol) => (
                  <button key={rol} onClick={() => setSelected(rol)} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                        selected === rol ? 'border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      <Image
                        src={t.perfiles[rol].icono}
                        alt={t.perfiles[rol].label}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        selected === rol ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      {t.perfiles[rol].label}
                    </span>
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {t.conoceLabel}{' '}
                <span className="text-[#0057B8]">{currentProfile.nombre}</span>
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[95%]">
                {currentProfile.descripcion}
              </p>
            </div>

            {/* Imagen / vídeo */}
            <div className="flex justify-center lg:justify-end">
              <div className="rounded-xl shadow-lg overflow-hidden bg-black/5">
                <div className="w-[280px] h-[200px] md:w-[320px] md:h-[220px] lg:w-[360px] lg:h-[240px]">
                  <video
                    ref={videoRef}
                    src={currentProfile.video}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                    loop
                    controls={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="w-full max-w-[1020px] px-4 sm:px-10 pt-5">
          <hr className="mb-10 border-gray-200" />
          <div className="flex justify-between items-center mb-16">
            <button
              onClick={() => router.push(`/`)}
              className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full text-sm font-medium transition hover:bg-blue-50"
            >
              {t.buttons.back}
            </button>
            <div className="flex-1 flex justify-center">
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium transition"
              >
                {t.buttons.next}
              </button>
            </div>
            <div className="w-[110px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
