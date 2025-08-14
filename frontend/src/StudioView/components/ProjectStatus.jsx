
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import ProjectDetailsModal from "./ProjectStatusModal";

const projectStatusData = [
  {
    projectId: "project1",
    name: "Modern Kitchen Renovation",
    client: "Emily Richardson",
    status: "ontrack",
    progress: 75,
    startDate: "May 10, 2025",
    dueDate: "July 15, 2025",
    weekFilter: "week1",
    taskDescription: "Installing sleek cabinetry, granite countertops, and LED lighting to create a modern, functional kitchen.",
    tasks: ["Cabinet Installation", "Countertop Fitting", "Under-Cabinet Lighting Setup"],
    beforeMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { type: "image", url: "https://images.unsplash.com/photo-1598546720078-8659863bc47d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    ],
    afterMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1580587771525-78b9f6f4e3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { type: "video", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
    ],
  },
  {
    projectId: "project2",
    name: "Master Bathroom Remodel",
    client: "Robert Johnson",
    status: "atrisk",
    progress: 45,
    startDate: "May 25, 2025",
    dueDate: "June 30, 2025",
    weekFilter: "week3",
    taskDescription: "Upgrading bathroom with modern fixtures and elegant tiling for a spa-like experience.",
    tasks: ["Bathroom Fixture Installation"],
    beforeMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    ],
    afterMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1600566753379-8c1a34c7e9c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { type: "image", url: "https://images.unsplash.com/photo-1618221710640-bff5a9e7b974?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    ],
  },
  {
    projectId: "project3",
    name: "Office Electrical Upgrade",
    client: "Techwave Inc.",
    status: "ontrack",
    progress: 50,
    startDate: "June 5, 2025",
    dueDate: "July 25, 2025",
    weekFilter: "week2",
    taskDescription: "Enhancing office with energy-efficient LED lighting and updated electrical wiring.",
    tasks: ["Recessed LED Lighting Installation", "Wiring Upgrade"],
    beforeMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1497366210541-8d17c7b8b6f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { type: "video", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
    ],
    afterMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    ],
  },
  {
    projectId: "project4",
    name: "Residential Plumbing System",
    client: "Sarah Thompson",
    status: "delayed",
    progress: 30,
    startDate: "May 15, 2025",
    dueDate: "June 20, 2025",
    weekFilter: "week1,week3",
    taskDescription: "Overhauling plumbing system, including kitchen, hall, and water heater replacement.",
    tasks: ["Plumbing Check in Kitchen", "Plumbing Work in Hall", "Water Heater Replacement"],
    beforeMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    ],
    afterMedia: [
      { type: "image", url: "https://images.unsplash.com/photo-1573166364528-6666f1d53e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { type: "video", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
    ],
  },
];

const weeklyTasks = {
  week1: [
    { name: "Cabinet Installation", status: "Completed", rupees: 150000, project: "project1", paid: 150000 },
    { name: "Countertop Fitting", status: "In Progress", rupees: 100000, project: "project1", paid: 0 },
    { name: "Under-Cabinet Lighting", status: "Pending", rupees: 36350, project: "project1", paid: 0 },
  ],
  week2: [
    { name: "Recessed LED Lighting", status: "Completed", rupees: 120740, project: "project3", paid: 120740 },
    { name: "Wiring Upgrade", status: "In Progress", rupees: 110000, project: "project3", paid: 0 },
  ],
  week3: [
    { name: "Bathroom Fixture Installation", status: "Pending", rupees: 86950, project: "project2", paid: 0 },
    { name: "Water Heater Replacement", status: "In Progress", rupees: 50000, project: "project4", paid: 0 },
    { name: "Carpentry Finishing", status: "Completed", rupees: 30295, project: "project2", paid: 30295 },
  ],
};

const taskOptions = [
  "All Tasks",
  "Cabinet Installation",
  "Countertop Fitting",
  "Under-Cabinet Lighting Setup",
  "Plumbing Check in Kitchen",
  "Plumbing Work in Hall",
  "Recessed LED Lighting Installation",
  "Wiring Upgrade",
  "Bathroom Fixture Installation",
  "Water Heater Replacement",
];

const ProjectStatus = () => {
  const [statusProject, setStatusProject] = useState("all");
  const [statusWeek, setStatusWeek] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusTask, setStatusTask] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  // Map weeklyTasks to task statuses
  const taskStatusMap = Object.keys(weeklyTasks).flatMap((weekKey) =>
    weeklyTasks[weekKey].map((task) => ({
      name: task.name,
      status: task.status.toLowerCase(),
      projectId: task.project,
      week: weekKey,
    }))
  );

  // Get task status from weeklyTasks or default to "notstarted"
  const getTaskStatus = (taskName, projectId) => {
    const task = taskStatusMap.find(
      (t) => t.name === taskName && t.projectId === projectId
    );
    return task ? task.status : "notstarted";
  };

  // Get progress percentage, stroke color (circle), and bg color (linear)
  const getTaskProgress = (taskStatus) => {
    switch (taskStatus) {
      case "completed":
        return { progress: 100, stroke: "#10b981", bgColor: "bg-green-500" };
      case "in progress":
      case "pending":
        return { progress: 25, stroke: "#f59e0b", bgColor: "bg-yellow-500" };
      case "notstarted":
        return { progress: 0, stroke: "#ec4899", bgColor: "bg-pink-500" };
      default:
        return { progress: 0, stroke: "#6b7280", bgColor: "bg-gray-500" };
    }
  };

  // Get task color for text
  const getTaskColor = (taskStatus) => {
    switch (taskStatus) {
      case "completed":
        return "text-green-600";
      case "in progress":
      case "pending":
        return "text-yellow-600";
      case "notstarted":
        return "text-pink-600";
      default:
        return "text-gray-600";
    }
  };

  // Filter projects and tasks
  const filteredTasks = projectStatusData
    .filter((project) =>
      projectId
        ? project.projectId === projectId
        : (statusProject === "all" || project.projectId === statusProject) &&
          (statusWeek === "all" || project.weekFilter.includes(statusWeek)) &&
          (statusFilter === "all" || project.status === statusFilter)
    )
    .flatMap((project) =>
      project.tasks
        .filter((task) =>
          statusTask === "all" ||
          task.toLowerCase().replace(/\s+/g, "") === statusTask
        )
        .map((task) => ({
          taskName: task,
          taskStatus: getTaskStatus(task, project.projectId),
          project: project,
        }))
    );

  const handleDetailsClick = (task, project) => {
    console.log("Opening modal for task:", task, "in project:", project.name);
    setSelectedTask({
      name: task,
      status: getTaskStatus(task, project.projectId),
      beforeMedia: project.beforeMedia,
      afterMedia: project.afterMedia,
      taskDescription: project.taskDescription,
    });
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  return (
    <div className="lg:col-span-2 bg-white rounded shadow mb-6">
      <style>
        {`
          .progress-circle-bg {
            fill: none;
            stroke: #e5e7eb;
            stroke-width: 8;
          }
          .progress-circle-value {
            fill: none;
            stroke-width: 8;
            stroke-linecap: round;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
          }
        `}
      </style>
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Task Status</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            id="projectStatusProjectFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={statusProject}
            onChange={(e) => setStatusProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            <option value="project1">P1</option>
                <option value="project2">P2</option>
                <option value="project3">P3</option>
                <option value="project4">P4</option>
          </select>
          <select
            id="projectStatusWeekFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={statusWeek}
            onChange={(e) => setStatusWeek(e.target.value)}
          >
            <option value="all">All Weeks</option>
            <option value="week1">Week 1 - June 2-8, 2025</option>
            <option value="week2">Week 2 - June 9-15, 2025</option>
            <option value="week3">Week 3 - June 16-22, 2025</option>
          </select>
          <select
            id="projectStatusFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="ontrack">On Track</option>
            <option value="atrisk">At Risk</option>
            <option value="delayed">Delayed</option>
          </select>
          <select
            id="projectStatusTaskFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={statusTask}
            onChange={(e) => setStatusTask(e.target.value)}
          >
            {taskOptions.map((task, index) => (
              <option key={index} value={task.toLowerCase().replace(/\s+/g, "")}>
                {task}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="p-5">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-600 text-center">No tasks found</p>
        ) : (
          <div id="taskStatusGrid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTasks.map((taskObj, index) => {
              const { taskName, taskStatus, project } = taskObj;
              const { progress, stroke, bgColor } = getTaskProgress(taskStatus);
              const strokeDashoffset = 176 - (176 * progress) / 100;
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded p-4 flex flex-col"
                  data-task={taskName}
                  data-status={taskStatus}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">{taskName}</h3>
                    <span className={`px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full`}>
                      {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 relative mr-4">
                      <svg className="progress-circle" width="64" height="64" viewBox="0 0 64 64">
                        <circle className="progress-circle-bg" cx="32" cy="32" r="28"></circle>
                        <circle
                          className="progress-circle-value"
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={stroke}
                          strokeDasharray="176"
                          strokeDashoffset={strokeDashoffset}
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                        {progress}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500">Progress</span>
                          <span className="text-xs font-medium text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${bgColor}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Project: {project.name}</p>
                      <p className={`text-sm ${getTaskColor(taskStatus)}`}>
                        Status: {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{project.startDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">{project.dueDate}</p>
                    </div>
                  </div>
                  <button
                    className="bg-[#E07A5F] text-white px-6 py-1 rounded-lg text-xs font-medium hover:bg-[#d16a4f] transition-colors self-end"
                    onClick={() => handleDetailsClick(taskName, project)}
                  >
                    Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedTask && (
        <ProjectDetailsModal project={selectedTask} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ProjectStatus;