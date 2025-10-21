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
  return (
    <span className={`inline-block text-[10px] leading-none px-1.5 py-1 rounded ${cls}`}>
      {k.toUpperCase()}
    </span>
  );
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
        const res = await fetch(
          `/locales/credenciales-profesionales/ministerio/bienvenida/${locale}.json`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as BienvenidaT;
        if (!cancelled) setT(data);
      } catch (e: unknown) {
        if (!cancelled) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError('No se pudo cargar la información');
          }
          setT(null);
        }
      }
      
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!t) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{error ?? 'Cargando…'}</p>
      </div>
    );
  }

  const resumen: Resumen = {
    nombre: t.resumen?.nombre ?? '',
    especialidad: t.resumen?.especialidad ?? '',
    centro: t.resumen?.centro ?? '',
  };

  const filas = t.filas ?? [];
  const COLS = t.columnas ?? [];

  return (
    <div className="pb-10">
      <div className="w-full bg-white border rounded-2xl shadow p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#414B61] mb-1">{t.titulo ?? ''}</h1>
        {t.subtitulo && <p className="text-sm text-[#414B61]">{t.subtitulo}</p>}

        <div className="mt-4 max-w-[840px]">
          <div className="rounded-xl border border-gray-200 bg-gray-100/80 px-5 py-4">
            <div className="grid gap-2 text-sm text-[#414B61]">
              <div className="flex items-center gap-3">
                <span className="w-28 text-[#414B61]">Nombre:</span>
                <span className="font-medium">{resumen.nombre || '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-[#414B61]">Especialidad:</span>
                <span className="font-medium">{resumen.especialidad || '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-[#414B61]">Centro:</span>
                <span className="font-medium">{resumen.centro || '—'}</span>
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
          <p className="text-xs text-[#414B61] mt-3 max-w-[1100px]">
            {locale === 'es'
              ? 'Los productos generados en el marco de la Red de Agencias se elaboran con una sistemática específica, basándose en un análisis exhaustivo de la literatura científica y con una metodología que garantiza unos resultados rigurosos y fiables.'
              : 'The products generated within the framework of the Agency Network are developed with a specific methodology, based on an exhaustive analysis of the scientific literature and with a methodology that guarantees rigorous and reliable results.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="bg-[#dbe9f7] text-[#324b67] border-t border-b border-[#c9dcec]">
                {COLS.map((c) => (
                  <th key={c} className="text-left font-semibold px-4 py-2.5 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.slice(0, 10).map((row, i) => (
                <tr
                  key={i}
                  className="odd:bg-white even:bg-[#f5f9fe] border-b border-slate-200"
                >
                  <td className="px-4 py-2.5 text-sky-800">{row.titulo}</td>
                  <td className="px-4 py-2.5">{row.agencia}</td>
                  <td className="px-4 py-2.5">{row.anio}</td>
                  <td className="px-4 py-2.5">{row.autores}</td>
                  <td className="px-4 py-2.5">
                    {(row.adjuntos ?? []).map((k, idx) => (
                      <span key={idx} className="mr-1">
                        <DocPill kind={k} />
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-2.5">
                    {(row.referencias ?? []).map((k, idx) => (
                      <span key={idx} className="mr-1">
                        <DocPill kind={k} />
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
