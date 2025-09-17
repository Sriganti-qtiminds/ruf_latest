import React from "react";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorDashboard = ({ data }) => {
  const completedProjects = data.projects.filter(
    (p) => p.status === "completed" && data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId)
  ).length;
  const pendingProjects = data.projects.filter(
    (p) => p.status === "active" && data.tasks.some((t) => t.projectId === p.id && t.vendorId === data.vendorId)
  ).length;
  const completedTasks = data.tasks.filter(
    (t) => t.vendorId === data.vendorId && t.status === "completed"
  ).length;
  const pendingTasks = data.tasks.filter(
    (t) => t.vendorId === data.vendorId && t.status === "active"
  ).length;

  const stats = [
    { icon: "ri-checkbox-circle-line", label: "Completed Projects", value: completedProjects, color: "text-green-500" },
    { icon: "ri-time-line", label: "Pending Projects", value: pendingProjects, color: "text-yellow-500" },
    { icon: "ri-task-line", label: "Completed Tasks", value: completedTasks, color: "text-green-500" },
    { icon: "ri-list-check", label: "Pending Tasks", value: pendingTasks, color: "text-yellow-500" },
  ];

  return (
    <div className="p-6">
      <h2 className={studioTailwindStyles.heading_2}>Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glassmorphic rounded-lg p-6 flex flex-col items-center justify-center">
            <i className={`${stat.icon} text-3xl ${stat.color} mb-4`}></i>
            <h3 className={studioTailwindStyles.heading_3}>{stat.label}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboard;