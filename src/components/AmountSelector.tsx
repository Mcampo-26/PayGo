'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

const PRESET_AMOUNTS = [
  { id: 'basica', label: 'CARGA BÁSICA', value: 10, kwh: '+0.05 kWh' },
  { id: 'recomendado', label: 'RECOMENDADO', value: 5000, kwh: '+25 kWh', badge: 'MÁS FRECUENTE' },
  { id: 'familiar', label: 'CARGA FAMILIAR', value: 10000, kwh: '+50 kWh' },
];

interface AmountSelectorProps {
  onConfirm: (amount: number) => void;
  onClose?: () => void;
}

export default function AmountSelector({ onConfirm,onClose }: AmountSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleNext = () => {
    const amount = selectedId 
      ? PRESET_AMOUNTS.find(a => a.id === selectedId)?.value 
      : Number(customAmount);

    if (!amount || amount <= 0) {
      return Swal.fire('Atención', 'Ingresa un monto válido', 'warning');
    }
    onConfirm(amount);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100">
        <span className="text-orange-400 text-2xl">⚡</span>
      </div>
      <h2 className="font-black text-2xl text-slate-800 tracking-tight text-center uppercase">Carga de Energía</h2>
      <p className="text-slate-400 text-sm font-bold mb-8 text-center uppercase tracking-widest">Selecciona el importe</p>

      <div className="w-full space-y-4 mb-8 text-left">
        {PRESET_AMOUNTS.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSelectedId(item.id); setCustomAmount(''); }}
            className={`w-full relative p-4 rounded-3xl border-4 transition-all flex items-center justify-between ${
              selectedId === item.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            {item.badge && (
              <span className="absolute -top-3 left-6 bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">
                {item.badge}
              </span>
            )}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-800">${item.value.toLocaleString('es-AR')}</p>
            </div>
            <span className="text-emerald-600 font-black text-xs bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              {item.kwh}
            </span>
          </button>
        ))}

        <div className={`p-4 rounded-3xl border-4 transition-all flex items-center ${
          customAmount !== '' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100'
        }`}>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Otro monto personalizado</p>
            <div className="flex items-center">
              <span className="text-2xl font-black text-slate-800 mr-1">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                className="bg-transparent text-2xl font-black text-slate-800 outline-none w-full"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedId(''); }}
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 transition-colors uppercase tracking-widest shadow-lg"
      >
        Continuar al Pago
      </button>
    </div>
  );
}