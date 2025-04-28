import React, { useState, useRef, forwardRef } from "react";
import { FaDownload, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { handlePayment } from "../../../utils/paymentUtils";
import PaymentModal from "../../../components/CommonViews/PaymentModel";

import tailwindStyles from "../../../utils/tailwindStyles";

// Common Component for Header
const Header = ({ title }) => (
  <div className="mb-6 sm:mb-8">
    <div className="flex items-center justify-center p-2 sm:p-3 rounded-md bg-[#001433] w-32 sm:w-36">
      <img
        src="/RUFRENT6.png"
        alt="RUFRENT Premium Living"
        className="h-8 sm:h-10 w-auto"
      />
    </div>
    <h1 className={`${tailwindStyles.heading_2} text-center`}>{title}</h1>
  </div>
);

// Common Component for Address Section
const AddressSection = ({ title, data }) => (
  <div className="border border-gray-300 p-3 sm:p-4 rounded-lg shadow-sm">
    <h2 className={`${tailwindStyles.heading_3} mb-2`}>{title}</h2>
    <div className={`${tailwindStyles.paragraph} space-y-1`}>
      <p className="font-medium">{data.name}</p>
      <p>{data.address}</p>
      {data.mobile && <p>Mobile: {data.mobile}</p>}
      {data.email && (
        <p>
          <a
            href={`mailto:${data.email}`}
            className="text-blue-500 hover:underline"
          >
            {data.email}
          </a>
        </p>
      )}
    </div>
  </div>
);

// Common Component for Customer Information
const CustomerInfo = ({ data, isInvoice }) => (
  <div className="border border-gray-300 p-3 sm:p-4 rounded-lg shadow-sm">
    <h2 className={`${tailwindStyles.heading_3} mb-2`}>Customer Information</h2>
    <div className={`${tailwindStyles.paragraph} space-y-1`}>
      <p>Customer ID: {data.customerId}</p>
      <p>Document No: {data.receiptNo}</p>
      <p>Date: {data.receiptDate}</p>
      {isInvoice && data.dueDate && <p>Due Date: {data.dueDate}</p>}
    </div>
  </div>
);

// Common Component for Payment Details Table
const PaymentDetailsTable = ({ paymentDetails }) => (
  <div className="mb-6 sm:mb-8">
    <h2 className={`${tailwindStyles.heading_3} mb-2`}>
      Description of Services
    </h2>
    <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm md:text-base">
      <thead>
        <tr className="bg-gray-100">
          <th
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left`}
          >
            Service Description
          </th>
          <th
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-center`}
          >
            Quantity
          </th>
          <th
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            Unit Price (₹)
          </th>
          <th
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            Amount (₹)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}>
            {paymentDetails.serviceDescription}
          </td>
          <td
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-center`}
          >
            {paymentDetails.quantity}
          </td>
          <td
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            {paymentDetails.unitPrice.toLocaleString()}
          </td>
          <td
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            {paymentDetails.amount.toLocaleString()}
          </td>
        </tr>
        <tr className="bg-gray-100">
          <td
            colSpan="3"
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            CGST
          </td>
          <td
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            {paymentDetails.cgst}
          </td>
        </tr>
        <tr>
          <td
            colSpan="3"
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            SGST
          </td>
          <td
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            {paymentDetails.sgst}
          </td>
        </tr>
        <tr className="bg-gray-100 font-semibold">
          <td
            colSpan="3"
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            Grand Total
          </td>
          <td
            className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-right`}
          >
            ₹{paymentDetails.grandTotal.toLocaleString()}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Common Component for Notes
const NotesSection = ({ notes }) => (
  <div className="mb-6 sm:mb-8">
    <h2 className={`${tailwindStyles.heading_3} mb-2`}>Terms & Conditions:</h2>
    <ul className={`${tailwindStyles.paragraph} list-disc pl-5 space-y-1`}>
      {notes.map((note, index) => (
        <li key={index}>{note}</li>
      ))}
    </ul>
  </div>
);

// Reusable Document Generator Component
const DocumentGenerator = forwardRef(({ data, type }, ref) => {
  const isInvoice = type === "invoice";

  const defaultData = {
    from: {
      name: "QTMINDS PVT LTD",
      address:
        "3rd Floor, 67, 2, Hitech City Rd, Patrika Nagar, Madhapur, Hyderabad, Telangana 500081",
      email: "support@rufrent.com",
      website: "http://www.rufrent.com",
      gst: "36AAFCQ7520H1ZX",
      cin: "U62013T52023PTC179951",
    },
    to: {
      name: "[Name]",
      address: "[Insert Address of the property]",
      mobile: "[Number]",
      email: "[Email]",
    },
    customerInfo: {
      customerId: "[insert this id]",
      receiptNo: isInvoice ? "RRI-202502-001" : "RP-202501-8001",
      receiptDate: "[insert date]",
      dueDate: isInvoice ? "[insert date]" : undefined,
    },
    paymentDetails: {
      serviceDescription: "Convenience Charges",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      cgst: "NA",
      sgst: "NA",
      grandTotal: 0,
      paymentMode: "[ONLINE PAYMENT, UPI, BANK TRANSFER, ETC.]",
      transactionId: "[INSERT REF NUMBER]",
    },
    notes: isInvoice
      ? [
          "Payments are non-refundable once the RR Package is activated.",
          "Services must be availed as per the package validity terms.",
          "Please retain this invoice for your records.",
        ]
      : [
          "This receipt acknowledges payment in full for the specified services.",
          "Services must be availed as per the package validity terms.",
          "Please retain this receipt for your records.",
        ],
  };

  const {
    from = defaultData.from,
    to = {
      name: data?.tenant_name || defaultData.to.name,
      address: data?.address || defaultData.to.address,
      mobile: data?.tenant_mobile || defaultData.to.mobile,
      email: data?.tenant_email || defaultData.to.email,
    },
    customerInfo = {
      customerId:
        data?.customer_id?.toString() ||
        data?.tenant_id?.toString() ||
        defaultData.customerInfo.customerId,
      receiptNo: isInvoice
        ? data?.Inv_Id || defaultData.customerInfo.receiptNo
        : data?.Receipt_Id || defaultData.customerInfo.receiptNo,
      receiptDate: isInvoice
        ? data?.Inv_DateTime || defaultData.customerInfo.receiptDate
        : data?.Payment_DateTime || defaultData.customerInfo.receiptDate,
      dueDate: isInvoice
        ? data?.Inv_DueDate || defaultData.customerInfo.dueDate
        : undefined,
    },
    paymentDetails = {
      serviceDescription: defaultData.paymentDetails.serviceDescription,
      quantity: 1,
      unitPrice:
        parseFloat(data?.Inv_Amount) || defaultData.paymentDetails.unitPrice,
      amount: parseFloat(data?.Inv_Amount) || defaultData.paymentDetails.amount,
      cgst: data?.Inv_CGST || defaultData.paymentDetails.cgst,
      sgst: data?.Inv_SGST || defaultData.paymentDetails.sgst,
      grandTotal:
        parseFloat(data?.Inv_Total) || defaultData.paymentDetails.grandTotal,
      paymentMode: isInvoice
        ? defaultData.paymentDetails.paymentMode
        : data?.Payment_Mode || defaultData.paymentDetails.paymentMode,
      transactionId: isInvoice
        ? defaultData.paymentDetails.transactionId
        : data?.Payment_Id || defaultData.paymentDetails.transactionId,
    },
    notes = defaultData.notes,
  } = data || {};

  return (
    <div
      ref={ref}
      className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-sm border-t-4"
      style={{ minWidth: "1000px", minHeight: "1200px" }}
    >
      <Header title={isInvoice ? "Invoice" : "Payment Receipt"} />
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <AddressSection
          title={`${type === "invoice" ? "Invoice" : "Receipt"} From`}
          data={from}
        />
        <AddressSection
          title={`${type === "invoice" ? "Invoice" : "Receipt"} To`}
          data={to}
        />
        <CustomerInfo data={customerInfo} isInvoice={isInvoice} />
      </div>
      <PaymentDetailsTable paymentDetails={paymentDetails} />
      <NotesSection notes={notes} />
      <div className="text-center">
        <p className={tailwindStyles.paragraph}>
          ***This is a computer-generated{" "}
          {isInvoice ? "invoice" : "payment receipt"}. No signature required***
        </p>
        <p className={`${tailwindStyles.paragraph} mt-1`}>
          Thank you for your {isInvoice ? "prompt payment" : "payment"}.
        </p>
      </div>
    </div>
  );
});

// Main Receipts Component
const AllTransactions = ({
  invoices,
  receipts,
  userProperties,
  userId,
  fetchActionsListings,
  fetchUserTransactions,
}) => {
  const [activeSubTab, setActiveSubTab] = useState("Invoices");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const documentRef = useRef(null);

  // Payment
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPaymentModal, setPaymentShowModal] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const handleViewDocument = (doc, type) => {
    setSelectedDocument(doc);
    setDocumentType(type);
    setShowPopup(true);
  };
  const handleClosePayment = async () => {
    setPaymentShowModal(false);
    await fetchActionsListings(userId);
    await fetchUserTransactions(userId);
  };

  const handleClosePopup = () => setShowPopup(false);

  const handleOverlayClick = (e) =>
    e.target === e.currentTarget && setShowPopup(false);

  const handleDownloadPDF = () => {
    if (!selectedDocument || !documentRef.current) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    html2canvas(documentRef.current, {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 1.0);
        const imgWidth = 595.28 - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
        doc.save(
          documentType === "invoice"
            ? `invoice_${selectedDocument.Inv_Id || "default"}.pdf`
            : `payment_receipt_${selectedDocument.Receipt_Id || "default"}.pdf`
        );
      })
      .catch((error) => console.error("Error generating PDF:", error));
  };

  return (
    <div className="bg-white py-5 px-5 rounded-xl shadow">
      <div style={{ display: "none" }}>
        {selectedDocument && (
          <DocumentGenerator
            data={selectedDocument}
            type={documentType}
            ref={documentRef}
          />
        )}
      </div>

      <div className="flex space-x-4 mb-4 border-b pb-2">
        {["Invoices", "Receipts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={
              activeSubTab === tab
                ? tailwindStyles.secondaryButton
                : tailwindStyles.heading_3
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === "Invoices" ? (
        <div>
          <h3 className={`${tailwindStyles.heading_2} mb-4`}>Invoices</h3>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left`}
                    >
                      Date
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left whitespace-nowrap`}
                    >
                      Invoice Id
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left whitespace-nowrap`}
                    >
                      Property Address
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left`}
                    >
                      Amount
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-center`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => {
                    const payEnable = userProperties.find(
                      (eachProp) =>
                        eachProp.prop_id == invoice.property_id &&
                        eachProp.current_status_id === 18
                    );

                    return (
                      <tr key={index}>
                        <td
                          className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                        >
                          {invoice?.Inv_DateTime
                            ? new Date(
                                invoice.Inv_DateTime
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td
                          className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                        >
                          {invoice?.Inv_Id || "N/A"}
                        </td>
                        <td
                          className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                        >
                          {invoice?.address || "N/A"}
                        </td>
                        <td
                          className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                        >
                          ₹{invoice?.Inv_Total || "0.00"}
                        </td>
                        <td className="border p-2 sm:p-3 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              className={`${tailwindStyles.secondaryButton} `}
                              title="View Invoice"
                              onClick={() =>
                                handleViewDocument(invoice, "invoice")
                              }
                            >
                              View
                            </button>
                            {payEnable && (
                              <button
                                className={`${tailwindStyles.secondaryButton} `}
                                onClick={() =>
                                  handlePayment(
                                    payEnable.prop_id,
                                    invoice,
                                    setIsPaymentLoading,
                                    setPaymentShowModal,
                                    setIsPaymentSuccess
                                  )
                                }
                                disabled={isPaymentLoading}
                              >
                                {`Pay ₹ ${invoice?.Inv_Total || ""}`}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={`${tailwindStyles.paragraph_b} text-center`}>
              No Invoices Available
            </p>
          )}
        </div>
      ) : (
        <div>
          <h3 className={`${tailwindStyles.heading_2} mb-4`}>Receipts</h3>
          {receipts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left`}
                    >
                      Date
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left`}
                    >
                      Receipt ID
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left whitespace-nowrap`}
                    >
                      Property Address
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-left`}
                    >
                      Amount
                    </th>
                    <th
                      className={`${tailwindStyles.paragraph} border p-2 sm:p-3 text-center`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((payment, index) => (
                    <tr key={index}>
                      <td
                        className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                      >
                        {payment?.Payment_DateTime
                          ? new Date(
                              payment.Payment_DateTime
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td
                        className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                      >
                        {payment?.Receipt_Id || "N/A"}
                      </td>
                      <td
                        className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                      >
                        {payment?.address || "N/A"}
                      </td>
                      <td
                        className={`${tailwindStyles.paragraph} border p-2 sm:p-3`}
                      >
                        ₹{payment?.Inv_Total || "0.00"}
                      </td>
                      <td className="border p-2 sm:p-3 text-center">
                        <button
                          className={`${tailwindStyles.secondaryButton} mx-auto`}
                          title="View Payment"
                          onClick={() => handleViewDocument(payment, "receipt")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={`${tailwindStyles.paragraph_b} text-center`}>
              No Receipts Available
            </p>
          )}
        </div>
      )}

      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-lg shadow-lg relative max-h-[90vh] max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] overflow-auto">
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-600 hover:text-gray-800 z-50"
              onClick={handleClosePopup}
            >
              <FaTimes className="text-xl sm:text-2xl" />
            </button>
            <button
              className="absolute top-2 sm:top-4 left-2 sm:left-4 text-gray-600 hover:text-gray-800 z-50"
              onClick={handleDownloadPDF}
              title="Download Document"
            >
              <FaDownload className="text-xl sm:text-2xl" />
            </button>
            <div
              className="p-4 sm:p-6 md:p-8"
              style={{
                overflowX: "auto",
                overflowY: "auto",
                maxWidth: "100%",
                maxHeight: "calc(90vh - 48px)",
              }}
            >
              <DocumentGenerator
                data={selectedDocument}
                type={documentType}
                ref={documentRef}
              />
            </div>
          </div>
        </div>
      )}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePayment}
        isPaymentSuccess={isPaymentSuccess}
      />
    </div>
  );
};

export default AllTransactions;
