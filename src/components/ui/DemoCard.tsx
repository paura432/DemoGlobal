'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import TwoLineTitle from './TwoLineTitle';
import HoverMedia from './HoverMedia';

export default function DemoCard({
  href,
  label,
  icon,
  image,
  video,
  objectPosition,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  image: string;
  video?: string;
  objectPosition?: string;
}) {
  return (
    <Link
      href={href}
      className="w-full max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[170px] flex flex-col items-center group min-h-[180px] sm:min-h-[210px] lg:min-h-[230px]"
      aria-label={label}
    >
      <HoverMedia
        imageSrc={image}
        alt={label}
        videoSrc={video}
        objectPosition={objectPosition}
      />

      <div className="flex items-start gap-2 mt-2 text-[#414B61] w-full justify-center">
        <span className="text-[#414B61] group-hover:text-[#0066FF] transition-colors text-sm sm:text-base leading-none mt-[2px] flex-shrink-0">
          {icon}
        </span>
        <TwoLineTitle text={label} />
      </div>
    </Link>
  );
}