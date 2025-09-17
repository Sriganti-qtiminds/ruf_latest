import React, { useState } from "react";
import VendorPaymentRequestForm from "../StudioVendorPayments/StdVenPaymentRequestForm";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorPayments = ({ data, saveData, showToast, openModal }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const projects = data.projects.filter((p) =>
    data.payments.some((pay) => pay.projectId === p.id && pay.vendorId === data.vendorId)
  );

  const handleRaisePayment = () => {
    const eligibleProjects = data.projects.filter((p) =>
      data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId && t.status === "completed")
    );
    if (eligibleProjects.length === 0) {
      showToast("No completed tasks available for payment request.", "error");
      return;
    }
    openModal(
      <VendorPaymentRequestForm
        projects={eligibleProjects}
        tasks={data.tasks}
        vendorId={data.vendorId}
        onSubmit={(payment) => {
          saveData({ ...data, payments: [...data.payments, payment] });
          showToast("Payment request raised successfully");
          setSelectedProject(selectedProject);
        }}
        onCancel={() => openModal(null)}
      />
    );
  };

  const payments = selectedProject
    ? data.payments.filter((p) => p.projectId === parseInt(selectedProject) && p.vendorId === data.vendorId)
    : data.payments.filter((p) => p.vendorId === data.vendorId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={studioTailwindStyles.heading_2}>Payments</h2>
        <button
          onClick={handleRaisePayment}
          className="neumorphic p-2 rounded-lg bg-secondary text-white button-hover transition-transform"
        >
          <i className="ri-add-line mr-2"></i> Raise Payment Request
        </button>
      </div>
      <div className="mb-6">
        <label className={studioTailwindStyles.heading_3}>Filter by Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full max-w-xs p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-2"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {payments.length === 0 ? (
          <p className={studioTailwindStyles.paragraph_1}>No payments found.</p>
        ) : (
          <>
            <div className="table-container sm:block hidden">
              <table className="w-full glassmorphic rounded-lg overflow-hidden table-auto">
                <thead className="bg-primary text-white">
                  <tr>
                    {["Project", "Task", "Status", "Request Date"].map((header) => (
                      <th key={header} className="p-3 text-left text-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <td className="p-3 text-sm">
                        {data.projects.find((proj) => proj.id === p.projectId)?.name || "N/A"}
                      </td>
                      <td className="p-3 text-sm">
                        {data.tasks.find((t) => t.id === p.taskId)?.name || "N/A"}
                      </td>
                      <td className={`p-3 text-sm status-${p.status}`}>{p.status}</td>
                      <td className="p-3 text-sm">{p.requestDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:hidden">
              {payments.map((p) => (
                <div key={p.id} className="glassmorphic rounded-lg p-4">
                  <p className={studioTailwindStyles.paragraph_2}>
                    <strong>Project:</strong>{" "}
                    {data.projects.find((proj) => proj.id === p.projectId)?.name || "N/A"}
                  </p>
                  <p className={studioTailwindStyles.paragraph_2}>
                    <strong>Task:</strong> {data.tasks.find((t) => t.id === p.taskId)?.name || "N/A"}
                  </p>
                  <p className={studioTailwindStyles.paragraph_2}>
                    <strong>Status:</strong> <span className={`status-${p.status}`}>{p.status}</span>
                  </p>
                  <p className={studioTailwindStyles.paragraph_2}>
                    <strong>Request Date:</strong> {p.requestDate}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorPayments;