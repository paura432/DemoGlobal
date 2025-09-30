'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Paso = { id: string; texto: string };
type ProgresoCfg = { mostrarBarra?: boolean; velocidadMsPorPaso?: number; color?: string };
type ResultadoCfg = { estado?: 'ok' | 'error'; redirigirA?: string; delayFinalMs?: number; cta?: string };
type LayoutCfg = { centrado?: boolean; compacto?: boolean };

type TCfg = {
  titulo: string;
  pasos: Paso[];
  progreso?: ProgresoCfg;
  resultado?: ResultadoCfg;
  layout?: LayoutCfg;
};

function PersonIcon({ className = 'w-4 h-4 text-gray-800' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 19.25c.8-3.2 3.7-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CheckCircle({ className = 'w-[14px] h-[14px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M14.2 7.6 9 12.8 6.6 10.3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PendingCircle({ className = 'w-[14px] h-[14px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.75" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
    </svg>
  );
}

export default function MinisterioVerificando() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [cfg, setCfg] = useState<TCfg | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [active, setActive] = useState(1);
  const [finished, setFinished] = useState(false);

  const steps = useMemo(() => cfg?.pasos?.map(p => p.texto) ?? [], [cfg]);
  const STEP_MS = cfg?.progreso?.velocidadMsPorPaso ?? 900;
  const color = cfg?.progreso?.color ?? '#22c55e';
  const showBar = cfg?.progreso?.mostrarBarra ?? true;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const load = async (loc: 'es' | 'en') => {
          const r = await fetch(`/locales/credenciales-profesionales/ministerio/verificacion/${locale}.json`, { cache: 'no-store' });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return (await r.json()) as TCfg;
        };
        let data: TCfg;
        try { data = await load(locale); } catch { data = await load('es'); }
        if (alive) setCfg(data);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Error cargando configuraciÃ³n');
      }
    })();
    return () => { alive = false; };
  }, [locale]);

  useEffect(() => {
    if (!steps.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 2; i <= steps.length; i++) {
      timers.push(setTimeout(() => setActive(i), STEP_MS * (i - 1)));
    }
    timers.push(setTimeout(() => setFinished(true), STEP_MS * steps.length));
    return () => timers.forEach(clearTimeout);
  }, [steps, STEP_MS]);

  const computeTarget = () => {
    const redir = cfg?.resultado?.redirigirA || '/credenciales-profesionales/ministerio/bienvenida';
    if (/^https?:\/\//i.test(redir)) return redir;
    if (/^\/(es|en)\//.test(redir)) return redir;
    return `/${locale}${redir.startsWith('/') ? '' : '/'}${redir}`;
  };

  if (err) {
    return <div className="w-full flex justify-center mt-12 text-red-600 text-sm px-4">{err}</div>;
  }
  if (!cfg) return null;

  const doneCount = finished ? steps.length : Math.max(0, active - 1);
  const pct = steps.length ? Math.min(100, Math.round((doneCount / steps.length) * 100)) : 0;

  const containerW = cfg.layout?.compacto ? 480 : 640;
  const centered = cfg.layout?.centrado !== false;

  return (
    <div
      className={`w-full flex items-center justify-center`}
      style={{ minHeight: 'calc(50vh - 100px)' }} // ajusta según la altura del header
    >
      <div className="px-4 flex flex-col items-center" style={{ width: containerW }}>
        {/* Título estático */}
        <div className="flex items-center gap-2 mb-4">
          <PersonIcon />
          <h2 className="text-[20px] leading-[24px] font-semibold text-gray-900">
            {cfg.titulo}
          </h2>
        </div>
  
        {/* Barra de progreso */}
        {showBar && (
          <div className="w-full max-w-[360px] h-[6px] bg-gray-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%`, backgroundColor: color }}
              aria-hidden="true"
            />
          </div>
        )}
  
        {/* Lista de pasos */}
        <ul className="mt-2 space-y-3 w-full max-w-[360px]" aria-live="polite">
          {steps.map((label, idx) => {
            const isActive = idx + 1 === active && !finished;
            const done = finished || idx + 1 < active;
            return (
              <li
                key={idx}
                className="flex items-center gap-3"
                style={{
                  animation: isActive ? 'fadeIn 240ms ease-out both' : undefined
                }}
              >
                {done ? <CheckCircle /> : <PendingCircle />}
                <span
                  className={`text-[14px] leading-[20px] ${
                    done ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
  
        {/* CTA final */}
        {finished && (
          <div className="mt-8 w-full flex justify-center">
            <button
              onClick={() => router.push(computeTarget())}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full text-sm font-medium shadow-sm transition"
            >
              {cfg.resultado?.cta ?? (locale === 'en' ? 'Access' : 'Acceder')}
            </button>
          </div>
        )}
  
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(2px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
  