'use client';

export default function TwoLineTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  let l1 = '';
  let l2 = '';
  if (words.length === 1) {
    const w = words[0];
    const mid = Math.ceil(w.length / 2);
    l1 = w.slice(0, mid);
    l2 = w.slice(mid) || '\u00A0';
  } else if (words.length === 2) {
    l1 = words[0];
    l2 = words[1] || '\u00A0';
  } else {
    const half = Math.ceil(words.length / 2);
    l1 = words.slice(0, half).join(' ');
    l2 = words.slice(half).join(' ') || '\u00A0';
  }

  return (
    <div className="text-[11px] sm:text-[12px] leading-tight font-medium text-gray-800 h-[30px] sm:h-[32px]">
      <span className="block">{l1}</span>
      <span className="block">{l2}</span>
    </div>
  );
}