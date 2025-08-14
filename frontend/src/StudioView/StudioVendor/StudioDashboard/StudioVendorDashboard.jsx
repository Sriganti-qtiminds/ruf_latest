import React from 'react';
import { useData } from './DataContext';

function Dashboard() {
  const { data } = useData();
  const completedProjects = data.projects.filter(
    (p) => p.status === 'completed' && data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId)
  ).length;
  const pendingProjects = data.projects.filter(
    (p) => p.status === 'active' && data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId)
  ).length;
  const completedTasks = data.tasks.filter((t) => t.vendorId === data.vendorId && t.status === 'completed').length;
  const pendingTasks = data.tasks.filter((t) => t.vendorId === data.vendorId && t.status === 'active').length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center">
          <i className="ri-checkbox-circle-line text-3xl text-green-500 mb-4"></i>
          <h3 className="text-lg font-semibold">Completed Projects</h3>
          <p className="text-2xl font-bold">{completedProjects}</p>
        </div>
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center">
          <i className="ri-time-line text-3xl text-yellow-500 mb-4"></i>
          <h3 className="text-lg font-semibold">Pending Projects</h3>
          <p className="text-2xl font-bold">{pendingProjects}</p>
        </div>
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center">
          <i className="ri-task-line text-3xl text-green-500 mb-4"></i>
          <h3 className="text-lg font-semibold">Completed Tasks</h3>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-lg border border-white/15 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center">
          <i className="ri-list-check text-3xl text-yellow-500 mb-4"></i>
          <h3 className="text-lg font-semibold">Pending Tasks</h3>
          <p className="text-2xl font-bold">{pendingTasks}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;