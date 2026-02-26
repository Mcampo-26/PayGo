'use client';

import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import Pusher from 'pusher-js'; // 👈 Cambiamos socket por Pusher
import { usePaymentStore } from '@/store/usePaymentStore';

interface PaymentSuccessAlertProps {
  user: string;
  onBalanceUpdate: (amount: number) => void;
}

export const PaymentSuccessAlert = ({ user, onBalanceUpdate }: PaymentSuccessAlertProps) => {
  const setPaymentSuccess = usePaymentStore((state) => state.setPaymentSuccess);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Candado físico para evitar duplicados
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!user) return;

    // 1. Inicializamos Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // 2. Nos suscribimos al canal del usuario
    const channel = pusher.subscribe(`user-${user}`);

    // 3. Escuchamos el evento 'payment-success'
    channel.bind('payment-success', (data: { amount: number }) => {
      // Si el candado está cerrado, ignoramos
      if (hasProcessed.current) return;
      
      console.log("🎊 Pago recibido por Pusher:", data);
      
      hasProcessed.current = true; // Cerramos el candado
      setIsProcessing(true); 
      setPaymentSuccess();

      Swal.fire({
        title: '¡Pago Confirmado!',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <div style="font-size: 3rem; animation: bounce 1s infinite;">⚡</div>
            <p style="font-size: 1.125rem; font-weight: 800; color: #334155;">+${data.amount.toFixed(2)} kWh acreditados</p>
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #16a34a; font-weight: 900; text-transform: uppercase; font-size: 0.875rem;">
               <span style="position: relative; display: flex; height: 0.75rem; width: 0.75rem;">
                <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #4ade80; opacity: 0.75; animation: ping 1s infinite;"></span>
                <span style="relative; display: inline-flex; border-radius: 9999px; height: 0.75rem; width: 0.75rem; background-color: #22c55e;"></span>
              </span>
              Servicio Restablecido
            </div>
          </div>
          <style>
            @keyframes bounce {
              0%, 100% { transform: translateY(-25%); }
              50% { transform: translateY(0); }
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
        padding: '2rem',
        willClose: () => {
          hasProcessed.current = false; // Liberamos el candado al cerrar
        }
      });

      setTimeout(() => {
        onBalanceUpdate(data.amount);
        setIsProcessing(false);
      }, 1500);
    });

    // 4. Limpieza: Desconectar Pusher al salir
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${user}`);
      pusher.disconnect();
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