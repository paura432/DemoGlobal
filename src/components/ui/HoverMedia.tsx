"use client";
import { useRef } from "react";
import Image from "next/image";
import clsx from "clsx";

type HoverMediaProps = {
  imageSrc: string;
  alt: string;
  videoSrc?: string;        // si existe, se reproduce al hover
  objectPosition?: string;  // "center", "50% 45%", etc.
  className?: string;
  blueOpacity?: number;     // 0..1 (por defecto 0.6)
  speedMs?: number;         // duraciÃ³n animaciÃ³n (por defecto 200)
};

export default function HoverMedia({
  imageSrc,
  alt,
  videoSrc,
  objectPosition = "center",
  className,
  blueOpacity = 0.6,
  speedMs = 200,
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
        // mismo borde redondeado para todas las capas; overflow oculta todo â†’ sin lÃ­neas
        "relative w-full aspect-[2/3] overflow-hidden rounded-xl shadow-md group bg-white",
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
        sizes="(max-width: 640px) 140px, 170px"
        quality={90}
        style={{ objectPosition }}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        priority={false}
      />

      {/* OVERLAY: se revela DESDE ARRIBA con clip-path (nada se traslada â†’ no hay seams) */}
      <div
        className={clsx(
          "absolute inset-0 rounded-xl z-10",
          // clip-path inicial: oculto (100% desde abajo); al hover: 0
          "[clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0_0)]",
          // transicionamos solo clip-path y opacidad
          "[transition-property:clip-path,opacity]"
        )}
        style={{
          transitionDuration: `${speedMs}ms`,
          transitionTimingFunction: "cubic-bezier(.22,.71,.18,1)",
        }}
      >
        {/* VÃ­deo debajo del velo azul para que herede el tinte */}
        {videoSrc && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
            muted
            playsInline
            preload="metadata"
            loop
            style={{ objectPosition }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        {/* Velo azul (intensidad controlable) */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: "#0057B8", opacity: blueOpacity }}
        />
      </div>
    </div>
  );
}