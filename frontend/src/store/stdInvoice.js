import { create } from "zustand";
import { fetchInvoiceRecords, fetchStudioUserPayments } from "../services/studioapiservices";

const useStudioPaymentsStore = create((set, get) => ({
  invoices: [],
  receipts: [],
  loading: false,
  error: null,

  // Fetch and store invoices
  loadInvoices: async (filters = {}) => {
    set({ loading: true, error: null, invoices: [] });
    try {
      const data = await fetchInvoiceRecords(filters);
      console.log("Invoices Data:", data);
      if (data.success && Array.isArray(data.result)) {
        const transformedInvoices = data.result.map((invoice) => {
          const transformed = {
            ...invoice,
            week_number: invoice.subtasks?.[0]?.week_no ?? invoice.wk_no ?? "N/A",
            invoice_info: invoice.inv_info ?? "N/A",
            project_name: invoice.project_name ?? `Invoice ${invoice.inv_id ?? "N/A"}`,
            payment_due_date: invoice.pymt_due_date ?? "N/A",
            weekly_cost_amount: invoice.wkly_cost_amt ?? 0,
            total_cost: invoice.wkly_cost_amt ?? 0,
          };
          console.log("Transformed invoice in store:", transformed);
          return transformed;
        });
        set({ invoices: transformedInvoices, loading: false });
      } else {
        console.warn("Invalid invoice API response:", data);
        set({ error: "No invoices found", loading: false, invoices: [] });
      }
    } catch (err) {
      console.error("Error in loadInvoices:", err);
      set({ error: err.message, loading: false, invoices: [] });
    }
  },

  // Fetch and store receipts
  loadReceipts: async (filters = {}) => {
    set({ loading: true, error: null, receipts: [] });
    try {
      const data = await fetchStudioUserPayments(filters);
      console.log("Receipts Data:", data);
      if (data.success && Array.isArray(data.result)) {
        // Transform receipts to ensure all critical fields are available
        const transformedReceipts = data.result.map((receipt) => {
          const transformed = {
            ...receipt,
            week_number: receipt.subtasks?.[0]?.week_no ?? receipt.wk_no ?? "N/A",
            userpayment_id: receipt.userpayment_id ?? receipt.id ?? "N/A",
            receipt_id: receipt.rcv_id ?? "N/A",
            project_name: receipt.project_name ?? `Invoice ${receipt.inv_id ?? "N/A"}`,
            payment_actual_date: receipt.pymt_act_date ?? "N/A",
            amount_paid: receipt.amt_act ?? 0,
            total_cost: receipt.inv_tot ?? 0,
          };
          console.log("Transformed receipt in store:", transformed);
          return transformed;
        });
        set({ receipts: transformedReceipts, loading: false });
      } else {
        console.warn("Invalid receipt API response:", data);
        set({ error: "No receipts found", loading: false, receipts: [] });
      }
    } catch (err) {
      console.error("Error in loadReceipts:", err);
      set({ error: err.message, loading: false, receipts: [] });
    }
  },

  // Clear store
  clearPayments: () => set({ invoices: [], receipts: [], error: null }),
}));

export default useStudioPaymentsStore;