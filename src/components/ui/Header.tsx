'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full">
      <div className="bg-[#3b435a] h-6 sm:h-8 lg:h-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Image
          src="/demoglobal/telefonica-tech-logo.png"
          alt="Telefónica Tech"
          width={130}
          height={20}
          className="object-contain w-24 sm:w-28 lg:w-32 h-auto"
          priority
        />
      </div>
    </header>
  );
}