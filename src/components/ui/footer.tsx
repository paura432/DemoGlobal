'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

const LINKS = {
  legal: {
    es: [
      {
        url: 'https://www.telefonica.com/aviso-legal',
        text: 'Aviso Legal'
    },
    {
        url: 'https://www.telefonica.com/es/cookies',
        text: 'Política de Cookies'
    },
    {
        url: 'https://www.telefonica.com/es/telefonica-accesible',
        text: 'Accesibilidad'
    },
    {
        url: 'https://www.telefonica.com/politica-de-privacidad',
        text: 'Privacidad'
    },
    {
        url: 'https://www.telefonica.com/mapa-sitio',
        text: 'Mapa del sitio'
    }
    ],
    en: [
      { url: '/legal', text: 'Legal Notice' },
      { url: '/cookies', text: 'Cookies Policy' },
      { url: '/privacy', text: 'Privacy Policy' },
    ],
  },
  social: [
    { url: 'https://www.linkedin.com/company/telefonicatech/', icon: FaLinkedin },
    { url: 'https://twitter.com/TelefonicaTech', icon: FaXTwitter },
    { url: 'https://www.instagram.com/TelefonicaTech', icon: FaInstagram },
    { url: 'https://www.youtube.com/c/TelefonicaTech', icon: FaYoutube },
  ],
};

export default function FooterDemo() {
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  const legalLinks = LINKS.legal[locale];

  return (
    <footer className="w-full bg-[#0057B8] text-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-3-y py-3 px-6">
      <Image
        src="/demoglobal/telefonica-tech-logo.png"
        alt="Telefónica Tech"
        width={160}
        height={40}
        className="opacity-90"
      />
        <p className="text-sm px-6 text-right">
          Demostración de credenciales verificables de Telefónica Tech.
        </p>
      </div>

      {/* Línea divisoria */}
      <div className="w-full border-t border-[#F2F4FF]/30" />

      {/* Sección inferior con enlaces y redes */}
      <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto px-6 py-4 text-xs">
        {/* Enlaces legales */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-3 md:mb-0">
          {legalLinks.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              className="opacity-80 hover:opacity-100 transition-all"
            >
              {link.text}
            </Link>
          ))}
        </div>

        {/* Redes sociales */}
        <div className="flex items-center justify-center gap-5">
          {LINKS.social.map((network, index) => (
            <Link
              key={index}
              href={network.url}
              target="_blank"
              className="opacity-80 hover:opacity-100 transition-all"
              aria-label="social link"
            >
              <network.icon className="text-lg" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
