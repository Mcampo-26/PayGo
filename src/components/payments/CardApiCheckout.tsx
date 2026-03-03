'use client';

import { useEffect, useState, useMemo } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useCardStore } from '@/store/useCardStore';
import AmountSelector from '@/components/AmountSelector';
import { PaymentLoader } from '@/components/payments/PaymentLoader';
import Swal from 'sweetalert2';

// 1. Variable fuera del componente para evitar re-inicializaciones del SDK
let mpInitialized = false;

export default function CardApiCheckout({ userId }: { userId: string }) {
  // Consumimos el Store de Zustand
  const { 
    isCardModalOpen, 
    closeCardModal, 
    processCardPayment, 
    isProcessing, 
    setProcessing 
  } = useCardStore();

  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isReadyToReveal, setIsReadyToReveal] = useState(false);

  // 2. Inicialización única cuando se abre el modal
  useEffect(() => {
    if (isCardModalOpen && !mpInitialized) {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (publicKey) {
        initMercadoPago(publicKey.trim(), { locale: 'es-AR' });
        mpInitialized = true;
        console.log("✅ SDK de Mercado Pago inicializado");
      }
    }
    
    // Al cerrar el modal, reseteamos el flujo interno
    if (!isCardModalOpen) {
      setStep('amount');
      setIsReadyToReveal(false);
    }
  }, [isCardModalOpen]);

  // 3. Memorizamos el objeto de inicialización (Esto frena el bucle infinito)
  const paymentInitialization = useMemo(() => ({
    amount: finalAmount,
    payer: { email: 'cliente@paygo.com' } // Email por defecto necesario para el Brick
  }), [finalAmount]);

  const handleAmountConfirmed = (amount: number) => {
    setFinalAmount(amount);
    setProcessing(true); // Activa el loader mientras el Brick carga
    setStep('payment');
  };

  const handleMpReady = () => {
    // Cuando el formulario de tarjeta está realmente listo, quitamos el loader
    setProcessing(false);
    setTimeout(() => setIsReadyToReveal(true), 100);
  };

  if (!isCardModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Fondo oscuro con desenfoque */}
      <div onClick={closeCardModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      <div className={`
        bg-white border-4 border-slate-900 relative overflow-hidden
        shadow-[15px_15px_0px_rgba(0,0,0,1)] w-full max-w-md transition-all duration-500
        ${step === 'amount' ? 'min-h-[400px]' : 'min-h-[600px]'}
        z-[201] rounded-[2.5rem]
      `}>
        
        <button onClick={closeCardModal} className="absolute top-6 right-8 font-black text-2xl text-slate-300 hover:text-slate-900 z-[210]">✕</button>

        {step === 'amount' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <AmountSelector onConfirm={handleAmountConfirmed} onClose={closeCardModal} />
          </div>
        )}

        {step === 'payment' && (
          <div className={`p-8 transition-opacity duration-500 ${isReadyToReveal ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={() => { setStep('amount'); setIsReadyToReveal(false); }} 
              className="text-slate-400 font-black text-[10px] uppercase mb-6 tracking-widest hover:text-blue-600"
            >
              ← Volver a montos
            </button>

            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total a pagar</p>
              <h2 className="font-black text-3xl text-slate-900">${finalAmount}</h2>
            </div>

            {/* AQUÍ OCURRE LA MAGIA DEL SDK */}
            {finalAmount > 0 && (
              <CardPayment
                initialization={paymentInitialization}
                onReady={handleMpReady}
                onSubmit={async (param) => {
                  // Llamamos a la acción de tu Store
                  const data = await processCardPayment({ 
                    ...param, 
                    userId, 
                    transaction_amount: finalAmount 
                  });

                  if (data.status === 'approved') {
                    closeCardModal();
                    Swal.fire({ icon: 'success', title: '¡Recarga Exitosa!', text: 'Los kWh se verán reflejados en breve.', confirmButtonColor: '#0F172A' });
                  } else {
                    Swal.fire({ icon: 'error', title: 'Pago Rechazado', text: 'Verifica los datos de tu tarjeta o el saldo disponible.', confirmButtonColor: '#0F172A' });
                  }
                }}
                onError={(error) => {
                  console.error("❌ Error en el Brick:", error);
                  setProcessing(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}