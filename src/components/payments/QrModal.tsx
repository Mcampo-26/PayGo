'use client';

import { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePaymentStore } from '../../store/usePaymentStore';

export const QrModal = () => {
  const { qrCodeString, resetPayment, selectedAmount } = usePaymentStore();
  const [timeLeft, setTimeLeft] = useState(50);

  // Usamos useCallback para que la función sea estable y no dispare efectos innecesarios
  const handleClose = useCallback(() => {
    resetPayment();
  }, [resetPayment]);

  useEffect(() => {
    if (!qrCodeString) return;

    // Reiniciamos el tiempo cuando aparece un nuevo QR
    setTimeLeft(50);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Usamos un pequeño delay o esperamos al siguiente tick para evitar
          // conflictos de renderizado de React al cerrar el modal
          setTimeout(() => handleClose(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCodeString, handleClose]);

  // Si no hay QR, no renderizamos nada
  if (!qrCodeString) return null;

  // Cálculos para el círculo de progreso (Timer)
  const radius = 28;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray * ((50 - timeLeft) / 50);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Overlay con desenfoque */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md rounded-3xl 
        bg-white/10 backdrop-blur-2xl border border-white/20 
        shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-8
        animate-in zoom-in-95 duration-300">

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

        {/* QR Code Container */}
        <div className="flex justify-center mb-8">
          <div className="relative p-6 rounded-[2.5rem] bg-white shadow-2xl border-4 border-white/20">
            <QRCodeSVG
              value={qrCodeString}
              size={200}
              fgColor="#0f172a"
              level="H" // Alta corrección de errores
              includeMargin={false}
            />
          </div>
        </div>

        {/* Info Card: Monto + Timer */}
        <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1 font-bold">
              Total a pagar
            </p>
            <p className="text-3xl font-black text-white">
              ${selectedAmount.toLocaleString('es-AR')}
            </p>
          </div>

          {/* Visual Timer Circular */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="#22d3ee"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 linear"
              />
            </svg>
            <span className="text-white font-black text-xs">
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Botón Cancelar */}
        <button
          onClick={handleClose}
          className="w-full py-4 rounded-2xl 
          bg-white/5 hover:bg-red-500/20 
          text-white hover:text-red-400 
          border border-white/10 hover:border-red-400/40
          transition-all duration-300 font-bold tracking-wide uppercase text-xs"
        >
          Cancelar operación
        </button>
      </div>
    </div>
  );
};