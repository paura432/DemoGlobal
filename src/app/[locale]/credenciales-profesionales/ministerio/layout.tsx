'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type LayoutJson = {
  brand: { logo?: string; sup?: string; title: string };
  menu: string[];
  tools: { lang: string; search: string };
  subnav: string[];
  style?: {
    containerW?: number;
    yellow?: string;
    red?: string;
    subnav?: string;
    text?: string;
    underlineHeight?: number;
    headerPadY?: number;
    logoSize?: number;
  };
  activeMenu?: number;
  return?: string;
};

export default function MinisterioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [cfg, setCfg] = useState<LayoutJson | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isBienvenida = pathname.includes(`/${locale}/credenciales-profesionales/ministerio/bienvenida`);

  // 👇 Aquí controlamos el scroll dinámicamente
  useEffect(() => {
    if (isBienvenida) {
      document.body.style.overflowY = 'auto';   // permite scroll
    }
    return () => {
      document.body.style.overflowY = 'auto'; // limpieza al desmontar
    };
  }, [isBienvenida]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `/locales/credenciales-profesionales/ministerio/layout/${locale}.json`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as LayoutJson;
        if (alive) setCfg(data);
      } catch (e: unknown) {
        if (alive) {
          if (e instanceof Error) {
            setErr(e.message);
          } else {
            setErr(String(e));
          }
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [locale]);

  if (err) return <div className="text-red-600 p-4">{err}</div>;
  if (!cfg) return null;

  const S = cfg.style ?? {};
  const containerW = S.containerW ?? 1100;
  const colorYellow = S.yellow ?? '#F2C400';
  const colorRed = S.red ?? '#B6372B';
  const colorSubnav = S.subnav ?? '#EFEAE0';
  const colorText = S.text ?? '#111111';
  const underlineH = S.underlineHeight ?? 3;
  const headerPadY = S.headerPadY ?? 10;
  const logoSize = S.logoSize ?? 40;
  const activeIdx = Math.max(0, Math.min(cfg.activeMenu ?? 1, cfg.menu.length - 1));

  // Removed redundant declaration of isBienvenida

  return (
    <div className="min-h-screen" style={{ color: colorText, background: '#ffffff' }}>
      {/* HEADER */}
      <header style={{ background: colorYellow }}>
        <div
          className="mx-auto flex items-center justify-between px-4"
          style={{ maxWidth: containerW, paddingTop: headerPadY, paddingBottom: headerPadY }}
        >
          <div className="flex items-center gap-3">
            {cfg.brand.logo ? (
              <Image
                src={cfg.brand.logo}
                alt="Escudo"
                width={logoSize}
                height={logoSize}
                className="object-contain"
                priority
              />
            ) : (
              <div
                className="rounded-md bg-white/70"
                style={{ width: logoSize, height: logoSize }}
              />
            )}
            <div className="leading-tight">
              {cfg.brand.sup && (
                <div className="text-xs text-gray-700">{cfg.brand.sup}</div>
              )}
              <div className="text-xl font-bold -mt-[2px]">{cfg.brand.title}</div>
            </div>
          </div>

          <div className="text-sm flex items-center gap-6">
            <span>{cfg.tools.lang} ▼</span>
            <span className="flex items-center gap-1">
              {cfg.tools.search} <span role="img" aria-label="buscar">🔍</span>
            </span>
          </div>
        </div>

        <nav>
          <div
            className="mx-auto flex items-center gap-6 px-4 text-[15px]"
            style={{ maxWidth: containerW }}
          >
            {cfg.menu.map((label, i) => (
              <div key={i} className="relative py-2">
                <span>{label}</span>
                {i === activeIdx && (
                  <span
                    className="absolute left-0 right-0"
                    style={{ bottom: -underlineH, height: underlineH, background: colorRed }}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ height: 2, background: colorRed }} />
        </nav>

        <div style={{ background: colorSubnav }}>
          <div
            className="mx-auto flex items-center gap-8 px-4 py-2 text-sm"
            style={{ maxWidth: containerW }}
          >
            {cfg.subnav.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>
      </header>

      {isBienvenida && (
        <div className="mx-auto px-4 py-3 flex justify-end" style={{ maxWidth: containerW }}>
          <button
            onClick={() => {
              window.location.assign(`/${locale}/demoglobal`);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-medium rounded-full px-5 py-2
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:ring-offset-1"
            aria-label="Volver"
          >
            {cfg.return || (locale === 'en' ? 'Back to demo' : 'Volver')}
          </button>
        </div>
      )}

      {/* Contenido */}
      <main className="mx-auto px-4 py-6" style={{ maxWidth: containerW }}>
        {children}
      </main>
    </div>
  );
}
