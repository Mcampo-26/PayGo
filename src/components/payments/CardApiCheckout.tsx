'use client';

import { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useCardStore } from '@/store/useCardStore';
import AmountSelector from '@/components/AmountSelector';
import { PaymentLoader } from '@/components/payments/PaymentLoader';
import Swal from 'sweetalert2';

export default function CardApiCheckout({ userId }: { userId: string }) {
  const { isCardModalOpen, closeCardModal, processCardPayment, isProcessing } = useCardStore();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [finalAmount, setFinalAmount] = useState<number>(0);
  
  const [isShowingMpLoader, setIsShowingMpLoader] = useState(false);
  const [isReadyToReveal, setIsReadyToReveal] = useState(false);

  useEffect(() => {
    if (isCardModalOpen && !sdkLoaded) {
      const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (key) {
        initMercadoPago(key.trim(), { locale: 'es-AR' });
        setSdkLoaded(true);
      }
    }
    
    if (!isCardModalOpen) {
      setStep('amount');
      setIsShowingMpLoader(false);
      setIsReadyToReveal(false);
    }
  }, [isCardModalOpen, sdkLoaded]);

  const handleAmountConfirmed = (amount: number) => {
    setFinalAmount(amount);
    setIsShowingMpLoader(true);
    setStep('payment');
  };

  const handleMpReady = () => {
    setTimeout(() => {
      setIsShowingMpLoader(false);
      setTimeout(() => setIsReadyToReveal(true), 300);
    }, 1500); 
  };

  if (!isCardModalOpen) return null;

  return (
    <>
      {/* LOADER CON PRIORIDAD MÁXIMA */}
      {(isProcessing || isShowingMpLoader) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
          <PaymentLoader mensaje={isProcessing ? "Validando transacción..." : "Preparando formulario..."} />
        </div>
      )}

      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          onClick={closeCardModal} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        />

        <div className={`
          bg-white rounded-[2.5rem] border-[3px] border-slate-900 relative overflow-hidden
          shadow-[15px_15px_0px_rgba(0,0,0,1)] w-full max-w-md transition-all duration-500
          ${step === 'amount' ? 'min-h-[400px]' : 'min-h-[600px]'}
          z-[151]
        `}>
          
          <button 
            onClick={closeCardModal} 
            className="absolute top-6 right-8 font-black text-2xl text-slate-300 hover:text-slate-900 z-[160]"
          >
            ✕
          </button>

          <div className="p-0"> {/* P-0 para que AmountSelector use todo el espacio */}
            {/* PASO 1: Selección de Monto (Sin títulos extras) */}
            {step === 'amount' && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <AmountSelector onConfirm={handleAmountConfirmed} />
              </div>
            )}

            {/* PASO 2: Checkout de Tarjeta */}
            {step === 'payment' && (
              <div 
                className="p-8 transition-all duration-700"
                style={{
                  filter: isReadyToReveal ? 'blur(0px)' : 'blur(10px)',
                  opacity: isReadyToReveal ? 1 : 0,
                  transform: isReadyToReveal ? 'scale(1)' : 'scale(0.98)',
                }}
              >
                <button 
                  onClick={() => { setStep('amount'); setIsReadyToReveal(false); }} 
                  className="text-slate-400 font-black text-[10px] uppercase mb-6 tracking-widest hover:text-blue-600 transition-colors"
                >
                  ← Volver a montos
                </button>
                
                <div className="mb-6 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-center border-dashed">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total a pagar</p>
                  <h2 className="font-black text-3xl text-slate-900 mt-1">
                    ${finalAmount.toLocaleString('es-AR')}
                  </h2>
                </div>
                
                <div className="min-h-[450px]">
                  {sdkLoaded && (
                    <CardPayment
                      initialization={{ 
                        amount: finalAmount, 
                        payer: { email: 'user@test.com' } 
                      }}
                      onReady={handleMpReady}
                      onSubmit={async (param) => {
                        const data = await processCardPayment({ 
                          ...param, 
                          userId, 
                          transaction_amount: finalAmount 
                        });

                        if (data.status === 'approved') {
                          // CERRAMOS EL MODAL ANTES O DURANTE EL ÉXITO
                          closeCardModal();
                          
                          await Swal.fire({ 
                            icon: 'success', 
                            title: '¡PAGO EXITOSO!', 
                            text: 'Tu energía ha sido acreditada.',
                            confirmButtonColor: '#0F172A',
                            customClass: { popup: 'rounded-[2.5rem] border-4 border-slate-900' }
                          });
                        } else {
                          Swal.fire({ 
                            icon: 'error', 
                            title: 'PAGO RECHAZADO', 
                            text: 'Intenta con otro medio de pago.',
                            confirmButtonColor: '#0F172A',
                            customClass: { popup: 'rounded-[2.5rem] border-4 border-slate-900' }
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}