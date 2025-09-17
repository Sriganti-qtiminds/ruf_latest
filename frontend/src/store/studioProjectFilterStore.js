import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchAllStudioProjects } from "../services/studioapiservices";

const useStudioProjectsStore = create(
  persist(
    (set, get) => ({
      projects: [],
      counts: { pending: 0, completed: 0, total: 0 },
      loading: false,
      error: null,

      // Fetch projects and save to state + localStorage
      getProjects: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const data = await fetchAllStudioProjects(params);
          set({
            projects: data.projects || [],
            counts: data.counts || { pending: 0, completed: 0, total: 0 },
            loading: false,
          });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },
    }),
    {
      name: "studio-projects-storage", // key for localStorage
    }
  )
);

export default useStudioProjectsStore;


