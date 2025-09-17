import React, { useEffect, useState } from "react";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";
import useStudioPaymentsStore from "../../store/stdInvoice";
import { useRoleStore } from "../../store/roleStore";
import { useNavigate } from "react-router-dom";
import { STUDIO_BASE } from "../../routes/routesPath";
import { fetchInvoiceRecords, fetchStudioUserPayments } from "../../services/studioapiservices";
import PaymentModal from "../../components/CommonViews/PaymentModel";
import { handleProjectPayment } from "../../utils/paymentUtils";

const ProjectTaskPayments = () => {
  const [projectFilter, setProjectFilter] = useState("all");
  const { invoices, receipts, loading, error, loadInvoices, loadReceipts } = useStudioPaymentsStore();
  const { userData } = useRoleStore();
  const navigate = useNavigate();

  // Payment-related states
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPaymentModal, setPaymentShowModal] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch invoices and receipts on mount with cust_id
  useEffect(() => {
    if (userData?.id) {
      console.log("Fetching invoices and receipts for cust_id:", userData.id);
      loadInvoices({ cust_id: userData.id });
      loadReceipts({ cust_id: userData.id });
    } else {
      console.warn("No cust_id found in userData, skipping fetch");
    }
  }, [loadInvoices, loadReceipts, userData]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Debugging invoices and receipts state
  useEffect(() => {
    console.log("Invoices state:", invoices);
    console.log("Receipts state:", receipts);
  }, [invoices, receipts]);

  // Get unique projects for filter dropdown
  const uniqueProjects = Array.isArray(invoices)
    ? Array.from(new Map(invoices.map((p) => [p.proj_id, p])).values())
    : [];

  // Apply filter based on proj_id
  const filteredPayments =
    projectFilter === "all"
      ? (Array.isArray(invoices) ? invoices : [])
      : (Array.isArray(invoices) ? invoices.filter((p) => p.proj_id === Number(projectFilter)) : []);

  // Format rupees
  const formatRupees = (amount) => {
    return "₹" + (amount || 0).toLocaleString("en-IN");
  };

  // Payment action
  const makePayment = async (payment) => {
    console.log("makePayment called with:", { payment, userData });
    setSelectedPayment(payment);
    handleProjectPayment(
      payment.id,
      payment,
      userData,
      setIsPaymentLoading,
      setPaymentShowModal,
      setIsPaymentSuccess
    );
  };

  const generateInvoice = async (payment) => {
    try {
      const invoiceData = await fetchInvoiceRecords({ id: payment.id });
      console.log("Fetched Invoice Data:", invoiceData);
      if (invoiceData.success && invoiceData.result.length > 0) {
        navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
          state: { invoices: invoiceData.result, receipts: [] },
        });
      } else {
        console.warn("No invoice found for id:", payment.id);
        navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
          state: { invoices: [], receipts: [] },
        });
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
        state: { invoices: [], receipts: [] },
      });
    }
  };

  const generateReceipt = async (payment) => {
    // Find the corresponding receipt from the receipts state
    const receiptData = receipts.find((r) => r.userpayment_id === payment.id || r.id === payment.id);
    if (receiptData) {
      const receipt = {
        ...receiptData,
        userpayment_id: receiptData.userpayment_id ?? receiptData.id ?? "N/A",
        rcv_id: receiptData.rcv_id ?? "N/A",
        wk_no: receiptData.subtasks?.[0]?.week_no ?? receiptData.wk_no ?? "N/A",
        project_name: receiptData.project_name ?? `Invoice ${receiptData.inv_id ?? "N/A"}`,
        pymt_act_date: receiptData.pymt_act_date ?? "N/A",
        amt_act: receiptData.amt_act ?? 0,
      };
      console.log("Generated receipt from store:", receipt);
      navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
        state: { invoices: [], receipts: [receipt] },
      });
    } else {
      // Fallback: Fetch receipt data if not in store
      try {
        const response = await fetchStudioUserPayments({ id: payment.id });
        console.log("Fetched receipt data:", response);
        if (response.success && response.result.length > 0) {
          const receipt = {
            ...response.result[0],
            userpayment_id: response.result[0].userpayment_id ?? response.result[0].id ?? "N/A",
            rcv_id: response.result[0].rcv_id ?? "N/A",
            wk_no: response.result[0].subtasks?.[0]?.week_no ?? response.result[0].wk_no ?? "N/A",
            project_name: response.result[0].project_name ?? `Invoice ${response.result[0].inv_id ?? "N/A"}`,
            pymt_act_date: response.result[0].pymt_act_date ?? "N/A",
            amt_act: response.result[0].amt_act ?? 0,
          };
          console.log("Generated receipt from API:", receipt);
          navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
            state: { invoices: [], receipts: [receipt] },
          });
        } else {
          console.warn("No receipt found for id:", payment.id);
          navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
            state: { invoices: [], receipts: [] },
          });
        }
      } catch (error) {
        console.error("Error fetching receipt:", error);
        navigate(`${STUDIO_BASE}/projectPaymentsDocs`, {
          state: { invoices: [], receipts: [] },
        });
      }
    }
  };

  // Handle modal close and refresh
  const handleClose = () => {
    setPaymentShowModal(false);
    setSelectedPayment(null);
    if (isPaymentSuccess) {
      loadInvoices({ cust_id: userData.id });
      loadReceipts({ cust_id: userData.id });
    }
  };

  return (
    <div className="bg-white rounded shadow mb-6">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}>
          Project Payments
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            id="projectFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            {uniqueProjects.map((p) => (
              <option key={p.proj_id} value={p.proj_id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5">
        {loading && <p className="text-gray-500">Loading payments...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && filteredPayments.length === 0 && (
          <p className="text-gray-500">No payments found</p>
        )}

        <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="col-span-1 sm:col-span-2">
              <h3 className="text-sm font-medium text-gray-900">
                {`Week ${payment.wk_no || "N/A"}: ${payment.project_name}`}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <p className="font-bold text-gray-900">
                    {formatRupees(payment.wkly_cost_amt)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <p className="font-bold text-gray-900">
                    {formatRupees(payment.amt_act ?? 0)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(payment.wkly_cost_amt !== (payment.amt_act ?? 0)) && (
                      <button
                        className={`px-2 sm:px-4 py-1 bg-[#E07A5F] text-white rounded-lg text-xs font-medium hover:bg-[#d16a4f] ${isPaymentLoading && selectedPayment?.id === payment.id ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => makePayment(payment)}
                        disabled={isPaymentLoading && selectedPayment?.id === payment.id}
                      >
                        {isPaymentLoading && selectedPayment?.id === payment.id
                          ? "Processing..."
                          : `Pay ${formatRupees(payment.wkly_cost_amt - (payment.amt_act ?? 0))}`}
                      </button>
                    )}
                    <button
                      className="px-2 sm:px-4 py-1 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700"
                      onClick={() => generateInvoice(payment)}
                    >
                      Invoice
                    </button>
                    {(payment.amt_act ?? 0) > 0 && (
                      <button
                        className="px-2 sm:px-4 py-1 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700"
                        onClick={() => generateReceipt(payment)}
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClose}
        isPaymentSuccess={isPaymentSuccess}
      />
    </div>
  );
};

export default ProjectTaskPayments;