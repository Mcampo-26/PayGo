'use client';

import { usePaymentStore } from '@/store/usePaymentStore';

// 1. Corregimos la interface para usar 'dni' como identificador
interface UserProps {
  dni: string; 
  balance: number;
}

interface RechargeSelectorProps {
  user: UserProps;
}

const OPTIONS = [
  { value: 10, label: 'Carga Básica', kwh: '0.05' },
  { value: 5000, label: 'Recomendado', kwh: '25', popular: true },
  { value: 10000, label: 'Carga Familiar', kwh: '50' },
];

export const RechargeSelector = ({ user }: RechargeSelectorProps) => {
  // Extraemos lo necesario del Store
  const { 
    isSelectorOpen, 
    closeAll, 
    setAmount, 
    generateQr, 
    selectedAmount, 
    isGenerating 
  } = usePaymentStore();

  // Si el selector no debe estar abierto, no renderizamos nada
  if (!isSelectorOpen) return null;

  // Manejo del click para generar el QR
  const handleGenerateClick = async () => {
    // 2. Validamos contra el campo dni
    if (!user?.dni) {
      alert("Error: No se encontró el DNI del usuario.");
      return;
    }

    if (!selectedAmount) {
      alert("Por favor, selecciona un monto primero.");
      return;
    }

    // 3. Ejecutamos la lógica del store enviando el DNI
    try {
      await generateQr(user.dni); 
    } catch (error) {
      console.error("Error al generar QR:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Fondo oscuro con desenfoque */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={closeAll} 
      />

      <div className="relative bg-[#F8FAFC] rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-lg w-full border border-white">
        
        {/* Botón Cerrar */}
        <button 
          onClick={closeAll}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2"
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

        {/* Opciones de Carga */}
        <div className="grid gap-4">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
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

        {/* Botón de Acción */}
        <button
          onClick={handleGenerateClick}
          disabled={!selectedAmount || isGenerating}
          className="w-full mt-10 py-5 bg-slate-900 text-white font-bold rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin text-xl">🌀</span>
              Generando...
            </>
          ) : (
            "Generar QR de Pago"
          )}
        </button>
      </div>
    </div>
  );
};