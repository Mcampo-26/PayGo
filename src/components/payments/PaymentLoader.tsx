'use client';

interface PaymentLoaderProps {
  mensaje?: string;
}

export const PaymentLoader = ({ mensaje = "Procesando tu carga..." }: PaymentLoaderProps) => {
  return (
    /* SUBIMOS EL Z-INDEX A 9999 */
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Contenedor del Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Círculo exterior girando */}
        <div className="w-24 h-24 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
        
        {/* Círculo interior girando en sentido opuesto */}
        <div className="absolute w-16 h-16 border-4 border-white/5 border-b-emerald-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
        
        {/* Icono central */}
        <span className="absolute text-3xl animate-pulse">⚡</span>
      </div>

      {/* Texto de estado */}
      <div className="mt-8 text-center px-6">
        <h3 className="text-white text-2xl font-black uppercase tracking-tighter animate-pulse italic">
          Pay<span className="text-blue-500">Go</span>
        </h3>
        {/* Usamos un min-h para que el layout no salte si el mensaje es corto */}
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3 max-w-[250px] leading-relaxed">
          {mensaje}
        </p>
      </div>

      {/* Barra de progreso decorativa */}
      <div className="mt-8 w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 animate-[progress_2s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(20%); }
          100% { width: 0%; transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};