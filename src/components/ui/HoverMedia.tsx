'use client';

import { useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

type HoverMediaProps = {
  imageSrc: string;
  alt: string;
  videoSrc?: string;
  objectPosition?: string;
  className?: string;
  blueOpacity?: number; // 0..1
  speedMs?: number;
};

export default function HoverMedia({
  imageSrc,
  alt,
  videoSrc,
  objectPosition = 'center',
  className,
  blueOpacity = 0.6,
}: HoverMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => void 0);
    }
  };

  const onLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={clsx(
        'relative w-full aspect-[2/3] overflow-hidden rounded-lg sm:rounded-xl shadow-md group bg-white',
        className
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Imagen base */}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 170px"
        quality={90}
        style={{ objectPosition }}
        className="object-cover transition-opacity duration-300 group-hover:opacity-0"
        priority={false}
      />

      {/* Vídeo con overlay, oculto por defecto */}
      {videoSrc && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover rounded-lg sm:rounded-xl"
            muted
            playsInline
            preload="none"
            loop
            style={{ objectPosition }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Overlay azul encima del vídeo */}
          <div
            className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none"
            style={{ backgroundColor: '#0066FF', opacity: blueOpacity }}
          />
        </div>
      )}
    </div>
  );
}