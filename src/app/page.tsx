'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BalanceWidget } from '@/components/BalanceWidget';
import { Footer } from '@/components/Footer';
import { RechargeSelector } from '@/components/payments/RechargeSelector';
import { QrModal } from '@/components/payments/QrModal';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useDebitStore } from '@/store/useDebitStore';
import { PaymentSuccessAlert } from '@/components/payments/PaymentSuccessAlert';
import Swal from 'sweetalert2';
import Pusher from 'pusher-js'; // 👈 Agregamos esto
import { CardPagoDebito } from '@/components/payments/CardPagoDebito';
import { PaymentLoader } from '@/components/payments/PaymentLoader';

export default function HomePage() {
  const [balance, setBalance] = useState<number>(1500);
  const [user, setUser] = useState<string>('');
  const router = useRouter();

  const openSelector = usePaymentStore((state) => state.openSelector);
  const openDebitSelector = useDebitStore((state) => state.openDebitSelector);
  const status = balance > 0 ? 'CONNECTED' : 'DISCONNECTED';
  const isGeneratingQR = usePaymentStore((state) => state.isGenerating);
  const isProcessingDebit = useDebitStore((state) => state.isProcessing);

  // 1. Gestión de Sesión: Extraer DNI de la cookie
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(row => row.startsWith('user_session='));

    if (userCookie) {
      const userId = userCookie.split('=')[1];
      setUser(userId);
    } else {
      router.push('/login');
    }
  }, [router]);

  // 2. CONEXIÓN A PUSHER (Reemplaza a Socket.io)
  useEffect(() => {
    if (!user) return;

    // Configuramos el cliente de Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    console.log("⚡ Pusher: Intentando conectar para DNI:", user);

    // Nos suscribimos al canal privado del usuario
    const channel = pusher.subscribe(`user-${user}`);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log("✅ Conectado exitosamente al canal de Pusher");
    });

    // Limpieza al desmontar el componente
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${user}`);
      pusher.disconnect();
    };
  }, [user]);

  const handleResetBalance = async () => {
    if (!user) return;

    const result = await Swal.fire({
      title: '¿Confirmar Corte de Suministro?',
      text: "Esta acción agotará los kWh y el estado pasará a DESCONECTADO.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'SÍ, FORZAR CORTE',
      cancelButtonText: 'CANCELAR',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2.5rem] border-4 border-slate-900',
        title: 'text-2xl font-black text-slate-800',
        confirmButton: 'rounded-2xl font-black px-6 py-3 uppercase tracking-tighter',
        cancelButton: 'rounded-2xl font-bold px-6 py-3'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Procesando Corte...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        const response = await fetch('/api/users/reset-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dni: user }),
        });

        if (response.ok) {
          setBalance(0);
          Swal.fire({
            icon: 'error',
            title: 'SUMINISTRO CORTADO',
            html: `<div class="flex flex-col items-center gap-3"><div class="text-5xl">🔌</div><p class="font-black text-red-600 text-xl">0.00 kWh</p></div>`,
            confirmButtonColor: '#0F172A',
          });
        }
      } catch (err) {
        console.error("Error al resetear:", err);
      }
    }
  };

  const handleLogout = () => {
    document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
      {(isGeneratingQR || isProcessingDebit) && (
        <PaymentLoader mensaje={isGeneratingQR ? "Generando QR..." : "Conectando con Mercado Pago..."} />
      )}
      {/* 🚨 El componente PaymentSuccessAlert ahora se encarga de escuchar el evento de pago */}
      {user && (
        <PaymentSuccessAlert
          user={user}
          onBalanceUpdate={(amount) => setBalance(prev => prev + amount)}
        />
      )}

      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-10 flex-grow space-y-8">
        <header className="flex justify-between items-center bg-paygo-dark text-white p-6 rounded-[2rem] shadow-xl border-b-4 border-paygo-qr">
          <div className="flex items-center gap-3">
            <div className="bg-paygo-qr w-10 h-10 rounded-xl flex items-center justify-center text-paygo-dark font-black text-xl shadow-inner">⚡</div>
            <h1 className="text-2xl font-black tracking-tighter">PAY GO</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-[9px] font-black text-paygo-qr uppercase tracking-widest">Cliente DNI</p>
              <p className="font-bold text-sm">{user || 'Cargando...'}</p>
            </div>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-2 border-red-500/20 px-4 py-2 rounded-xl text-xs font-black transition-all">
              SALIR 🚪
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <BalanceWidget amount={balance} status={status} />
            <div className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-paygo-qr opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-paygo-qr"></span>
                  </div>
                  <span className="text-sm font-black uppercase text-slate-700 tracking-tight">Sistema Realtime (Pusher)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-black mb-8 border-b-4 border-slate-100 pb-4 uppercase">Cargar Energía</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
  onClick={openSelector}
  className="flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-slate-100 hover:border-paygo-qr bg-slate-50 hover:bg-white transition-all group shadow-sm hover:shadow-xl text-center"
>
  {/* Icono Centrado con fondo dinámico */}
  <div className="bg-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
    <span className="text-5xl">🤳</span>
  </div>
  
  {/* Bloque de Texto Centrado */}
  <div className="flex flex-col items-center">
    <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
      Escanear
    </span>
    <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
       QR
    </span>
  </div>

  {/* Footer del botón con el color de PayGo QR */}
  <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 px-4 py-1 rounded-full">
    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
    <span className="font-black text-emerald-600 text-[10px] uppercase tracking-widest">
      Mercado Pago / Otros
    </span>
  </div>
</button>


              <button
  onClick={openDebitSelector}
  className="flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-slate-100 hover:border-blue-500 bg-slate-50 hover:bg-white transition-all group shadow-sm hover:shadow-xl text-center"
>
  {/* Icono Centrado con efecto */}
  <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-100">
    <span className="text-5xl">💳</span>
  </div>
  
  {/* Bloque de Texto Centrado */}
  <div className="flex flex-col items-center">
    <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
      Tarjetas
    </span>
    <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
      Débito - Crédito
    </span>
  </div>

  {/* Footer Centrado */}
  <div className="mt-4 flex items-center gap-2 bg-blue-500/10 px-4 py-1 rounded-full">
    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
    <span className="font-black text-blue-600 text-[10px] uppercase tracking-widest">
      Pago seguro
    </span>
  </div>
</button>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetBalance}
          className="flex items-center gap-2 text-[10px] font-bold tracking-tighter bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
        >
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse group-hover:bg-white" />
          FORZAR CORTE (0 kWh)
        </button>
      </div>
      <CardPagoDebito user={user} />

      <RechargeSelector user={{ dni: user, balance: balance }} />
      <QrModal />
      <Footer />
    </main>
  );
}