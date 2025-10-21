'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

const ITEM = {
  id: '1',
  brand: 'New Look',
  title: 'PANELLED - Chaqueta vaquera - blue',
  price: 59.99,
  color: 'blue',
  size: '36',
  image: '/titulos_academicos/chaqueta.jpg',
  seller: 'Shopyline Europe',
};

type CartContent = {
  cart: {
    banner: string;
    title: string;
    shipping: { by: string; date: string };
    productNew: string;
    qty: string;
    moveToFav: string;
    reminder: string;
    summary: {
      title: string;
      subtotal: string;
      shipping: string;
      total: string;
      vatIncluded: string;
      cta: string;
    };
    header: {
      search: string;
      woman: string;
      man: string;
      news: string;
      clothes: string;
      shoes: string;
      accessories: string;
    };
  };
};

function QtySelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="w-14 h-9 border rounded flex items-center justify-between px-2 text-sm"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {value}
        <span className="text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute z-10 bg-white border rounded mt-1 w-full text-sm shadow-lg">
          {[1, 2, 3, 4, 5].map((q) => (
            <button
              key={q}
              onClick={() => {
                onChange(q);
                setOpen(false);
              }}
              className={`w-full text-left px-2 py-1.5 hover:bg-gray-100 ${
                q === value ? 'font-semibold bg-gray-50' : ''
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BankShoppingCartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [qty, setQty] = useState(1);
  const [content, setContent] = useState<CartContent | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/locales/atributos_verificados/credenciales-bancarias/cesta/${locale}.json`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      setContent(data);
    })();
  }, [locale]);

  const subtotal = useMemo(() => +(ITEM.price * qty).toFixed(2), [qty]);
  const shipping = 0.0;
  const total = useMemo(() => +(subtotal + shipping).toFixed(2), [subtotal]);

  const handleCheckout = () => {
    router.push(`/${locale}/atributos_verificados/credenciales-bancarias/login`);
  };

  if (!content) return null;
  const c = content.cart;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header oscuro como confirmación */}
      <header className="bg-[#1c2230] text-white py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <span className="text-lg font-semibold italic">Shopyline</span>
          </div>
          <span className="text-xs text-[#414B61]">Pago seguro con credenciales verificables</span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        {/* Columna izquierda */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[#414B61]">{c.title}</h1>

          {/* Info de envío */}
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-50 rounded">
            <svg className="w-5 h-5 text-[#414B61]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M20 7h-3V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1v1a3 3 0 0 0 3 3h11.5a1 1 0 0 0 .8-.4l2-2.5a1 1 0 0 0 .2-.6V8a1 1 0 0 0-1-1z"
                strokeWidth="2"
              />
            </svg>
            <div>
              <p className="font-semibold text-sm">{c.shipping.by}</p>
              <p className="text-sm text-[#414B61]">{c.shipping.date}</p>
            </div>
          </div>

          {/* Producto */}
          <div className="border-b pb-4 flex flex-wrap sm:flex-nowrap gap-4">
            <div className="w-28 h-36 relative rounded overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
              <Image src={ITEM.image} alt={ITEM.title} fill className="object-cover" />
            </div>

            <div className="flex-1 text-sm">
              <p className="text-[#414B61] mb-1">{ITEM.brand}</p>
              <p className="font-medium mb-1">{ITEM.title}</p>
              <p className="text-base font-bold mb-2">{ITEM.price.toFixed(2)} €</p>
              <p className="text-xs text-[#414B61]">
                Venta a través de{' '}
                <a href="#" className="underline font-semibold">
                  {ITEM.seller}
                </a>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 sm:gap-3">
              <QtySelect value={qty} onChange={setQty} />
              <button className="text-[#414B61] hover:text-[#414B61]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-[#414B61] flex items-center gap-2">
            ⚠️ <span>{c.reminder}</span>
          </p>
        </div>

        {/* Columna derecha */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-gray-200 h-fit">
          <h2 className="font-bold text-lg mb-4">{c.summary.title}</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{c.summary.subtotal}</span>
              <span className="font-semibold">{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>
                {c.summary.total}{' '}
                <span className="text-xs text-[#414B61] font-normal">{c.summary.vatIncluded}</span>
              </span>
              <span className="text-xl">{total.toFixed(2)} €</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mt-5 rounded-lg font-semibold text-sm transition"
          >
            Continuar con la verificación bancaria
          </button>
        </div>
      </main>
    </div>
  );
}
