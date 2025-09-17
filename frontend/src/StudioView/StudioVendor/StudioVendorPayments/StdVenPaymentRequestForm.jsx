import React, { useState } from "react";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorPaymentRequestForm = ({ projects, tasks, vendorId, onSubmit, onCancel }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const eligibleTasks = tasks.filter(
    (t) => t.projectId === parseInt(selectedProject) && t.vendorId === vendorId && t.status === "completed"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedTask) {
      // Note: showToast is called by parent component
      return;
    }
    onSubmit({
      id: tasks.length + 1,
      projectId: parseInt(selectedProject),
      taskId: parseInt(selectedTask),
      vendorId,
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div>
      <h3 className={studioTailwindStyles.heading_2}>Raise Payment Request</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={studioTailwindStyles.heading_3}>Project</label>
          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedTask("");
            }}
            className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-1"
            required
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={studioTailwindStyles.heading_3}>Task</label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-1"
            required
          >
            <option value="">Select a task</option>
            {eligibleTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="neumorphic p-3 rounded-lg bg-secondary text-white w-full button-hover transition-transform"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorPaymentRequestForm;