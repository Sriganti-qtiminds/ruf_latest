
import { create } from "zustand";
import { fetchStudioSubTasks } from "../services/studioapiservices";

const useStudioSubTasksStore = create((set, get) => ({
  subTasks: [],
  loading: false,
  error: null,

  // Fetch and store sub tasks
  loadSubTasks: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchStudioSubTasks(filters);

     
      if (data?.success && Array.isArray(data.result)) {
        set({ subTasks: data.result, loading: false });
      } else {
        set({
          error: "Invalid response format from server",
          loading: false,
          subTasks: [],
        });
      }
    } catch (err) {
      set({ error: err.message, loading: false, subTasks: [] });
    }
  },

  clearSubTasks: () => set({ subTasks: [], error: null }),
}));

export default useStudioSubTasksStore;
