'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BalanceWidget } from '@/components/BalanceWidget';
import { Footer } from '@/components/Footer';
import { RechargeSelector } from '@/components/payments/RechargeSelector';
import { QrModal } from '@/components/payments/QrModal';
import { usePaymentStore } from '@/store/usePaymentStore';

export default function HomePage() {
  const [balance, setBalance] = useState(1500);
  const [user, setUser] = useState('');
  const router = useRouter();
  
  // Extraemos la acción para abrir el selector desde nuestro Store
  const { openSelector } = usePaymentStore();

  const status = balance > 0 ? 'CONNECTED' : 'DISCONNECTED';

  // Al cargar, leemos el ID del usuario de la cookie
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(row => row.startsWith('user_session='));
    if (userCookie) setUser(userCookie.split('=')[1]);
  }, []);

  const handleLogout = () => {
    // Borramos cookie y mandamos al login
    document.cookie = "user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-10 flex-grow space-y-8">
        
        {/* Header Pro con Logout */}
        <header className="flex justify-between items-center bg-paygo-dark text-white p-6 rounded-[2rem] shadow-xl border-b-4 border-paygo-qr">
          <div className="flex items-center gap-3">
            <div className="bg-paygo-qr w-10 h-10 rounded-xl flex items-center justify-center text-paygo-dark font-black text-xl shadow-inner">⚡</div>
            <h1 className="text-2xl font-black tracking-tighter">PAY GO</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-[9px] font-black text-paygo-qr uppercase tracking-widest">Cliente ID</p>
              <p className="font-bold text-sm">{user || 'Cargando...'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-2 border-red-500/20 px-4 py-2 rounded-xl text-xs font-black transition-all"
            >
              SALIR 🚪
            </button>
          </div>
        </header>

        {/* Layout Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda */}
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
                <button onClick={() => setBalance(0)} className="text-[9px] font-black bg-slate-100 px-3 py-1 rounded-lg hover:bg-slate-200">TEST CORTE</button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Acciones */}
          <div className="lg:col-span-7 bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-black mb-8 border-b-4 border-slate-100 pb-4 uppercase">Cargar Energía</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Botón Carga QR - Conectado al Store */}
              <button 
                onClick={openSelector}
                className="flex flex-col p-8 rounded-3xl border-4 border-slate-100 hover:border-paygo-qr bg-slate-50 hover:bg-white transition-all group shadow-sm hover:shadow-xl text-left"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤳</span>
                <span className="text-2xl font-black text-slate-900">Carga QR</span>
                <span className="mt-2 font-bold text-paygo-qr text-sm">Mercado Pago / Otros</span>
              </button>

              {/* Botón Tarjeta (Próximamente) */}
              <button className="flex flex-col p-8 rounded-3xl border-4 border-slate-100 hover:border-paygo-card bg-slate-50 hover:bg-white transition-all group shadow-sm hover:shadow-xl text-left">
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">💳</span>
                <span className="text-2xl font-black text-slate-900">Tarjeta</span>
                <span className="mt-2 font-bold text-paygo-card text-sm">Crédito o Débito</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Componentes de Pago (Modales) */}
      <RechargeSelector />
      <QrModal />

      <Footer />
    </main>
  );
}