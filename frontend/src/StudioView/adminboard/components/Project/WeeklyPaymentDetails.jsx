import React, { useEffect, useState } from "react";

export default function ProjectPlans() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    pymt_pct: "",
    week_invoice_date: "",
    week_due_date: "",
    addl_notes: "",
  });
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);

  // Subtasks modal state
  const [subtasks, setSubtasks] = useState([]);
  const [showSubtasksModal, setShowSubtasksModal] = useState(false);

  // --- Fetch all projects on mount ---
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/project/getAllstudioprojects`)
      .then((res) => res.json())
      .then((data) => {
        const result = data.result || data.data || [];
        setProjects(Array.isArray(result) ? result : []);
      })
      .catch(() => setProjects([]));
  }, []);

  // --- Fetch weekly plan for selected project ---
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetch(`${import.meta.env.VITE_API_URL}/userpayment/getAllUserPaymentPlans`)
      .then((res) => res.json())
      .then((data) => {
        const res = data.result || data.data || [];
        const plans = res.filter((plan) => plan.project_id === project.id);
        setWeeklyPlans(plans);
      })
      .catch((err) => console.error("Error fetching payment plans:", err));
  };

  // --- Amount calculation ---
  function Amountpayable(totalAmount, percentage) {
    return Number(((totalAmount * percentage) / 100).toFixed(2));
  }

  // --- Date formatting ---
  function formatDateTime(date) {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ""
      : d.toISOString().slice(0, 19).replace("T", " "); // YYYY-MM-DD HH:mm:ss
  }

  function formatDateInput(date) {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // --- Generate Invoice ---
  const generateInvoice = async (plan) => {
    if (!selectedProject) return;
    setLoadingInvoiceId(plan._id);

    const payload = {
      invoiceData: [
        { key: "proj_id", value: selectedProject.id }, // use id
        { key: "wk_no", value: plan.week_no },
        { key: "wkly_cost_pct", value: plan.pymt_pct },
        {
          key: "wkly_cost_amt",
          value: Amountpayable(selectedProject.total_cost, plan.pymt_pct),
        },
        { key: "pymt_due_date", value: formatDateTime(plan.week_due_date) },
        { key: "pymt_act_date", value: formatDateTime(new Date()) },
      ],
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/invoice/addinvoiceInfo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        if (data.incomplete_subtasks && data.incomplete_subtasks.length > 0) {
          setSubtasks(data.incomplete_subtasks);
          setShowSubtasksModal(true);
        }
        throw new Error(data.message || "Failed to generate invoice");
      }

      alert("Invoice generated successfully!");
    } catch (error) {
      console.error("Error generating invoice:", error);
      if (!showSubtasksModal) {
        alert(error.message || "Failed to generate invoice.");
      }
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  // --- Handle Edit ---
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      pymt_pct: plan.pymt_pct,
      week_invoice_date: formatDateInput(plan.week_invoice_date),
      week_due_date: formatDateInput(plan.week_due_date),
      addl_notes: plan.addl_notes || "",
    });
  };

  // --- Form Change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Save Edit ---
const handleSave = async () => {
  if (!editingPlan) return;

  const payload = {
    id: editingPlan.id,  
    ...editingPlan,
    pymt_pct: Number(formData.pymt_pct),
    week_invoice_date: formData.week_invoice_date
      ? `${formData.week_invoice_date} 00:00:00`
      : editingPlan.week_invoice_date,
    week_due_date: formData.week_due_date
      ? `${formData.week_due_date} 00:00:00`
      : editingPlan.week_due_date,
    addl_notes: formData.addl_notes,
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/userpayment/updateUserPaymentPlan`, 
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error("Update failed");

    alert("Plan updated successfully!");
    setEditingPlan(null);

    // Update state locally (merge with existing)
    setWeeklyPlans((prev) =>
      prev.map((p) => (p.id === editingPlan.id ? { ...p, ...payload } : p))
    );
  } catch (error) {
    console.error("Error updating plan:", error);
    alert("Failed to update plan.");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      {/* --- Projects List --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleSelectProject(project)}
            className="cursor-pointer border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold mb-2">
              {project.project_name}
            </h2>
            <p>
              <strong>Flat:</strong> {project.cust_flat}
            </p>
            <p>
              <strong>Address:</strong> {project.cust_address}
            </p>
            <p>
              <strong>User:</strong> {project.user_name}
            </p>
            <p>
              <strong>Total Cost:</strong> {project.total_cost}
            </p>
          </div>
        ))}
      </div>

      {/* --- Weekly Plan Table --- */}
      {selectedProject && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Weekly Plan for {selectedProject.project_name} (User:{" "}
            {selectedProject.user_name})
          </h2>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Week Number</th>
                <th className="border p-2">Payment %</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Invoice Date</th>
                <th className="border p-2">Due Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weeklyPlans.map((plan) => (
                <tr key={plan._id}>
                  <td className="border p-2">
                    {plan.week_no} {plan.addl_notes || ""}
                  </td>
                  <td className="border p-2">{plan.pymt_pct}</td>
                  <td className="border p-2">
                    {Amountpayable(selectedProject.total_cost, plan.pymt_pct)}
                  </td>
                  <td className="border p-2">
                    {formatDateInput(plan.week_invoice_date)}
                  </td>
                  <td className="border p-2">
                    {formatDateInput(plan.week_due_date)}
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => generateInvoice(plan)}
                      disabled={loadingInvoiceId === plan._id}
                      className={`px-3 py-1 rounded text-white ${
                        loadingInvoiceId === plan._id
                          ? "bg-gray-400"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {loadingInvoiceId === plan._id
                        ? "Generating..."
                        : "Generate Invoice"}
                    </button>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              Edit Plan (Week {editingPlan.week_no})
            </h2>

            <label className="block mb-2">
              Payment %:
              <input
                type="number"
                name="pymt_pct"
                value={formData.pymt_pct}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-2">
              Invoice Date:
              <input
                type="date"
                name="week_invoice_date"
                value={formData.week_invoice_date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-2">
              Due Date:
              <input
                type="date"
                name="week_due_date"
                value={formData.week_due_date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-4">
              Notes:
              <input
                type="text"
                name="addl_notes"
                value={formData.addl_notes}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Subtasks Modal --- */}
      {showSubtasksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Pending Subtasks — Invoice cannot be created
            </h2>

            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Sub Task</th>
                  <th className="border p-2">Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {subtasks.map((task) => (
                  <tr key={task.id}>
                    <td className="border p-2">{task.id}</td>
                    <td className="border p-2">{task.sub_task_name}</td>
                    <td className="border p-2">
                      {task.approval_status === 1 ? "Approved" : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSubtasksModal(false)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
