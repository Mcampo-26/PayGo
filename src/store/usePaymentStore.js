import { create } from 'zustand';
import axios from 'axios';

export const usePaymentStore = create((set, get) => ({
  // --- ESTADO ---
  selectedAmount: null,
  qrCodeString: null,
  isGenerating: false,
  isSelectorOpen: false,

  // --- ACCIONES ---

  // Abrir selector: Reseteamos montos y QRs previos para que la UI esté limpia
  openSelector: () => set({ 
    isSelectorOpen: true, 
    qrCodeString: null, 
    selectedAmount: null,
    isGenerating: false 
  }),

  // Cerrar todo: Limpieza total
  closeAll: () => set({ 
    isSelectorOpen: false, 
    qrCodeString: null, 
    selectedAmount: null,
    isGenerating: false
  }),

  // Reset parcial (por si falla el pago o el usuario vuelve atrás)
  resetPayment: () => set({
    qrCodeString: null,
    isGenerating: false
  }),

  setAmount: (amount) => set({ selectedAmount: amount }),

  generateQr: async () => {
    const { selectedAmount, isGenerating } = get();
    
    // Validación de seguridad
    if (!selectedAmount || isGenerating) return;

    set({ isGenerating: true });
    
    try {
      // Llamada real a tu API de Next.js
      const res = await axios.post('/api/payments/create-qr', { 
        amount: selectedAmount,
        description: `Carga Pay Go $${selectedAmount}`
      });

      // Éxito: Cerramos el selector y guardamos el string del QR
      // Al setear qrCodeString, el componente QrModal se activará automáticamente
      set({ 
        qrCodeString: res.data.qr_data, 
        isGenerating: false, 
        isSelectorOpen: false 
      });

    } catch (err) {
      console.error("Error generating QR:", err);
      set({ isGenerating: false });
      
      // Un pequeño delay antes del alert queda más refinado
      setTimeout(() => {
        alert("No pudimos conectar con Mercado Pago. Intenta de nuevo.");
      }, 100);
    }
  }
}));