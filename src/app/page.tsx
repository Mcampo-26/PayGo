'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BalanceWidget } from '@/components/BalanceWidget';
import { Footer } from '@/components/Footer';
import { RechargeSelector } from '@/components/payments/RechargeSelector';
import { QrModal } from '@/components/payments/QrModal';
import { usePaymentStore } from '@/store/usePaymentStore';
import socket from '@/lib/socket';
import { PaymentSuccessAlert } from '@/components/payments/PaymentSuccessAlert';
import Swal from 'sweetalert2'

export default function HomePage() {
  const [balance, setBalance] = useState<number>(1500);
  const [user, setUser] = useState<string>(''); 
  const router = useRouter();
  
  const openSelector = usePaymentStore((state) => state.openSelector);

  const status = balance > 0 ? 'CONNECTED' : 'DISCONNECTED';

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


const handleResetBalance = async () => {
  if (!user) return;

  // 1. Alerta de Confirmación con Estilo "Danger"
  const result = await Swal.fire({
    title: '¿Confirmar Corte de Suministro?',
    text: "Esta acción agotará los kWh y el estado pasará a DESCONECTADO.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Rojo intenso
    cancelButtonColor: '#64748b',  // Gris Slate
    confirmButtonText: 'SÍ, FORZAR CORTE',
    cancelButtonText: 'CANCELAR',
    reverseButtons: true, // Pone el cancelar a la izquierda
    background: '#ffffff',
    customClass: {
      popup: 'rounded-[2.5rem] border-4 border-slate-900',
      title: 'text-2xl font-black text-slate-800',
      confirmButton: 'rounded-2xl font-black px-6 py-3 uppercase tracking-tighter',
      cancelButton: 'rounded-2xl font-bold px-6 py-3'
    }
  });

  if (result.isConfirmed) {
    // Spinner de carga mientras la API responde
    Swal.fire({
      title: 'Procesando Corte...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch('/api/users/reset-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: user }),
      });

      if (response.ok) {
        setBalance(0); // Actualiza la UI de React inmediatamente

        // 2. Notificación Final de Suministro Interrumpido
        Swal.fire({
          icon: 'error',
          title: 'SUMINISTRO CORTADO',
          html: `
            <div class="flex flex-col items-center gap-3">
              <div class="text-5xl">🔌</div>
              <p class="font-black text-red-600 text-xl">0.00 kWh</p>
              <p class="text-sm font-medium text-slate-500">El medidor ha sido puesto a cero correctamente.</p>
            </div>
          `,
          confirmButtonColor: '#0F172A',
          confirmButtonText: 'VOLVER AL PANEL',
          customClass: {
            popup: 'rounded-[2.5rem] border-4 border-red-600'
          }
        });
      }
    } catch (err) {
      console.error("Error al resetear:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo comunicar con el medidor central.',
        confirmButtonColor: '#0F172A',
      });
    }
  }
};
  // 2. Conexión de Socket: Unirse a la sala privada del DNI
  useEffect(() => {
    if (!user) return;
    
    const joinRoom = () => {
      socket.emit('join', user);
      console.log("🔌 Socket: Escuchando notificaciones para DNI:", user);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }

    return () => {
      socket.off('connect', joinRoom);
    };
  }, [user]);

  const handleLogout = () => {
    document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
      {/* Orquestador de alertas de pago exitoso */}
      {user && (
        <PaymentSuccessAlert 
          user={user} 
          onBalanceUpdate={(amount) => setBalance(prev => prev + amount)} 
        />
      )}

      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-10 flex-grow space-y-8">
        
        {/* Header con información del Cliente */}
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
          {/* Columna Izquierda: Widget de Balance y Estado */}
          <div className="lg:col-span-5 space-y-6">
            <BalanceWidget amount={balance} status={status} />
            <div className="bg-white border-4 border-slate-900 p-6 rounded-[2rem] shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-paygo-qr opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-paygo-qr"></span>
                  </div>
                  <span className="text-sm font-black uppercase text-slate-700 tracking-tight">Sistema Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Opciones de Carga */}
          <div className="lg:col-span-7 bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-black mb-8 border-b-4 border-slate-100 pb-4 uppercase">Cargar Energía</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <button 
                onClick={openSelector}
                className="flex flex-col p-8 rounded-3xl border-4 border-slate-100 hover:border-paygo-qr bg-slate-50 hover:bg-white transition-all group shadow-sm hover:shadow-xl text-left"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤳</span>
                <span className="text-2xl font-black text-slate-900">Carga QR</span>
                <span className="mt-2 font-bold text-paygo-qr text-sm">Mercado Pago / Otros</span>
              </button>

              <button className="flex flex-col p-8 rounded-3xl border-4 border-slate-100 bg-slate-50 transition-all group shadow-sm text-left cursor-not-allowed opacity-60">
                <span className="text-5xl mb-4 grayscale">💳</span>
                <span className="text-2xl font-black text-slate-900">Tarjeta</span>
                <span className="mt-2 font-bold text-paygo-card text-sm">Próximamente</span>
              </button>
            </div>
          </div>
        </div>
        <button 
  onClick={handleResetBalance} 
  className="text-[9px] font-black bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg transition-all"
>
  FORZAR CORTE (0 kWh)
</button>
      </div>


      {/* Modales y Componentes Globales */}
      <RechargeSelector user={{ dni: user, balance: balance }} />
      <QrModal />
      <Footer />
    </main>
  );
}