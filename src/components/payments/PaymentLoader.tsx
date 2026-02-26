'use client';

interface PaymentLoaderProps {
  mensaje?: string;
}

export const PaymentLoader = ({ mensaje = "Procesando tu carga..." }: PaymentLoaderProps) => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Contenedor del Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Círculo exterior girando */}
        <div className="w-24 h-24 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
        
        {/* Círculo interior girando en sentido opuesto */}
        <div className="absolute w-16 h-16 border-4 border-white/5 border-b-emerald-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
        
        {/* Icono central */}
        <span className="absolute text-2xl animate-pulse">⚡</span>
      </div>

      {/* Texto de estado */}
      <div className="mt-8 text-center">
        <h3 className="text-white text-xl font-black uppercase tracking-widest animate-pulse">
          PayGo
        </h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">
          {mensaje}
        </p>
      </div>

      {/* Barra de progreso decorativa */}
      <div className="mt-6 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-[progress_2s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};