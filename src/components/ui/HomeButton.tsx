'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FaHouse } from 'react-icons/fa6';

export default function HomeButton() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const handleClick = () => {
    router.push(`/${locale}/demoglobal`);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-0 left-0 text-gray-500 hover:text-blue-700 hover:scale-110 transition-all duration-200"
      aria-label="Volver al inicio"
      title="Volver al inicio"
    >
      <FaHouse className="text-xl sm:text-2xl" />
    </button>
  );
}