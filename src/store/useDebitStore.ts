import { create } from 'zustand';
import axios from 'axios';

interface DebitState {
  isDebitSelectorOpen: boolean;
  isProcessing: boolean;
  errorMessage: string | null;
  openDebitSelector: () => void;
  closeDebitSelector: () => void;
  generateDebitLink: (dni: string, amount: number) => Promise<void>;
}

export const useDebitStore = create<DebitState>((set) => ({
  isDebitSelectorOpen: false,
  isProcessing: false,
  errorMessage: null,

  openDebitSelector: () => set({ 
    isDebitSelectorOpen: true, 
    errorMessage: null,
    isProcessing: false 
  }),

  closeDebitSelector: () => set({ 
    isDebitSelectorOpen: false, 
    isProcessing: false 
  }),

  generateDebitLink: async (dni, amount) => {
    // 1. Validación de datos
    if (!dni || !amount) {
      set({ errorMessage: "DNI y Monto son requeridos." });
      return;
    }

    set({ isProcessing: true, errorMessage: null });

    try {
      // 2. Llamada a la API con los headers de ngrok correctos
      const res = await axios.post(
        '/api/payments/mercadopago/create-debit', 
        { 
          amount: Number(amount),
          dni: String(dni)
        },
        {
          headers: {
            // ✅ ESTO ES LO QUE PERMITE QUE NGROK DEJE PASAR LA PETICIÓN
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      // 3. Redirección si todo sale bien
      if (res.data.init_point) {
        console.log("🔗 Redirigiendo a Mercado Pago...");
        window.location.href = res.data.init_point;
      } else {
        throw new Error("No se recibió el punto de inicio de pago.");
      }

    } catch (err: any) {
      console.error("❌ Error en generateDebitLink:", err);
      
      // Capturamos el error específico si la API devolvió algo (como el 403)
      const errorDetail = err.response?.data?.detail || err.response?.data?.error || "Error al conectar con Mercado Pago";
      
      set({ 
        errorMessage: errorDetail,
        isProcessing: false 
      });
    }
  }
}));