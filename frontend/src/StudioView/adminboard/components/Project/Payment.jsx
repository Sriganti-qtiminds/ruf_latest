import React, { useState, useEffect } from 'react';

function Payment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredPayments, setFilteredPayments] = useState([]);

  // Fetch all user payment plans on component mount
  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  // Filter payments when search term or status filter changes
  useEffect(() => {
    const filtered = payments.filter(payment => {
      const matchesSearch = searchTerm === '' || 
        payment.project_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.cust_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.week_no?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || payment.pymt_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const fetchPaymentPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/userpayment/getAllUserPaymentPlans`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment plans');
      }
      
      const data = await response.json();
      setPayments(data.data || []);
    } catch (err) {
      console.error('Error fetching payment plans:', err);
      setError('Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (paymentId, updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/userpayment/updateUserPaymentPlan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentData: updatedData })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      setSuccess('Payment updated successfully');
      fetchPaymentPlans(); // Refresh the list
    } catch (err) {
      console.error('Error updating payment:', err);
      setError('Failed to update payment');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment plan?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/userpayment/deleteStudioUserPaymentPlan?id=${paymentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment plan');
      }

      setSuccess('Payment plan deleted successfully');
      fetchPaymentPlans(); // Refresh the list
    } catch (err) {
      console.error('Error deleting payment plan:', err);
      setError('Failed to delete payment plan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'partial': return 'Partial';
      case 'failed': return 'Failed';
      default: return 'Unknown';
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">User Payment Plans</h1>
        <p className="text-gray-600">Manage and track user payment plans</p>
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
              Search by Project ID, Customer ID, or Week Number
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
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <button
              onClick={fetchPaymentPlans}
              className="w-full md:w-auto px-4 py-2 bg-[#E07A5F] text-white rounded-md hover:bg-[#d96a4c] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.project_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.cust_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.week_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.pymt_pct}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.pymt_status)}`}>
                      {getStatusText(payment.pymt_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdatePayment(payment.id, [
                          { key: "cust_id", value: payment.cust_id },
                          { key: "project_id", value: payment.project_id },
                          { key: "week_no", value: payment.week_no },
                          { key: "pymt_pct", value: payment.pymt_pct }
                        ])}
                        className="text-[#E07A5F] hover:text-[#d96a4c] p-1 rounded hover:bg-gray-100"
                        title="Edit Payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100"
                        title="Delete Payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-money-dollar-circle-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No payment plans found</p>
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
              {filteredPayments.filter(p => p.pymt_status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {filteredPayments.filter(p => p.pymt_status === 'paid').length}
            </p>
            <p className="text-sm text-gray-600">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {filteredPayments.filter(p => p.pymt_status === 'partial').length}
            </p>
            <p className="text-sm text-gray-600">Partial</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;