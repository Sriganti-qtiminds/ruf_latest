
import { create } from "zustand";
import apiStatusConstants from "../utils/apiStatusConstants";
import { fetchUserListings } from "../services/newapiservices";
import CryptoJS from "crypto-js";

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

const useUserListingsStore = create((set, get) => ({
  listings: [],
  apiResponse: {
    status: apiStatusConstants.initial,
    data: [],
    errorMsg: null,
  },
  currentPage: 1,
  totalPages: 0,
  limit: 6,
  selectedProperty: null, // Property to edit

  fetchUserListings: async (userId) => {
    set({
      apiResponse: {
        status: apiStatusConstants.inProgress,
        data: get().listings,
        errorMsg: null,
      },
    });
    try {
      const listings = await fetchUserListings(
        userId,
        get().currentPage,
        get().limit
      );
      if (listings.status) {
        const newListings = listings.data.results;
        set((state) => {
          const newState = {
            listings: newListings,
            totalPages: listings.data.pagination.totalPages,
            apiResponse: {
              status: apiStatusConstants.success,
              data: newListings,
              errorMsg: null,
            },
          };
          const encryptedData = encryptData({
            listings: newListings,
            currentPage: state.currentPage,
            totalPages: listings.data.pagination.totalPages,
          });
          localStorage.setItem("userListings", encryptedData);
          return newState;
        });
      } else {
        set({
          apiResponse: {
            status: apiStatusConstants.failure,
            data: get().listings,
            errorMsg: listings.errorMsg || "Failed to fetch Listings",
          },
        });
      }
    } catch (error) {
      console.error("Error in fetching properties:", error);
      set({
        apiResponse: {
          status: apiStatusConstants.failure,
          data: get().listings,
          errorMsg: "Failed to fetch Listings",
        },
      });
    }
  },

  loadUserListings: () => {
    const encryptedData = localStorage.getItem("userListings");
    if (encryptedData) {
      const decryptedData = decryptData(encryptedData);
      if (decryptedData) {
        set({
          listings: decryptedData.listings || [],
          currentPage: decryptedData.currentPage || 1,
          totalPages: decryptedData.totalPages || 0,
          apiResponse: {
            status: apiStatusConstants.success,
            data: decryptedData.listings || [],
            errorMsg: null,
          },
        });
      }
    }
  },

  clearUserListings: () => {
    localStorage.removeItem("userListings");
    set({
      listings: [],
      currentPage: 1,
      totalPages: 0,
      apiResponse: {
        status: apiStatusConstants.initial,
        data: [],
        errorMsg: null,
      },
      selectedProperty: null,
    });
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
    const state = get();
    const encryptedData = encryptData({
      listings: state.listings,
      currentPage: page,
      totalPages: state.totalPages,
    });
    localStorage.setItem("userListings", encryptedData);
  },

  // Set the property to edit
  setSelectedProperty: (property) => {
    set({ selectedProperty: property });
    const encryptedData = encryptData({ selectedProperty: property });
    localStorage.setItem("selectedProperty", encryptedData);
  },

  // Clear the selected property (e.g., after submission or for new property)
  clearSelectedProperty: () => {
    set({ selectedProperty: null });
    localStorage.removeItem("selectedProperty");
  },

  loadSelectedProperty: () => {
    const encryptedData = localStorage.getItem("selectedProperty");
    if (encryptedData) {
      const decryptedData = decryptData(encryptedData);
      if (decryptedData) {
        set({ selectedProperty: decryptedData.selectedProperty });
      }
    }
  },

  initializeStore: () => {
    get().loadUserListings();
    get().loadSelectedProperty();
  },
}));

useUserListingsStore.getState().initializeStore();

export default useUserListingsStore;
