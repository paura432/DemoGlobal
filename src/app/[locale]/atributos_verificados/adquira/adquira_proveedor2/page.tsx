'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

type AdquiraProveedorContent = {
  header: {
    title: string;
    tabs: string[];
    nav: string[];
    menu: string[];
  };
  userSection: {
    title: string;
    user: string;
    companyName: string;
    cif: string;
    button: string;
  };
  notifications: {
    title: string;
    emailSettings: string;
    emailFormat: string;
    orders: string[];
  };
  done: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    copyright: string;
    links: {
      trustCenter: string;
      ethicCode: string;
      privacyPolicy: string;
      legalNotice: string;
    };
    customerService: { label: string; emoji: string };
  };
};

export default function AdquiraProveedorPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const [t, setT] = useState<AdquiraProveedorContent | null>(null);

  // Cargar traducción
  useEffect(() => {
    fetch(`/locales/atributos_verificados/adquira/adquira_proveedor2/${locale}.json`)
      .then((r) => r.json())
      .then(setT)
      .catch(() => console.error('Error cargando traducción'));
  }, [locale]);

  if (!t) return null;

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-gray-800">
      {/* HEADER */}
      <header className="bg-[#e9ebe7] border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/atributos_verificados/adquira.png" alt="Adquira" width={130} height={40} />
            <div className="flex gap-4">
              {t.header.nav.map((item, i) => (
                <button
                  key={i}
                  className="bg-white rounded-full shadow p-2 text-sm font-medium text-gray-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button className="text-xs bg-[#d6e4cf] text-[#4a5c3b] px-3 py-1 rounded-full hover:bg-[#c9d9c3] transition">
            {t.footer.customerService.emoji} {t.footer.customerService.label}
          </button>
        </div>
      </header>

      {/* NAV BAR NEGRA */}
      <nav className="bg-[#1e1e1e] text-white text-sm font-medium">
        <div className="max-w-7xl mx-auto px-6 py-2 flex gap-6">
          {t.header.menu.map((item, i) => (
            <span key={i} className="hover:text-[#d6e4cf] cursor-pointer">
              {item}
            </span>
          ))}
        </div>
      </nav>

      {/* BARRA BEIGE */}
      <div className="bg-[#d5d1b8] text-xs text-gray-700 py-1 px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          Está viendo: <span className="font-semibold">Todos los compradores</span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto bg-white border border-gray-200 shadow-sm rounded-md p-10 mt-6">
        <h1 className="text-xl font-bold mb-6">{t.header.title}</h1>

        <div className="flex gap-6 text-sm font-semibold mb-6 border-b border-gray-200">
          {t.header.tabs.map((tab, i) => (
            <span
              key={i}
              className={`pb-1 ${
                i === 0 ? 'text-[#c00000] border-b-2 border-[#c00000]' : 'text-gray-600'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <h2 className="text-[#c00000] font-bold text-lg mb-1">{t.userSection.title}</h2>
        <p className="text-gray-700 font-medium">{t.userSection.user}</p>
        <p className="text-gray-600 font-semibold mt-1">{t.userSection.companyName}</p>
        <p className="text-sm text-gray-500 mb-4">{t.userSection.cif}</p>

        <button
          onClick={() => router.push(`/${locale}`)}
          className="bg-[#0057B8] text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-[#004c9d] transition"
        >
          {t.done.button}
        </button>

        <div className="mt-10">
          <h3 className="font-bold text-gray-800 mb-3">{t.notifications.title}</h3>
          <p className="text-[#c00000] font-bold text-sm mb-2">{t.notifications.emailSettings}</p>
          <p className="text-gray-600 text-sm italic mb-4">{t.notifications.emailFormat}</p>
          <ul className="space-y-2 text-sm text-gray-700">
            {t.notifications.orders.map((o, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#808a3d] rounded-sm" /> {o}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-10 text-center text-xs text-gray-600 pb-6">
        <p className="mb-2">{t.footer.copyright}</p>
        <div className="flex justify-center gap-6 flex-wrap">
          <a href="#">{t.footer.links.trustCenter}</a>
          <a href="#">{t.footer.links.ethicCode}</a>
          <a href="#">{t.footer.links.privacyPolicy}</a>
          <a href="#">{t.footer.links.legalNotice}</a>
        </div>
      </footer>
    </div>
  );
}
