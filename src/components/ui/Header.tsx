'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full">
      <div className="bg-[#3b435a] h-[40px] flex items-center justify-center px-4">
        <Image
          src="/demoglobal/telefonica-tech.png"
          alt="TelefÃ³nica Tech"
          width={130}
          height={20}
          className="object-contain"
        />
      </div>
    </header>
  );
}