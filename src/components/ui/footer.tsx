'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

// Traducciones directas en el componente
const TRANSLATIONS = {
  es: {
    description: 'Telefónica Tech es la compañía líder en transformación digital. La compañía cuenta con una amplia oferta de servicios y soluciones tecnológicas integradas de Ciberseguridad, Cloud, IoT, Big Data o Blockchain.',
    legal: [
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
    ]
  },
  en: {
    description: 'Telefónica Tech is the leading company in digital transformation. The company offers a wide range of integrated technological services and solutions including Cybersecurity, Cloud, IoT, Big Data, and Blockchain.',
    legal: [
      {
        url: 'https://www.telefonica.com/en/legal-notice',
        text: 'Legal Notice'
      },
      {
        url: 'https://www.telefonica.com/en/cookies',
        text: 'Cookies Policy'
      },
      {
        url: 'https://www.telefonica.com/en/telefonica-accesibility',
        text: 'Accessibility'
      },
      {
        url: 'https://www.telefonica.com/en/privacy-policy',
        text: 'Privacy Policy'
      },
      {
        url: 'https://www.telefonica.com/en/sitemap',
        text: 'Sitemap'
      }
    ]
  }
};

const SOCIAL_LINKS = [
  { url: 'https://www.linkedin.com/company/telefonicatech/', icon: FaLinkedin },
  { url: 'https://twitter.com/TelefonicaTech', icon: FaXTwitter },
  { url: 'https://www.instagram.com/TelefonicaTech', icon: FaInstagram },
  { url: 'https://www.youtube.com/c/TelefonicaTech', icon: FaYoutube },
];

export default function FooterDemo() {
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';
  
  // Obtener las traducciones según el idioma
  const t = TRANSLATIONS[locale];

  return (
    <footer className="w-full bg-[#0066FF] text-white">
      {/* Logo de Telefónica Tech */}
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

      {/* Texto descriptivo traducido */}
      <div className="w-full px-16 pb-6">
        <p className="text-sm text-left">
          {t.description}
        </p>
      </div>

      {/* Línea divisoria */}
      <div className="w-full border-t border-[#F2F4FF]/30" />

      {/* Sección inferior con enlaces y redes */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full px-10 py-4 text-xs">
        {/* Enlaces legales traducidos */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 pb-3">
          {t.legal.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              className="opacity-80 hover:opacity-100 transition-all"
            >
              {link.text}
            </Link>
          ))}
        </div>

        {/* Redes sociales (sin traducción necesaria) */}
        <div className="flex items-center justify-center gap-5">
          {SOCIAL_LINKS.map((network, index) => (
            <Link
              key={index}
              href={network.url}
              target="_blank"
              className="opacity-80 hover:opacity-100 transition-all"
              aria-label={`${network.url.split('/').pop()} social link`}
            >
              <network.icon className="text-lg" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}