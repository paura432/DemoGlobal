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
      className="w-[120px] sm:w-[140px] flex flex-col items-center group min-h-[210px]"
      aria-label={label}
    >
      <HoverMedia
        imageSrc={image}
        alt={label}
        videoSrc={video}
        objectPosition={objectPosition}
      />

      <div className="flex items-start gap-2 mt-2 text-gray-800">
        <span className="text-gray-500 group-hover:text-blue-700 transition-colors text-base leading-none mt-[2px]">
          {icon}
        </span>
        <TwoLineTitle text={label} />
      </div>
    </Link>
  );
}