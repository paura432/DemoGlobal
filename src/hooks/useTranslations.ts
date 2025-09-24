'use client';

import { useState, useEffect } from 'react';

type Messages = Record<string, string>;

export function useTranslations(locale: string) {
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    async function loadMessages() {
      try {
        const mod = await import(`../locales/demoglobal/${locale}.json`);
        setMessages(mod.default);
      } catch (e) {
        console.error('Error loading locale messages', e);
      }
    }

    loadMessages();
  }, [locale]);

  function t(key: string): string {
    return messages[key] ?? key;
  }

  return { t };
}
