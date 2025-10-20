'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Traducciones ---
const TRANSLATIONS = {
  es: {
    header: {
      tabs: ["Mujer", "Hombre"],
      account: "Cuenta",
      favorites: "Favoritos",
      cart: "Cesta",
      search: "Busca aquí",
      freeShipping: "Envío gratuito para pedidos superiores a 30€"
    }
  },
  en: {
    header: {
      tabs: ["Women", "Men"],
      account: "Account",
      favorites: "Favorites",
      cart: "Cart",
      search: "Search here",
      freeShipping: "Free shipping on orders over €30"
    }
  }
};

// --- Iconos inline ---
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" />
  </svg>
);
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2h12v4H6z" />
    <path d="M4 6h16l-1.5 14.5A2 2 0 0 1 16.5 22h-9A2 2 0 0 1 5.5 20.5L4 6z" />
    <path d="M9 10v-1a3 3 0 0 1 6 0v1" />
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-3.6-3.6" />
  </svg>
);

type HeaderTranslations = {
  tabs: string[];
  account: string;
  favorites: string;
  cart: string;
  search: string;
  freeShipping: string;
};

function Header({ cartCount, t }: { cartCount: number; t: HeaderTranslations }) {
  return (
    <header className="w-full border-b flex-shrink-0">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-6 h-16">
        {/* Tabs */}
        <nav className="flex gap-2 text-[14px] font-semibold">
          <Link href="#" className="px-3 py-1 rounded bg-black text-white">{t.tabs[0]}</Link>
          <Link href="#" className="px-3 py-1 rounded hover:bg-gray-100">{t.tabs[1]}</Link>
        </nav>

        {/* Logo */}
        <div className="flex-1 text-center">
          <Link href="#" className="inline-block text-3xl font-serif tracking-wide text-indigo-900">Shopyline</Link>
        </div>

        {/* Iconos */}
        <div className="flex items-center gap-4">
          <Link href="#" aria-label={t.account}><IconUser /></Link>
          <Link href="#" aria-label={t.favorites}><IconHeart /></Link>
          <Link href="#" aria-label={t.cart} className="relative">
            <IconBag />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full w-5 h-5 grid place-items-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="border-t">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex justify-end">
            <form className="w-[360px] flex items-center gap-2 border rounded-full px-3 py-2 text-sm" action="/buscar">
              <IconSearch />
              <input name="q" className="flex-1 outline-none" placeholder={t.search} />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ShopLayout({
  children,
  cartCount = 1,
  noScroll = false,
}: {
  children: React.ReactNode;
  cartCount?: number;
  noScroll?: boolean;
}) {
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const t = TRANSLATIONS[locale].header;

  useEffect(() => {
    if (noScroll) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
      };
    }
  }, [noScroll]);

  if (noScroll) {
    return (
      <div className="overflow-hidden bg-white text-gray-900 flex flex-col">
        <div className="w-full bg-indigo-100 text-center text-[13px] py-2 flex-shrink-0">
          {t.freeShipping}
        </div>
        <Header cartCount={cartCount} t={t} />
        <main className="flex-1 overflow-hidden max-w-[1200px] mx-auto w-full px-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="w-full bg-indigo-100 text-center text-[13px] py-2">
        {t.freeShipping}
      </div>
      <Header cartCount={cartCount} t={t} />
      <main className="flex-1 mx-auto w-full px-4">{children}</main>
    </div>
  );
}