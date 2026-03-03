import { create } from 'zustand';
import axios from 'axios';

// 1. Definimos la interfaz para el estado del Pago QR
interface PaymentState {
  selectedAmount: number | null;
  qrCodeString: string | null;
  isGenerating: boolean;
  isSelectorOpen: boolean;
  showSuccessAlert: boolean;
  
  // Acciones
  openSelector: () => void;
  closeSelector: () => void;
  closeAll: () => void;
  resetPayment: () => void;
  setAmount: (amount: number) => void;
  closeSuccessAlert: () => void;
  setPaymentSuccess: () => void;
  generateQr: (userId: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  // --- ESTADO INICIAL ---
  selectedAmount: null,
  qrCodeString: null,
  isGenerating: false,
  isSelectorOpen: false,
  showSuccessAlert: false,

  // --- ACCIONES ---

  openSelector: () => set({ 
    isSelectorOpen: true, 
    qrCodeString: null, 
    selectedAmount: null,
    isGenerating: false,
    showSuccessAlert: false 
  }),

  closeSelector: () => set({ isSelectorOpen: false }),

  closeAll: () => set({ 
    isSelectorOpen: false, 
    qrCodeString: null, 
    selectedAmount: null,
    isGenerating: false
  }),

  resetPayment: () => set({
    qrCodeString: null,
    isGenerating: false,
    isSelectorOpen: true 
  }),

  setAmount: (amount: number) => set({ selectedAmount: amount }),

  closeSuccessAlert: () => set({ showSuccessAlert: false }),

  setPaymentSuccess: () => {
    set({ 
      qrCodeString: null, 
      isSelectorOpen: false,
      showSuccessAlert: true 
    });
    setTimeout(() => set({ showSuccessAlert: false }), 6000);
  },

  // Acción principal tipada
  generateQr: async (userId: string) => {
    const amount = get().selectedAmount;
    
    if (!userId) {
      console.error("❌ Falta el ID de usuario");
      return;
    }

    if (!amount) {
      console.error("❌ No se ha seleccionado un monto");
      return;
    }

    set({ isGenerating: true });
  
    try {
      const res = await axios.post('/api/payments/mercadopago/create-qr', 
        { 
          amount: Number(amount),
          userId: String(userId)
        },
        {
          headers: {
            'ngrok-skip-browser-warning': 'true' // Manteniendo la consistencia con el de Débito
          }
        }
      );
      
      set({ 
        qrCodeString: res.data.qr_data, 
        isGenerating: false, 
        isSelectorOpen: false 
      });

    } catch (err: any) {
      console.error("❌ Error en generateQr:", err);
      set({ isGenerating: false });
    }
  }
}));