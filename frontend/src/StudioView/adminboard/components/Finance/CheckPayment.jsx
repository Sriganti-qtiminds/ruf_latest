
import React, { useState, useEffect } from "react";

const CheckPayment = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const filtered = invoices.filter((inv) =>
      statusFilter === "all" ? true : inv.inv_status === parseInt(statusFilter)
    );
    setFilteredInvoices(filtered);
  }, [invoices, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/invoice/getinvoiceInfo`);
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.result || []);
    } catch (err) {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoice/deleteinvoiceInfo?id=${invoiceId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete invoice");
      setSuccess("Invoice deleted successfully");
      fetchInvoices();
    } catch (err) {
      setError("Failed to delete invoice");
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 1: return { text: "Completed", color: "bg-green-100 text-green-800" };
      case 0: return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
      case 2: return { text: "Failed", color: "bg-red-100 text-red-800" };
      default: return { text: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Check Invoices</h1>

      {error && <div className="p-3 bg-red-100 text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700">{success}</div>}

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2">Status Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="0">Pending</option>
          <option value="1">Completed</option>
          <option value="2">Failed</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Invoice No</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Project ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Week No</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Penalty</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Payment Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => {
              const status = getStatusLabel(inv.inv_status);
              return (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{inv.inv_info}</td>
                  <td className="px-3 py-2">{inv.proj_id}</td>
                  <td className="px-3 py-2">{inv.wk_no}</td>
                  <td className="px-3 py-2">₹{inv.wkly_cost_amt?.toLocaleString()}</td>
                  <td className="px-3 py-2">{inv.pen_amt ? `₹${inv.pen_amt}` : "-"}</td>
                  <td className="px-3 py-2">{new Date(inv.pymt_due_date).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{inv.pymt_act_date ? new Date(inv.pymt_act_date).toLocaleDateString() : "-"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded ${status.color}`}>{status.text}</span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDeleteInvoice(inv.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="text-center p-6 text-gray-500">No invoices found</div>
        )}
      </div>
    </div>
  );
};

export default CheckPayment;
