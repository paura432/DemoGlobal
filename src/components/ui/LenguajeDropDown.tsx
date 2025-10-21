import { useState, useRef, useEffect } from 'react';

type Props = {
  locale: 'es' | 'en';
  onSelect: (locale: 'es' | 'en') => void;
};

export default function LanguageDropdown({ locale, onSelect }: Props) {
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
    en: { code: 'EN', name: 'English' }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 text-sm text-[#414B61] hover:text-[#414B61] transition-colors"
        aria-label="Seleccionar idioma"
      >
        <span className="font-medium">{languages[locale].code}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-[#414B61] rounded-lg shadow-lg z-50">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => {
                onSelect(code as 'es' | 'en');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#414B61] first:rounded-t-lg last:rounded-b-lg transition-colors ${
                locale === code ? 'bg-[#0066FF] text-[#0066FF]' : 'text-[#414B61]'
              }`}
            >
              <span className="font-medium">{lang.code}</span>
              <span className="ml-2 text-xs opacity-75">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}