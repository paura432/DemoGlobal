'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HomeButton from '@/components/ui/HomeButton';
import { QRCodeCanvas } from 'qrcode.react';

const PASOS = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] as const;

type AppId = 'procivis';
type BlockId = 'install' | 'import' | 'qr' | 'use';
type Rol = 'cliente' | 'empresario';

type AppItem = { id: AppId; nombre: string; logo: string };

type Block = {
  id: BlockId;
  titulo: string;
  instrucciones: string[];
  video?: string;
  poster?: string;
  apps?: AppItem[];
  boton?: string;
  credencialImagen?: string;
  qrHeaderImage?: string;
};

type Step3Json = {
  bloques: Block[];
};

interface CreateCredentialResponse {
  urls: {
    appUrl: string;
  };
}

// ✅ Tipado de las credenciales
const CREDENTIALS = {
  cliente: {
    schema: 'cliente',
    data: {
      Titular: 'Carolina Martínez García',
      NúmeroTarjeta: '1234 5678 9012 3456',
      FechaEmisón: '2024-06-01',
      FechaExpedición: '2030-06-01',
      MayorEdad: 'true',
    },
  },
  empresario: {
    schema: 'empresario',
    data: {
      DenominaciónSocial: 'Tech Solutions S.L.',
      CIF: 'B12345678',
      DirecciónFiscal: 'Calle Innovación, 45, 28023 Madrid',
      IBAN: 'ES9121000418450200051332',
      FechaExpedición: '2025-09-15',
    },
  },
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
  const locale = match ? (match[1] as 'es' | 'en') : 'es';

  const [t, setT] = useState<Step3Json | null>(null);
  const [rol, setRol] = useState<Rol>('cliente');
  const [hydrated, setHydrated] = useState(false);
  const [subIdx, setSubIdx] = useState(0);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedWrapQr, setIssuedWrapQr] = useState('');
  const QR_SIZE = 160;

  // Recuperar rol desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atributos_rol') as Rol | null;
      if (stored === 'empresario' || stored === 'cliente') {
        setRol(stored);
      }
      setHydrated(true);
    }
  }, []);

  // Cargar JSON según rol
  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      const res = await fetch(`/locales/atributos_verificados/step-3/${rol}/${locale}.json`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as Step3Json;
      setT(data);
    })();
  }, [locale, rol, hydrated]);

  const allBlocks = t?.bloques ?? [];
  const blocks = allBlocks.filter((b) => b.id !== 'use');
  const block = blocks[Math.max(0, Math.min(subIdx, blocks.length - 1))];

  // ✅ Tipado de respuesta y errores seguro
  const issueCredential = async (): Promise<void> => {
    try {
      setIssuing(true);
      setIssueError(null);
      setIssuedWrapQr('');

      const apiurl = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';
      const credentialConfig = CREDENTIALS[rol];

      const payload = {
        schema: credentialConfig.schema,
        credential: credentialConfig.data,
      };

      const res = await fetch(`${apiurl}/api/v1/createCredential/procivis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as CreateCredentialResponse;

      if (!data.urls?.appUrl) throw new Error('URL no disponible en respuesta');

      setIssuedWrapQr(data.urls.appUrl);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Error desconocido');
      setIssueError(error.message);
    } finally {
      setIssuing(false);
    }
  };

  useEffect(() => {
    if (block?.id === 'qr') issueCredential();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block, rol]);

  const goTo = (step: typeof PASOS[number]) =>
    router.push(pathname.replace(/step-\d+(.*)?$/, `${step}$1`));
  const goStep2Part2 = () =>
    router.push(pathname.replace(/step-\d+(.*)?$/, 'step-2$1') + '#parte-2');

  const goBack = (): void => {
    if (subIdx > 0) setSubIdx((p) => p - 1);
    else goTo('step-2');
  };

  const goNext = (): void => {
    if (subIdx < blocks.length - 1) setSubIdx((p) => p + 1);
    else goTo('step-4');
  };

  if (!hydrated || !block) return null;

  return (
    <div className="flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col items-center">
        {/* Barra de progreso */}
        <div className="w-full flex justify-center pt-1 pb-6 relative">
          <div className="absolute left-3 sm:left-8 lg:left-14 top-1">
            <HomeButton />
          </div>

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

        {/* Contenido */}
        <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-h-[300px]">
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

              {block.id === 'qr' && issueError && (
                <p className="mt-2 text-sm text-red-600">
                  Error emitiendo credencial: {issueError}
                </p>
              )}
            </div>

            <div className="flex justify-center lg:justify-end">
              {block.id !== 'qr' && block.video && (
                block.id === 'import' ? (
                  <button
                    type="button"
                    onClick={goStep2Part2}
                    className="cursor-pointer"
                    title="Ir a Step-2 (parte 2)"
                  >
                    <MediaCard mediaSrc={block.video} poster={block.poster} />
                  </button>
                ) : (
                  <MediaCard mediaSrc={block.video} poster={block.poster} />
                )
              )}

              {block.id === 'qr' && (
                <div className="rounded-2xl shadow-lg bg-white border border-gray-200 p-5">
                  <div className="w-[180px] md:w-[220px] lg:w-[260px] mx-auto grid place-items-center">
                    {block.qrHeaderImage && (
                      <Image
                        src={block.qrHeaderImage}
                        alt="Logo"
                        width={180}
                        height={180}
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
                            Generando QR…
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {issuing ? 'Generando QR…' : 'Preparando QR'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="w-full max-w-[1020px] px-4 sm:px-10 pt-5">
          <hr className="mb-10 border-gray-200" />
          <div className="flex justify-between items-center mb-16">
            <button
              onClick={goBack}
              className="border border-blue-600 text-blue-600 px-8 py-2 rounded-full text-sm font-medium transition hover:bg-blue-50"
            >
              Atrás
            </button>
            <div className="flex-1 flex justify-center">
              <button
                onClick={goNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium transition"
              >
                {block.boton ?? (subIdx < blocks.length - 1 ? 'Siguiente' : 'Ir a Ministerio')}
              </button>
            </div>
            <div className="w-[110px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
