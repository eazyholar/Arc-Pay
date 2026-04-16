// store/wallet-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WalletMode = "inbuilt" | "external" | null;

export interface MockUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CircleWalletState {
  walletId: string;
  address: string;
  blockchain: string;
}

export interface TxRecord {
  id: string;
  hash?: string;
  from: string;
  to: string;
  amount: string;
  state: "PENDING" | "CONFIRMED" | "FAILED" | "INITIATED";
  timestamp: string;
  source: "inbuilt" | "external";
}

interface WalletStore {
  user: MockUser | null;
  isAuthenticated: boolean;
  walletMode: WalletMode;
  circleWallet: CircleWalletState | null;
  transactions: TxRecord[];
  isLoading: boolean;
  error: string | null;
  login: (user: MockUser) => void;
  logout: () => void;
  setWalletMode: (mode: WalletMode) => void;
  setCircleWallet: (wallet: CircleWalletState) => void;
  addTransaction: (tx: TxRecord) => void;
  updateTransaction: (id: string, updates: Partial<TxRecord>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      walletMode: null,
      circleWallet: null,
      transactions: [],
      isLoading: false,
      error: null,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        walletMode: null,
        circleWallet: null,
        transactions: [],
        error: null,
      }),

      setWalletMode: (mode) => set({ walletMode: mode }),

      setCircleWallet: (wallet) => set({ circleWallet: wallet }),

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 50),
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "arcpay-wallet-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        walletMode: state.walletMode,
        circleWallet: state.circleWallet,
        transactions: state.transactions,
      }),
    }
  )
);