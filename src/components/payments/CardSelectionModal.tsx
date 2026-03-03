'use client';

import { useState } from 'react';
import { useCardStore } from '@/store/useCardStore';
import { PaymentLoader } from '@/components/payments/PaymentLoader';
import AmountSelector from '@/components/AmountSelector';
import Swal from 'sweetalert2';

export const CardSelectionModal = ({ userId }: { userId: string }) => {
    const {
        showSelectionModal,
        setShowSelectionModal,
        openCardModal,
        createExternalPreference,
        isProcessing,
        setProcessing
    } = useCardStore();

    const [step, setStep] = useState<'method' | 'amount'>('method');

    if (!showSelectionModal) return null;

    const handleExternalPaymentClick = () => {
        setStep('amount');
    };

    // ESTA ES LA FUNCIÓN CLAVE
    const handleConfirmAmountAndRedirect = async (amount: number) => {
        try {
            // 1. CERRAMOS EL MODAL INMEDIATAMENTE
            // Así el usuario ya no lo ve debajo del loader
            setShowSelectionModal(false);

            // 2. ACTIVAMOS EL LOADER GLOBAL
            setProcessing(true);

            const initPoint = await createExternalPreference(amount, userId);

            if (initPoint) {
                // 3. REDIRECCIÓN CON DELAY PARA EL EFECTO VISUAL
                setTimeout(() => {
                    window.location.href = initPoint;
                }, 2000);
            } else {
                setProcessing(false);
                throw new Error("Error al generar link");
            }
        } catch (error) {
            setProcessing(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo conectar con Mercado Pago',
                confirmButtonColor: '#0F172A',
            });
        }
    };

    const handleClose = () => {
        setShowSelectionModal(false);
        // Resetear el step después de que cierre la animación
        setTimeout(() => setStep('method'), 300);
    };

    return (
        <>
            {/* LOADER GLOBAL (z-9999) */}
            {isProcessing && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md">
                    <PaymentLoader mensaje="Redirigiendo a Mercado Pago..." />
                </div>
            )}

            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <div onClick={handleClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

                <div className={`
          bg-white border-[3px] border-slate-900 relative overflow-hidden
          shadow-[15px_15px_0px_rgba(0,0,0,1)] w-full max-w-md transition-all duration-500
          ${step === 'method' ? 'min-h-[400px]' : 'min-h-[500px]'}
          z-[201]
        `}>

                    <button onClick={handleClose} className="absolute top-6 right-8 font-black text-2xl text-slate-300 hover:text-slate-900 z-[210]">✕</button>

                    
                    <div className="p-0">
  {step === 'method' && (
    <div className="animate-in fade-in duration-300">

      {/* HEADER SIMPLE */}
      <div className="px-8 pt-10 pb-6">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-2">
          Checkout Seguro
        </p>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Elegí cómo querés pagar
        </h2>
      </div>

      {/* OPCIONES DE PAGO */}
      <div className="px-6 pb-8 space-y-3">

        {/* MERCADO PAGO - HOVER AZUL */}
        <button
          onClick={handleExternalPaymentClick}
          className="group w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-white border-2 border-slate-100 transition-all duration-300 hover:border-[#009EE3] hover:bg-[#009EE3] active:scale-[0.98] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-white/20 transition-colors">
              💙
            </div>
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100 transition-colors mb-0.5">
                App o Efectivo
              </p>
              <h4 className="text-lg font-bold text-slate-800 group-hover:text-white transition-colors">
                Mercado Pago
              </h4>
            </div>
          </div>

          <span className="text-xl text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all">
            →
          </span>
        </button>

        {/* PAGO EXPRESS - HOVER VERDE */}
        <button
          onClick={openCardModal}
          className="group w-full flex items-center justify-between px-6 py-5 rounded-2xl bg-white border-2 border-slate-100 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.98] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-white/20 transition-colors">
              🚀
            </div>
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-50 transition-colors mb-0.5">
                Carga Directa
              </p>
              <h4 className="text-lg font-bold text-slate-800 group-hover:text-white transition-colors">
                Pago Express
              </h4>
            </div>
          </div>

          <span className="text-xl text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all">
            →
          </span>
        </button>

      </div>

      {/* FOOTER DISCRETO */}
      <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Conexión Encriptada SSL
        </p>
      </div>

    </div>
  )}

  {step === 'amount' && (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="px-6 pt-8">
        <button
          onClick={() => setStep('method')}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#009EE3] hover:text-[#007EB5] transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver a métodos
        </button>
      </div>
      <div className="p-4">
        <AmountSelector onConfirm={handleConfirmAmountAndRedirect} />
      </div>
    </div>
  )}
</div>
                </div>
            </div>
        </>
    );
};