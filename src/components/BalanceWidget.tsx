interface BalanceProps {
    amount: number;
    status: 'CONNECTED' | 'DISCONNECTED';
  }
  
  export const BalanceWidget = ({ amount, status }: BalanceProps) => {
    const isGreen = status === 'CONNECTED';
  
    return (
      <section className={`relative overflow-hidden p-8 rounded-[2.5rem] shadow-2xl transition-all duration-700 text-white ${
        isGreen ? 'bg-paygo-qr' : 'bg-paygo-trans'
      }`}>
        {/* Decoración de fondo */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Saldo de Energía</p>
          
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl font-light">$</span>
            <h2 className="text-7xl font-black tracking-tighter tabular-nums">
              {amount.toLocaleString('es-AR')}
            </h2>
          </div>
  
          {/* Badge de Estado Dinámico */}
          <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-3 bg-black/15 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10">
              <div className={`w-3 h-3 rounded-full ${
                isGreen ? 'bg-white animate-pulse' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
              }`} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {isGreen ? 'Suministro Activo' : 'Servicio Interrumpido'}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  };