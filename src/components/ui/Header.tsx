'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
  locale: 'es' | 'en';
  onSelect: (locale: 'es' | 'en') => void;
};

function LanguageDropdown({ locale, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = {
    es: { code: 'ES', name: 'Español' },
    en: { code: 'EN', name: 'English' },
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-white bg-[#3b435a] px-3 py-1 rounded-md border border-white/30 hover:bg-[#2f3547]"
      >
        {languages[locale].code}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50">
          {Object.entries(languages).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                onSelect(key as 'es' | 'en');
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm border-white hover:text-black ${
                locale === key ? 'text-[#0066FF]' : 'text-[#0066FF]'
              }`}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = (pathname.split('/')[1] as 'es' | 'en') || 'es';
  const [locale, setLocale] = useState<'es' | 'en'>(currentLocale);

  const handleSelectLocale = (newLocale: 'es' | 'en') => {
    if (newLocale === locale) return;
    setLocale(newLocale);

    // 🔁 Cambiar idioma en la URL manteniendo la ruta actual
    const segments = pathname.split('/');
    segments[1] = newLocale; // sustituye el prefijo del idioma
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <header className="w-full relative">
      <div className="bg-[#414B61] h-8 sm:h-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Image
          src="/demoglobal/telefonica-tech-logo.png"
          alt="Telefónica Tech"
          width={130}
          height={20}
          className="object-contain w-24 sm:w-28 lg:w-32 h-auto"
          priority
        />
        <div className="absolute right-4">
          <LanguageDropdown locale={locale} onSelect={handleSelectLocale} />
        </div>
      </div>
    </header>
  );
}
