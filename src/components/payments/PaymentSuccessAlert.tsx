'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import socket from '@/lib/socket';
import { usePaymentStore } from '@/store/usePaymentStore';

interface PaymentSuccessAlertProps {
  user: string;
  onBalanceUpdate: (amount: number) => void;
}

export const PaymentSuccessAlert = ({ user, onBalanceUpdate }: PaymentSuccessAlertProps) => {
  const setPaymentSuccess = usePaymentStore((state) => state.setPaymentSuccess);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket.on('paymentSuccess', async (data: { amount: number }) => {
      console.log("🎊 Pago recibido por socket:", data);
      
      setIsProcessing(true); 
      setPaymentSuccess();

      Swal.fire({
        title: '¡Pago Confirmado!',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <div style="font-size: 3rem; animation: bounce 1s infinite;">⚡</div>
            <p style="font-size: 1.125rem; font-weight: 800; color: #334155;">+${data.amount.toFixed(2)} kWh acreditados</p>
            <div style="display: flex; items-center; gap: 0.5rem; color: #16a34a; font-weight: 900; text-transform: uppercase; font-size: 0.875rem;">
              <span style="position: relative; display: flex; height: 0.75rem; width: 0.75rem; margin-top: 0.25rem;">
                <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #4ade80; opacity: 0.75; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                <span style="position: relative; display: inline-flex; border-radius: 9999px; height: 0.75rem; width: 0.75rem; background-color: #22c55e;"></span>
              </span>
              Servicio Restablecido
            </div>
          </div>
          <style>
            @keyframes bounce {
              0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
              50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
            }
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          </style>
        `,
        icon: 'success',
        confirmButtonText: 'Servicio en linea',
        confirmButtonColor: '#0F172A', 
        timer: 5000,
        timerProgressBar: true,
        // Usamos customClass para redondear si lo deseas, o simplemente quitamos borderRadius
        padding: '2rem',
      });

      // Simulamos la carga suave antes de impactar el balance en la UI
      setTimeout(() => {
        onBalanceUpdate(data.amount);
        setIsProcessing(false);
      }, 1500);
    });

    return () => {
      socket.off('paymentSuccess');
    };
  }, [user, setPaymentSuccess, onBalanceUpdate]);

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-yellow-400 rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-slate-900 tracking-tighter uppercase animate-pulse">
          Restableciendo Servicio...
        </p>
      </div>
    );
  }

  return null;
};