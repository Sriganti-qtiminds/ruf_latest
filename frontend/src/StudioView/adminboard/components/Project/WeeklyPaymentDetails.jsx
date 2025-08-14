import React, { useState, useEffect } from 'react';

function WeeklyPaymentDetails() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [weeklyPayments, setWeeklyPayments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);

  // Fetch projects and weekly payments data
  useEffect(() => {
    // Fetch projects
    fetch(`${import.meta.env.VITE_API_URL}/project/getAllStudioProjects`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || [];
        setProjectData(Array.isArray(result) ? result : []);
      })
      .catch(() => setProjectData([]));

    // Fetch weekly payments (using invoice data)
    fetch(`${import.meta.env.VITE_API_URL}/studio/getinvoiceInfo`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || [];
        setWeeklyPayments(Array.isArray(result) ? result : []);
      })
      .catch(() => setWeeklyPayments([]));

    // Fetch receipts data
    fetch(`${import.meta.env.VITE_API_URL}/studio/getreceiptInfo`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || [];
        setReceipts(Array.isArray(result) ? result : []);
      })
      .catch(() => setReceipts([]));
  }, []);

  // Helper to get the first payment due date for a project
  const getFirstPaymentDueDate = (projectId) => {
    const payments = weeklyPayments.filter(wp => String(wp.project_id) === String(projectId));
    if (payments.length === 0) return '-';
    // Sort by payment_due_date and pick the earliest
    const sorted = payments.slice().sort((a, b) => new Date(a.payment_due_date) - new Date(b.payment_due_date));
    return sorted[0].payment_due_date ? new Date(sorted[0].payment_due_date).toLocaleDateString() : '-';
  };

  // Helper to get all invoices for a project
  const getInvoicesForProject = (projectId) => {
    return weeklyPayments.filter(wp => String(wp.project_id) === String(projectId));
  };

  // Helper to get receipt information for an invoice
  const getReceiptForInvoice = async (invoiceInfo) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/studio/getreceiptInfo`);
      const data = await response.json();
      const receipts = data.result || [];
      return receipts.find(receipt => receipt.invoice_info === invoiceInfo);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return null;
    }
  };

  // Helper to calculate weekly payment amount
  const calculateWeeklyPayment = (project) => {
    if (!project) return 0;
    const total = parseFloat(project.total_cost) || 0;
    const signupPerc = parseFloat(project.signup_percentage) || 0;
    const weeks = parseInt(project.no_of_weeks) || 0;
    
    if (weeks <= 0) return 0;
    
    const signupFee = (total * signupPerc) / 100;
    const remaining = total - signupFee;
    return Math.round((remaining / weeks) * 100) / 100;
  };

  // Helper to calculate due date for a week
  const calculateDueDate = (project, weekNo) => {
    if (!project || !project.signuptime) return null;
    const signupDate = new Date(project.signuptime);
    const dueDate = new Date(signupDate);
    dueDate.setDate(dueDate.getDate() + (weekNo * 7)); // 7 days per week
    return dueDate;
  };

  // Helper to get the expected weekly plan for a project
  const getWeeklyPlan = (project) => {
    if (!project) return [];
    const weeks = parseInt(project.no_of_weeks, 10);
    const total = parseFloat(project.total_cost);
    const signupPerc = parseFloat(project.signup_percentage);
    if (isNaN(weeks) || isNaN(total) || isNaN(signupPerc) || weeks <= 0) return [];
    const signupFee = Math.round((total * signupPerc / 100) * 100) / 100;
    const remaining = total - signupFee;
    const perWeek = Math.round((remaining / weeks) * 100) / 100;
    const plan = [];
    for (let i = 1; i <= weeks; i++) {
      plan.push({ week: i, amount: perWeek });
    }
    // Adjust last week for rounding errors
    const sum = plan.reduce((acc, cur) => acc + cur.amount, 0);
    if (sum !== remaining) {
      plan[plan.length - 1].amount += (remaining - sum);
    }
    return plan;
  };

  // Handler for generating invoice (placeholder)
  const handleGenerateInvoice = (selectedProject, nextWeek) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`Invoice generated for Project ${selectedProject.id}, Week ${nextWeek}`);
    }, 1000);
  };

  // Handler for generating all invoices for project_id 2
  const handleGenerateAllInvoices = async () => {
    setGenerating(true);
    
    try {
      const projectId = 2;
      const totalWeeks = selectedProject.no_of_weeks || 0;
      const weeklyAmount = calculateWeeklyPayment(selectedProject);
      
      // Generate invoices for all weeks
      const invoicePromises = [];
      
      for (let weekNo = 1; weekNo <= totalWeeks; weekNo++) {
        const invoiceData = {
          parameters: [
            { key: "project_id", value: projectId },
            { key: "week_no", value: weekNo },
            { key: "weekly_cost_amount", value: weeklyAmount },
            { key: "weekly_cost_percentage", value: 100 },
            { key: "cgst_amount", value: Math.round(weeklyAmount * 0.09) }, // 9% CGST
            { key: "sgst_amount", value: Math.round(weeklyAmount * 0.09) }, // 9% SGST
            { key: "payer_category_id", value: 1 },
            { key: "receiver_category_id", value: 1 },
            { key: "payment_mode", value: 1 },
            { key: "status", value: 1 }
          ]
        };
        
        const promise = fetch(`${import.meta.env.VITE_API_URL}/studio/addNewInvoiceRecord`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData)
        }).then(response => response.json());
        
        invoicePromises.push(promise);
      }
      
      // Wait for all invoices to be created
      const results = await Promise.all(invoicePromises);
      
      // Check for any errors
      const errors = results.filter(result => !result.success);
      if (errors.length > 0) {
        console.error('Some invoices failed to create:', errors);
        alert(`Generated ${results.length - errors.length} invoices. ${errors.length} failed.`);
      } else {
        alert(`Successfully generated ${results.length} invoices for Project ${projectId}`);
      }
      
      // Refresh the data
      window.location.reload();
      
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert('Failed to generate invoices. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <div className="text-3xl font-bold mb-8 text-center">Weekly Payment Details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-8 pb-8">
          {projectData.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow p-6 cursor-pointer hover:scale-105 transition-transform border border-gray-100 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <div className="font-bold text-xl mb-1">{project.customer_flat || '-'}</div>
              <div className="text-gray-700 text-base mb-1">Community: <span className="font-medium">{project.customer_community || '-'}</span></div>
              <div className="text-gray-700 text-base mb-1">Customer: <span className="font-medium">{project.customer_id || '-'}</span></div>
              <div className="text-gray-700 text-base mb-1">Address: <span className="font-medium">{project.customer_address || '-'}</span></div>
              <div className="text-gray-700 text-base mb-1">Total Cost: <span className="font-medium">₹ {project.total_cost != null ? project.total_cost : '-'}</span></div>
              <div className="text-gray-700 text-base mb-1">Total Weeks: <span className="font-medium">{project.no_of_weeks || '-'}</span></div>
              <div className="text-gray-700 text-base mb-1">Due Date: <span className="font-medium">{getFirstPaymentDueDate(project.id)}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show invoice details for selected project
  const selectedProject = projectData.find(p => String(p.id) === String(selectedProjectId));
  const invoices = getInvoicesForProject(selectedProjectId);
  // Find the next week number
  const lastInvoiceWeek = invoices.length > 0 ? Math.max(...invoices.map(inv => Number(inv.week_no))) : 0;
  const nextWeek = lastInvoiceWeek + 1;

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-auto">
      <button
        className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow"
        onClick={() => setSelectedProjectId(null)}
      >
        ← Back to Projects
      </button>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-6xl mx-auto mb-8">
        <div className="text-2xl font-bold mb-2">{selectedProject.customer_flat || '-'}</div>
        <div className="text-gray-700 text-base mb-1">Community: <span className="font-medium">{selectedProject.customer_community || '-'}</span></div>
        <div className="text-gray-700 text-base mb-1">Customer: <span className="font-medium">{selectedProject.customer_id || '-'}</span></div>
        <div className="text-gray-700 text-base mb-1">Address: <span className="font-medium">{selectedProject.customer_address || '-'}</span></div>
        <div className="text-gray-700 text-base mb-1">Total Cost: <span className="font-medium">₹ {selectedProject.total_cost != null ? selectedProject.total_cost : '-'}</span></div>
        <div className="text-gray-700 text-base mb-1">Total Weeks: <span className="font-medium">{selectedProject.no_of_weeks || '-'}</span></div>
      </div>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-6xl mx-auto">
        <h3 className="text-lg font-bold mb-2 text-center">Weekly Payment Schedule</h3>
        <table className="w-full table-auto border text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Week No</th>
              <th className="p-2 text-left">Due Date</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">CGST</th>
              <th className="p-2 text-left">SGST</th>
              <th className="p-2 text-left">Late Fees</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Payment Mode</th>
              <th className="p-2 text-left">Invoice Info</th>
              <th className="p-2 text-left">Receipt No</th>
              <th className="p-2 text-left">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: selectedProject.no_of_weeks || 0 }, (_, index) => {
              const weekNo = index + 1;
              const invoice = invoices.find(inv => inv.week_no === weekNo);
              const receipt = invoice ? receipts.find(rec => rec.invoice_info === invoice.invoice_info) : null;
              const weeklyAmount = calculateWeeklyPayment(selectedProject);
              const dueDate = calculateDueDate(selectedProject, weekNo);
              const isExpanded = expandedWeek === weekNo;
              return [
                <tr key={weekNo} className={"border-b last:border-b-0 cursor-pointer" + (invoice ? " hover:bg-blue-50" : "")} onClick={() => invoice && setExpandedWeek(isExpanded ? null : weekNo)}>
                  <td className="p-2 font-medium">{weekNo}</td>
                  <td className="p-2">
                    {invoice ? 
                      (invoice.payment_due_date ? new Date(invoice.payment_due_date).toLocaleDateString() : '-') :
                      (dueDate ? dueDate.toLocaleDateString() : '-')
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      `₹${invoice.weekly_cost_amount?.toLocaleString() || '-'}` :
                      `₹${weeklyAmount.toLocaleString()}`
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      `₹${invoice.cgst_amount?.toLocaleString() || '-'}` :
                      '-'
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      `₹${invoice.sgst_amount?.toLocaleString() || '-'}` :
                      '-'
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      `₹${invoice.late_fees?.toLocaleString() || '-'}` :
                      '-'
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      invoice.status_code || '-' :
                      'Pending'
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      invoice.payments_mode || '-' :
                      '-'
                    }
                  </td>
                  <td className="p-2">
                    {invoice ? 
                      invoice.invoice_info :
                      '-'
                    }
                  </td>
                  <td className="p-2">
                    {receipt ? 
                      receipt.receipt_no :
                      '-'
                    }
                  </td>
                  <td className="p-2">
                    {receipt ? 
                      (receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString() : '-') :
                      '-'
                    }
                  </td>
                </tr>,
                (isExpanded && receipt) && (
                  <tr key={weekNo + '-details'} className="bg-blue-50">
                    <td colSpan={11} className="p-4">
                      <div className="text-base font-semibold mb-2">Receipt Details</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div><span className="font-semibold">Receipt No:</span> {receipt.receipt_no}</div>
                        <div><span className="font-semibold">Payment Date:</span> {receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString() : '-'}</div>
                        <div><span className="font-semibold">Status:</span> {receipt.status_code || '-'}</div>
                        <div><span className="font-semibold">Razorpay Info:</span> {receipt.razor_payment_info || '-'}</div>
                        <div><span className="font-semibold">Amount:</span> ₹{receipt.weekly_cost_amount?.toLocaleString() || '-'}</div>
                        <div><span className="font-semibold">CGST:</span> ₹{receipt.cgst_amount?.toLocaleString() || '-'}</div>
                        <div><span className="font-semibold">SGST:</span> ₹{receipt.sgst_amount?.toLocaleString() || '-'}</div>
                        <div><span className="font-semibold">Late Fees:</span> ₹{receipt.late_fees?.toLocaleString() || '-'}</div>
                        <div><span className="font-semibold">Payment Mode:</span> {receipt.payment_mode || '-'}</div>
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
        <div className="flex justify-end mt-6">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
            onClick={() => handleGenerateInvoice(selectedProject, nextWeek)}
            disabled={generating}
          >
            {generating ? 'Generating...' : `Generate Invoice for Week ${nextWeek}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WeeklyPaymentDetails; 