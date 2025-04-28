import { create } from "zustand";
import CryptoJS from "crypto-js";

const secretKey = `${import.meta.env.VITE_CRYPTO_SECRET_KEY}`; // Replace with your own secret key

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString(); // Encrypt data
};

const decryptData = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); // Decrypt data
};

export const useRoleStore = create((set) => ({
  // State
  userData: {
    id: null,
    role: null,
    userName: null,
  },

  // Actions
  setUserData: (data) => {
    const encryptedData = encryptData(data);
    set({ userData: { ...data } });
    localStorage.setItem("userData", encryptedData); // Store encrypted data in localStorage
  },

  updateUserData: (updates) => {
    set((state) => {
      const updatedUserData = {
        ...state.userData,
        ...updates,
      };
      const encryptedData = encryptData(updatedUserData);
      localStorage.setItem("userData", encryptedData); // Update encrypted data in localStorage
      return { userData: updatedUserData };
    });
  },

  // Reset action
  resetStore: () => {
    set({
      userData: {
        id: null,
        role: null,
        userName: null,
      },
    });
    localStorage.removeItem("userData"); // Remove data from localStorage
  },

  // Load userData from localStorage on initialization
  loadUserData: () => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const decryptedData = decryptData(storedData);
      set({ userData: decryptedData });
    }
  },
}));

// Call loadUser Data when the store is created to initialize userData
useRoleStore.getState().loadUserData();
