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
    <footer className="w-full bg-[#0157b8] text-white">
      {/* ✅ Contenedor del logo con padding fijo en lugar de max-width */}
      <div className="w-full px-10 pt-10 pb-6">
        <div className="inline-block">
          <Image
            src="/demoglobal/telefonica-tech-logo.png"
            alt="Telefónica Tech"
            width={160}
            height={40}
            className="opacity-90"
            priority
          />
        </div>
      </div>

      {/* ✅ Texto descriptivo con padding consistente */}
      <div className="w-full px-16 pb-6">
        <p className="text-sm text-left">
          Telefónica Tech es la compañía líder en transformación digital. La compañía cuenta con una amplia oferta de servicios y
          soluciones tecnológicas integradas de Ciberseguridad, Cloud, IoT, Big Data o Blockchain.
        </p>
      </div>

      {/* Línea divisoria */}
      <div className="w-full border-t border-[#F2F4FF]/30" />

      {/* Sección inferior con enlaces y redes */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full px-10 py-4 text-xs">
        {/* Enlaces legales */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 pb-3">
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