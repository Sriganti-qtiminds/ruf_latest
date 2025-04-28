import { create } from "zustand";
import CryptoJS from "crypto-js";
import apiStatusConstants from "../utils/apiStatusConstants";
import { fetchUserActions } from "../services/newapiservices";

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

// Store definition
const useActionsListingsStore = create((set, get) => ({
  userProperties: [],
  apiResponse: {
    status: apiStatusConstants.initial,
    data: [],
    errorMsg: null,
  },

  // Fetch actions and user properties from the API
  fetchActionsListings: async (id) => {
    set({
      apiResponse: {
        status: apiStatusConstants.inProgress,
        data: get().userProperties, // Preserve current data during fetch
        errorMsg: null,
      },
    });

    try {
      const result = await fetchUserActions(id);

      if (result.status) {
        const properties = result.data.userProperties;

        set((state) => {
          const newState = {
            userProperties: properties,
            apiResponse: {
              status: apiStatusConstants.success,
              data: properties,
              errorMsg: null,
            },
          };

          // Encrypt and save the entire state to localStorage
          const encryptedData = encryptData({
            userProperties: properties,
          });
          localStorage.setItem("userProperties", encryptedData);

          return newState;
        });
      } else {
        set({
          apiResponse: {
            status: apiStatusConstants.failure,
            data: get().userProperties,
            errorMsg: "Invalid response format",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching actions listings:", error);
      set({
        apiResponse: {
          status: apiStatusConstants.failure,
          data: get().userProperties,
          errorMsg: error.message || "Failed to fetch actions listings",
        },
      });
    }
  },

  // Load data from localStorage
  loadActionsListings: () => {
    const encryptedData = localStorage.getItem("userProperties");

    if (encryptedData) {
      const decryptedData = decryptData(encryptedData);

      if (decryptedData) {
        set({
          userProperties: decryptedData.userProperties || [],
        });
      }
    }
  },

  // Clear all stored data
  clearActionsListings: () => {
    localStorage.removeItem("userProperties");
    set({
      userProperties: [],
      apiResponse: {
        status: apiStatusConstants.initial,
        data: [],
        errorMsg: null,
      },
    });
  },

  // Reset the entire store
  resetStore: () => {
    localStorage.removeItem("userProperties");
    set({
      userProperties: [],
      apiResponse: {
        status: apiStatusConstants.initial,
        data: [],
        errorMsg: null,
      },
    });
  },

  // Initialize the store by loading from localStorage
  initializeStore: () => {
    get().loadActionsListings();
  },
}));

// Call initializeStore when the store is created
useActionsListingsStore.getState().initializeStore();

export default useActionsListingsStore;
