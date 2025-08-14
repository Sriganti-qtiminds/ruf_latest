import React, { useState, useEffect } from 'react';

const VendorInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [pendingOpen, setPendingOpen] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Fetch all vendor payments on component mount
  useEffect(() => {
    fetchVendorInvoices();
  }, []);

  // Filter invoices when search term or status filter changes
  useEffect(() => {
    const filtered = invoices.filter(invoice => {
      const matchesSearch = searchTerm === '' || 
        invoice.inv_no?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendor_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.main_task_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.pymt_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const fetchVendorInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vendorpayment/getAllVendorPayments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor invoices');
      }
      
      const data = await response.json();
      setInvoices(data.data || []);
    } catch (err) {
      console.error('Error fetching vendor invoices:', err);
      setError('Failed to load vendor invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = async (invoiceId, updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vendorpayment/updateVendorPayment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentData: updatedData })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      setSuccess('Invoice updated successfully');
      fetchVendorInvoices(); // Refresh the list
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError('Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vendorpayment/deleteVendorPayment?id=${invoiceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      setSuccess('Invoice deleted successfully');
      fetchVendorInvoices(); // Refresh the list
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case '1': return 'bg-yellow-100 text-yellow-800'; // pending
      case '2': return 'bg-blue-100 text-blue-800'; // approved
      case '3': return 'bg-green-100 text-green-800'; // paid
      case '4': return 'bg-red-100 text-red-800'; // cancelled
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'paid': return 'Paid';
      case 'cancelled': return 'Cancelled';
      case '1': return 'Pending';
      case '2': return 'Approved';
      case '3': return 'Paid';
      case '4': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Separate pending invoices for cards
  const pendingInvoices = filteredInvoices.filter(invoice => 
    invoice.pymt_status === 'pending' || invoice.pymt_status === '1'
  );
  const completedInvoices = filteredInvoices.filter(invoice => 
    invoice.pymt_status === 'paid' || invoice.pymt_status === '3' || 
    invoice.pymt_status === 'cancelled' || invoice.pymt_status === '4'
  );

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice({ ...invoice });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingInvoice(null);
  };

  const handleSaveEdit = async () => {
    if (editingInvoice) {
      try {
        const updatedData = [
          { key: "vendor_id", value: editingInvoice.vendor_id },
          { key: "project_id", value: editingInvoice.project_id },
          { key: "task_id", value: editingInvoice.task_id },
          { key: "invoice_amount", value: editingInvoice.invoice_amount },
          { key: "inv_no", value: editingInvoice.inv_no },
          { key: "pymt_inv_date", value: editingInvoice.pymt_inv_date },
          { key: "pymt_due_date", value: editingInvoice.pymt_due_date },
          { key: "pymt_status", value: editingInvoice.pymt_status },
          { key: "nsub_tasks_planned", value: editingInvoice.nsub_tasks_planned },
          { key: "nsub_task_completed", value: editingInvoice.nsub_task_completed },
          { key: "vnd_pymt_mode", value: editingInvoice.vnd_pymt_mode },
          { key: "reciept_no", value: editingInvoice.reciept_no }
        ];

        await handleUpdateInvoice(editingInvoice.id, updatedData);
        closeEditModal();
      } catch (err) {
        console.error('Error saving invoice:', err);
        setError('Failed to save invoice');
      }
    }
  };

  const handleApprove = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        const updatedData = [
          { key: "vendor_id", value: invoice.vendor_id },
          { key: "project_id", value: invoice.project_id },
          { key: "task_id", value: invoice.task_id },
          { key: "invoice_amount", value: invoice.invoice_amount },
          { key: "inv_no", value: invoice.inv_no },
          { key: "pymt_inv_date", value: invoice.pymt_inv_date },
          { key: "pymt_due_date", value: invoice.pymt_due_date },
          { key: "pymt_status", value: "2" }, // approved
          { key: "nsub_tasks_planned", value: invoice.nsub_tasks_planned },
          { key: "nsub_task_completed", value: invoice.nsub_task_completed },
          { key: "vnd_pymt_mode", value: invoice.vnd_pymt_mode },
          { key: "reciept_no", value: invoice.reciept_no }
        ];

        await handleUpdateInvoice(invoiceId, updatedData);
      }
    } catch (err) {
      console.error('Error approving invoice:', err);
      setError('Failed to approve invoice');
    }
  };

  const handleCancel = async (invoiceId) => {
    const reason = prompt('Reason for cancellation:');
    if (reason) {
      try {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          const updatedData = [
            { key: "vendor_id", value: invoice.vendor_id },
            { key: "project_id", value: invoice.project_id },
            { key: "task_id", value: invoice.task_id },
            { key: "invoice_amount", value: invoice.invoice_amount },
            { key: "inv_no", value: invoice.inv_no },
            { key: "pymt_inv_date", value: invoice.pymt_inv_date },
            { key: "pymt_due_date", value: invoice.pymt_due_date },
            { key: "pymt_status", value: "4" }, // cancelled
            { key: "nsub_tasks_planned", value: invoice.nsub_tasks_planned },
            { key: "nsub_task_completed", value: invoice.nsub_task_completed },
            { key: "vnd_pymt_mode", value: invoice.vnd_pymt_mode },
            { key: "reciept_no", value: invoice.reciept_no },
            { key: "cancelled_reason", value: reason }
          ];

          await handleUpdateInvoice(invoiceId, updatedData);
        }
      } catch (err) {
        console.error('Error cancelling invoice:', err);
        setError('Failed to cancel invoice');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E07A5F]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Vendor Invoices</h1>
        <p className="text-gray-600">Manage and track vendor payment invoices</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Invoice Number, Vendor Name, Project, or Task
            </label>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <button
              onClick={fetchVendorInvoices}
              className="w-full md:w-auto px-4 py-2 bg-[#E07A5F] text-white rounded-md hover:bg-[#d96a4c] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Pending Invoices Cards */}
      {pendingInvoices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Pending Invoices</h2>
            <button
              className="md:hidden px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              onClick={() => setPendingOpen((prev) => !prev)}
            >
              {pendingOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className={`${pendingOpen ? '' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{invoice.inv_no}</h3>
                        <p className="text-sm text-gray-600">{invoice.vendor_user_name}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.pymt_status)}`}>
                        {getStatusText(invoice.pymt_status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Project:</span>
                        <span className="text-sm font-medium text-gray-800">{invoice.project_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Task:</span>
                        <span className="text-sm font-medium text-gray-800">{invoice.main_task_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-semibold text-gray-800">₹{invoice.invoice_amount?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Due Date:</span>
                        <span className="text-sm text-gray-800">
                          {invoice.pymt_due_date ? new Date(invoice.pymt_due_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(invoice);
                        }}
                        className="flex-1 bg-yellow-500 text-white px-2 py-1.5 rounded-full text-xs font-medium hover:bg-yellow-600 transition-colors"
                      >
                        <i className="ri-edit-line mr-1"></i>Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(invoice.id);
                        }}
                        className="flex-1 bg-green-500 text-white px-2 py-1.5 rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
                      >
                        <i className="ri-check-line mr-1"></i>Approve
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(invoice.id);
                        }}
                        className="flex-1 bg-red-500 text-white px-2 py-1.5 rounded-full text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        <i className="ri-close-line mr-1"></i>Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 text-xs md:px-4 md:py-2 md:text-base rounded-lg font-medium ${
            statusFilter === 'all' ? 'bg-[#E07A5F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Invoices
        </button>

        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium ${
            statusFilter === 'paid' ? 'bg-[#E07A5F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium ${
            statusFilter === 'cancelled' ? 'bg-[#E07A5F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Completed Invoices Table */}
      {completedInvoices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Invoices</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.inv_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{invoice.vendor_user_name}</div>
                          <div className="text-gray-500 text-xs">ID: {invoice.vendor_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.project_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.main_task_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{invoice.invoice_amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.pymt_inv_date ? new Date(invoice.pymt_inv_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.pymt_due_date ? new Date(invoice.pymt_due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.pymt_status)}`}>
                          {getStatusText(invoice.pymt_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.pymt_status === 'paid' || invoice.pymt_status === '3' ? (invoice.reciept_no || 'N/A') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleInvoiceClick(invoice)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 text-xs font-medium"
                            title="View Details"
                          >
                            <i className="ri-eye-line mr-1"></i>View
                          </button>
                          <button 
                            className="text-[#E07A5F] hover:text-[#d0694a] px-2 py-1 rounded border border-orange-200 hover:bg-orange-50 text-xs font-medium"
                            title="Download Invoice"
                          >
                            <i className="ri-download-line mr-1"></i>Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-file-list-3-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No vendor invoices found</p>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Vendor Invoice Details</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Invoice No:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.inv_no}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.pymt_status)}`}>
                    {getStatusText(selectedInvoice.pymt_status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vendor:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.vendor_user_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Project:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.project_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Task:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.main_task_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Invoice Amount:</span>
                  <span className="ml-2 text-gray-900 font-semibold">₹{selectedInvoice.invoice_amount?.toLocaleString() || '0'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Invoice Date:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedInvoice.pymt_inv_date ? new Date(selectedInvoice.pymt_inv_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedInvoice.pymt_due_date ? new Date(selectedInvoice.pymt_due_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sub Tasks Planned:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.nsub_tasks_planned || '0'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sub Tasks Completed:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.nsub_task_completed || '0'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Payment Mode:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.vnd_pymt_mode || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Receipt No:</span>
                  <span className="ml-2 text-gray-900">{selectedInvoice.reciept_no || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Close
              </button>
              <button className="px-4 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#d0694a]">
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Vendor Invoice</h2>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice No</label>
                  <input
                    type="text"
                    value={editingInvoice.inv_no || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, inv_no: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Amount</label>
                  <input
                    type="number"
                    value={editingInvoice.invoice_amount || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, invoice_amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={editingInvoice.pymt_inv_date ? editingInvoice.pymt_inv_date.split(' ')[0] : ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, pymt_inv_date: e.target.value + ' 00:00:00'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={editingInvoice.pymt_due_date ? editingInvoice.pymt_due_date.split(' ')[0] : ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, pymt_due_date: e.target.value + ' 00:00:00'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingInvoice.pymt_status || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, pymt_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  >
                    <option value="1">Pending</option>
                    <option value="2">Approved</option>
                    <option value="3">Paid</option>
                    <option value="4">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <input
                    type="text"
                    value={editingInvoice.vnd_pymt_mode || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, vnd_pymt_mode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Tasks Planned</label>
                  <input
                    type="number"
                    value={editingInvoice.nsub_tasks_planned || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, nsub_tasks_planned: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Tasks Completed</label>
                  <input
                    type="number"
                    value={editingInvoice.nsub_task_completed || ''}
                    onChange={(e) => setEditingInvoice({...editingInvoice, nsub_task_completed: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={closeEditModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#d0694a]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorInvoices; 