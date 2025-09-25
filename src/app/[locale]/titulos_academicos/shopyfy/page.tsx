'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

/* =========================
   Config / Mock de producto
   ========================= */
const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

const ITEM = {
  id: '1',
  brand: 'New Look',
  title: 'PANELLED - Chaqueta vaquera - blue',
  price: 59.99,
  color: 'blue',
  size: '36',
  image: '/titulos_academicos/chaqueta.jpg',
  seller: 'Shopyline Europe',
  qty: 1,
};

const PaymentBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center justify-center text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white border">
    {label}
  </span>
);

/* =========================
   Iconos
   ========================= */
function PersonIcon({ className = 'w-3 h-3 text-gray-800' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 19.25c.8-3.2 3.7-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircle({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M14.2 7.6 9 12.8 6.6 10.3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PendingCircle({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.75" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
    </svg>
  );
}

function IconCheck({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDown({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* =========================
   Selector de cantidad
   ========================= */
function QtySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="w-12 h-7 border rounded flex items-center justify-between px-1.5 text-xs"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cantidad"
        type="button"
      >
        {value}
        <span>▾</span>
      </button>
      {open && (
        <div className="absolute z-10 bg-white border rounded mt-1 w-full text-xs">
          {[1, 2, 3, 4, 5].map((q) => (
            <button
              key={q}
              onClick={() => {
                onChange(q);
                setOpen(false);
              }}
              className={`w-full text-left px-1.5 py-1 hover:bg-gray-100 ${
                q === value ? 'font-semibold' : ''
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   Estado de credencial
   ========================= */
type StudentState = {
  verified: boolean;
  discountPercent: number;
  name?: string;
  exp?: string;
  uiLabel?: string;
};

function useStudentCred() {
  const [st, setSt] = useState<StudentState>({
    verified: false,
    discountPercent: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tt_student');
      if (raw) setSt(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tt_student', JSON.stringify(st));
    } catch {}
  }, [st]);

  return { st, setSt };
}

/* =========================
   Modal compacto
   ========================= */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm max-h-[85vh]">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title ?? 'Verificar credencial'}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-lg">✕</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Dropdown compacto
   ========================= */
type Phase = 'loading' | 'qr' | 'verifying' | 'ready' | 'error';

const VERIFY_STEPS = [
  'Verificando credencial',
  'Validando expiración',
  'Confirmando validez',
  'Autenticando',
];

function DiscountDropdown({
  current,
  onVerified,
}: {
  current: StudentState;
  onVerified: (s: StudentState) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [phase, setPhase] = useState<Phase>('loading');
  const [qrLink, setQrLink] = useState('');
  const [sessionID, setSessionID] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<Partial<StudentState> | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const stepsDone = Math.min(activeStep, VERIFY_STEPS.length);
  const pct = Math.round((stepsDone / VERIFY_STEPS.length) * 100);

  const START_ENDPOINT = `${apiBase}/api/v1/verifier-back/procivis`;
  const STATUS_ENDPOINT = (sid: string) => `${apiBase}/api/v1/verifier-status/procivis/${sid}`;

  const discountOptions = [
    {
      id: 'verifiable-credential',
      label: 'Credencial verificable de estudiante',
      description: 'Descuento del 10%',
      available: true
    },
    {
      id: 'student-card',
      label: 'Carnet estudiante',
      description: 'Descuento del 15%',
      available: false
    }
  ];

  const handleOptionClick = (optionId: string) => {
    setDropdownOpen(false);
    if (optionId === 'verifiable-credential') {
      startVerification();
    }
  };

  const startVerification = async () => {
    setModalOpen(true);
    setPhase('loading');
    setErrorMsg(null);
    setPendingResult(null);
    setActiveStep(0);

    try {
      const res = await fetch(START_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: 'estudiante' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json?.data ?? json;

      const link = data?.appUrl as string | undefined;
      const sid = data?.sessionID as string | undefined;

      if (!link || !sid) throw new Error('Respuesta incompleta');

      setQrLink(link);
      setSessionID(sid);
      setPhase('qr');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Error de conexión');
      setPhase('error');
    }
  };

  // Polling simplificado
  useEffect(() => {
    if (!modalOpen || !sessionID) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(STATUS_ENDPOINT(sessionID));
        if (!res.ok) return;
        const json = await res.json();
        const data = json?.data ?? json;
        const status = data?.status as string | undefined;

        if (status === 'success' || status === 'verified') {
          setPendingResult({
            discountPercent: 10,
            name: 'Estudiante verificado',
            uiLabel: 'Descuento aplicado',
          });

          setPhase('verifying');
          setActiveStep(0);

          const timers: ReturnType<typeof setTimeout>[] = [];
          VERIFY_STEPS.forEach((_, i) => {
            timers.push(setTimeout(() => setActiveStep(i + 1), 300 * (i + 1)));
          });
          timers.push(setTimeout(() => setPhase('ready'), 300 * (VERIFY_STEPS.length + 1)));
          clearInterval(id);
        }

        if (status === 'error' || status === 'rejected' || status === 'expired') {
          setPhase('error');
          setErrorMsg('Verificación fallida');
          clearInterval(id);
        }
      } catch {}
    }, 1500);

    return () => clearInterval(id);
  }, [modalOpen, sessionID]);

  const applyAndClose = () => {
    const base: StudentState = {
      verified: true,
      discountPercent: 10,
      name: 'Estudiante verificado',
      uiLabel: 'Descuento aplicado',
    };
    onVerified(base);
    setModalOpen(false);
  };

  return (
    <>
      {current.verified ? (
        <div className="mt-2 p-2 rounded border bg-green-50 text-xs border-green-200">
          <div className="font-semibold text-green-700">Descuento aplicado ✓</div>
          <div className="text-green-600">{current.discountPercent}% de descuento</div>
        </div>
      ) : (
        <div className="mt-2 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-8 rounded-full text-xs font-semibold
                       border border-indigo-600 text-indigo-600
                       hover:bg-indigo-600 hover:text-white transition
                       flex items-center justify-center gap-1"
            type="button"
          >
            Descuentos
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-20 max-h-32 overflow-y-auto">
              {discountOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={!option.available}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 
                    ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}
                    border-b last:border-b-0`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Verificar credencial">
        {phase === 'loading' && (
          <div className="text-sm text-gray-600">Generando QR…</div>
        )}

        {phase === 'qr' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-700">
              1. Abre tu wallet<br/>
              2. Escanea el QR y comparte tu credencial
            </div>
            <div className="flex justify-center p-2 bg-gray-50 rounded">
              <QRCodeCanvas value={qrLink} size={150} level="M" />
            </div>
            <div className="text-xs text-gray-600 text-center">Verificando automáticamente…</div>
          </div>
        )}

        {(phase === 'verifying' || phase === 'ready') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PersonIcon />
              <h4 className="text-sm font-semibold">Verificando</h4>
            </div>

            <div className="w-full h-1 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            <ul className="space-y-1.5">
              {VERIFY_STEPS.map((label, i) => {
                const done = i < activeStep;
                return (
                  <li key={i} className="flex items-center gap-2">
                    {done ? <CheckCircle /> : <PendingCircle />}
                    <span className={`text-xs ${done ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
                  </li>
                );
              })}
            </ul>

            {phase === 'ready' && (
              <button
                onClick={applyAndClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
                type="button"
              >
                Aplicar descuento
              </button>
            )}
          </div>
        )}

        {phase === 'error' && (
          <div className="text-sm text-red-600 text-center">{errorMsg || 'Error de verificación'}</div>
        )}
      </Modal>
    </>
  );
}

/* =========================
   Página principal compacta
   ========================= */
export default function CartPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = (pathname?.split('/')[1] || 'es') as string;

  const [qty, setQty] = useState<number>(ITEM.qty);
  const { st: student, setSt } = useStudentCred();

  const subtotal = useMemo(() => +(ITEM.price * qty).toFixed(2), [qty]);
  const discountAmount = useMemo(
    () => (student.verified ? +((ITEM.price * qty) * (student.discountPercent / 100)).toFixed(2) : 0),
    [qty, student]
  );
  const total = useMemo(() => +(subtotal - discountAmount).toFixed(2), [subtotal, discountAmount]);

  const goDemo = () => router.push(`/${locale}/demoglobal`);

  const ctaLabel = student.verified ? 'Volver a demo' : 'Comprar';
  const ctaClasses = `w-full h-9 rounded text-sm font-semibold flex items-center justify-center gap-1.5 transition
    ${student.verified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-black hover:opacity-90 text-white'}`;

    return (
      <div className="h-screen bg-white text-gray-900 flex flex-col">
        <main className="flex-1 max-w-[1100px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 py-6">
          
          <section>
            <h1 className="text-2xl font-semibold mb-5">Tu cesta (1 artículo)</h1>
    
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded border">📦</span>
              <span>
                Envío por parte de <span className="font-semibold">Shopyline</span>
                <span className="block text-gray-500">Jue., 18.09 - Vie., 19.09</span>
              </span>
            </div>
    
            <div className="flex gap-3">
              <div className="w-20 h-24 relative overflow-hidden rounded">
                <img src={ITEM.image} alt={ITEM.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-600">{ITEM.brand}</div>
                    <div className="font-semibold text-sm">{ITEM.title}</div>
                    <div className="mt-1 text-xs text-gray-700">{ITEM.price.toFixed(2)} €</div>
                    <div className="mt-1 text-xs text-gray-600">Color: {ITEM.color}</div>
                    <div className="text-xs text-gray-600">Talla: {ITEM.size}</div>
                    <div className="mt-1 text-xs">
                      Venta a través de <a className="underline font-semibold" href="#">{ITEM.seller}</a>
                    </div>
                  </div>
    
                  <div className="flex items-start gap-3">
                    <QtySelect value={qty} onChange={setQty} />
                    <button aria-label="Eliminar artículo" className="h-9 w-9 grid place-items-center">✕</button>
                  </div>
                </div>
                <button className="mt-2 text-violet-600 text-xs hover:underline">Mover a favoritos</button>
              </div>
            </div>
    
            <p className="mt-6 text-xs text-gray-600">❗ Recuerda: no podemos reservar los artículos en tu cesta.</p>
          </section>
        <aside className="bg-gray-100 p-4 rounded self-start" style={{maxHeight: '70vh'}}>
          <div className="flex items-center justify-between text-sm py-1.5">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>

          {student.verified && (
            <div className="flex items-center justify-between text-sm py-1.5 text-green-700">
              <span>Descuento estudiante ({student.discountPercent}%)</span>
              <span>-{discountAmount.toFixed(2)} €</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm py-1.5 border-b">
            <span>Envío</span>
            <span>0,00 €</span>
          </div>

          <div className="flex items-center justify-between font-semibold text-base py-3">
            <span> Total <span className="text-gray-500 text-xs">IVA incluido</span></span>
            <span className="text-[18px]">{total.toFixed(2)} €</span>
          </div>

          <button onClick={goDemo} className={ctaClasses} disabled>
            {student.verified && <IconCheck className="w-4 h-4" />} {ctaLabel}
          </button>

          <DiscountDropdown current={student} onVerified={setSt} />
        </aside>
      </main>
    </div>
  );
}