import { create } from 'zustand';

interface CardState {
  // Estados de visibilidad
  showSelectionModal: boolean;
  isCardModalOpen: boolean;
  isProcessing: boolean;
  
  // Acciones
  setShowSelectionModal: (open: boolean) => void;
  openCardModal: () => void;
  closeCardModal: () => void;
  setProcessing: (processing: boolean) => void;
  
  // Lógica de Pago Externo
  createExternalPreference: (amount: number, userId: string) => Promise<string | null>;
}

export const useCardStore = create<CardState>((set) => ({
  showSelectionModal: false,
  isCardModalOpen: false,
  isProcessing: false,

  setShowSelectionModal: (open) => set({ showSelectionModal: open }),
  
  openCardModal: () => set({ isCardModalOpen: true, showSelectionModal: false }),
  
  closeCardModal: () => set({ isCardModalOpen: false, isProcessing: false }),
  
  setProcessing: (processing) => set({ isProcessing: processing }),

  createExternalPreference: async (amount, userId) => {
    // No reseteamos el processing aquí para que el loader no parpadee
    try {
      const res = await fetch('/api/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId }),
      });
      const data = await res.json();
      return data.init_point;
    } catch (error) {
      set({ isProcessing: false });
      return null;
    }
  },
}));