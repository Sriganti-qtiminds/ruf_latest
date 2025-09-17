import React, { useState } from "react";

export default function ProjectWeekDistribution({ project }) {
  console.log('ProjectWeekDistribution received project:', project);
  const { no_of_weeks, project_id, cust_id, signup_percentage, signup_date, signuptime } = project;
  
  // Use signup_date if available, otherwise fall back to signuptime
  const effectiveSignupDate = signup_date || signuptime;
  console.log('Destructured values:', { no_of_weeks, project_id, cust_id, signup_percentage, signup_date, signuptime, effectiveSignupDate });

  const [weeks, setWeeks] = useState([]);
  const [form, setForm] = useState({
    week_no: "",
    pct: "",
    invoiceDate: "",
    dueDate: "",
  });
  const [editingWeek, setEditingWeek] = useState(null);
  const [editForm, setEditForm] = useState({
    pct: "",
    invoiceDate: "",
    dueDate: "",
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWeekForInvoice, setSelectedWeekForInvoice] = useState(null);

  // Helper function to calculate total percentage correctly (avoiding double counting week 0)
  const calculateTotalPercentage = () => {
    const signupPct = parseFloat(project.signup_percentage || 0);
    const weeksPct = weeks.filter(w => w.week_no !== 0).reduce((sum, w) => sum + w.pct, 0);
    return signupPct + weeksPct;
  };

  // Function to fetch invoice data
  const handleViewInvoice = async (week) => {
    if (showInvoice && selectedWeekForInvoice?.week_no === week.week_no) {
      setShowInvoice(false);
      setInvoiceData(null);
      setSelectedWeekForInvoice(null);
      return;
    }

    setSelectedWeekForInvoice(week);
    setInvoiceLoading(true);
    setInvoiceError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoice/getinvoiceInfo?proj_id=${project_id}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoice data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Invoice API Response:", data);
      
      if (data.success && data.result) {
        setInvoiceData(data.result);
        setShowInvoice(true);
      } else {
        setInvoiceError("No invoice data found");
      }
    } catch (err) {
      console.error("Error fetching invoice data:", err);
      setInvoiceError("Failed to fetch invoice data");
    } finally {
      setInvoiceLoading(false);
    }
  };

  // helper for date formatting compatible with <input type="datetime-local">
const formatForInput = (date) => date.toISOString().slice(0, 16);

// signup date object - use effective signup date (signup_date or signuptime)
const signupDateObj = effectiveSignupDate ? new Date(effectiveSignupDate) : null;

// project end date = signup + total weeks * 7 days
const projectEndDate = signupDateObj
  ? new Date(signupDateObj.getTime() + no_of_weeks * 7 * 86400000)
  : null;


  // Initialize week 0 with signup percentage if signup date exists
  React.useEffect(() => {
    console.log('useEffect triggered with:', { signup_date, signuptime, effectiveSignupDate, signup_percentage, project });
    
    if (effectiveSignupDate && (signup_percentage !== undefined && signup_percentage !== null)) {
      const signupDate = new Date(effectiveSignupDate);
      const dueDate = new Date(signupDate.getTime() + 2 * 86400000); // 2 days later
      
      const week0 = {
        week_no: 0,
        pct: parseFloat(signup_percentage),
        invoiceDate: formatDate(signupDate),
        dueDate: formatDate(dueDate),
        isSignupWeek: true // Mark as signup week
      };
      
      console.log('Creating Week 0 object:', week0);
      
      // Always set week 0 if signup data exists
      setWeeks(prev => {
        const hasWeek0 = prev.some(week => week.week_no === 0);
        console.log('Current weeks:', prev, 'Has week 0:', hasWeek0);
        if (!hasWeek0) {
          console.log('Adding Week 0:', week0);
          return [week0, ...prev];
        }
        console.log('Week 0 already exists, not adding');
        return prev;
      });
    } else {
      console.log('Missing signup data:', { signup_date, signup_percentage });
      // If we have signup date but no signup_percentage, create week 0 with 0%
      if (effectiveSignupDate && (signup_percentage === undefined || signup_percentage === null)) {
        console.log('Creating Week 0 with 0% signup percentage');
        const signupDate = new Date(effectiveSignupDate);
        const dueDate = new Date(signupDate.getTime() + 2 * 86400000);
        
        const week0 = {
          week_no: 0,
          pct: 0,
          invoiceDate: formatDate(signupDate),
          dueDate: formatDate(dueDate),
          isSignupWeek: true
        };
        
        setWeeks(prev => {
          const hasWeek0 = prev.some(week => week.week_no === 0);
          if (!hasWeek0) {
            console.log('Adding Week 0 with 0%:', week0);
            return [week0, ...prev];
          }
          return prev;
        });
      }
    }
  }, [effectiveSignupDate, signup_percentage]);

  // format date to "YYYY-MM-DD HH:mm:ss"
  const formatDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (week) => {
    if (week.isSignupWeek) {
      alert("Week 0 (Signup) cannot be edited!");
      return;
    }
    setEditingWeek(week);
    setEditForm({
      pct: week.pct.toString(),
      invoiceDate: week.invoiceDate,
      dueDate: week.dueDate,
    });
  };

  const cancelEdit = () => {
    setEditingWeek(null);
    setEditForm({ pct: "", invoiceDate: "", dueDate: "" });
  };

  const saveEdit = () => {
    if (!editForm.pct || !editForm.invoiceDate) {
      alert("Please fill all required fields!");
      return;
    }

    const dueDate = editForm.dueDate
      ? editForm.dueDate
      : formatDate(new Date(new Date(editForm.invoiceDate).getTime() + 2 * 86400000));

    setWeeks((prev) =>
      prev.map((week) =>
        week.week_no === editingWeek.week_no
          ? {
              ...week,
              pct: parseFloat(editForm.pct),
              invoiceDate: editForm.invoiceDate,
              dueDate,
            }
          : week
      )
    );

    setEditingWeek(null);
    setEditForm({ pct: "", invoiceDate: "", dueDate: "" });
  };

  const deleteWeek = (weekToDelete) => {
    if (weekToDelete.isSignupWeek) {
      alert("Week 0 (Signup) cannot be deleted!");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete Week ${weekToDelete.week_no}?`)) {
      setWeeks((prev) => prev.filter((week) => week.week_no !== weekToDelete.week_no));
    }
  };

  const addWeekEntry = () => {
    if (!form.week_no || !form.pct || !form.invoiceDate) {
      alert("Please fill all required fields!");
      return;
    }

    // Prevent adding week 0 manually
    if (parseInt(form.week_no) === 0) {
      alert("Week 0 (Signup) is automatically created and cannot be modified!");
      return;
    }

    // Check if week already exists
    const weekExists = weeks.some(week => week.week_no === parseInt(form.week_no));
    if (weekExists) {
      alert("This week already exists!");
      return;
    }

    const dueDate = form.dueDate
      ? form.dueDate
      : formatDate(new Date(new Date(form.invoiceDate).getTime() + 2 * 86400000)); 

    setWeeks((prev) => [
      ...prev,
      {
        week_no: parseInt(form.week_no),
        pct: parseFloat(form.pct),
        invoiceDate: form.invoiceDate,
        dueDate,
        isSignupWeek: false
      },
    ]);

    // reset form and close add form
    setForm({ week_no: "", pct: "", invoiceDate: "", dueDate: "" });
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    // Calculate total percentage including signup percentage
    const totalPercentage = calculateTotalPercentage();
    const signupPct = parseFloat(project.signup_percentage || 0);
    const weeksPct = weeks.filter(w => w.week_no !== 0).reduce((sum, w) => sum + w.pct, 0);
    
    // Check if total is exactly 100.00%
    if (Math.abs(totalPercentage - 100.00) > 0.01) {
      alert(`Cannot submit payment plan. Total percentage must be exactly 100.00%. Current total: ${totalPercentage.toFixed(2)}% (Signup: ${signupPct}% + Weeks: ${weeksPct.toFixed(2)}%)`);
      return;
    }

    // Check if there are any weeks to submit
    if (weeks.length === 0) {
      alert("Please add at least one week to the payment plan before submitting.");
      return;
    }

    try {
      // First, submit Week 0 (signup percentage) if signup date exists
      if (effectiveSignupDate) {
        console.log('Submitting Week 0 (signup) with:', { signupPct, effectiveSignupDate, signup_date, signuptime, cust_id, project_id });
        
        const signupDate = new Date(effectiveSignupDate);
        const signupDueDate = new Date(signupDate.getTime() + 2 * 86400000); // 2 days later
        
        const signupPayload = {
          paymentData: [
            { key: "cust_id", value: cust_id },
            { key: "project_id", value: project_id },
            { key: "week_no", value: 0 },
            { key: "pymt_pct", value: signupPct },
            { key: "payment_status", value: 1 },
            { key: "addl_notes", value: "signup payment" },
            { key: "week_invoice_date", value: formatDate(signupDate) },
            { key: "week_due_date", value: formatDate(signupDueDate) },
          ],
        };

        console.log('Week 0 payload:', signupPayload);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/userpayment/addNewUserPaymentplan`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupPayload),
          }
        );
        
        const responseData = await response.json();
        console.log('Week 0 submission response:', responseData);
        
        if (!response.ok) {
          throw new Error(`Week 0 submission failed: ${responseData.message || response.statusText}`);
        }
      } else {
        console.log('Skipping Week 0 submission - no signup date available (neither signup_date nor signuptime)');
      }

      // Then submit all weekly payments
      for (let week of weeks) {
        const payload = {
          paymentData: [
            { key: "cust_id", value: cust_id },
            { key: "project_id", value: project_id },
            { key: "week_no", value: week.week_no },
            { key: "pymt_pct", value: week.pct },
            { key: "payment_status", value: 1 },
            { key: "addl_notes", value: "manual payments" },
            { key: "week_invoice_date", value: week.invoiceDate },
            { key: "week_due_date", value: week.dueDate },
          ],
        };

        await fetch(
          `${import.meta.env.VITE_API_URL}/userpayment/addNewUserPaymentplan`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }
      alert("Payment plan submitted successfully!");
    } catch (error) {
      console.error("Error submitting payments:", error);
      alert("Error submitting payments");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Weekly Distribution</h2>
        <button
          onClick={() => {
            setForm({ week_no: "", pct: "", invoiceDate: "", dueDate: "" });
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <i className="ri-add-line mr-2"></i>
          {showAddForm ? 'Cancel' : 'Add Week'}
        </button>
      </div>
      {signup_date && signup_percentage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <i className="ri-information-line mr-1"></i>
            <strong>Week 0 (Signup)</strong> is automatically generated from the project's signup percentage ({signup_percentage}%) and signup date ({new Date(signup_date).toLocaleDateString()}). This cannot be modified.
          </p>
        </div>
      )}

      {/* Form for adding a week */}
      {showAddForm && (
        <div className="border p-3 rounded-lg bg-gray-100 space-y-3">
        <div>
          <label className="block mb-1 font-semibold">Week Number</label>
          <select
            className="w-full border rounded-lg p-2"
            value={form.week_no}
            onChange={(e) => handleFormChange("week_no", e.target.value)}
            required
          >
            <option value="">-- Select Week --</option>
            {Array.from({ length: no_of_weeks }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Percentage (%)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2"
            value={form.pct}
            onChange={(e) => handleFormChange("pct", e.target.value)}
          />
        </div>

        <input
  type="datetime-local"
  className="w-full border rounded-lg p-2"
  value={form.invoiceDate}
  min={signupDateObj ? formatForInput(signupDateObj) : undefined}
  max={projectEndDate ? formatForInput(projectEndDate) : undefined}
  onChange={(e) =>
    handleFormChange("invoiceDate", e.target.value.replace("T", " "))
  }
/>


<input
  type="datetime-local"
  className="w-full border rounded-lg p-2"
  value={form.dueDate}
  min={form.invoiceDate || (signupDateObj ? formatForInput(signupDateObj) : undefined)}
  max={projectEndDate ? formatForInput(projectEndDate) : undefined}
  onChange={(e) =>
    handleFormChange("dueDate", e.target.value.replace("T", " "))
  }
/>


        <button
          type="button"
          onClick={addWeekEntry}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Add Week
        </button>
      </div>
      )}
      <div className="font-semibold mt-4">
        Total: {calculateTotalPercentage().toFixed(2)}%
      </div>

      {/* Display added weeks */}
{console.log('Rendering weeks:', weeks)}
{weeks.length > 0 && (
  <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-4 py-2 text-left">Week</th>
        <th className="border px-4 py-2 text-left">Percentage</th>
        <th className="border px-4 py-2 text-left">Invoice Date</th>
        <th className="border px-4 py-2 text-left">Due Date</th>
        <th className="border px-4 py-2 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {weeks.map((week, i) => (
        <tr key={i} className={`hover:bg-gray-50 ${week.isSignupWeek ? 'bg-blue-50' : ''}`}>
          <td className="border px-4 py-2">
            {week.week_no === 0 ? 'Week 0 (Signup) - Auto Generated' : `Week ${week.week_no}`}
          </td>
          <td className="border px-4 py-2">
            {editingWeek && editingWeek.week_no === week.week_no ? (
              <input
                type="number"
                step="0.1"
                className="w-full border rounded px-2 py-1 text-sm"
                value={editForm.pct}
                onChange={(e) => handleEditFormChange('pct', e.target.value)}
              />
            ) : (
              <>
                {week.pct}%
                {week.isSignupWeek && <span className="text-xs text-blue-600 ml-1">(Fixed)</span>}
              </>
            )}
          </td>
          <td className="border px-4 py-2">
            {editingWeek && editingWeek.week_no === week.week_no ? (
              <input
                type="datetime-local"
                className="w-full border rounded px-2 py-1 text-sm"
                value={editForm.invoiceDate}
                onChange={(e) => handleEditFormChange('invoiceDate', e.target.value.replace('T', ' '))}
              />
            ) : (
              <>
                {week.invoiceDate}
                {week.isSignupWeek && <span className="text-xs text-blue-600 ml-1">(Fixed)</span>}
              </>
            )}
          </td>
          <td className="border px-4 py-2">
            {editingWeek && editingWeek.week_no === week.week_no ? (
              <input
                type="datetime-local"
                className="w-full border rounded px-2 py-1 text-sm"
                value={editForm.dueDate}
                onChange={(e) => handleEditFormChange('dueDate', e.target.value.replace('T', ' '))}
              />
            ) : (
              <>
                {week.dueDate}
                {week.isSignupWeek && <span className="text-xs text-blue-600 ml-1">(Fixed)</span>}
              </>
            )}
          </td>
          <td className="border px-4 py-2">
            {editingWeek && editingWeek.week_no === week.week_no ? (
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                >
                  <i className="ri-check-line"></i>
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(week)}
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  disabled={week.isSignupWeek}
                  title="Edit Week"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => deleteWeek(week)}
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  disabled={week.isSignupWeek}
                  title="Delete Week"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
                <button
                  onClick={() => handleViewInvoice(week)}
                  className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                  title="View Invoice"
                >
                  <i className="ri-file-text-line"></i>
                </button>
              </div>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}


      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg shadow ${
            Math.abs(calculateTotalPercentage() - 100.00) <= 0.01 && weeks.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
          }`}
          disabled={Math.abs(calculateTotalPercentage() - 100.00) > 0.01 || weeks.length === 0}
        >
          Submit Payment Plan
          {Math.abs(calculateTotalPercentage() - 100.00) > 0.01 && (
            <span className="ml-2 text-xs">(Total must be 100%)</span>
          )}
        </button>
      </div>

      {/* Invoice Display */}
      {showInvoice && selectedWeekForInvoice && (
        <div className="mt-6 bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <i className="ri-file-text-line mr-2 text-green-600"></i>
              Invoice Information - Week {selectedWeekForInvoice.week_no}
              {selectedWeekForInvoice.isSignupWeek && <span className="ml-2 text-sm text-blue-600">(Signup)</span>}
            </h3>
          </div>
          
          <div className="p-4">
            {invoiceError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <i className="ri-error-warning-line text-red-500 mr-2"></i>
                  <span className="text-red-700">{invoiceError}</span>
                </div>
              </div>
            )}

            {invoiceData && invoiceData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invoiceData.map((invoice, index) => (
                    <div key={invoice.id || index} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Week {invoice.wk_no}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.inv_status === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.inv_status === 1 ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="text-lg font-semibold text-gray-800">
                          ₹{invoice.wkly_cost_amt?.toLocaleString('en-IN') || '0'}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Percentage:</span>
                            <span className="font-medium">{invoice.wkly_cost_pct}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST Central:</span>
                            <span className="font-medium">{invoice.gst_cen_pct}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST State:</span>
                            <span className="font-medium">{invoice.gst_sta_pct}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Penalty:</span>
                            <span className="font-medium">₹{invoice.pen_amt?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                          {invoice.pymt_due_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Due Date:</span>
                              <span className="font-medium">{new Date(invoice.pymt_due_date).toLocaleDateString('en-IN')}</span>
                            </div>
                          )}
                          {invoice.pymt_act_date && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Paid Date:</span>
                              <span className="font-medium">{new Date(invoice.pymt_act_date).toLocaleDateString('en-IN')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {invoiceData.length}
                      </div>
                      <div className="text-gray-600">Total Invoices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        ₹{invoiceData.reduce((sum, inv) => sum + (inv.wkly_cost_amt || 0), 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-gray-600">Total Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        ₹{invoiceData.reduce((sum, inv) => sum + (inv.pen_amt || 0), 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-gray-600">Total Penalty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {invoiceData.filter(inv => inv.inv_status === 1).length}
                      </div>
                      <div className="text-gray-600">Paid Invoices</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-file-text-line text-4xl mb-2"></i>
                <p>No invoice data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
