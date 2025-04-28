import { create } from "zustand";
import CryptoJS from "crypto-js";
import { fetchTransactionsData } from "../services/newapiservices";

// Encryption & Decryption Utilities
const secretKey = `${import.meta.env.VITE_CRYPTO_SECRET_KEY}`;

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptData = (data) => {
  try {
    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

const useTransactionsStore = create((set, get) => ({
  invoices: [],
  receipts: [],
  transactionsLoading: false,
  transactionsError: null,

  fetchUserTransactions: async (tenantId) => {
    set({ transactionsLoading: true, transactionsError: null });
    try {
      const response = await fetchTransactionsData(tenantId);
      const data = response.data;

      if (response.status) {
        set((state) => {
          const newState = {
            invoices: data.invoices,
            receipts: data.receipts,
            transactionsLoading: false,
            transactionsError: null,
          };

          // Encrypt and save to localStorage
          const encryptedData = encryptData({
            invoices: data.invoices,
            receipts: data.receipts,
          });
          localStorage.setItem("userTransactions", encryptedData);

          return newState;
        });
      } else {
        set({
          transactionsError: data.detail || "Error fetching user transactions",
          transactionsLoading: false,
        });
      }
    } catch (error) {
      set({
        transactionsError: error.message,
        transactionsLoading: false,
      });
    }
  },

  // Load data from localStorage
  loadTransactions: () => {
    const encryptedData = localStorage.getItem("userTransactions");
    if (encryptedData) {
      const decryptedData = decryptData(encryptedData);
      if (decryptedData) {
        set({
          invoices: decryptedData.invoices || [],
          receipts: decryptedData.receipts || [],
        });
      }
    }
  },

  // Clear stored data
  clearTransactions: () => {
    localStorage.removeItem("userTransactions");
    set({
      invoices: [],
      receipts: [],
      transactionsLoading: false,
      transactionsError: null,
    });
  },

  resetStore: () => {
    localStorage.removeItem("userTransactions");
    set({
      invoices: [],
      receipts: [],
      transactionsLoading: false,
      transactionsError: null,
    });
  },

  // Initialize store
  initializeStore: () => {
    get().loadTransactions();
  },
}));

// Initialize the store
useTransactionsStore.getState().initializeStore();

export default useTransactionsStore;
