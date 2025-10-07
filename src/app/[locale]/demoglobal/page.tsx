'use client';

import { usePathname, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { FaGraduationCap, FaHeart, FaCar, /*FaBuilding*/ } from 'react-icons/fa';
import LanguageDropdown from '@/components/ui/LenguajeDropDown';
import DemoCard from '@/components/ui/DemoCard';

type DemoTranslations = {
  demoglobal: {
    title: string;
    subtitle: string;
    intro: string;
    cards: {
      estudios: string;
      salud: string;
      coches: string;
      telefonica: string;
      tramites: string;
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

  if (!translations) return null;
  const { demoglobal } = translations;

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
      key: 'coches',
      href: `/${locale}//tramites_licencias/step-1`,
      icon: <FaCar />,
      image: '/demoglobal/Atributos.jpg',
      video: '/videos/policia.mp4',
      objectPosition: 'center',
    },
    // {
    //   key: 'tramites',
    //   href: `/${locale}/tramites_licencias`,
    //   icon: <FaBuilding />,
    //   image: '/demoglobal/telefonica.jpg',
    //   objectPosition: 'center',
    // },
    // {
    //   key: 'tramites',
    //   href: `/${locale}/tramites`,
    //   icon: <FaBuilding />,
    //   image: '/demoglobal/tramites.jpg',
    //   objectPosition: 'center',
    // },
  ];

  return (
    <>
      <header className="w-full">
        <div className="border-b border-gray-200">
          <div className="max-w-[1000px] mx-auto px-3 grid grid-cols-3 items-center">
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
        <h2 className="text-[18px] sm:text-[22px] text-blue-700 font-bold mb-1">
          {demoglobal.title}
        </h2>

        <h1 className="text-[20px] sm:text-[22px] font-light text-gray-800 mb-2">
          {demoglobal.subtitle}
        </h1>

        <p
          className="text-gray-700 max-w-[860px] mx-auto mb-6 leading-relaxed text-[13px] sm:text-[14px]"
          dangerouslySetInnerHTML={{ __html: demoglobal.intro }}
        />

        <div className="flex justify-center flex-wrap gap-5 sm:gap-6">
          {cards.map((card) => (
            <DemoCard
              key={card.key}
              href={card.href}
              label={demoglobal.cards[card.key]}
              icon={card.icon}
              image={card.image}
              video={card.video}
              objectPosition={card.objectPosition}
            />
          ))}
        </div>
      </main>
    </>
  );
}