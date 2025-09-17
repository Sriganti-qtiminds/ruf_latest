import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { studioTailwindStyles } from "../../../../utils/studioTailwindStyles";
import { Eye, Download } from "lucide-react";
import useStudioPaymentsStore from "../../../../store/stdInvoice";
import { useRoleStore } from "../../../../store/roleStore";
import { useLocation } from "react-router-dom";

const PaymentsDocsPage = () => {
  const [previewDoc, setPreviewDoc] = useState(null);
  const { invoices, receipts, loading, error, loadInvoices, loadReceipts } =
    useStudioPaymentsStore();
  const { userData } = useRoleStore();
  const { state } = useLocation();
  const isInvoiceView = state?.invoices?.length > 0;

  useEffect(() => {
    // Handle navigation state from ProjectTaskPayments
    if (state?.invoices?.length || state?.receipts?.length) {
      const transformedReceipts = (state.receipts || []).map((receipt) => {
        const week_number = receipt.subtasks?.[0]?.week_no ?? receipt.wk_no ?? "N/A";
        console.log("Receipt navigation week_number:", {
          receipt_id: receipt.receipt_id,
          subtasks_week_no: receipt.subtasks?.[0]?.week_no,
          wk_no: receipt.wk_no,
          result: week_number,
        });
        const transformed = {
          ...receipt,
          week_number,
          userpayment_id: receipt.userpayment_id ?? receipt.id ?? "N/A",
          receipt_id: receipt.receipt_id ?? receipt.rcv_id ?? "N/A",
          project_name: receipt.project_name ?? `Invoice ${receipt.inv_id ?? "N/A"}`,
          payment_actual_date: receipt.payment_actual_date ?? receipt.pymt_act_date ?? "N/A",
          amount_paid: receipt.amount_paid ?? receipt.amt_act ?? 0,
          total_cost: receipt.total_cost ?? receipt.inv_tot ?? 0,
        };
        console.log("Transformed receipt from navigation:", transformed);
        return transformed;
      });
      const transformedInvoices = (state.invoices || []).map((invoice) => {
        const week_number = invoice.subtasks?.[0]?.week_no ?? invoice.wk_no ?? "N/A";
        console.log("Invoice navigation week_number:", {
          invoice_id: invoice.inv_id,
          subtasks_week_no: invoice.subtasks?.[0]?.week_no,
          wk_no: invoice.wk_no,
          result: week_number,
        });
        console.log("Invoice navigation total_cost:", {
          invoice_id: invoice.inv_id,
          total_cost: invoice.total_cost,
          wkly_cost_amt: invoice.wkly_cost_amt,
          result: invoice.total_cost ?? invoice.wkly_cost_amt ?? 0,
        });
        return {
          ...invoice,
          week_number,
          invoice_info: invoice.inv_info ?? "N/A",
          project_name: invoice.project_name ?? `Invoice ${invoice.inv_id ?? "N/A"}`,
          payment_due_date: invoice.payment_due_date ?? invoice.pymt_due_date ?? "N/A",
          weekly_cost_amount: invoice.weekly_cost_amount ?? invoice.wkly_cost_amt ?? 0,
          total_cost: invoice.total_cost ?? invoice.wkly_cost_amt ?? 0,
        };
      });
      console.log("Setting store state:", { invoices: transformedInvoices, receipts: transformedReceipts });
      useStudioPaymentsStore.setState({
        invoices: transformedInvoices,
        receipts: transformedReceipts,
      });
      return;
    }

    // Fetch data with cust_id if no navigation state
    if (!userData?.id) {
      console.warn("No cust_id found, skipping fetch");
      return;
    }

    if (isInvoiceView) {
      loadInvoices({ cust_id: userData.id });
    } else {
      loadReceipts({ cust_id: userData.id });
    }
  }, [isInvoiceView, loadInvoices, loadReceipts, userData, state]);

  const downloadPDF = (doc, type) => {
    const pdf = new jsPDF();
    pdf.addImage("/RUFRENT6.png", "PNG", 20, 10, 50, 20);
    pdf.setFontSize(16);
    pdf.text(`${type.toUpperCase()} DOCUMENT`, 20, 40);
    pdf.setFontSize(12);

    // Define fields to display
    const fieldsToDisplay = {
      Invoice: {
        "Invoice Info": doc.invoice_info || "N/A",
        "Week Number": doc.week_number ?? "N/A",
        "Project Name": doc.project_name ?? "N/A",
        "Payment Due Date": doc.payment_due_date
          ? new Date(doc.payment_due_date).toLocaleDateString()
          : "N/A",
        "Weekly Cost Amount": doc.weekly_cost_amount != null
          ? `₹${doc.weekly_cost_amount.toLocaleString("en-IN")}`
          : "N/A",
        "Total Cost": doc.total_cost != null
          ? `₹${doc.total_cost.toLocaleString("en-IN")}`
          : "N/A",
      },
      Receipt: {
        "Receipt ID": doc.receipt_id || "N/A",
        "Week Number": doc.week_number ?? "N/A",
        "Project Name": doc.project_name ?? "N/A",
        "Payment Actual Date": doc.payment_actual_date
          ? new Date(doc.payment_actual_date).toLocaleDateString()
          : "N/A",
        "Amount Paid": doc.amount_paid != null
          ? `₹${doc.amount_paid.toLocaleString("en-IN")}`
          : "N/A",
      },
    };

    // Select fields based on type
    const selectedFields = type === "invoice" ? fieldsToDisplay.Invoice : fieldsToDisplay.Receipt;

    Object.entries(selectedFields).forEach(([key, value], index) => {
      pdf.text(`${key}: ${value}`, 20, 50 + index * 10);
    });

    pdf.save(`${type}-${doc.id || doc.userpayment_id}.pdf`);
  };

  const dataToRender = Array.isArray(isInvoiceView ? invoices : receipts)
    ? isInvoiceView
      ? invoices
      : receipts
    : [];

  // Log invalid records and debug fields
  dataToRender.forEach((doc, index) => {
    if (isInvoiceView && (doc.total_cost === undefined || doc.total_cost === null)) {
      console.warn(`Invalid invoice at index ${index}:`, doc);
    } else if (!isInvoiceView && (doc.amount_paid === undefined || doc.amount_paid === null)) {
      console.warn(`Invalid receipt at index ${index}:`, doc);
    }
    console.log(`Rendering ${isInvoiceView ? "invoice" : "receipt"} at index ${index}:`, {
      userpayment_id: doc.userpayment_id,
      receipt_id: doc.receipt_id,
      invoice_id: doc.id,
      invoice_info: doc.invoice_info,
      week_number: doc.week_number,
      project_name: doc.project_name,
      payment_due_date: doc.payment_due_date,
      payment_actual_date: doc.payment_actual_date,
      weekly_cost_amount: doc.weekly_cost_amount,
      amount_paid: doc.amount_paid,
      total_cost: doc.total_cost,
    });
  });

  return (
    <div className="bg-white rounded shadow p-5">
      <h2 className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}>
        {isInvoiceView ? "Invoices" : "Receipts"}
      </h2>

      {/* Loader & Errors */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table Display */}
      {!loading && dataToRender.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Serial No</th>
                <th className="px-4 py-2 border">{isInvoiceView ? "Invoice Info" : "Receipt ID"}</th>
                <th className="px-4 py-2 border">Week Number</th>
                <th className="px-4 py-2 border">Project Name</th>
                <th className="px-4 py-2 border">{isInvoiceView ? "Payment Due Date" : "Payment Actual Date"}</th>
                <th className="px-4 py-2 border">{isInvoiceView ? "Weekly Cost Amount" : "Amount Paid"}</th>
                {isInvoiceView && <th className="px-4 py-2 border">Project Total Cost</th>}
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataToRender.map((doc) => (
                <tr
                  key={isInvoiceView ? doc.id : doc.userpayment_id}
                  className="text-sm text-gray-700"
                >
                  <td className="px-4 py-2 border">
                    {isInvoiceView ? doc.id : doc.userpayment_id ?? "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {isInvoiceView ? doc.invoice_info || "N/A" : doc.receipt_id || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">{doc.week_number ?? "N/A"}</td>
                  <td className="px-4 py-2 border">{doc.project_name ?? "N/A"}</td>
                  <td className="px-4 py-2 border">
                    {isInvoiceView
                      ? doc.payment_due_date
                        ? new Date(doc.payment_due_date).toLocaleDateString()
                        : "N/A"
                      : doc.payment_actual_date
                      ? new Date(doc.payment_actual_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {isInvoiceView
                      ? doc.weekly_cost_amount != null
                        ? `₹${doc.weekly_cost_amount.toLocaleString("en-IN")}`
                        : "N/A"
                      : doc.amount_paid != null
                      ? `₹${doc.amount_paid.toLocaleString("en-IN")}`
                      : "N/A"}
                  </td>
                  {isInvoiceView && (
                    <td className="px-4 py-2 border">
                      {doc.total_cost != null
                        ? `₹${doc.total_cost.toLocaleString("en-IN")}`
                        : "N/A"}
                    </td>
                  )}
                  <td className="px-4 py-2 border flex gap-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="px-2 py-1 bg-[#E07A5F] text-white rounded hover:bg-[#d16a4f]"
                      onClick={() => downloadPDF(doc, isInvoiceView ? "invoice" : "receipt")}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && dataToRender.length === 0 && (
        <p className="text-gray-500">No {isInvoiceView ? "invoices" : "receipts"} found.</p>
      )}

      {/* Modal Preview */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setPreviewDoc(null)}
            >
              ✕
            </button>

            <div className="mb-4">
              <img src="/Studio/payment.png" className="h-6 lg:h-8" alt="RUFRENT STUDIO" />
              <h3 className="text-lg font-semibold">
                {isInvoiceView ? "Invoice Preview" : "Receipt Preview"}
              </h3>
            </div>

            <div className="overflow-auto max-h-96 border p-4 rounded">
              <table className="min-w-full text-sm text-gray-700">
                <tbody>
                  {Object.entries(
                    isInvoiceView
                      ? {
                          "Invoice Info": previewDoc.invoice_info || "N/A",
                          "Week Number": previewDoc.week_number ?? "N/A",
                          "Project Name": previewDoc.project_name ?? "N/A",
                          "Payment Due Date": previewDoc.payment_due_date
                            ? new Date(previewDoc.payment_due_date).toLocaleDateString()
                            : "N/A",
                          "Weekly Cost Amount": previewDoc.weekly_cost_amount != null
                            ? `₹${previewDoc.weekly_cost_amount.toLocaleString("en-IN")}`
                            : "N/A",
                          "Project Total Cost": previewDoc.total_cost != null
                            ? `₹${previewDoc.total_cost.toLocaleString("en-IN")}`
                            : "N/A",
                        }
                      : {
                          "Receipt ID": previewDoc.receipt_id || "N/A",
                          "Week Number": previewDoc.week_number ?? "N/A",
                          "Project Name": previewDoc.project_name ?? "N/A",
                          "Payment Actual Date": previewDoc.payment_actual_date
                            ? new Date(previewDoc.payment_actual_date).toLocaleDateString()
                            : "N/A",
                          "Amount Paid": previewDoc.amount_paid != null
                            ? `₹${previewDoc.amount_paid.toLocaleString("en-IN")}`
                            : "N/A",
                        }
                  ).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border px-2 py-1 font-semibold">{key}</td>
                      <td className="border px-2 py-1">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-[#E07A5F] text-white rounded hover:bg-[#d16a4f] flex items-center gap-1"
                onClick={() => downloadPDF(previewDoc, isInvoiceView ? "invoice" : "receipt")}
              >
                <Download size={16} /> Download
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsDocsPage;