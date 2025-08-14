import React, { useState, useEffect } from 'react';
import { useData } from './DataContext';

function Payments() {
  const { data, setData, saveData, showToast, openModal } = useData();
  const [selectedProject, setSelectedProject] = useState('');

  const projects = data.projects.filter((p) =>
    data.payments.some((pay) => pay.projectId === p.id && pay.vendorId === data.vendorId)
  );

  const raisePaymentRequest = () => {
    const projects = data.projects.filter((p) =>
      data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId && t.status === 'completed')
    );
    if (projects.length === 0) {
      showToast('No completed tasks available for payment request.', 'error');
      return;
    }
    openModal(
      <div>
        <h3 className="text-xl font-bold mb-6 text-center">Raise Payment Request</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const projectId = parseInt(e.target.elements['payment-project'].value);
            const taskId = parseInt(e.target.elements['payment-task'].value);
            if (!projectId || !taskId) {
              showToast('Please select a project and task.', 'error');
              return;
            }
            setData((prev) => ({
              ...prev,
              payments: [
                ...prev.payments,
                {
                  id: prev.payments.length + 1,
                  projectId,
                  taskId,
                  vendorId: prev.vendorId,
                  status: 'pending',
                  requestDate: new Date().toISOString().split('T')[0],
                },
              ],
            }));
            saveData();
            showToast('Payment request raised successfully');
            setSelectedProject(selectedProject);
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-1">Project</label>
            <select
              name="payment-project"
              id="payment-project"
              className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
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
            <label className="block text-sm font-semibold mb-1">Task</label>
            <select
              name="payment-task"
              id="payment-task"
              className="w-full p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
              required
            >
              <option value="">Select a task</option>
            </select>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="p-3 rounded-lg bg-secondary text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] w-full hover:scale-105 transition-transform"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    );

    const projectSelect = document.getElementById('payment-project');
    const taskSelect = document.getElementById('payment-task');
    if (projectSelect && taskSelect) {
      projectSelect.addEventListener('change', () => {
        const projectId = projectSelect.value;
        taskSelect.innerHTML = `<option value="">Select a task</option>`;
        if

 (projectId) {
          const tasks = data.tasks.filter(
            (t) => t.projectId === parseInt(projectId) && t.vendorId === data.vendorId && t.status === 'completed'
          );
          taskSelect.innerHTML += tasks
            .map((t) => `<option value="${t.id}">${t.name}</option>`)
            .join('');
        }
      });
    }
  };

  const renderPaymentsForProject = (projectId) => {
    const payments = projectId
      ? data.payments.filter((p) => p.projectId === parseInt(projectId) && p.vendorId === data.vendorId)
      : data.payments.filter((p) => p.vendorId === data.vendorId);
    if (payments.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No payments found.</p>;
    }
    return (
      <>
        <div className="overflow-x-auto sm:block hidden">
          <table className="w-full bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-3 text-left text-sm">Project</th>
                <th className="p-3 text-left text-sm">Task</th>
                <th className="p-3 text-left text-sm">Status</th>
                <th className="p-3 text-left text-sm">Request Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="p-3 text-sm">
                    {data.projects.find((proj) => proj.id === p.projectId)?.name || 'N/A'}
                  </td>
                  <td className="p-3 text-sm">{data.tasks.find((t) => t.id === p.taskId)?.name || 'N/A'}</td>
                  <td
                    className={`p-3 text-sm ${
                      p.status === 'pending'
                        ? 'text-yellow-500'
                        : p.status === 'approved'
                        ? 'text-blue-500'
                        : 'text-green-500'
                    }`}
                  >
                    {p.status}
                  </td>
                  <td className="p-3 text-sm">{p.requestDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg p-4"
            >
              <p className="text-sm">
                <strong>Project:</strong>{' '}
                {data.projects.find((proj) => proj.id === p.projectId)?.name || 'N/A'}
              </p>
              <p className="text-sm">
                <strong>Task:</strong> {data.tasks.find((t) => t.id === p.taskId)?.name || 'N/A'}
              </p>
              <p className="text-sm">
                <strong>Status:</strong>{' '}
                <span
                  className={
                    p.status === 'pending'
                      ? 'text-yellow-500'
                      : p.status === 'approved'
                      ? 'text-blue-500'
                      : 'text-green-500'
                  }
                >
                  {p.status}
                </span>
              </p>
              <p className="text-sm">
                <strong>Request Date:</strong> {p.requestDate}
              </p>
            </div>
          ))}
        </div>
      </>
    );
  };

  useEffect(() => {
    renderPaymentsForProject(selectedProject);
  }, [selectedProject]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payments</h2>
        <button
          onClick={raisePaymentRequest}
          className="p-2 rounded-lg bg-secondary text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform"
        >
          <i className="ri-add-line mr-2"></i> Raise Payment Request
        </button>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Filter by Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full max-w-xs p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-accent focus:border-2 focus:ring-2 focus:ring-accent transition-all duration-200"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">{renderPaymentsForProject(selectedProject)}</div>
    </div>
  );
}

export default Payments;