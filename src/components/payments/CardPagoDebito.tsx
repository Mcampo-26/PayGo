'use client';

import { useDebitStore } from '@/store/useDebitStore';

const OPCIONES_PAGO = [
  { label: 'CARGA MÍNIMA', monto: 100, kwh: '+5 kWh' },
  { label: 'RECOMENDADO', monto: 5000, kwh: '+25 kWh', destacado: true },
  { label: 'CARGA FULL', monto: 10000, kwh: '+50 kWh' },
];

export const CardPagoDebito = ({ user }: { user: string }) => {
  // Extraemos lo necesario del store, incluyendo la nueva acción asíncrona
  const { 
    isDebitSelectorOpen, 
    closeDebitSelector, 
    isProcessing, 
    generateDebitLink, 
    errorMessage 
  } = useDebitStore();

  // Si el modal está cerrado, no renderizamos nada
  if (!isDebitSelectorOpen) return null;

  const handlePago = async (monto: number) => {
    console.log("⏳ Iniciando proceso de pago para DNI:", user, "Monto:", monto);
    // Ejecutamos la acción del store que ya tiene el axios y la redirección
    await generateDebitLink(user, monto);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] border-4 border-slate-900 p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Botón para cerrar el modal */}
        <button 
          onClick={closeDebitSelector}
          disabled={isProcessing}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 font-black text-xl disabled:opacity-30"
        >✕</button>

        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 text-3xl">
            {isProcessing ? "⏳" : "💳"}
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Pago con Tarjeta
          </h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">
            Seleccioná el monto a acreditar
          </p>
        </div>

        {/* Mensaje de error si algo falla en el Store */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-xs font-bold text-center animate-bounce">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {OPCIONES_PAGO.map((opcion) => (
            <button
              key={opcion.monto}
              onClick={() => handlePago(opcion.monto)}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-6 rounded-3xl border-4 border-slate-100 hover:border-blue-500 bg-slate-50 hover:bg-white transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-left">
                {opcion.destacado && (
                  <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 block w-fit">
                    Más usado
                  </span>
                )}
                <p className="text-2xl font-black text-slate-800">
                  ${opcion.monto.toLocaleString('es-AR')}
                </p>
              </div>
              <span className="text-blue-600 font-black text-sm bg-blue-50 px-3 py-1 rounded-xl border-2 border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {opcion.kwh}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase italic">
          {isProcessing ? "Generando link seguro de Mercado Pago..." : "Serás redirigido a la pasarela de pagos"}
        </p>
      </div>
    </div>
  );
};