export const Footer = () => {
    return (
      /* w-full y bg-paygo-dark para que la franja negra cruce toda la pantalla */
      <footer className="w-full bg-paygo-dark text-white mt-auto border-t border-slate-800">
        
        {/* Contenedor interno alineado con el Dashboard (max-w-[1400px]) */}
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          
          {/* Fila Superior: Datos del Medidor y Consumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-paygo-qr uppercase tracking-[0.2em]">Dispositivo</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">Smart Meter v2</span>
                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">SN: 99283-X</span>
              </div>
            </div>
  
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-paygo-card uppercase tracking-[0.2em]">Estado de Red</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-paygo-qr rounded-full animate-pulse" />
                <span className="text-sm font-bold text-slate-100 italic">142.5 kWh consumidos</span>
              </div>
            </div>
  
            <div className="flex items-center md:justify-end">
              <button className="w-full md:w-auto bg-white text-paygo-dark hover:bg-paygo-qr transition-all duration-300 font-black text-[11px] py-2.5 px-6 rounded-xl shadow-lg uppercase">
                🆘 Soporte Técnico
              </button>
            </div>
  
          </div>
  
          {/* Fila Inferior: Branding y Copyright */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-7 h-7 bg-paygo-qr rounded flex items-center justify-center text-paygo-dark font-black text-xs group-hover:rotate-12 transition-transform">
                ⚡
              </div>
              <span className="font-black tracking-tighter text-base">PAY GO</span>
            </div>
            
            <p className="text-[9px] text-slate-500 font-bold tracking-[0.2em] uppercase">
              © 2026 Pay Go Energy — Digitalizando la red eléctrica
            </p>
          </div>
  
        </div>
      </footer>
    );
  };