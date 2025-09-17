


import { create } from "zustand";
import { fetchAllStudioTasks } from "../services/studioapiservices";

const useStudioTasksStore = create((set) => ({
  tasks: [],
  counts: {
    main_task_count: 0,
   
  },
  loading: false,
  error: null,

  getStudioTasks: async (project_id) => {
    set({ loading: true, error: null, tasks: [] });
    try {
      const data = await fetchAllStudioTasks(project_id);

      // Map main tasks with week_no from first sub-task
      const mappedTasks = (data.result || []).map((task) => ({
        id: task.id,
        project_id: task.project_id,
        main_task_name: task.main_task_name || "N/A",
        start_date: task.start_date,
        end_date: task.end_date,
        task_cost: task.task_cost,
        sgst_pct: task.sgst_pct,
        cgst_pct: task.cgst_pct,
        total_task_cost: task.total_task_cost,
        signup_pct: task.signup_pct,
        status: task.main_task_status || "N/A", // Fallback for null main_task_status
        status_code: task.main_task_status_code || null,
        week_no: task.sub_tasks?.[0]?.week_no || null, // Use first sub-task's week_no or null
      }));

      // Extract counts from API response
      const apiCounts = {
        main_task_count: data.main_task_count || 0,
       
      };

      // Calculate counts client-side as a fallback (based on main_task_status_code)
      const calculatedCounts = {
        main_task_count: data.result.length,
       
      };

      // Use API counts if non-zero, else fallback to calculated counts
      const finalCounts = {
        main_task_count: apiCounts.main_task_count || calculatedCounts.main_task_count,
       
      };

      set({
        tasks: mappedTasks,
        counts: finalCounts,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false, tasks: [] });
    }
  },
}));

export default useStudioTasksStore;