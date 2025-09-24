'use client';

import { useEffect, useRef, useState } from 'react';

export default function LanguageDropdown({
  locale,
  onSelect,
}: {
  locale: 'es' | 'en';
  onSelect: (next: 'es' | 'en') => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options: Array<{ code: 'es' | 'en'; label: string; native: string }> = [
    { code: 'es', label: 'ES', native: 'EspaÃ±ol' },
    { code: 'en', label: 'EN', native: 'English' },
  ];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const current = options.find((o) => o.code === locale) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        title={locale === 'es' ? 'Cambiar idioma' : 'Change language'}
      >
        <span role="img" aria-hidden="true">ðŸŒ</span>
        <span className="tabular-nums">{current.label}</span>
        <span aria-hidden="true" className="text-gray-500">â–¾</span>
      </button>

      {open && (
        <ul role="listbox" className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
          {options.map((opt) => {
            const active = opt.code === locale;
            return (
              <li key={opt.code}>
                <button
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSelect(opt.code);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                    active ? 'font-semibold text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <span>{opt.native}</span>
                  <span className="text-xs text-gray-500">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}