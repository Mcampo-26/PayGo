// src/components/payment/RechargeSelector.jsx
import { usePaymentStore } from '@/store/usePaymentStore';

const OPTIONS = [
  { value: 10, label: 'Carga Básica', kwh: '12' },
  { value: 5000, label: 'Recomendado', kwh: '35', popular: true },
  { value: 10000, label: 'Carga Familiar', kwh: '75' },
];

export const RechargeSelector = () => {
  const { 
    isSelectorOpen, 
    closeAll, 
    setAmount, 
    generateQr, 
    selectedAmount, 
    isGenerating 
  } = usePaymentStore();

  // Si el store dice que no está abierto, no renderizamos nada
  if (!isSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Fondo desenfocado */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={closeAll} 
      />

      {/* Contenedor del Selector */}
      <div className="relative bg-[#F8FAFC] rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-lg w-full border border-white">
        
        {/* Botón cerrar sutil */}
        <button 
          onClick={closeAll}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-2xl mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Carga de Energía</h2>
          <p className="text-slate-500 mt-2 text-sm">Selecciona el monto que deseas acreditar</p>
        </div>

        <div className="grid gap-4">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAmount(opt.value)}
              className={`relative flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300
                ${selectedAmount === opt.value 
                  ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/5' 
                  : 'border-transparent bg-white hover:border-slate-200 shadow-sm'}`}
            >
              <div className="text-left">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{opt.label}</span>
                <span className="text-2xl font-black text-slate-800">${opt.value.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                  +{opt.kwh} kWh
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${selectedAmount === opt.value ? 'border-blue-500 bg-blue-500' : 'border-slate-200'}`}>
                  {selectedAmount === opt.value && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {opt.popular && (
                <div className="absolute -top-3 left-8 bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Más frecuente
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={generateQr}
          disabled={!selectedAmount || isGenerating}
          className="w-full mt-10 py-5 bg-slate-900 text-white font-bold rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generando orden...</span>
            </>
          ) : (
            <>
              <span>Confirmar y pagar</span>
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};