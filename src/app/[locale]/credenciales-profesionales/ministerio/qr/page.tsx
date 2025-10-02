'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type QRTxt = {
  heading: string;
  helper: string;
  loading: string;
  error: string;
  verified: string;
};

export default function MinisterioQR() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = (pathname.split('/')[1] || 'es') as 'es' | 'en';

  const [txt, setTxt] = useState<QRTxt | null>(null);

  const QR_SIZE = 220;

  const [qrLink, setQrLink] = useState<string>('');
  const [sessionID, setSessionID] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_VCS_API_URL || 'http://localhost:8085';

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/locales/credenciales-profesionales/ministerio/qr/${locale}.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as QRTxt;
        if (alive) setTxt(data);
      } catch {
        if (alive) {
          setTxt(
            locale === 'en'
              ? { heading: 'Verifiable credentials', helper: 'Scan the QR with your authorized app', loading: 'Preparing QRâ€¦', error: 'Error generating QR', verified: 'Verified âœ“ Redirectingâ€¦' }
              : { heading: 'Credenciales verificables', helper: 'Escanea el QR con tu aplicaciÃ³n autorizada', loading: 'Preparando QRâ€¦', error: 'Error generando el QR', verified: 'Verificado âœ“ Redirigiendoâ€¦' }
          );
        }
      }
    })();
    return () => { alive = false; };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        const res = await fetch(`${apiBase}/api/v1/verifier-back/procivis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema: 'medico' })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: { data?: { appUrl?: string; sessionID?: string } } = await res.json();
        const link = data?.data?.appUrl ?? '';
        const sid = data?.data?.sessionID ?? '';

        if (!link || !sid) throw new Error('Respuesta incompleta del backend');

        if (!cancelled) {
          setQrLink(link);
          setSessionID(sid);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (err instanceof Error) {
            setErrorMsg(err.message);
          } else {
            setErrorMsg('No se pudo cargar la información');
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [apiBase]);

  useEffect(() => {
    if (!sessionID) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/verifier-status/procivis/${sessionID}`);
        if (!res.ok) return;
        const data: { data?: { status?: 'pending' | 'success' | 'error' } } = await res.json();
        if (data?.data?.status === 'success') {
          clearInterval(id);
          setIsVerified(true);
        }
      } catch {
      }
    }, 1500);

    return () => clearInterval(id);
  }, [apiBase, sessionID]);

  useEffect(() => {
    if (!isVerified) return;
    router.replace(`/${locale}/credenciales-profesionales/ministerio/verificacion`);
  }, [isVerified, router, locale]);

  const qrReady = !!qrLink && !isLoading && !errorMsg;

  return (
    <div className="w-full grid place-items-center py-8">
      <div className="w-full max-w-[720px] bg-white">
        <h2 className="text-[20px] font-semibold text-gray-800 mb-6 text-center">
          {txt?.heading ?? ''}
        </h2>

        <div className="grid place-items-center">
          <div className="rounded-2xl bg-white border border-gray-300 shadow-sm p-3 grid place-items-center">
            {qrReady ? (
              <QRCodeCanvas value={qrLink} size={QR_SIZE} className="rounded border shadow" />
            ) : (
              <div
                className="rounded-xl grid place-items-center text-gray-400 text-sm bg-gray-50 animate-pulse"
                style={{ width: QR_SIZE, height: QR_SIZE }}
              >
                {errorMsg ? (txt?.error ?? '') : (txt?.loading ?? '')}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">{txt?.helper ?? ''}</p>
          {isVerified && <p className="mt-2 text-xs text-green-600">{txt?.verified ?? ''}</p>}
        </div>
      </div>
    </div>
  );
}