import React, { useState } from "react";
import VendorCompleteTaskForm from "../StudioVendorTasks/StdVenCompleteTaskForm";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorTasks = ({ data, saveData, showToast, openModal }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const projects = data.projects.filter((p) =>
    data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId)
  );

  const handleCompleteTask = (taskId) => {
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) {
      showToast("Task not found.", "error");
      return;
    }
    openModal(
      <VendorCompleteTaskForm
        task={task}
        onSubmit={(updatedTask) => {
          const newTasks = data.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t));
          saveData({ ...data, tasks: newTasks });
          showToast("Task marked as completed");
          setSelectedProject(selectedProject);
        }}
        onCancel={() => openModal(null)}
      />
    );
  };

  const tasks = data.tasks.filter(
    (t) => t.projectId === parseInt(selectedProject) && t.vendorId === data.vendorId
  );
  const weeks = [...new Set(tasks.map((t) => t.week_id))].sort((a, b) => a - b);

  return (
    <div className="p-6">
      <h2 className={studioTailwindStyles.heading_2}>Tasks</h2>
      <div className="mb-6">
        <label className={studioTailwindStyles.heading_3}>Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full max-w-xs p-2 rounded-lg bg-gray-200 dark:bg-gray-700 form-input focus:ring-2 focus:ring-accent mt-2"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {!selectedProject || tasks.length === 0 ? (
          <p className={studioTailwindStyles.paragraph_1}>Select a project to view tasks.</p>
        ) : (
          weeks.map((week) => (
            <div key={week} className="glassmorphic rounded-lg">
              <h3 className={studioTailwindStyles.heading_3}>Week {week}</h3>
              <div className="table-container sm:block hidden">
                <table className="w-full glassmorphic rounded-lg overflow-hidden table-auto">
                  <thead className="bg-primary text-white">
                    <tr>
                      {["Name", "Category", "Completed %", "Images Before", "Images After", "Notes", "Status", "Action"].map(
                        (header) => (
                          <th key={header} className="p-3 text-left text-sm">
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks
                      .filter((t) => t.week_id === week)
                      .map((t) => (
                        <tr
                          key={t.id}
                          className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <td className="p-3 text-sm">{t.name}</td>
                          <td className="p-3 text-sm">{t.category}</td>
                          <td className="p-3 text-sm">{t.completed_percent}%</td>
                          <td className="p-3 text-sm">
                            {t.images_before ? (
                              <a href={t.images_before} target="_blank" className="text-accent hover:underline">
                                View
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="p-3 text-sm">
                            {t.images_after ? (
                              <a href={t.images_after} target="_blank" className="text-accent hover:underline">
                                View
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="p-3 text-sm">{t.notes || "N/A"}</td>
                          <td className={`p-3 text-sm status-${t.status}`}>{t.status}</td>
                          <td className="p-3">
                            {t.status === "active" && (
                              <button
                                className="p-2 rounded-lg bg-secondary text-white neumorphic button-hover transition-transform"
                                onClick={() => handleCompleteTask(t.id)}
                              >
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:hidden">
                {tasks
                  .filter((t) => t.week_id === week)
                  .map((t) => (
                    <div key={t.id} className="glassmorphic rounded-lg p-4">
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Name:</strong> {t.name}
                      </p>
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Category:</strong> {t.category}
                      </p>
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Completed %:</strong> {t.completed_percent}%
                      </p>
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Images Before:</strong>{" "}
                        {t.images_before ? (
                          <a href={t.images_before} target="_blank" className="text-accent hover:underline">
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Images After:</strong>{" "}
                        {t.images_after ? (
                          <a href={t.images_after} target="_blank" className="text-accent hover:underline">
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Notes:</strong> {t.notes || "N/A"}
                      </p>
                      <p className={studioTailwindStyles.paragraph_2}>
                        <strong>Status:</strong>{" "}
                        <span className={`status-${t.status}`}>{t.status}</span>
                      </p>
                      {t.status === "active" && (
                        <button
                          className="mt-2 p-2 rounded-lg bg-secondary text-white neumorphic button-hover transition-transform"
                          onClick={() => handleCompleteTask(t.id)}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorTasks;