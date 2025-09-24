'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';

const PASOS = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] as const;

type StoreId = 'appstore' | 'play';
type AppId = 'procivis';

type AppItem = { id: AppId; nombre: string; logo: string };
type ModalItem = { title: string; sub?: string };

type Bloque = {
  subtitulo: string;
  texto: string;
  video?: string;
  poster?: string;
  imagen?: string;
  // NUEVO:
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
  };
  buttons?: {
    back: string;
    next: string;
    go: string; 
  };
};

function TickSmall() {
  return (
    <svg className="mt-[4px] w-3 h-3 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="2"/>
      <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <div className="w-full h-full grid place-items-center text-sm text-gray-500">Sin vÃ­deo</div>
        )}
      </div>
    </div>
  );
}

function AppDownloadModal({
  open, onClose, app, store, onStoreChange, qrDataUrl, items = [], labels
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

  const MODAL_W = 880;
  const RIGHT_W = 240;
  const QR_W = 260;
  const QR_H = 190;
  const BADGE_GAP = 30;
  const BADGE_W = (QR_W - BADGE_GAP) / 2;

  const StoreBtn = ({ id, label, src }: { id: StoreId; label: string; src: string }) => {
    const isActive = store === id;
    return (
      <button
        type="button"
        onClick={() => onStoreChange(id)}
        aria-pressed={isActive}
        title={label}
        aria-label={label}
        className={[
          'h-9 grid place-items-center rounded-md border transition',
          isActive ? 'bg-white border-blue-600 ring-4 ring-blue-300 shadow-sm scale-[1.02]' : 'border-gray-300 hover:border-gray-400'
        ].join(' ')}
        style={{ width: BADGE_W }}
      >
        <Image src={src} alt={label} width={112} height={28} className="h-7 w-auto object-contain" />
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 md:px-16 relative" style={{ width: MODAL_W, maxWidth: '96vw' }}>
        <button onClick={onClose} className="absolute right-3 top-3 w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100" aria-label={labels.close}>âœ•</button>
        <div className="grid items-start" style={{ gridTemplateColumns: `1fr ${RIGHT_W}px`, gap: 140 }}>
          <div className="pr-4">
            <div className="flex items-center gap-3 mb-3">
              <Image src={app.logo} alt={app.nombre} width={44} height={44} className="rounded-md object-contain" />
              <div>
                <h3 className="text-[20px] font-semibold text-gray-900 leading-none">{app.nombre}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-none">{labels.subtitle}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-5">
              {items.map((it, i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-[2px]">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] text-gray-800" dangerouslySetInnerHTML={{ __html: it.title }} />
                    {it.sub && <p className="text-[12px] text-gray-500 mt-1 leading-snug" dangerouslySetInnerHTML={{ __html: it.sub }} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="justify-self-end">
            <div className="rounded-2xl bg-[#eaf2ff] border border-blue-200 shadow-sm p-6 md:p-7">
              <div className="mx-auto flex items-center justify-between mb-3" style={{ width: QR_W, gap: BADGE_GAP }}>
                <StoreBtn id="appstore" label="App Store" src="/demoglobal/app-store-badge.png" />
                <StoreBtn id="play" label="Google Play" src="/demoglobal/google-play-badge.png" />
              </div>
              <div className="mx-auto rounded-2xl bg-white border-2 border-gray-300 shadow-inner grid place-items-center" style={{ width: QR_W, height: QR_H }}>
                <Image src={qrDataUrl || '/demoglobal/qr-placeholder.png'} alt={`QR ${app.nombre}`} width={QR_W - 96} height={QR_W - 96} className="object-contain" />
              </div>
              <div className="mt-4 grid place-items-center">
                <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-sm font-medium shadow-sm" style={{ width: QR_W }}>
                  {labels.done}
                </button>
              </div>
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
      const res = await fetch(`/locales/credenciales-profesionales/step-2/${locale}.json`, { cache: 'no-store' });
      const data = (await res.json()) as Step2Translations;
      setT(data);
    })();
  }, [locale]);

  const bloque = useMemo(() => (t ? t.bloques[idx] : null), [t, idx]);

  const goTo = (i: number) => {
    const step = PASOS[i];
    if (step) router.push(`/${locale}/credenciales-profesionales/${step}`);
  };

  const handleNext = () => {
    if (!t) return;
    if (idx < t.bloques.length - 1) setIdx((p) => p + 1);
    else goTo(currentStep + 1);
  };

  const goStep3 = () => router.push(`/${locale}/credenciales-profesionales/step-3`);

  // Generar QR segÃºn app/tienda
  const genQrFor = async (app: AppItem, store: StoreId) => {
    const url = t?.qrByAppStore?.[app.id]?.[store] ?? '';
    if (!url) { setQrDataUrl(''); return; }
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1, errorCorrectionLevel: 'M' });
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

  const firstChar = t.tituloFijo.slice(0, 1);
  const restTitle = t.tituloFijo.slice(1);
  const titleParts = restTitle.split('Wallet');

  const buttons = {
    back: t.buttons?.back ?? 'AtrÃ¡s',
    next: t.buttons?.next ?? 'Siguiente',
    go: t.buttons?.go ?? 'Importar credencial'
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        {/* Pasos */}
        <div className="w-full flex justify-center pt-1 pb-6">
          <ol className="flex items-center gap-2">
            {PASOS.map((_, i) => (
              <li key={i} className="flex items-center">
                <div className={`w-6 h-6 rounded-full grid place-items-center border font-bold leading-none text-[11px] ${
                  i === currentStep ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'
                }`}>{i + 1}</div>
                {i < PASOS.length - 1 && <span className="block w-8 h-[2px] bg-gray-300 mx-1 sm:mx-2" />}
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
                    {i < titleParts.length - 1 && <span className="text-blue-600 font-bold">Wallet</span>}
                  </span>
                ))}
              </h2>

              <div className="mt-3 flex gap-2 items-start">
                <TickSmall />
                <a className="text-sm text-gray-600 font-semibold">{bloque.subtitulo}</a>
              </div>

              <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-6" dangerouslySetInnerHTML={{ __html: bloque.texto }} />

              {/* Iconos de apps (solo si el bloque trae apps) */}
              {!!bloque.apps?.length && (
                <div className="mt-5 flex gap-8 items-center pl-6">
                  {bloque.apps.map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => openAppModal(app)}
                      className="group flex flex-col items-center focus:outline-none"
                      title={app.nombre}
                      aria-label={app.nombre}
                    >
                      <div className="w-16 h-16 rounded-xl shadow border border-gray-200 bg-white grid place-items-center group-hover:shadow-md transition">
                        <img src={app.logo} alt={app.nombre} className="w-10 h-10 object-contain" />
                      </div>
                      <span className="text-[11px] text-gray-600 mt-2">{app.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            <div className="flex justify-center lg:justify-end">
              <MediaCard mediaSrc={bloque.video} poster={bloque.poster} />
            </div>
          </div>
        </div>

        {/* NavegaciÃ³n */}
        <div className="w-full max-w-[1020px] px-4 sm:px-10 pt-5">
  <hr className="mb-10 border-gray-200" />

        {/* Contenedor relativo para centrar Siguiente de forma absoluta */}
        <div className="relative flex items-center mb-16">
          {/* Columna izquierda (AtrÃ¡s) - mismo ancho que antes */}
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

          {/* BotÃ³n Siguiente centrado ABSOLUTO (no se desplaza nunca) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium transition"
            >
              {buttons.next}
            </button>
          </div>

          {/* Columna derecha: botÃ³n extra SOLO en la primera fase (idx === 0) */}
          <div className="ml-auto w-[220px] flex justify-end">
            {idx === 0 && (
              <button
                onClick={() => router.push(`/${locale}/credenciales-profesionales/step-3`)}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full text-sm font-medium transition hover:bg-blue-50"
              >
                {buttons.go}
              </button>
            )}
          </div>
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
        items={bloque.modalItems}
        labels={{
          close: t.ui?.close ?? 'Cerrar',
          done: t.ui?.done ?? 'Hecho',
          subtitle: t.ui?.modalSubtitle ?? 'Descarga la app y completa el proceso'
        }}
      />
    </div>
  );
}