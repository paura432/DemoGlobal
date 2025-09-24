'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Resumen = { nombre: string; especialidad: string; centro: string };
type Row = {
  titulo: string;
  agencia: string;
  anio: string;
  autores: string;
  adjuntos?: string[];
  referencias?: string[];
};
type BienvenidaT = {
  titulo?: string;
  subtitulo?: string;
  resumen?: Partial<Resumen>;
  tablaTitulo: string;
  columnas?: string[];
  filas: Row[];
};

const Eye = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-600">
    <path d="M1.5 12S5.5 5.5 12 5.5 22.5 12 22.5 12 18.5 18.5 12 18.5 1.5 12 1.5 12Z" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const CardIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="9" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M7.5 17c1.9-3.2 7.1-3.2 9 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const Steth = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M6 4v7a4 4 0 1 0 8 0V4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M14 11a4 4 0 0 0 8 0v-1a2 2 0 1 0-4 0v1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const Building = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M9 21v-4h6v4M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

function DocPill({ kind }: { kind: string }) {
  const k = kind.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'bg-red-500 text-white',
    xls: 'bg-green-600 text-white',
    doc: 'bg-blue-600 text-white',
    url: 'bg-slate-600 text-white',
    ris: 'bg-amber-600 text-white',
    bib: 'bg-teal-600 text-white',
  };
  const cls = map[k] ?? 'bg-slate-400 text-white';
  return <span className={`inline-block text-[10px] leading-none px-1.5 py-1 rounded ${cls}`}>{k.toUpperCase()}</span>;
}

export default function BienvenidaCursos() {
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [t, setT] = useState<BienvenidaT | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch(`/locales/credenciales-profesionales/ministerio/bienvenida/${locale}.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as BienvenidaT;
        if (!cancelled) setT(data);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'No se pudo cargar la informaciÃ³n');
          setT(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [locale]);

  if (!t) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{error ?? 'Cargandoâ€¦'}</p>
      </div>
    );
  }

  const resumen: Resumen = {
    nombre: t.resumen?.nombre ?? '',
    especialidad: t.resumen?.especialidad ?? '',
    centro: t.resumen?.centro ?? '',
  };

  const filas = t.filas ?? [];
  const COLS = ['TÃ­tulo', 'Agencia', 'AÃ±o de publicaciÃ³n', 'Autores', 'Adjunto', 'Referencia'];

  return (
    <div className="pb-10">
      <div className="w-full bg-white border rounded-2xl shadow p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t.titulo ?? ''}</h1>
        {t.subtitulo && <p className="text-sm text-gray-600">{t.subtitulo}</p>}

        <div className="mt-4 max-w-[840px]">
          <div className="rounded-xl border border-gray-200 bg-gray-100/80 px-5 py-4">
            <div className="grid gap-2 text-sm text-gray-800">
              <div className="flex items-center gap-3">
                <span className="inline-grid place-items-center w-7 h-7 rounded-md border bg-white text-sky-700"><CardIcon /></span>
                <span className="w-28 text-gray-500">Nombre:</span>
                <span className="font-medium">{resumen.nombre || 'â€”'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-grid place-items-center w-7 h-7 rounded-md border bg-white text-sky-700"><Steth /></span>
                <span className="w-28 text-gray-500">Especialidad:</span>
                <span className="font-medium">{resumen.especialidad || 'â€”'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-grid place-items-center w-7 h-7 rounded-md border bg-white text-sky-700"><Building /></span>
                <span className="w-28 text-gray-500">Centro:</span>
                <span className="font-medium">{resumen.centro || 'â€”'}</span>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>

      <div className="w-full bg-white border rounded-2xl shadow">
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-[18px] font-semibold text-sky-800">{t.tablaTitulo}</h2>
          <div className="h-[2px] w-64 bg-orange-400 rounded mt-2" />
          <p className="text-xs text-gray-600 mt-3 max-w-[1100px]">
            Los productos generados en el marco de la Red de Agencias se elaboran con una
            sistemÃ¡tica especÃ­fica, basÃ¡ndose en un anÃ¡lisis exhaustivo de la literatura cientÃ­fica
            y con una metodologÃ­a que garantiza unos resultados rigurosos y fiables.
          </p>
        </div>

        <div className="px-6 py-2 text-xs text-gray-700 flex items-center justify-between">
          <span>{`${filas.length} filas, mostrando desde 1 a ${Math.min(10, filas.length)}.`}</span>
          <div className="flex items-center gap-[4px]">
            {['Â«','â€¹',1,2,3,4,5,6,7,8,'â€º','Â»'].map((it, i) => {
              const active = it === 2;
              return (
                <button
                  key={i}
                  className={`h-6 min-w-6 px-1 grid place-items-center rounded-[2px] border ${active ? 'bg-sky-700 text-white border-sky-700' : 'bg-white hover:bg-slate-100 border-slate-300'}`}
                  type="button"
                >
                  {it}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="bg-[#dbe9f7] text-[#324b67] border-t border-b border-[#c9dcec]">
                {COLS.map((c) => (
                  <th key={c} className="text-left font-semibold px-4 py-2.5 whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.slice(0, 10).map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-[#f5f9fe] border-b border-slate-200">
                  <td className="px-4 py-2.5 align-top text-[13px] text-sky-800 hover:underline cursor-pointer">{row.titulo}</td>
                  <td className="px-4 py-2.5 align-top whitespace-nowrap"><span className="inline-flex items-center gap-2"><Eye /><span>{row.agencia}</span></span></td>
                  <td className="px-4 py-2.5 align-top whitespace-nowrap">{row.anio}</td>
                  <td className="px-4 py-2.5 align-top">{row.autores}</td>
                  <td className="px-4 py-2.5 align-top whitespace-nowrap">
                    {(row.adjuntos ?? []).map((k, idx) => (<span key={idx} className="mr-1"><DocPill kind={k} /></span>))}
                  </td>
                  <td className="px-4 py-2.5 align-top whitespace-nowrap">
                    {(row.referencias ?? []).map((k, idx) => (<span key={idx} className="mr-1"><DocPill kind={k} /></span>))}
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} className="px-6 py-8 text-center text-gray-500">No hay filas para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 text-xs text-gray-700 flex items-center justify-between border-t">
          <span>{`${filas.length} filas, mostrando desde 1 a ${Math.min(10, filas.length)}.`}</span>
          <div className="flex items-center gap-[4px]">
            {['Â«','â€¹',1,2,3,4,5,6,7,8,'â€º','Â»'].map((it, i) => {
              const active = it === 2;
              return (
                <button
                  key={i}
                  className={`h-6 min-w-6 px-1 grid place-items-center rounded-[2px] border ${active ? 'bg-sky-700 text-white border-sky-700' : 'bg-white hover:bg-slate-100 border-slate-300'}`}
                  type="button"
                >
                  {it}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}