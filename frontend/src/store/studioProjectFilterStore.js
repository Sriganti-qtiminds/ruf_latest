import { create } from 'zustand';
import { fetchStudioProjects } from './apiService';

const useStudioProjectStore = create((set) => ({
  projects: [],

  // Actions
  fetchProjects: async (cust_id = null, isAdmin = false) => {
    try {
      // If isAdmin is true, fetch all projects (no cust_id filter)
      const projectData = await fetchStudioProjects(null, isAdmin ? null : cust_id);
      set({ projects: projectData });
    } catch (error) {
      console.error('Error fetching studio projects:', error);
      set({ projects: [] }); // Clear projects on error
    }
  },

  resetStore: () => {
    set({ projects: [] }, true);
  },
}));

export default useStudioProjectStore;