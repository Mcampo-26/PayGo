'use client';

import { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePaymentStore } from '../../store/usePaymentStore';
import AmountSelector from '@/components/AmountSelector';
import { PaymentLoader } from '@/components/payments/PaymentLoader';

export const QrModal = ({ userId }: { userId: string }) => {
  const { 
    qrCodeString, 
    resetPayment, 
    selectedAmount, 
    isSelectorOpen, 
    setAmount,     // Agregado para guardar el monto antes de generar
    generateQr     // Nombre correcto según tu store
  } = usePaymentStore();

  const MAX_TIME = 60;
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [step, setStep] = useState<'amount' | 'loading' | 'qr'>('amount');

  const handleClose = useCallback(() => {
    resetPayment();
    setStep('amount');
    // Si tienes una función closeAll o closeSelector en el store, llámala aquí
    usePaymentStore.getState().closeAll?.();
  }, [resetPayment]);

  // Manejo de la selección de monto
  const handleAmountConfirmed = async (amount: number) => {
    if (!userId) {
      console.error("❌ Error: No se detectó el ID de usuario");
      return;
    }

    setStep('loading');
    
    try {
      // 1. Guardamos el monto en el store
      setAmount(amount);
      
      // 2. Generamos el QR pasando el userId que viene por props
      await generateQr(userId); 
      
      // El useEffect de abajo detectará cuando qrCodeString cambie y pasará al paso 'qr'
    } catch (error) {
      console.error("Error al generar QR:", error);
      handleClose();
    }
  };

  // Sincronizar pasos con el estado del store
  useEffect(() => {
    if (qrCodeString) {
      setStep('qr');
      setTimeLeft(MAX_TIME);
    } else if (!qrCodeString && step === 'qr') {
      // Si el QR desaparece (pago exitoso), volvemos al inicio
      setStep('amount');
    }
  }, [qrCodeString, step]);

  // Temporizador para el QR
  useEffect(() => {
    if (step !== 'qr') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleClose(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, handleClose]);

  // Si no hay nada que mostrar, retornamos null
  if (!isSelectorOpen && !qrCodeString) return null;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / MAX_TIME) * circumference;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity animate-in fade-in duration-500"
      />

      {/* 1. PASO SELECCIÓN DE MONTO */}
      {step === 'amount' && isSelectorOpen && (
        <div className="relative bg-white rounded-[2.5rem] border-4 border-slate-900 w-full max-w-md p-8 shadow-[15px_15px_0px_rgba(0,0,0,0.2)] animate-in zoom-in-95">
          <button 
            onClick={handleClose} 
            className="absolute top-6 right-8 font-black text-2xl text-slate-300 hover:text-slate-900 transition-colors"
          >
            ✕
          </button>
          <AmountSelector onConfirm={handleAmountConfirmed} />
        </div>
      )}

      {/* 2. PASO LOADING */}
      {step === 'loading' && (
        <PaymentLoader mensaje="Generando código QR seguro..." />
      )}

      {/* 3. PASO MOSTRAR QR */}
      {step === 'qr' && qrCodeString && (
        <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white border-4 border-slate-900 shadow-[15px_15px_0px_rgba(0,0,0,0.2)] p-8 animate-in zoom-in-95">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full mb-4">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">QR Listo para escanear</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Pago QR</h2>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative p-4 rounded-[2rem] bg-slate-50 border-2 border-slate-100 shadow-inner">
              <QRCodeSVG 
                value={qrCodeString} 
                size={220} 
                fgColor="#0f172a" 
                level="H" 
                className="rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-100">
                  <span className="text-xl">⚡</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900 rounded-3xl p-5 mb-6 border-b-4 border-slate-700">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 font-black">Total a pagar</p>
              <p className="text-3xl font-black text-white tracking-tighter">
                ${selectedAmount?.toLocaleString('es-AR')}
              </p>
            </div>

            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="28" cy="28" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                <circle
                  cx="28" cy="28" r={radius}
                  stroke={timeLeft < 10 ? "#f87171" : "#22d3ee"}
                  strokeWidth="6" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 linear"
                />
              </svg>
              <span className={`font-black text-xs ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border-2 border-transparent hover:border-red-200 transition-all duration-300 font-black tracking-[0.2em] uppercase text-[10px]"
          >
            Cancelar operación
          </button>
        </div>
      )}
    </div>
  );
};