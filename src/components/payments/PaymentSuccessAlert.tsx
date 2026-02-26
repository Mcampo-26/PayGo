'use client';

import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Pusher from 'pusher-js';
import { usePaymentStore } from '@/store/usePaymentStore';

export const PaymentSuccessAlert = ({ user, onBalanceUpdate }: { user: string, onBalanceUpdate: (a: number) => void }) => {
  const setPaymentSuccess = usePaymentStore((state) => state.setPaymentSuccess);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${user}`);

    channel.bind('payment-success', (data: { amount: number }) => {
      // 1. Verificamos que no sea un duplicado
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      console.log("🔥 EVENTO REAL RECIBIDO:", data);

      // 2. DISPARO DIRECTO (Sin estados intermedios que bloqueen)
      Swal.fire({
        title: '¡CARGA EXITOSA!',
        html: `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 10px;">⚡</div>
            <p style="font-size: 1.5rem; font-weight: bold; color: #0f172a;">+${data.amount} kWh</p>
            <p style="color: #64748b;">Tu saldo ha sido actualizado</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#0f172a',
        confirmButtonText: 'ENTENDIDO',
        allowOutsideClick: false,
      }).then(() => {
        // Liberamos el candado cuando cierran el cartel
        hasProcessed.current = false;
      });

      // 3. Actualizamos los datos de la app
      onBalanceUpdate(data.amount);
      setPaymentSuccess();
    });

    return () => {
      pusher.unsubscribe(`user-${user}`);
      pusher.disconnect();
    };
  }, [user, onBalanceUpdate, setPaymentSuccess]);

  return null; // No retornamos NADA de HTML para que no interfiera con el DOM
};