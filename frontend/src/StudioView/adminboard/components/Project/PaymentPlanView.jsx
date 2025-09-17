import React, { useState } from 'react';
import ProjectWeekDistribution from './UserPaymentplan';

const PaymentPlanView = ({ 
  project, 
  paymentPlans, 
  formatShortDate, 
  getStatusColor,
  onClose 
}) => {
  // Invoice generation state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [projectTotalCost, setProjectTotalCost] = useState(0);
  const [invoiceForm, setInvoiceForm] = useState({
    wk_no: "",
    rcvr_cat_id: "",
    wkly_cost_pct: "",
    wkly_cost_amt: "",
    gst_cen_pct: "9",   // default 9
    gst_sta_pct: "9",   // default 9
    pen_amt: "",
    pyr_cat_id: "",
    pymt_due_date: "",
    pymt_act_date: "",
    inv_status: "1",
    total_with_tax: "",
  });
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  
  // Add/Edit Week form state
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [weekForm, setWeekForm] = useState({
    week_no: '',
    pymt_pct: ''
  });
  const [weekFormLoading, setWeekFormLoading] = useState(false);
  const [editingWeekId, setEditingWeekId] = useState(null);
  const calculateTotalWithTax = (amount, gstCen, gstSta) => {
    const amt = parseFloat(amount || 0);
    const gstCenPct = parseFloat(gstCen || 0);
    const gstStaPct = parseFloat(gstSta || 0);
    const totalGstPct = gstCenPct + gstStaPct;
    return (amt + (amt * totalGstPct / 100)).toFixed(2);
  };
  // Effect to ensure calculated values are properly set
  React.useEffect(() => {
    if (showInvoiceForm && selectedWeek) {
      const projectTotalCost = parseFloat(
        project?.total_cost || 
        project?.cost || 
        project?.budget || 
        project?.amount || 
        0
      );
      const weeklyPercentage = parseFloat(selectedWeek.pymt_pct || 0);
      const calculatedWeeklyCost = (projectTotalCost * weeklyPercentage) / 100;
      
      console.log('useEffect - Recalculating values:', {
        projectTotalCost,
        weeklyPercentage,
        calculatedWeeklyCost,
        currentForm: invoiceForm
      });
      
      setInvoiceForm(prev => ({
        ...prev,
        wkly_cost_amt: calculatedWeeklyCost.toFixed(2),
        total_with_tax: calculatedWeeklyCost.toFixed(2)
      }));
    }
  }, [showInvoiceForm, selectedWeek, project]);

  // Debug: Log project data to see what's available
  console.log('PaymentPlanView - Project data:', project);
  console.log('PaymentPlanView - Required fields:', {
    no_of_weeks: project?.no_of_weeks,
    project_id: project?.project_id || project?.id,
    cust_id: project?.cust_id,
    signup_percentage: project?.signup_percentage,
    signup_date: project?.signup_date,
    total_cost: project?.total_cost,
    cost: project?.cost,
    budget: project?.budget,
    amount: project?.amount
  });

  // Handle invoice form submission
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setInvoiceLoading(true);
    
    try {
      const invoiceData = [
        { key: "proj_id", value: project?.project_id || project?.id },
        { key: "wk_no", value: parseInt(invoiceForm.wk_no) },
        { key: "rcvr_cat_id", value: parseInt(invoiceForm.rcvr_cat_id) },
        { key: "wkly_cost_pct", value: parseFloat(invoiceForm.wkly_cost_pct) },
        { key: "wkly_cost_amt", value: parseFloat(invoiceForm.wkly_cost_amt) },
        { key: "gst_cen_pct", value: parseFloat(invoiceForm.gst_cen_pct) },
        { key: "gst_sta_pct", value: parseFloat(invoiceForm.gst_sta_pct) },
        { key: "pen_amt", value: parseFloat(invoiceForm.pen_amt) },
        { key: "pyr_cat_id", value: parseInt(invoiceForm.pyr_cat_id) },
        { key: "pymt_due_date", value: invoiceForm.pymt_due_date },
        { key: "pymt_act_date", value: invoiceForm.pymt_act_date },
        { key: "inv_status", value: parseInt(invoiceForm.inv_status) },
        { key: "total_with_tax", value: parseFloat(invoiceForm.total_with_tax) }
      ];

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoice/addinvoiceInfo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceData }),
        }
      );
      
      const data = await response.json();
      console.log("Invoice creation response:", data);
      
      if (response.ok && data.success) {
        alert(`Invoice created successfully for Week ${selectedWeek?.week_no || ''}!`);
        setShowInvoiceForm(false);
        setSelectedWeek(null);
        setInvoiceForm({
          wk_no: '',
          rcvr_cat_id: '',
          wkly_cost_pct: '',
          wkly_cost_amt: '',
          gst_cen_pct: '',
          gst_sta_pct: '',
          pen_amt: '',
          pyr_cat_id: '',
          pymt_due_date: '',
          pymt_act_date: '',
          inv_status: '1',
          total_with_tax:''
        });
      } else {
        alert(`Failed to create invoice: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice. Please try again.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setInvoiceForm(prev => {
      const updatedForm = { ...prev, [field]: value };
  
      // Recalculate weekly amount when % changes
      if (field === "wkly_cost_pct") {
        const projectTotalCost = parseFloat(
          project?.total_cost ||
          project?.cost ||
          project?.budget ||
          project?.amount ||
          0
        );
        const weeklyPercentage = parseFloat(value || 0);
        const calculatedWeeklyCost = (projectTotalCost * weeklyPercentage) / 100;
        updatedForm.wkly_cost_amt = calculatedWeeklyCost.toFixed(2);
      }
  
      // Always recalc total_with_tax
      updatedForm.total_with_tax = calculateTotalWithTax(
        updatedForm.wkly_cost_amt,
        updatedForm.gst_cen_pct,
        updatedForm.gst_sta_pct
      );
  
      return updatedForm;
    });
  };  


  // Handle week-specific invoice generation
  const handleWeekInvoiceGeneration = (weekPlan) => {
    // Calculate weekly cost amount based on project total cost and weekly percentage
    // Try different possible field names for total cost
    const projectTotalCost = parseFloat(
      project?.total_cost || 
      project?.cost || 
      project?.budget || 
      project?.amount || 
      0
    );
    const weeklyPercentage = parseFloat(weekPlan.pymt_pct || 0);
    const calculatedWeeklyCost = (projectTotalCost * weeklyPercentage) / 100;
    
    console.log('Invoice Generation Calculation:', {
      projectTotalCost,
      weeklyPercentage,
      calculatedWeeklyCost,
      weekPlan,
      project: project
    });
    
    setSelectedWeek(weekPlan);
    
    // Ensure the calculated value is properly formatted
    const formattedWeeklyCost = calculatedWeeklyCost.toFixed(2);
    
    console.log('Setting invoice form with calculated values:', {
      calculatedWeeklyCost,
      formattedWeeklyCost,
      weeklyPercentage,
      projectTotalCost
    });
    
    setInvoiceForm({
      wk_no: weekPlan.week_no || '',
      rcvr_cat_id: '',
      wkly_cost_pct: weekPlan.pymt_pct || '',
      wkly_cost_amt: formattedWeeklyCost,
      gst_cen_pct: '',
      gst_sta_pct: '',
      pen_amt: '',
      pyr_cat_id: '',
      pymt_due_date: weekPlan.week_due_date ? weekPlan.week_due_date.split(' ')[0] : '',
      pymt_act_date: weekPlan.week_invoice_date ? weekPlan.week_invoice_date.split(' ')[0] : '',
      inv_status: weekPlan.payment_status === 1 ? '1' : '0',
      total_with_tax: formattedWeeklyCost
    });
    setShowInvoiceForm(true);
  };


  // Handle form input changes
  const handleWeekFormChange = (field, value) => {
    setWeekForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle opening add week form
  const handleAddWeek = () => {
    setWeekForm({ week_no: '', pymt_pct: '' });
    setEditingWeekId(null);
    setShowWeekForm(true);
  };

  // Handle opening edit week form
  const handleEditWeek = (weekPlan) => {
    setWeekForm({
      week_no: weekPlan.week_no.toString(),
      pymt_pct: weekPlan.pymt_pct?.toString() || ''
    });
    setEditingWeekId(weekPlan.id);
    setShowWeekForm(true);
  };

  // Handle week form submission
  const handleWeekFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!weekForm.week_no || !weekForm.pymt_pct) {
      alert('Please fill in all required fields');
      return;
    }

    setWeekFormLoading(true);

    try {
      const projectId = project?.project_id || project?.id;
      const custId = project?.cust_id;
      
      if (!projectId || !custId) {
        alert('Missing project or customer information');
        return;
      }

      const paymentData = [
        { key: "cust_id", value: custId },
        { key: "project_id", value: projectId },
        { key: "week_no", value: parseInt(weekForm.week_no) },
        { key: "pymt_pct", value: parseFloat(weekForm.pymt_pct) }
      ];

      // Add ID for edit mode
      if (editingWeekId) {
        paymentData.push({ key: "id", value: editingWeekId });
      }

      console.log('Payment Data Payload:', paymentData);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/userpayment/addNewUserPayment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentData }),
        }
      );
      
      const data = await response.json();
      console.log('User payment response:', data);
      
      if (response.ok && data.success) {
        alert(`Week ${weekForm.week_no} ${editingWeekId ? 'updated' : 'added'} successfully!`);
        setShowWeekForm(false);
        setWeekForm({ week_no: '', pymt_pct: '' });
        setEditingWeekId(null);
        // Optionally refresh the data or close the view
        onClose();
      } else {
        alert(`Failed to ${editingWeekId ? 'update' : 'add'} week: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving week:', error);
      alert('Error saving week. Please try again.');
    } finally {
      setWeekFormLoading(false);
    }
  };

  // Handle deleting individual week
  const handleDeleteWeek = async (weekPlan) => {
    const projectName = project?.project_name || `Project #${project?.id}`;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete Week ${weekPlan.week_no} for "${projectName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/userpayment/deleteUserPaymentplan?id=${weekPlan.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert(`Successfully deleted Week ${weekPlan.week_no}`);
        // Optionally refresh the data or close the view
        onClose();
      } else {
        alert(`Failed to delete Week ${weekPlan.week_no}. Please try again.`);
      }
    } catch (error) {
      console.error('Error deleting payment plan:', error);
      alert('Error deleting payment plan. Please try again.');
    }
  };

  return (
    <div className="px-8 mb-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Weekly Payment Plan</h2>
            <p className="text-gray-600 mt-1">
              {project?.project_name || `Project #${project?.id}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const projectId = project?.project_id || project?.id;
              const hasPlans = paymentPlans.some(plan => 
                plan.project_id?.toString() === projectId?.toString()
              );
              
              return hasPlans ? (
                <button
                  onClick={handleAddWeek}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Week
                </button>
              ) : null;
            })()}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <i className="ri-close-line text-2xl text-gray-500"></i>
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-2 text-sm">
            {(() => {
              const projectId = project?.id;
              const plans = paymentPlans
                .filter(p => p.project_id?.toString() === projectId?.toString())
                .sort((a, b) => (a.week_no ?? 0) - (b.week_no ?? 0));
              
              if(!plans.length) {
                // Use the exact project fields as requested
                const planProject = {
                  no_of_weeks: project.no_of_weeks || 0,
                  project_id: project.project_id || project.id,
                  cust_id: project.cust_id,
                  signup_percentage: project.signup_percentage !== undefined ? project.signup_percentage : 0,
                  signup_date: project.signup_date,
                  signuptime: project.signuptime,
                };

                console.log('PaymentPlanView - planProject object:', planProject);
                console.log('PaymentPlanView - signup_percentage type:', typeof planProject.signup_percentage, 'value:', planProject.signup_percentage);
                console.log('PaymentPlanView - signup_date type:', typeof planProject.signup_date, 'value:', planProject.signup_date);
                console.log('PaymentPlanView - signuptime type:', typeof planProject.signuptime, 'value:', planProject.signuptime);

                return (
                  <div className="space-y-2">
                    <div className="text-gray-500">
                      No weekly payment plan available. Create one:
                    </div>
                    <ProjectWeekDistribution project={planProject} />
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {plans.map(plan => (
                    <div key={plan.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Week {plan.week_no ?? '-'}</div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(plan.payment_status)}`}>
                          {plan.payment_status === 1 ? 'Paid' : plan.payment_status === 0 ? 'Pending' : 'Unknown'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-700 mb-2">
                        <div>Pymt %: <span className="font-medium">{plan.pymt_pct != null ? plan.pymt_pct + '%' : '-'}</span></div>
                        <div>Invoice: <span className="font-medium">{formatShortDate(plan.week_invoice_date)}</span></div>
                        <div>Due: <span className="font-medium">{formatShortDate(plan.week_due_date)}</span></div>
                        {plan.addl_notes && (<div className="col-span-2">Notes: <span className="font-medium">{plan.addl_notes}</span></div>)}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditWeek(plan)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                          title="Edit Week"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteWeek(plan)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors"
                          title="Delete Week"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                        <button
                          onClick={() => handleWeekInvoiceGeneration(plan)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors"
                        >
                          <i className="ri-file-download-line mr-1"></i>
                          Generate Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Invoice Generation Form */}
        {showInvoiceForm && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Generate Invoice for Week {selectedWeek?.week_no || ''}
              </h3>
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                  <input
                    type="number"
                    readOnly
                    value={invoiceForm.wk_no}
                    onChange={(e) => handleFormChange('wk_no', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Receiver Category
  </label>
  <select
    value={invoiceForm.rcvr_cat_id}
    onChange={(e) => handleFormChange('rcvr_cat_id', e.target.value)}
    className="w-full border rounded-lg p-2"
    required
  >
    <option value="">Select Category</option>
    <option value="6">Vendor</option>
    <option value="1">Company</option>
    <option value="8">Third Party</option>
  </select>
</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Cost %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceForm.wkly_cost_pct}
                    onChange={(e) => handleFormChange('wkly_cost_pct', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Cost Amount</label>
                  <input
                    type="text"
                    value={(() => {
                      const projectTotalCost = parseFloat(
                        project?.total_cost || 
                        project?.cost || 
                        project?.budget || 
                        project?.amount || 
                        0
                      );
                      const weeklyPercentage = parseFloat(invoiceForm.wkly_cost_pct || 0);
                      const calculated = (projectTotalCost * weeklyPercentage) / 100;
                      return calculated.toFixed(2);
                    })()}
                    className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                    readOnly
                    title="Automatically calculated from project total cost and weekly percentage"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculated: ₹{(() => {
                      const projectTotalCost = parseFloat(
                        project?.total_cost || 
                        project?.cost || 
                        project?.budget || 
                        project?.amount || 
                        0
                      );
                      return projectTotalCost;
                    })()} × {invoiceForm.wkly_cost_pct || 0}% = ₹{(() => {
                      const projectTotalCost = parseFloat(
                        project?.total_cost || 
                        project?.cost || 
                        project?.budget || 
                        project?.amount || 
                        0
                      );
                      const weeklyPercentage = parseFloat(invoiceForm.wkly_cost_pct || 0);
                      return ((projectTotalCost * weeklyPercentage) / 100).toFixed(2);
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Central %</label>
                  <input
                    type="integer"
                    step="0.01"
                    value={invoiceForm.gst_cen_pct}
                    onChange={(e) => handleFormChange('gst_cen_pct', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST State %</label>
                  <input
                    type="integer"
                    step="0.01"
                    value={invoiceForm.gst_sta_pct}
                    onChange={(e) => handleFormChange('gst_sta_pct', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Amount</label>
                  <input
                    type="integer"
                    step="0.01"
                    value={invoiceForm.pen_amt}
                    onChange={(e) => handleFormChange('pen_amt', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Payer Category
  </label>
  <select
    value={invoiceForm.pyr_cat_id}
    onChange={(e) => handleFormChange('pyr_cat_id', e.target.value)}
    className="w-full border rounded-lg p-2"
    required
  >
    <option value="">Select Category</option>
    <option value="3">Customer</option>
    <option value="2">Company</option>
    
  </select>
</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.pymt_due_date}
                    onChange={(e) => handleFormChange('pymt_due_date', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Actual Date</label>
                  <input
                    type="date"
                    value={invoiceForm.pymt_act_date}
                    onChange={(e) => handleFormChange('pymt_act_date', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Status</label>
                  <select
                    value={invoiceForm.inv_status}
                    onChange={(e) => handleFormChange('inv_status', e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  >
                    <option value="1">Paid</option>
                    <option value="0">Pending</option>
                  </select>
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Total With Tax</label>
                   <input
                     type="text"
                     value={(() => {
                       const projectTotalCost = parseFloat(
                         project?.total_cost || 
                         project?.cost || 
                         project?.budget || 
                         project?.amount || 
                         0
                       );
                       const weeklyPercentage = parseFloat(invoiceForm.wkly_cost_pct || 0);
                       const gstCenPct = parseFloat(invoiceForm.gst_cen_pct || 0);
                       const gstStaPct = parseFloat(invoiceForm.gst_sta_pct || 0);
                       const totalGstPct = gstCenPct + gstStaPct;
                       const calculated = (projectTotalCost * weeklyPercentage) / 100 + ((projectTotalCost * weeklyPercentage) / 100 * totalGstPct / 100);
                       return calculated.toFixed(2);
                     })()}
                     className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                     readOnly
                     title="Automatically calculated from weekly cost amount"
                   />
                 </div>
                
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invoiceLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invoiceLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Invoice'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add/Edit Week Form */}
        {showWeekForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingWeekId ? 'Edit Week' : 'Add Week'}
                </h3>
                <button
                  onClick={() => setShowWeekForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleWeekFormSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Week Number *
                    </label>
                    <select
                      value={weekForm.week_no}
                      onChange={(e) => handleWeekFormChange('week_no', e.target.value)}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="">Select Week</option>
                      {(() => {
                        const totalWeeks = project?.no_of_weeks || 0;
                        const existingWeeks = paymentPlans
                          .filter(plan => plan.project_id?.toString() === (project?.project_id || project?.id)?.toString())
                          .map(plan => plan.week_no);
                        
                        const weekOptions = [];
                        for (let i = 1; i <= totalWeeks; i++) {
                          // Skip week 0 (signup) and existing weeks (unless editing)
                          if (i !== 0 && (!existingWeeks.includes(i) || editingWeekId)) {
                            weekOptions.push(
                              <option key={i} value={i}>
                                Week {i}
                              </option>
                            );
                          }
                        }
                        return weekOptions;
                      })()}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Percentage (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={weekForm.pymt_pct}
                      onChange={(e) => handleWeekFormChange('pymt_pct', e.target.value)}
                      className="w-full border rounded-lg p-2"
                      placeholder="Enter percentage"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowWeekForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={weekFormLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {weekFormLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        {editingWeekId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingWeekId ? 'Update Week' : 'Add Week'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentPlanView;
