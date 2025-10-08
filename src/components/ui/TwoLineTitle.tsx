"use client";

type TwoLineTitleProps = {
  text: string;
  className?: string;
};

export default function TwoLineTitle({ text, className = "" }: TwoLineTitleProps) {
  // Dividir el texto en palabras
  const words = text.split(' ');
  
  if (words.length === 1) {
    // Si es una sola palabra, mostrarla completa
    return (
      <span className={`text-xs sm:text-sm leading-tight text-center font-medium group-hover:text-blue-700 transition-colors ${className}`}>
        {text}
      </span>
    );
  }

  // Si son 2 palabras, una en cada línea
  if (words.length === 2) {
    return (
      <span className={`text-xs sm:text-sm leading-tight text-center font-medium group-hover:text-blue-700 transition-colors ${className}`}>
        {words[0]}
        <br />
        {words[1]}
      </span>
    );
  }

  // Si son más de 2 palabras, dividir aproximadamente por la mitad
  const midPoint = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, midPoint).join(' ');
  const secondLine = words.slice(midPoint).join(' ');

  return (
    <span className={`text-xs sm:text-sm leading-tight text-center font-medium group-hover:text-blue-700 transition-colors ${className}`}>
      {firstLine}
      <br />
      {secondLine}
    </span>
  );
}