'use client';

import { useState } from 'react';
import { useDebitStore } from '@/store/useDebitStore';
import { PaymentLoader } from './PaymentLoader';

const OPCIONES_PAGO = [
  { label: 'CARGA MÍNIMA', monto: 100, kwh: '5' },
  { label: 'RECOMENDADO', monto: 5000, kwh: '25', destacado: true },
  { label: 'CARGA FULL', monto: 10000, kwh: '50' },
];

export const CardPagoDebito = ({ user }: { user: string }) => {
  // Estado local para el monto seleccionado
  const [selectedMonto, setSelectedMonto] = useState<number | null>(null);

  const { 
    isDebitSelectorOpen, 
    closeDebitSelector, 
    isProcessing, 
    generateDebitLink, 
    errorMessage 
  } = useDebitStore();

  if (!isDebitSelectorOpen) return null;

  // Esta función ahora solo se dispara al tocar el botón grande de abajo
  const handleConfirmarPago = async () => {
    if (!selectedMonto) return;
    await generateDebitLink(user, selectedMonto);
  };

  return (
    <>
      {isProcessing && <PaymentLoader mensaje="Conectando con Mercado Pago..." />}

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] border-4 border-slate-900 p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
          
          <button 
            onClick={closeDebitSelector}
            disabled={isProcessing}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 font-black text-xl disabled:opacity-30 p-2"
          >✕</button>

          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 text-3xl">
              💳
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
              Pago con Tarjeta
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              Seleccioná un plan de carga
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-xs font-bold text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* LISTA DE OPCIONES (Solo seleccionan, no disparan el pago) */}
          <div className="space-y-3 mb-8">
            {OPCIONES_PAGO.map((opcion) => (
              <button
                key={opcion.monto}
                onClick={() => setSelectedMonto(opcion.monto)}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-4 transition-all duration-200
                  ${selectedMonto === opcion.monto 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
              >
                <div className="text-left">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
                    {opcion.label}
                  </p>
                  <p className={`text-2xl font-black ${selectedMonto === opcion.monto ? 'text-blue-600' : 'text-slate-800'}`}>
                    ${opcion.monto.toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[10px] font-black px-3 py-1 rounded-lg border-2 ${
                     selectedMonto === opcion.monto 
                     ? 'bg-blue-600 text-white border-blue-600' 
                     : 'bg-white text-slate-600 border-slate-200'
                   }`}>
                    +{opcion.kwh} kWh
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* BOTÓN FINAL DE ACCIÓN */}
          <button
            onClick={handleConfirmarPago}
            disabled={!selectedMonto || isProcessing}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 disabled:opacity-20 disabled:grayscale uppercase tracking-widest flex items-center justify-center gap-3"
          >
            {isProcessing ? "Procesando..." : "Pagar Ahora"}
            {!isProcessing && <span className="text-xl">→</span>}
          </button>

          <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-6 tracking-widest">
            Serás redirigido a Mercado Pago de forma segura
          </p>
        </div>
      </div>
    </>
  );
};