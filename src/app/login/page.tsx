'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [clientId, setClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulación de validación
    setTimeout(() => {
      if (clientId.length >= 7) {
        // Guardamos la sesión en Cookies (v4 Next.js style)
        document.cookie = `user_session=${clientId}; path=/; max-age=86400; samesite=lax`;
        router.push('/');
      } else {
        alert("DNI o N° de Cliente inválido (mínimo 7 dígitos)");
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-paygo-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border-[6px] border-slate-900 shadow-[20px_20px_0px_rgba(0,0,0,0.3)]">
        
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden rounded-t-[1.8rem]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-paygo-qr rounded-2xl text-paygo-dark text-3xl font-black mb-4 shadow-xl rotate-3">⚡</div>
          <h1 className="text-white text-3xl font-black tracking-tighter uppercase">Pay Go</h1>
          <p className="text-paygo-qr font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Acceso Seguro</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificación</label>
              <input 
                required
                type="number" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="DNI o N° de Cliente"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-lg font-bold outline-none focus:border-paygo-card transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-paygo-dark text-white font-black py-5 rounded-2xl text-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
          >
            {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : "INGRESAR"}
          </button>
        </form>
      </div>
    </main>
  );
}