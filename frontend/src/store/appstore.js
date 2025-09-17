import { create } from "zustand";
import axios from "axios";

const ADMIN_API_URL = "http://localhost:5000/api/admin/adminUserManagement";
const VENDOR_API_URL = "http://localhost:5000/api/vendor/getvendorInfo";

const useAppStore = create((set) => ({
  users: [],
  siteManagers: [],
  vendors: [],
  loading: false,
  error: null,

  // Fetch Users & Site Managers from ALL pages
  fetchUsersAndSiteManagers: async (limit = 50) => {
    set({ loading: true, error: null });

    try {
      let allResults = [];
      let currentPage = 1;
      let totalPages = 1;

      // Loop through paginated results
      do {
        const response = await axios.get(ADMIN_API_URL, {
          params: { page: currentPage, limit },
        });

        const { results, pagination } = response.data;
        allResults = [...allResults, ...results];
        totalPages = pagination.totalPages;
        currentPage++;
      } while (currentPage <= totalPages);

      // Categorize
      const siteManagers = allResults.filter((u) => u.role_id === 8);
      const users = allResults.filter((u) => u.role_id === 2);

      set({ users, siteManagers, loading: false });
    } catch (error) {
      console.error("Error fetching users/site managers:", error);
      set({ users: [], siteManagers: [], loading: false, error: error.message });
    }
  },

  // Fetch Vendors
  fetchVendors: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(VENDOR_API_URL);
      const { result } = response.data;

      set({ vendors: result || [], loading: false });
    } catch (error) {
      console.error("Error fetching vendors:", error);
      set({ vendors: [], loading: false, error: error.message });
    }
  },

  // Reset store
  resetStore: () => {
    set({
      users: [],
      siteManagers: [],
      vendors: [],
      loading: false,
      error: null,
    });
  },
}));

export default useAppStore;
