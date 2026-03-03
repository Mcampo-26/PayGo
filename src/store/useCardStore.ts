import { create } from 'zustand';

interface CardState {
  // Estados de visibilidad
  showSelectionModal: boolean;
  isCardModalOpen: boolean;
  isProcessing: boolean;
  
  // Acciones de UI
  setShowSelectionModal: (open: boolean) => void;
  openCardModal: () => void;
  closeCardModal: () => void;
  setProcessing: (processing: boolean) => void;
  
  // Lógica de Pagos (API)
  processCardPayment: (paymentData: any) => Promise<{ status: string; [key: string]: any }>;
  createExternalPreference: (amount: number, userId: string) => Promise<string | null>;
}

export const useCardStore = create<CardState>((set) => ({
  showSelectionModal: false,
  isCardModalOpen: false,
  isProcessing: false,

  // Abrir/Cerrar modales
  setShowSelectionModal: (open) => set({ showSelectionModal: open }),
  
  openCardModal: () => set({ 
    isCardModalOpen: true, 
    showSelectionModal: false 
  }),
  
  closeCardModal: () => set({ 
    isCardModalOpen: false, 
    isProcessing: false,
    showSelectionModal: false 
  }),
  
  setProcessing: (processing) => set({ isProcessing: processing }),

  /**
   * PAGO INTERNO (API propia con SDK de MP)
   */
  processCardPayment: async (paymentData) => {
    set({ isProcessing: true });
    try {
      // ⬇️ CAMBIO CRUCIAL: Debe coincidir con tu carpeta en src/app/api/payments/mercadopago/process-card
      const res = await fetch('/api/payments/mercadopago/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        // Si MP devuelve 400 (como el Invalid Token), lo capturamos aquí
        throw new Error(data.details?.message || 'Error en el procesamiento');
      }
  
      return data; 
    } catch (error: any) {
      console.error("❌ Error en processCardPayment:", error.message);
      return { status: 'error', message: error.message };
    } finally {
      set({ isProcessing: false });
    }
  },

  /**
   * PAGO EXTERNO (Checkout Pro / Redirección)
   */
  createExternalPreference: async (amount, userId) => {
    set({ isProcessing: true });
    try {
      const res = await fetch('/api/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId }),
      });
      
      if (!res.ok) throw new Error('Error al crear preferencia');

      const data = await res.json();
      return data.init_point;
    } catch (error) {
      console.error("Error creando preferencia:", error);
      // Solo en caso de error apagamos el loader para permitir que el usuario intente de nuevo
      set({ isProcessing: false });
      return null;
    }
    // Nota: No ponemos setProcessing(false) aquí en el flujo exitoso 
    // para que el loader permanezca visible mientras el navegador cambia de página.
  },
}));