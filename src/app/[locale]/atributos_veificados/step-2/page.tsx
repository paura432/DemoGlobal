'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HomeButton from '@/components/ui/HomeButton';
import QRCode from 'qrcode';


const PASOS = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] as const;

type StoreId = 'appstore' | 'play';
type AppId = 'privadoid' | 'nik' | 'vidwallet';

type AppItem = { id: AppId; nombre: string; logo: string };
type ModalItem = { title: string; sub?: string };

type Bloque = {
  subtitulo: string;
  texto: string;
  video?: string;
  poster?: string;
  imagen?: string;
  apps?: AppItem[];
  modalItems?: ModalItem[];
};

type StoreLinks = Partial<Record<StoreId, string>>;
type QrByAppStore = Partial<Record<AppId, StoreLinks>>;

type Step2Translations = {
  tituloFijo: string;
  bloques: Bloque[];
  qrByAppStore?: QrByAppStore;
  ui?: {
    modalSubtitle: string;
    close: string;
    done: string;
    extraStep?: string;
  };
  buttons?: {
    back: string;
    next: string;
    go: string;
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

function MediaCard({ mediaSrc, poster }: { mediaSrc?: string; poster?: string }) {
  return (
    <div className="rounded-xl shadow-lg overflow-hidden bg-black/5">
      <div className="w-[280px] h-[200px] md:w-[320px] md:h-[220px] lg:w-[360px] lg:h-[240px]">
        {mediaSrc ? (
          <video
            key={mediaSrc}
            className="w-full h-full object-cover"
            src={mediaSrc}
            poster={poster}
            muted
            playsInline
            autoPlay
            loop
            controls={false}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-sm text-gray-500">
            Sin vídeo
          </div>
        )}
      </div>
    </div>
  );
}

function AppDownloadModal({
  open,
  onClose,
  app,
  store,
  onStoreChange,
  qrDataUrl,
  items = [],
  labels
}: {
  open: boolean;
  onClose: () => void;
  app: AppItem | null;
  store: StoreId;
  onStoreChange: (s: StoreId) => void;
  qrDataUrl: string;
  items?: ModalItem[];
  labels: { close: string; done: string; subtitle: string };
}) {
  if (!open || !app) return null;

  const StoreBtn = ({ id, label, src }: { id: StoreId; label: string; src: string }) => {
    const isActive = store === id;
    return (
      <button
        type="button"
        onClick={() => onStoreChange(id)}
        aria-pressed={isActive}
        title={label}
        aria-label={label}
        className={`transition-all duration-200 ${
          isActive
            ? 'opacity-100 transform scale-100'
            : 'opacity-60 transform scale-95 hover:opacity-80'
        }`}
      >
        <Image src={src} alt={label} width={80} height={24} className="h-6 w-auto object-contain" />
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-8">
          {/* Header con logo de la app */}
          <div className="flex items-center gap-3 mb-8">
            {app.logo ? (
              <Image
                src={app.logo}
                alt={app.nombre}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 grid place-items-center shadow-sm">
                <span className="text-gray-500 font-bold text-xs">App</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{app.nombre}</h3>
            </div>
          </div>

          {/* Layout horizontal: Contenido izquierda, QR derecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Columna izquierda - Lista de pasos */}
            <div className="space-y-4">
              {items.map((it, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="currentColor" />
                      <path
                        d="m8 12 3 3 5-6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm text-gray-700 font-medium"
                      dangerouslySetInnerHTML={{ __html: it.title }}
                    />
                    {it.sub && (
                      <p
                        className="text-xs text-gray-500 mt-1"
                        dangerouslySetInnerHTML={{ __html: it.sub }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Columna derecha - QR */}
            <div className="text-center">
              {/* Botones de tienda */}
              <div className="flex justify-center gap-3 mb-6">
                <StoreBtn id="appstore" label="App Store" src="/demoglobal/apple-store-badge.png" />
                <StoreBtn id="play" label="Google Play" src="/demoglobal/google-play-badge.png" />
              </div>

              {/* QR Code */}
              <div className="inline-block bg-white p-4 rounded-xl border border-gray-200 mb-6">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt={`QR ${app.nombre}`}
                    width={140}
                    height={140}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-35 h-35 grid place-items-center text-gray-400 text-sm">
                    Generando QR...
                  </div>
                )}
              </div>

              {/* Botón Hecho */}
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {labels.done}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Step2() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const currentStep = PASOS.findIndex((s) => pathname.includes(s));

  const [t, setT] = useState<Step2Translations | null>(null);
  const [idx, setIdx] = useState(0);

  // Estado para modal y QR
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreId>('appstore');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch(`/locales/tramites_licencias/step-2/${locale}.json`, {
        cache: 'no-store'
      });
      const data = (await res.json()) as Step2Translations;
      setT(data);
    })();
  }, [locale]);

  const bloque = useMemo(() => (t ? t.bloques[idx] : null), [t, idx]);

  const goTo = (i: number) => {
    const step = PASOS[i];
    if (step) router.push(`/${locale}/tramites_licencias/${step}`);
  };

  const handleNext = () => {
    if (!t) return;
    if (idx < t.bloques.length - 1) setIdx((p) => p + 1);
    else goTo(currentStep + 1);
  };

  // Generar QR según app/tienda
  const genQrFor = async (app: AppItem, store: StoreId) => {
    const url = t?.qrByAppStore?.[app.id]?.[store] ?? '';
    if (!url) {
      setQrDataUrl('');
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 220,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl('');
    }
  };

  const openAppModal = async (app: AppItem) => {
    setSelectedApp(app);
    setSelectedStore('appstore');
    await genQrFor(app, 'appstore');
    setShowModal(true);
  };

  const handleStoreChange = async (s: StoreId) => {
    if (!selectedApp) return;
    setSelectedStore(s);
    await genQrFor(selectedApp, s);
  };

  if (!t || !bloque) return null;

  const getTitleForPhase = () => {
    if (idx === 2) {
      return {
        firstChar: 'I',
        titleParts: ['nstala ', 'tu aplicación ', '']
      };
    } else {
      const firstChar = t.tituloFijo.slice(0, 1);
      const restTitle = t.tituloFijo.slice(1);
      const titleParts = restTitle.split('Wallet');
      return { firstChar, titleParts };
    }
  };

  const { firstChar, titleParts } = getTitleForPhase();

  const buttons = {
    back: t.buttons?.back ?? 'Atrás',
    next: t.buttons?.next ?? 'Siguiente',
    go: t.buttons?.go ?? 'Importar credencial'
  };

  return (
    <div className="h-screen flex flex-col bg-white">
    
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        {/* Pasos */}
        <div className="w-full flex justify-center pt-1 pb-6 relative">
          {/* Botón Home alineado con el progreso */}
          <div className="absolute left-3 sm:left-8 lg:left-14 top-1">
            <HomeButton />
          </div>
          
          <ol className="flex items-center gap-2">
            {PASOS.map((_, i) => (
              <li key={i} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full grid place-items-center border font-bold leading-none text-[11px] ${
                    i === currentStep
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  {i + 1}
                </div>
                {i < PASOS.length - 1 && (
                  <span className="block w-8 h-[2px] bg-gray-300 mx-1 sm:mx-2" />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Contenido */}
        <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-h-[300px]">
            {/* Texto + apps */}
            <div className="min-h-[280px] mt-2">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                <span>{firstChar}</span>
                {titleParts.map((p, i) => (
                  <span key={i}>
                    {p}
                    {idx !== 2 && i < titleParts.length - 1 && (
                      <span className="text-blue-600 font-bold">Wallet</span>
                    )}
                    {idx === 2 && i === 2 && (
                      <span className="text-blue-600 font-bold">Wallet</span>
                    )}
                  </span>
                ))}
              </h2>

              {idx === 2 ? (
                <div className="mt-3 pl-2 space-y-4">
                  {/* Bullet 1 */}
                  <div className="flex gap-2 items-start">
                    <TickSmall />
                    <span className="text-sm text-gray-600 font-semibold">{bloque.texto}</span>
                  </div>

                  {/* Bullet 2 */}
                  <div className="flex gap-2 items-start">
                    <TickSmall />
                    <span className="text-sm text-gray-600 font-semibold">{t.ui?.extraStep}</span>
                  </div>

                  {/* Apps */}
                  {bloque.apps?.length && (
                    <div className="flex gap-6 pl-6 mt-6">
                      {bloque.apps.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => openAppModal(app)}
                          className="group flex flex-col items-center focus:outline-none"
                          title={app.nombre}
                          aria-label={app.nombre}
                        >
                          <div className="w-16 h-16 rounded-xl shadow border border-gray-200 bg-white grid place-items-center group-hover:shadow-md transition">
                            <Image
                              src={app.logo}
                              alt={app.nombre}
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <span className="text-sm text-gray-600 mt-2">{app.nombre}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-3 flex gap-2 items-start">
                    <TickSmall />
                    <span className="text-sm text-gray-600 font-semibold">{bloque.subtitulo}</span>
                  </div>
                  <p
                    className="mt-2 text-sm text-gray-600 leading-relaxed pl-6"
                    dangerouslySetInnerHTML={{ __html: bloque.texto }}
                  />
                </>
              )}
            </div>

            {/* Media */}
            <div className="flex justify-center lg:justify-end">
              <MediaCard mediaSrc={bloque.video} poster={bloque.poster} />
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="w-full max-w-[1020px] px-4 sm:px-10 pt-5">
          <hr className="mb-10 border-gray-200" />
          <div className="relative flex items-center mb-16">
            <div className="w-[110px]">
              <button
                onClick={() => {
                  if (idx > 0) setIdx((p) => p - 1);
                  else goTo(currentStep - 1);
                }}
                className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full text-sm font-medium transition hover:bg-blue-50"
              >
                {buttons.back}
              </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium transition"
              >
                {buttons.next}
              </button>
              
              {idx === 0 && (
                <button
                  onClick={() => router.push(`/${locale}/tramites_licencias/step-3`)}
                  className="text-blue-600 text-sm underline hover:text-blue-700 transition cursor-pointer"
                >
                  {buttons.go}
                </button>
              )}
            </div>

            <div className="ml-auto w-[110px]"></div>
          </div>
        </div>
      </div>

      {/* Modal descarga app */}
      <AppDownloadModal
        open={showModal}
        onClose={() => setShowModal(false)}
        app={selectedApp}
        store={selectedStore}
        onStoreChange={handleStoreChange}
        qrDataUrl={qrDataUrl}
        items={bloque?.modalItems || []}
        labels={{
          close: t.ui?.close ?? 'Cerrar',
          done: t.ui?.done ?? 'Hecho',
          subtitle: t.ui?.modalSubtitle ?? 'Descarga la app y completa el proceso'
        }}
      />
    </div>
  );
}
