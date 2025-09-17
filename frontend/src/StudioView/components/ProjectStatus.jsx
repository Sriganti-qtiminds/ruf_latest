import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProjectDetailsModal from "./ProjectStatusModal";
import useStudioSubTasksStore from "../../store/stdSubTaskStore";

const ProjectStatus = () => {
  const [selectedSubTask, setSelectedSubTask] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedMainTask, setSelectedMainTask] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mainTaskId = queryParams.get("main_task");
  const custId = queryParams.get("cust_id"); // Added to support cust_id-based filtering

  const { subTasks, loading, error, loadSubTasks } = useStudioSubTasksStore();

  useEffect(() => {
    if (custId) {
      loadSubTasks({ cust_id: custId }); // Fetch filtered by cust_id
    } else if (mainTaskId) {
      loadSubTasks({ main_task: mainTaskId }); // Fetch filtered by main_task
    } else {
      loadSubTasks(); // Fetch all
    }
  }, [custId, mainTaskId, loadSubTasks]);

  // ---------------- STATUS HELPERS ----------------
  const getStatusFromPercent = (percent) => {
    return percent === 100 ? "completed" : "in progress";
  };

  const getTaskProgress = (status) => {
    const s = status?.toLowerCase() || "in progress";
    if (s === "completed") {
      return {
        progress: 100,
        stroke: "#10b981",
        bgColor: "bg-green-500 text-white",
      };
    }
    return {
      progress: 0,
      stroke: "#f59e0b",
      bgColor: "bg-yellow-100 text-yellow-800",
    };
  };

  const getTaskColor = (status) => {
    const s = status?.toLowerCase() || "";
    return s === "completed" ? "text-green-600" : "text-yellow-600";
  };

  // ---------------- UNIQUE FILTER OPTIONS ----------------
  const uniqueProjects = useMemo(
    () => [...new Set(subTasks.map((task) => task.project_name))].sort(),
    [subTasks]
  );

  const uniqueMainTasks = useMemo(
    () => [...new Set(subTasks.map((task) => task.main_task_name))].sort(),
    [subTasks]
  );

  const uniqueWeeks = useMemo(
    () =>
      [...new Set(subTasks.map((task) => task.week_no))].sort((a, b) => a - b),
    [subTasks]
  );

  const uniqueSubTasks = useMemo(
    () => [...new Set(subTasks.map((task) => task.sub_task_name))].sort(),
    [subTasks]
  );

  // ---------------- FILTER LOGIC ----------------
  const filteredTasks = subTasks.filter(
    (task) =>
      (selectedProject === "all" || task.project_name === selectedProject) &&
      (selectedMainTask === "all" ||
        task.main_task_name === selectedMainTask) &&
      (selectedWeek === "all" || task.week_no === Number(selectedWeek)) &&
      (selectedSubTask === "all" || task.sub_task_name === selectedSubTask)
  );

  // ---------------- MODAL HANDLERS ----------------
  const handleDetailsClick = (task) => setSelectedTask(task);
  const handleCloseModal = () => setSelectedTask(null);

  return (
    <div className="lg:col-span-2 bg-white rounded shadow mb-6">
      <style>{`
        .progress-circle-bg { fill: none; stroke: #e5e7eb; stroke-width: 8; }
        .progress-circle-value { fill: none; stroke-width: 8; stroke-linecap: round;
                                transform: rotate(-90deg); transform-origin: 50% 50%; }
      `}</style>

      {/* ---------------- FILTERS ---------------- */}
      <div className="p-5 border-b border-gray-200 flex flex-wrap justify-center md:justify-end gap-2">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
        >
          <option value="all">All Projects</option>
          {uniqueProjects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>

        <select
          value={selectedMainTask}
          onChange={(e) => setSelectedMainTask(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
        >
          <option value="all">All Main Tasks</option>
          {uniqueMainTasks.map((mainTask) => (
            <option key={mainTask} value={mainTask}>
              {mainTask}
            </option>
          ))}
        </select>

        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
        >
          <option value="all">All Weeks</option>
          {uniqueWeeks.map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>

        <select
          value={selectedSubTask}
          onChange={(e) => setSelectedSubTask(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
        >
          <option value="all">All Sub Tasks</option>
          {uniqueSubTasks.map((subTask) => (
            <option key={subTask} value={subTask}>
              {subTask}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- TASK CARDS ---------------- */}
      <div className="p-5">
        {loading && <p className="text-gray-600 text-center">Loading tasks...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {!loading && !error && filteredTasks.length === 0 && (
          <p className="text-gray-600 text-center">No tasks found</p>
        )}

        {!loading && !error && filteredTasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const status = getStatusFromPercent(task.percent_complete);
              const { stroke, bgColor } = getTaskProgress(status);
              const strokeDashoffset =
                176 - (176 * task.percent_complete) / 100;

              console.log("Rendering task card:", {
                id: task.id,
                sub_task_name: task.sub_task_name,
                project_name: task.project_name,
                main_task_name: task.main_task_name,
                week_no: task.week_no,
                status,
              });

              return (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded p-4 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {task.sub_task_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        Project: {task.project_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        Main Task: {task.main_task_name}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 ${bgColor} text-xs font-medium rounded-full whitespace-nowrap`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  {/* Progress & Info */}
                  <div className="flex items-start gap-4 mb-4">
                    {status === "completed" ? (
                      <>
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <svg width="64" height="64" viewBox="0 0 64 64">
                            <circle
                              className="progress-circle-bg"
                              cx="32"
                              cy="32"
                              r="28"
                            ></circle>
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
                            {task.percent_complete}%
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            Description: {task.sub_task_description}
                          </p>
                          <p className={`text-sm ${getTaskColor(status)}`}>
                            Status:{" "}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${getTaskColor(
                            status
                          )}`}
                        >
                          Status:{" "}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          Description: {task.sub_task_description}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    className="bg-[#E07A5F] text-white px-6 py-1 rounded-lg text-xs font-medium hover:bg-[#d16a4f] transition-colors self-end"
                    onClick={() => handleDetailsClick(task)}
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
        <ProjectDetailsModal
          project={selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProjectStatus;