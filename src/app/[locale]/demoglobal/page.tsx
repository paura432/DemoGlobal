'use client';

import { usePathname, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { FaGraduationCap, FaHeart } from 'react-icons/fa';
import LanguageDropdown from '@/components/ui/LenguajeDropDown';
import DemoCard from '@/components/ui/DemoCard';
import { FaNewspaper } from 'react-icons/fa6';

type DemoTranslations = {
  demoglobal: {
    title: string;
    subtitle: string;
    intro: string;
    cards: {
      estudios: string;
      salud: string;
      coches: string;
      tramites: string;
      atributos: string;
    };
  };
};

type CardKey = 'estudios' | 'salud' | 'coches' | 'telefonica' | 'tramites';

type CardItem = {
  key: CardKey;
  href: string;
  icon: JSX.Element;
  image: string;
  video?: string;
  objectPosition?: string;
};

export default function DemoGlobalPage() {
  const [translations, setTranslations] = useState<DemoTranslations | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const match = pathname.match(/^\/(es|en)/);
  const locale = (match ? match[1] : 'es') as 'es' | 'en';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/locales/demoglobal/${locale}.json`);
        const data = (await res.json()) as DemoTranslations;
        setTranslations(data);
      } catch {
        setTranslations(null);
      }
    })();
  }, [locale]);

  const handleSelectLocale = (next: 'es' | 'en') => {
    if (next === locale) return;
    const newPath =
      pathname.replace(/^\/(es|en)(?=\/|$)/, `/${next}`) ||
      `/${next}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
    router.push(newPath);
  };

  const cards: CardItem[] = [
    {
      key: 'salud',
      href: `/${locale}/credenciales-profesionales/step-1`,
      icon: <FaHeart />,
      image: '/demoglobal/credenciales-profesionales.jpg',
      video: '/videos/medico.mp4',
      objectPosition: 'center',
    },
    {
      key: 'estudios',
      href: `/${locale}/titulos_academicos/step-1`,
      icon: <FaGraduationCap />,
      image: '/demoglobal/titulos-academicos.jpg',
      video: '/videos/estudiante.mp4',
      objectPosition: '50% 45%',
    },
    {
      key: 'tramites',
      href: `/${locale}/tramites_licencias/step-1`,
      icon: <FaNewspaper />,
      image: '/demoglobal/Atributos.jpg',
      video: '/videos/ciudadano.mp4',
      objectPosition: 'center',
    },
    // {
    //   key: 'atributos',
    //   href: `/${locale}/atributos_verificados/step-1`,
    //   icon: <Fa42Group />,
    //   image: '/demoglobal/telefonica.jpg',
    //   video: '/videos/empresario.mp4',
    //   objectPosition: 'center',
    // }
  ];

  return (
    <>
      <header className="w-full">
        <div className="border-b border-gray-200">
          <div className="max-w-[1000px] mx-auto px-20 grid grid-cols-3 items-center">
            <div className="justify-self-start text-base font-semibold text-gray-600 select-none">
              Trust<span className="text-blue-600">OS</span>
            </div>
            <div className="justify-self-center" />
            <div className="justify-self-end">
              <LanguageDropdown locale={locale} onSelect={handleSelectLocale} />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1000px] mx-auto px-3 pt-4 pb-6 text-center">
        {/* ✅ Skeleton loader mientras carga */}
        {!translations ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto mb-8"></div>
            <div className="flex justify-center gap-6">
              <div className="h-48 w-64 bg-gray-200 rounded"></div>
              <div className="h-48 w-64 bg-gray-200 rounded"></div>
              <div className="h-48 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-[18px] sm:text-[22px] text-blue-700 font-bold mb-1">
              {translations.demoglobal.title}
            </h2>

            <h1 className="text-[20px] sm:text-[22px] font-light text-gray-800 mb-2">
              {translations.demoglobal.subtitle}
            </h1>

            <p
              className="text-gray-700 max-w-[860px] mx-auto mb-6 leading-relaxed text-[13px] sm:text-[14px]"
              dangerouslySetInnerHTML={{ __html: translations.demoglobal.intro }}
            />

            <div className="flex justify-center flex-wrap gap-5 sm:gap-6">
              {cards.map((card) => (
                <DemoCard
                  key={card.key}
                  href={card.href}
                  label={translations.demoglobal.cards[card.key]}
                  icon={card.icon}
                  image={card.image}
                  video={card.video}
                  objectPosition={card.objectPosition}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}