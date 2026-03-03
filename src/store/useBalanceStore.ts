import { create } from 'zustand';

interface BalanceState {
  amount: number;
  status: 'CONNECTED' | 'DISCONNECTED';
  isLoading: boolean;
  // Acciones
  setBalance: (newAmount: number) => void;
  fetchBalance: (userId: string) => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  amount: 0,
  status: 'DISCONNECTED',
  isLoading: true,

  // Actualiza el estado local (úsalo después de un pago aprobado)
  setBalance: (newAmount: number) => set({
    amount: newAmount,
    status: newAmount > 0 ? 'CONNECTED' : 'DISCONNECTED'
  }),

  // Trae el saldo real de la base de datos
  fetchBalance: async (userId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/users/get-balance?userId=${userId}`);
      const data = await res.json();
      
      if (res.ok) {
        set({
          amount: data.balance,
          status: data.balance > 0 ? 'CONNECTED' : 'DISCONNECTED',
          isLoading: false
        });
      }
    } catch (error) {
      console.error("❌ Error fetching balance:", error);
      set({ isLoading: false });
    }
  }
}));