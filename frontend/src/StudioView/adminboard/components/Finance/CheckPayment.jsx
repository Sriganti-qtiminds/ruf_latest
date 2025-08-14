import React, { useState, useEffect } from 'react';

const CheckPayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredPayments, setFilteredPayments] = useState([]);

  // Fetch all studio user payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments when search term or status filter changes
  useEffect(() => {
    const filtered = payments.filter(payment => {
      const matchesSearch = searchTerm === '' || 
        payment.project_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.cust_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/getAllStudiouserPayments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      setPayments(data.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (paymentId, updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/updateStudiouserPayment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentData: updatedData })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      setSuccess('Payment updated successfully');
      fetchPayments(); // Refresh the list
    } catch (err) {
      console.error('Error updating payment:', err);
      setError('Failed to update payment');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/deleteStudiouserPayment?id=${paymentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      setSuccess('Payment deleted successfully');
      fetchPayments(); // Refresh the list
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'bank transfer': return 'ri-bank-line';
      case 'upi': return 'ri-smartphone-line';
      case 'credit card': return 'ri-bank-card-line';
      case 'paypal': return 'ri-paypal-line';
      default: return 'ri-money-dollar-circle-line';
    }
  };

  const handleDownloadInvoice = (invoiceNumber) => {
    // Implement invoice download logic
    console.log('Downloading invoice:', invoiceNumber);
    // You can add actual download logic here
    window.open(`${import.meta.env.VITE_API_URL}/invoice/download/${invoiceNumber}`, '_blank');
  };

  const handleDownloadReceipt = (receiptNumber) => {
    // Implement receipt download logic
    console.log('Downloading receipt:', receiptNumber);
    // You can add actual download logic here
    window.open(`${import.meta.env.VITE_API_URL}/payment/download-receipt/${receiptNumber}`, '_blank');
  };

  const handleViewDetails = (payment) => {
    // Implement view details logic
    console.log('Viewing details for payment:', payment);
    // You can add a modal or navigation to details page
  };

  const handleEditPayment = (payment) => {
    // Implement edit payment logic
    console.log('Editing payment:', payment);
    // You can add a modal for editing
  };

  const handleGenerateInvoice = (payment) => {
    // Implement generate invoice logic
    console.log('Generating invoice for payment:', payment);
    // You can add invoice generation logic here
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Check Payments</h1>
        <p className="text-gray-600">Monitor and manage studio user payments</p>
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
              Search by Project ID, Customer ID, Status, or Invoice Number
            </label>
            <input
              type="text"
              placeholder="Search payments..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <button
              onClick={fetchPayments}
              className="w-full md:w-auto px-4 py-2 bg-[#E07A5F] text-white rounded-md hover:bg-[#d96a4c] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex flex-row gap-4 flex-wrap">
        <div className="bg-white p-2 md:p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setStatusFilter('all')}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${statusFilter === 'all' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <i className={`text-xl ${statusFilter === 'all' ? 'ri-list-check text-blue-600' : 'ri-list-check text-gray-600'}`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 hidden md:inline">All</p>
              <p className={`text-lg font-semibold ${statusFilter === 'all' ? 'text-blue-900' : 'text-gray-900'}`}>
                {payments.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 md:p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setStatusFilter('completed')}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${statusFilter === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <i className={`text-xl ${statusFilter === 'completed' ? 'ri-check-line text-green-600' : 'ri-check-line text-gray-600'}`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 hidden md:inline">Completed</p>
              <p className={`text-lg font-semibold ${statusFilter === 'completed' ? 'text-green-900' : 'text-gray-900'}`}>
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 md:p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setStatusFilter('pending')}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${statusFilter === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <i className={`text-xl ${statusFilter === 'pending' ? 'ri-time-line text-yellow-600' : 'ri-time-line text-gray-600'}`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 hidden md:inline">Pending</p>
              <p className={`text-lg font-semibold ${statusFilter === 'pending' ? 'text-yellow-900' : 'text-gray-900'}`}>
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 md:p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setStatusFilter('failed')}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${statusFilter === 'failed' ? 'bg-red-100' : 'bg-gray-100'}`}>
              <i className={`text-xl ${statusFilter === 'failed' ? 'ri-close-line text-red-600' : 'ri-close-line text-gray-600'}`}></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 hidden md:inline">Failed</p>
              <p className={`text-lg font-semibold ${statusFilter === 'failed' ? 'text-red-900' : 'text-gray-900'}`}>
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Total
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Number
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.project_id}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.cust_id}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.inv_tot?.toLocaleString() || '0'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.amt_act?.toLocaleString() || '0'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.amt_bal?.toLocaleString() || '0'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.pymt_act_date ? new Date(payment.pymt_act_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">{payment.rct_no || '-'}</span>
                      {payment.rct_no && (
                        <button 
                          onClick={() => handleDownloadReceipt(payment.rct_no)}
                          className="text-[#E07A5F] hover:text-[#d0694a] p-1 rounded hover:bg-gray-100" 
                          title="Download Receipt"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <i className={`${getPaymentMethodIcon(payment.pymt_mode)} mr-2`}></i>
                      {payment.pymt_mode || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.status === 'completed' ? (
                      <>
                        <button 
                          onClick={() => handleViewDetails(payment)} 
                          className="text-[#E07A5F] hover:text-[#d0694a] mr-3 p-1 rounded hover:bg-gray-100" 
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDownloadReceipt(payment.rct_no)} 
                          className="text-[#E07A5F] hover:text-[#d0694a] p-1 rounded hover:bg-gray-100" 
                          title="Download Receipt"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditPayment(payment)} 
                          className="text-[#E07A5F] hover:text-[#d0694a] mr-3 p-1 rounded hover:bg-gray-100" 
                          title="Edit Payment"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleGenerateInvoice(payment)} 
                          className="text-[#E07A5F] hover:text-[#d0694a] p-1 rounded hover:bg-gray-100" 
                          title="Generate Invoice"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-money-dollar-circle-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
            <p className="text-sm text-gray-600">Total Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {filteredPayments.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {filteredPayments.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {filteredPayments.filter(p => p.status === 'failed').length}
            </p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPayment; 