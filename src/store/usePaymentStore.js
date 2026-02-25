import { create } from 'zustand';
import axios from 'axios';

export const usePaymentStore = create((set, get) => ({
  // --- ESTADO ---
  selectedAmount: null,    // Monto elegido por el usuario
  qrCodeString: null,      // String del QR que devuelve MP
  isGenerating: false,     // Loader al crear el QR
  isSelectorOpen: false,   // Estado del modal de selección de monto
  showSuccessAlert: false, // Controla la visibilidad del cartel verde

  // --- ACCIONES ---

  // Abrir selector
  openSelector: () => set({ 
    isSelectorOpen: true, 
    qrCodeString: null, 
    selectedAmount: null,
    isGenerating: false,
    showSuccessAlert: false 
  }),

  // Cerrar todo (se llama al tocar el fondo o la X)
  closeAll: () => {
    set({ 
      isSelectorOpen: false, 
      qrCodeString: null, 
      selectedAmount: null,
      isGenerating: false
    });
  },

  // Reset parcial (por si quiere cambiar de monto antes de pagar)
  resetPayment: () => {
    set({
      qrCodeString: null,
      isGenerating: false
    });
  },

  setAmount: (amount) => set({ selectedAmount: amount }),

  closeSuccessAlert: () => set({ showSuccessAlert: false }),

  // --- ACCIÓN DE ÉXITO (Llamada por Socket.io) ---
  setPaymentSuccess: () => {
    set({ 
      qrCodeString: null, 
      isSelectorOpen: false,
      showSuccessAlert: true 
    });
    // Autocerrar el cartel verde tras 6 segundos
    setTimeout(() => set({ showSuccessAlert: false }), 6000);
  },

  // Acción principal: Genera el QR
  generateQr: async (userId) => {
    const amount = get().selectedAmount;
    
    if (!userId || typeof userId !== 'string') {
      console.error("ID de usuario inválido para generar QR.");
      return;
    }

    set({ isGenerating: true });
  
    try {
      // Llamada a tu API de Next.js que ya configuramos
      const res = await axios.post('/api/payments/mercadopago/create-qr', { 
        amount: Number(amount),
        userId: String(userId)
      });
      
      set({ 
        qrCodeString: res.data.qr_data, 
        isGenerating: false, 
        isSelectorOpen: false // Cerramos el selector para mostrar el Modal del QR
      });

      // NOTA: Ya no hay setInterval aquí. 
      // El sistema simplemente se queda esperando a que el Socket dispare setPaymentSuccess().
  
    } catch (err) {
      console.error("Error en generateQr:", err);
      set({ isGenerating: false });
    }
  }
}));