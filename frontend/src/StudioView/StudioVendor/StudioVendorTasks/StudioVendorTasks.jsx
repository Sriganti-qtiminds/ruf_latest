import React, { useState } from 'react';
import { useData } from './DataContext';

function Tasks() {
  const { data, setData, saveData, showToast, openModal } = useData();
  const [selectedProject, setSelectedProject] = useState('');

  const projects = data.projects.filter((p) =>
    data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId)
  );

  const completeTask = (id) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) {
      showToast('Task not found.', 'error');
      return;
    }
    openModal(
      <div>
        <h3 className="text-xl font-bold mb-6 text-center">Complete Task: {task.name}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const beforeImage = e.target.elements['task-before-image'].files[0];
            const afterImage = e.target.elements['task-after-image'].files[0];
            const notes = e.target.elements['task-notes'].value.trim();
            if (!beforeImage || !afterImage || !notes) {
              showToast('All fields are mandatory.', 'error');
              return;
            }
            setData((prev) => ({
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === id
                  ? {
                      ...t,
                      images_before: URL.createObjectURL(beforeImage),
                      images_after: URL.createObjectURL(afterImage),
                      notes,
                      completed_percent: 100,
                      status: 'completed',
                    }
                  : t
              ),
            }));
            saveData();
            showToast('Task marked as completed');
            setSelectedProject(selectedProject);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-1">Before Image (File)</label>
            <input
              type="file"
              name="task-before-image"
              accept="image/*"
              className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-1">After Image (File)</label>
            <input
              type="file"
              name="task-after-image"
              accept="image/*"
              className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
              required
            />
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea
              name="task-notes"
              className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="col-span-full mt-4 flex space-x-4">
            <button
              type="submit"
              className="p-3 rounded-lg bg-secondary text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] w-full hover:scale-105 transition-transform"
            >
              Confirm Completion
            </button>
            <button
              type="button"
              onClick={() => openModal(null)}
              className="p-3 rounded-lg bg-gray-500 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] w-full hover:scale-105 transition-transform"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderTasksForProject = (projectId) => {
    const tasks = projectId
      ? data.tasks.filter((t) => t.projectId === parseInt(projectId) && t.vendorId === data.vendorId)
      : [];
    if (!projectId || tasks.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">Select a project to view tasks.</p>;
    }
    const weeks = [...new Set(tasks.map((t) => t.week_id))].sort((a, b) => a - b);
    return weeks.map((week) => {
      const weekTasks = tasks.filter((t) => t.week_id === week);
      return (
        <div key={week} className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-4 px-4 pt-4">Week {week}</h3>
          <div className="overflow-x-auto sm:block hidden">
            <table className="w-full bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-left text-sm">Name</th>
                  <th className="p-3 text-left text-sm">Category</th>
                  <th className="p-3 text-left text-sm">Completed %</th>
                  <th className="p-3 text-left text-sm">Images Before</th>
                  <th className="p-3 text-left text-sm">Images After</th>
                  <th className="p-3 text-left text-sm">Notes</th>
                  <th className="p-3 text-left text-sm">Status</th>
                  <th className="p-3 text-left text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {weekTasks.map((t) => (
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
                        'N/A'
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {t.images_after ? (
                        <a href={t.images_after} target="_blank" className="text-accent hover:underline">
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-3 text-sm">{t.notes || 'N/A'}</td>
                    <td className={`p-3 text-sm ${t.status === 'active' ? 'text-yellow-500' : 'text-green-500'}`}>
                      {t.status}
                    </td>
                    <td className="p-3">
                      {t.status === 'active' && (
                        <button
                          onClick={() => completeTask(t.id)}
                          className="p-2 rounded-lg bg-secondary text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform"
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
            {weekTasks.map((t) => (
              <div key={t.id} className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Name:</strong> {t.name}
                </p>
                <p className="text-sm">
                  <strong>Category:</strong> {t.category}
                </p>
                <p className="text-sm">
                  <strong>Completed %:</strong> {t.completed_percent}%
                </p>
                <p className="text-sm">
                  <strong>Images Before:</strong>{' '}
                  {t.images_before ? (
                    <a href={t.images_before} target="_blank" className="text-accent hover:underline">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
                <p className="text-sm">
                  <strong>Images After:</strong>{' '}
                  {t.images_after ? (
                    <a href={t.images_after} target="_blank" className="text-accent hover:underline">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
                <p className="text-sm">
                  <strong>Notes:</strong> {t.notes || 'N/A'}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong>{' '}
                  <span className={t.status === 'active' ? 'text-yellow-500' : 'text-green-500'}>{t.status}</span>
                </p>
                {t.status === 'active' && (
                  <button
                    onClick={() => completeTask(t.id)}
                    className="mt-2 p-2 rounded-lg bg-secondary text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform"
                  >
                    Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full max-w-xs p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">{renderTasksForProject(selectedProject)}</div>
    </div>
  );
}

export default Tasks;