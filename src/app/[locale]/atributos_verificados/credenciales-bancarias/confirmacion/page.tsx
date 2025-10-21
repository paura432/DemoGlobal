'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

const ITEM = {
  brand: 'New Look',
  title: 'PANELLED - Chaqueta vaquera - blue',
  price: 59.99,
  color: 'blue',
  size: '36',
  image: '/titulos_academicos/chaqueta.jpg',
  qty: 1,
};

type ConfirmationContent = {
  confirmation: {
    header: { securePayment: string };
    steps: {
      login: string;
      address: string;
      payment: string;
      confirmation: string;
      done: string;
    };
    leftColumn: {
      title: string;
      deliveryTitle: string;
      deliveryDate: string;
      standardShipping: string;
      free: string;
      orderTitle: string;
      qty: string;
    };
    rightColumn: {
      dataTitle: string;
      bankAccreditation: string;
      completeCapture: string;
      shipping: string;
      total: string;
      vatIncluded: string;
      ctaButton: string;
    };
  };
};

function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const active = stepNum === current;
        const done = stepNum < current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold
                  ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-[#414B61]'}`}
              >
                {done ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className="text-[10px] sm:text-xs mt-1 text-[#414B61] text-center">{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-10 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ConfirmationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [content, setContent] = useState<ConfirmationContent | null>(null);

  
  useEffect(() => {
    (async () => {
      const res = await fetch(`/locales/atributos_verificados/credenciales-bancarias/confirmacion/${locale}.json`);
      const data = await res.json();
      setContent(data);
    })();
  }, [locale]);

  
  if (!content) return null;
  const c = content.confirmation;
  const stepLabels = [c.steps.login, c.steps.address, c.steps.payment, c.steps.confirmation, c.steps.done];

      const cardLabel = locale === 'es'
      ? 'Tarjeta **** **** **** 3456'
      : 'Card **** **** **** 3456';

    const BANK_CREDENTIAL = {
      address: 'Carolina Martínez García',
      card: cardLabel,
    };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1c2230] text-white py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <span className="text-lg font-semibold italic">Shopyline</span>
          </div>
          <span className="text-xs text-[#414B61]">{c.header.securePayment}</span>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <StepIndicator current={4} labels={stepLabels} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* Columna izquierda */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200">
            <h1 className="text-lg sm:text-xl font-bold text-[#414B61] mb-4">{c.leftColumn.title}</h1>

            {/* Entrega */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#414B61]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="4" y="5" width="16" height="16" rx="2" strokeWidth="2" />
                  <path d="M16 3v4M8 3v4M4 11h16" strokeWidth="2" />
                </svg>
                <h2 className="font-semibold text-[#414B61] text-sm">{c.leftColumn.deliveryTitle}</h2>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 ml-2">
                <p className="text-sm font-medium">{c.leftColumn.deliveryDate}</p>
                <p className="text-xs text-[#414B61]">{c.leftColumn.standardShipping}</p>
                <p className="text-xs text-green-600 font-semibold">{c.leftColumn.free}</p>
              </div>
            </div>

            {/* Pedido */}
            <div>
              <h2 className="font-semibold text-[#414B61] text-sm mb-2">{c.leftColumn.orderTitle}</h2>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 ml-2 flex gap-3">
                <div className="w-16 h-24 relative rounded overflow-hidden flex-shrink-0">
                  <Image src={ITEM.image} alt={ITEM.title} fill className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-xs text-[#414B61]">{ITEM.brand}</p>
                  <p className="font-semibold">{ITEM.title}</p>
                  <p className="text-[#414B61]">{ITEM.price.toFixed(2)} €</p>
                  <p className="text-xs text-[#414B61] mt-1">
                    {c.leftColumn.qty}: {ITEM.qty}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-gray-200 h-fit lg:max-w-[360px]">
            <h2 className="font-semibold text-base mb-3">{c.rightColumn.dataTitle}</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="font-semibold text-xs mb-2">{c.rightColumn.bankAccreditation}</p>
              <p className="text-xs text-[#414B61]">{BANK_CREDENTIAL.address}</p>
              <p className="text-xs text-[#414B61]">{BANK_CREDENTIAL.card}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">
                {c.rightColumn.completeCapture} ✓
              </p>
            </div>

            <div className="text-sm border-t pt-3">
              <div className="flex justify-between mb-1">
                <span>{c.rightColumn.shipping}</span>
                <span className="font-semibold">0,00 €</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>
                  {c.rightColumn.total}{' '}
                  <span className="text-xs text-[#414B61] font-normal">
                    {c.rightColumn.vatIncluded}
                  </span>
                </span>
                <span>59,99 €</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/${locale}/demoglobal`)}
              className="w-full bg-black hover:bg-gray-800 text-white py-2 mt-4 rounded-lg font-semibold text-sm transition"
            >
              {c.rightColumn.ctaButton}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
