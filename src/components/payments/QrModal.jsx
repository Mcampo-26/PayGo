import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { usePaymentStore } from '../../store/usePaymentStore';

export const QrModal = () => {
  const { qrCodeString, resetPayment, selectedAmount } = usePaymentStore();
  const [timeLeft, setTimeLeft] = useState(50);

  useEffect(() => {
    if (!qrCodeString) return;
    setTimeLeft(50);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          resetPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCodeString, resetPayment]);

  if (!qrCodeString) return null;

  const strokeDasharray = 2 * Math.PI * 40;
  const strokeDashoffset = strokeDasharray * ((50 - timeLeft) / 50);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Overlay */}
      <div
        onClick={resetPayment}
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl 
        bg-white/10 backdrop-blur-2xl border border-white/20 
        shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] text-cyan-400 font-semibold uppercase mb-2">
            Pago Digital
          </p>
          <h2 className="text-3xl font-extrabold text-white">
            Escaneá el QR
          </h2>
          <p className="text-slate-300 text-sm mt-2">
            Usá Mercado Pago u otra billetera
          </p>
        </div>

        {/* QR */}
        <div className="flex justify-center mb-8">
          <div className="relative p-6 rounded-3xl bg-white shadow-2xl">
            <QRCodeSVG
              value={qrCodeString}
              size={200}
              fgColor="#0f172a"
            />
          </div>
        </div>

        {/* Amount + Timer */}
        <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">

          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">
              Total
            </p>
            <p className="text-3xl font-bold text-white">
              ${selectedAmount.toLocaleString('es-AR')}
            </p>
          </div>

          {/* Timer */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#22d3ee"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className="text-white font-bold text-sm">
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={resetPayment}
          className="w-full py-4 rounded-2xl 
          bg-white/10 hover:bg-red-500/20 
          text-white hover:text-red-400 
          border border-white/20 hover:border-red-400/40
          transition-all duration-300 font-semibold tracking-wide"
        >
          Cancelar operación
        </button>
      </div>
    </div>
  );
};