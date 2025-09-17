import { create } from "zustand";
import { fetchStudioUserPayments } from "../services/studioapiservices";

const useStudioUserPaymentsStore = create((set, get) => ({
  payments: [],
  loading: false,
  error: null,

  // Fetch and store payments
loadPayments: async (filters = {}) => {
    set({ loading: true, error: null, payments: [] });
    try {
      const data = await fetchStudioUserPayments(filters);
      console.log("Payments API Response:", data);
      if (data.success && Array.isArray(data.result)) {
        // Transform data to ensure critical fields are preserved
        const transformedPayments = data.result.map((payment) => {
          const transformed = {
            ...payment,
            wk_no: payment.subtasks?.[0]?.week_no ?? payment.wk_no ?? "N/A",
            userpayment_id: payment.userpayment_id ?? "N/A",
            rcv_id: payment.rcv_id ?? "N/A",
            project_name: payment.project_name ?? "N/A",
            pymt_act_date: payment.pymt_act_date ?? "N/A",
            amt_act: payment.amt_act ?? 0,
          };
          console.log("Transformed payment:", transformed.rcv_id);
          return transformed;
        });
        set({ payments: transformedPayments, loading: false });
      } else {
        console.warn("Invalid API response:", data);
        set({ error: "No payments found", loading: false, payments: [] });
      }
    } catch (err) {
      console.error("Error in loadPayments:", err);
      set({ error: err.message, loading: false, payments: [] });
    }
  },
  // Get a single payment by userpayment_id (from cache if available)
  getPaymentById: (id) => {
    return get().payments.find((payment) => payment.userpayment_id === id);
  },

  // Clear store
  clearPayments: () => set({ payments: [], error: null }),
}));

export default useStudioUserPaymentsStore;