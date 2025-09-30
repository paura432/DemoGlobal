'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Card = {
  id: string;
  title: string;
  desc: string;
  img: string;
  cta: string;
  href: string;
  badge?: string;
  priority?: boolean;
};

type CardsDoc = {
  breadcrumb?: {
    prefix?: string;
    area?: string;
    section?: string;
    separator?: string;
  };
  settings?: {
    cardWidth?: number;
    aspectRatio?: string;
    gapPx?: number;
  };
  cards?: Card[];
};

export default function MinisterioPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [doc, setDoc] = useState<CardsDoc | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        const load = async (loc: 'es' | 'en') => {
          const r = await fetch(`/locales/credenciales-profesionales/ministerio/${locale}.json`, { cache: 'no-store' });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return (await r.json()) as CardsDoc;
        };
        let data: CardsDoc;
        try {
          data = await load(locale);
        } catch {
          data = await load('es');
        }
        if (alive) setDoc(data);
      } catch (e: any) {
        if (alive) {
          setErr(e?.message ?? 'No se pudo cargar la configuración');
          setDoc({ cards: [] });
        }
      }
    })();
    return () => { alive = false; };
  }, [locale]);

  if (!doc) return null;

  const { settings } = doc;
  const cardW = settings?.cardWidth ?? 280;
  const gapPx = settings?.gapPx ?? 20;
  const aspect = settings?.aspectRatio ?? '16 / 10';

  const cards: Card[] = Array.isArray(doc.cards) ? doc.cards : [];

  const goto = (href: string) => {
    if (!href || href === '#') return;
    
    let finalHref = href;
    
    // Si la href no empieza con el locale, agregarlo
    if (!href.startsWith(`/${locale}/`)) {
      if (href.startsWith('/')) {
        finalHref = `/${locale}${href}`;
      } else {
        finalHref = `/${locale}/${href}`;
      }
    }
    
    console.log('Navigating to:', finalHref); // Para debug
    router.push(finalHref);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-[13px] text-gray-600 mb-5">
        <span className="text-gray-500">{doc.breadcrumb?.prefix ?? 'Está usted en:'}</span>{' '}
        <span className="hover:underline cursor-default">{doc.breadcrumb?.area ?? 'Áreas'}</span>{' '}
        <span className="text-gray-400">{doc.breadcrumb?.separator ?? '›'}</span>{' '}
        <span className="font-medium">{doc.breadcrumb?.section ?? 'Salud Digital'}</span>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center"
        style={{ gap: `${gapPx}px` }}
      >
        {cards.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
            style={{ width: cardW }}
          >
            <div className="relative w-full" style={{ aspectRatio: aspect }}>
              <Image
                src={c.img}
                alt={c.title}
                fill
                className="object-cover"
                sizes={`${cardW}px`}
                priority={!!c.priority}
              />
            </div>

            <div className="px-3 pt-2 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-gray-900">{c.title}</h3>
                {c.badge && (
                  <span className="text-[9px] leading-none px-1.5 py-[4px] rounded-full bg-orange-500 text-white font-bold uppercase">
                    {c.badge}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-gray-600 min-h-[36px]">{c.desc}</p>

              <button
                type="button"
                onClick={() => goto(c.href)}
                className="mt-2 w-full rounded-full px-3 py-1.5 text-xs font-semibold border-2 border-orange-400 text-orange-600 bg-white hover:bg-orange-500 hover:text-white transition"
                aria-label={c.cta}
              >
                {c.cta}
              </button>
            </div>
          </article>
        ))}

        {cards.length === 0 && (
          <div className="col-span-full text-small-auto-responsive text-gray-500 py-10">
            {err ? `No hay tarjetas. (${err})` : 'No hay tarjetas para mostrar.'}
          </div>
        )}
      </div>
    </div>
  );
}