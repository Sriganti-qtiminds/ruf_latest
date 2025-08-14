import React, { useState, useEffect } from 'react';

function AddProject() {
  const [form, setForm] = useState({
    project_name: '',
    site_mgr_id: '',
    budget_cat: '',
    cust_id: '',
    cust_flat: '',
    cust_community: '',
    cust_address: '',
    total_cost: '',
    total_paid: '',
    total_balance: '',
    signup_date: '',
    signup_percentage: '',
    weeks_planned: '',
    weeks_buffer: '',
    weeks_total: '',
    tnt_start_date: '',
    est_end_date: '',
    act_end_date: '',
    current_status: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentsPopup, setShowPaymentsPopup] = useState(false);
  const [weeklyPayments, setWeeklyPayments] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [paymentDates, setPaymentDates] = useState({});

  // Automatic balance calculation
  useEffect(() => {
    const cost = parseFloat(form.total_cost) || 0;
    const paid = parseFloat(form.total_paid) || 0;
    setForm(prev => ({ ...prev, total_balance: cost - paid }));
  }, [form.total_cost, form.total_paid]);

  // Automatic weeks total calculation
  useEffect(() => {
    const planned = parseInt(form.weeks_planned) || 0;
    const buffer = parseInt(form.weeks_buffer) || 0;
    setForm(prev => ({ ...prev, weeks_total: planned + buffer }));
  }, [form.weeks_planned, form.weeks_buffer]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };


  const formatBackendDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validate required fields
    const requiredFields = [
      "project_name", "site_mgr_id", "budget_cat", "cust_id", 
      "cust_flat", "cust_community", "cust_address", "total_cost",
      "signup_date", "signup_percentage", "weeks_planned", "weeks_buffer",
      "tnt_start_date", "current_status"
    ];
    
    for (let field of requiredFields) {
      if (!form[field]) {
        setError(`Please fill in ${field.replace(/_/g, ' ')}.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      // Format the data for backend
      const projectData = Object.entries(form)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => ({ 
          key, 
          value: key.endsWith('_date') ? formatBackendDate(value) : value 
        }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/project/addstudioproject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add project');
      }
      
      setSuccess('Project added successfully!');
      setProjectId(data.projectId);
      calculateWeeklyPayments(data.projectId);
      setShowPaymentsPopup(true);
      // Reset form
      setForm({
        project_name: '',
        site_mgr_id: '',
        budget_cat: '',
        cust_id: '',
        cust_flat: '',
        cust_community: '',
        cust_address: '',
        total_cost: '',
        total_paid: '',
        total_balance: '',
        signup_date: '',
        signup_percentage: '',
        weeks_planned: '',
        weeks_buffer: '',
        weeks_total: '',
        tnt_start_date: '',
        est_end_date: '',
        act_end_date: '',
        current_status: ''
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to add project.');
    }
    
    setSubmitting(false);
  };
  const calculateWeeklyPayments = (projectId) => {
    const totalWeeks = parseInt(form.weeks_total) || 0;
    const balance = parseFloat(form.total_balance) || 0;
    const custId = form.cust_id;
    
    if (totalWeeks <= 0 || balance <= 0) return;

    const weeklyAmount = balance / totalWeeks;
    const weeklyPercentage = (weeklyAmount / parseFloat(form.total_cost)) * 100;
    
    const payments = Array.from({ length: totalWeeks }, (_, i) => ({
      week_no: i + 1,
      amount: weeklyAmount,
      percentage: weeklyPercentage,
      cust_id: custId,
      project_id: projectId,
      status: 'pending', // pending/paid/partial
      paid_amount: 0,
      payment_date: null
    }));

    setWeeklyPayments(payments);
    
    // Initialize status and dates for each week
    const initialStatus = {};
    const initialDates = {};
    payments.forEach(payment => {
      initialStatus[payment.week_no] = 'pending';
      initialDates[payment.week_no] = '';
    });
    setPaymentStatus(initialStatus);
    setPaymentDates(initialDates);
  };

  const handlePaymentStatusChange = (weekNo, value) => {
    setPaymentStatus(prev => ({
      ...prev,
      [weekNo]: value
    }));
  };

  const handlePaymentDateChange = (weekNo, date) => {
    setPaymentDates(prev => ({
      ...prev,
      [weekNo]: date
    }));
  };

  const handlePaidAmountChange = (weekNo, amount) => {
    setWeeklyPayments(prev => 
      prev.map(payment => 
        payment.week_no === weekNo
          ? { ...payment, paid_amount: parseFloat(amount) || 0 }
          : payment
      )
    );
  };

  const handlePaymentSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
  
    try {
      // Show loading state in UI
      setPaymentStatus(prev => {
        const newStatus = {...prev};
        Object.keys(newStatus).forEach(week => {
          newStatus[week] = 'processing'; // Temporary status
        });
        return newStatus;
      });
  
      // Send each weekly payment separately
      for (const payment of weeklyPayments) {
        const currentStatus = paymentStatus[payment.week_no] || 'pending';
        const currentDate = paymentDates[payment.week_no] || '';
        
        // Prepare individual payment data
        const paymentData = [
          { key: "cust_id", value: payment.cust_id },
          { key: "project_id", value: payment.project_id },
          { key: "week_no", value: payment.week_no },
          { key: "pymt_pct", value: payment.percentage },
          { key: "pymt_status", value: currentStatus },
          { key: "pymt_amount", value: payment.paid_amount },
          { key: "pymt_date", value: currentDate ? formatBackendDate(currentDate) : null }
        ];
  
        // Send individual payment to backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/userpayment/addNewUserPayment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentData })
        });
  
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Week ${payment.week_no}: ${errorData.message || 'Payment failed'}`);
        }
  
        // Update status for this specific week
        setPaymentStatus(prev => ({
          ...prev,
          [payment.week_no]: currentStatus === 'processing' ? 'paid' : currentStatus
        }));
      }
  
      setSuccess('All weekly payments saved successfully!');
      setTimeout(() => {
        setShowPaymentsPopup(false);
        // Reset form and states
        setForm({
          project_name: '',
          site_mgr_id: '',
          budget_cat: '',
          cust_id: '',
          cust_flat: '',
          cust_community: '',
          cust_address: '',
          total_cost: '',
          total_paid: '',
          total_balance: '',
          signup_date: '',
          signup_percentage: '',
          weeks_planned: '',
          weeks_buffer: '',
          weeks_total: '',
          tnt_start_date: '',
          est_end_date: '',
          act_end_date: '',
          current_status: ''
        });
        setWeeklyPayments([]);
        setPaymentStatus({});
        setPaymentDates({});
        setProjectId(null);
      }, 1500); // Give user time to see success message
  
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      
      // Revert any processing statuses
      setPaymentStatus(prev => {
        const newStatus = {...prev};
        Object.keys(newStatus).forEach(week => {
          if (newStatus[week] === 'processing') {
            newStatus[week] = 'pending';
          }
        });
        return newStatus;
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Project</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-center">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Project Information */}
          <div className="md:col-span-2 lg:col-span-3 border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700">Project Information</h3>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Project Name*</label>
            <input className="w-full border rounded-lg p-2" type="text" name="project_name" value={form.project_name} onChange={handleFormChange} required />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Site Manager ID*</label>
            <input className="w-full border rounded-lg p-2" type="text" name="site_mgr_id" value={form.site_mgr_id} onChange={handleFormChange} required />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Budget Category*</label>
            <select 
              className="w-full border rounded-lg p-2" 
              name="budget_cat" 
              value={form.budget_cat} 
              onChange={handleFormChange} 
              required
            >
              <option value="">Select Category</option>
              <option value="1">Elegant</option>
              <option value="2">Luxury</option>
              <option value="3">Premium</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Current Status*</label>
            <select className="w-full border rounded-lg p-2" name="current_status" value={form.current_status} onChange={handleFormChange} required>
              <option value="">Select Status</option>
              <option value="1">Planning</option>
              <option value="2">Pre-production</option>
              <option value="3">Production</option>
              <option value="4">Post-production</option>
              <option value="5">Completed</option>
            </select>
          </div>

          {/* Customer Information */}
          <div className="md:col-span-2 lg:col-span-3 border-b pb-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Customer Information</h3>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Customer ID*</label>
            <input className="w-full border rounded-lg p-2" type="text" name="cust_id" value={form.cust_id} onChange={handleFormChange} required />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Flat No.*</label>
            <input className="w-full border rounded-lg p-2" type="text" name="cust_flat" value={form.cust_flat} onChange={handleFormChange} required />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Community*</label>
            <input className="w-full border rounded-lg p-2" type="text" name="cust_community" value={form.cust_community} onChange={handleFormChange} required />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-1 font-semibold">Address*</label>
            <input className="w-full border rounded-lg p-2" type="text" name="cust_address" value={form.cust_address} onChange={handleFormChange} required />
          </div>

          {/* Financial Information */}
          <div className="md:col-span-2 lg:col-span-3 border-b pb-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Financial Information</h3>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Total Cost (₹)*</label>
            <input className="w-full border rounded-lg p-2" type="number" name="total_cost" value={form.total_cost} onChange={handleFormChange} required />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Amount Paid (₹)</label>
            <input 
              className="w-full border rounded-lg p-2" 
              type="number" 
              name="total_paid" 
              value={form.total_paid} 
              onChange={handleFormChange} 
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Balance (₹)</label>
            <input className="w-full border rounded-lg p-2 bg-gray-100" type="number" name="total_balance" value={form.total_balance} readOnly />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Signup Percentage*</label>
            <input className="w-full border rounded-lg p-2" type="number" step="0.01" name="signup_percentage" value={form.signup_percentage} onChange={handleFormChange} required />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Signup Date*</label>
            <input className="w-full border rounded-lg p-2" type="datetime-local" name="signup_date" value={form.signup_date} onChange={handleFormChange} required />
          </div>

          {/* Timeline Information */}
          <div className="md:col-span-2 lg:col-span-3 border-b pb-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Timeline Information</h3>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Weeks Planned*</label>
            <input 
              className="w-full border rounded-lg p-2" 
              type="number" 
              name="weeks_planned" 
              value={form.weeks_planned} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Weeks Buffer*</label>
            <input 
              className="w-full border rounded-lg p-2" 
              type="number" 
              name="weeks_buffer" 
              value={form.weeks_buffer} 
              onChange={handleFormChange} 
              required 
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Total Weeks</label>
            <input className="w-full border rounded-lg p-2 bg-gray-100" type="number" name="weeks_total" value={form.weeks_total} readOnly />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold">Tentative Start Date*</label>
            <input className="w-full border rounded-lg p-2" type="datetime-local" name="tnt_start_date" value={form.tnt_start_date} onChange={handleFormChange} required />
          </div>
          
          
        </div>

        <div className="flex justify-center">
          <button 
            type="submit" 
            className="bg-[#E07A5F] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#d96a4c] transition" 
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      </form>
      {showPaymentsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
            <h3 className="text-xl font-bold mb-4">Weekly Payment Plan</h3>
            {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
            {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
            <p className="mb-4">
              Total Balance: ₹{form.total_balance} | 
              Total Weeks: {form.weeks_total} | 
              Average Weekly Payment: ₹{(form.total_balance / form.weeks_total).toFixed(2)}
            </p>
            
            <div className="max-h-96 overflow-y-auto mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Week</th>
                    <th className="p-2 border">Amount (₹)</th>
                    <th className="p-2 border">Percentage (%)</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Paid Amount</th>
                    <th className="p-2 border">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyPayments.map((payment) => (
                    <tr key={payment.week_no} className="border-b">
                      <td className="p-2 border text-center">{payment.week_no}</td>
                      <td className="p-2 border text-center">
                        {(payment.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-2 border text-center">
                        {payment.percentage.toFixed(2)}%
                      </td>
                      <td className="p-2 border">
                        <select
                          className="w-full p-1 border rounded"
                          value={paymentStatus[payment.week_no] || 'pending'}
                          onChange={(e) => handlePaymentStatusChange(payment.week_no, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-1 border rounded"
                          value={payment.paid_amount}
                          onChange={(e) => handlePaidAmountChange(payment.week_no, e.target.value)}
                          disabled={paymentStatus[payment.week_no] !== 'partial'}
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="date"
                          className="w-full p-1 border rounded"
                          value={paymentDates[payment.week_no] || ''}
                          onChange={(e) => handlePaymentDateChange(payment.week_no, e.target.value)}
                          disabled={paymentStatus[payment.week_no] === 'pending'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Total Allocated: {weeklyPayments.reduce((sum, p) => sum + p.paid_amount, 0).toFixed(2)} / {form.total_balance}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowPaymentsPopup(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#E07A5F] text-white rounded hover:bg-[#d96a4c] disabled:opacity-50"
                  onClick={handlePaymentSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Saving Payments...' : 'Save Payment Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default AddProject;