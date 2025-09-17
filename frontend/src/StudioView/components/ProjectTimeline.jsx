import React, { useMemo, useState } from "react";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";
import { STUDIO_BASE } from "../../routes/routesPath";
import useStudioProjectsStore from "../../store/studioProjectFilterStore";

const Timeline = ({ timelineData, timelineProject, setTimelineProject, navigate, projects }) => {
  const { loading: projectsLoading } = useStudioProjectsStore();
  const [timelineWeek, setTimelineWeek] = useState("all");

  // Extract unique weeks for dropdown
  const availableWeeks = useMemo(() => {
    const weeks = new Set();
    timelineData.forEach((task) => {
      if (task.week_no) weeks.add(task.week_no);
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [timelineData]);

  // Group tasks by week_no
  const filteredTimelineItems = useMemo(() => {
    const weekMap = {};
    timelineData.forEach((task) => {
      const weekKey = task.week_no || "N/A";

      // Apply week filter
      if (timelineWeek !== "all" && String(weekKey) !== String(timelineWeek)) {
        return;
      }

      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {
          week: `Week ${weekKey}`,
          projects: [],
        };
      }
      weekMap[weekKey].projects.push({
        taskId: task.id,
        name: task.main_task_name || "N/A",
      });
    });

    return Object.keys(weekMap)
      .sort((a, b) => a - b)
      .map((key) => weekMap[key]);
  }, [timelineData, timelineWeek]);

  const handleTaskClick = (taskId) => {
    if (taskId) {
      navigate(`${STUDIO_BASE}/taskStatus?main_task=${taskId}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Header with project dropdown */}
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-0 md:mb-4`}>
          Project Plan
        </h2>
        <div className="flex flex-row gap-2 sm:gap-4 items-center flex-wrap mb-4">
          <select
            id="weeklyPlanProjectFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] w-full sm:w-auto"
            value={timelineProject}
            onChange={(e) => setTimelineProject(e.target.value)}
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.project_name}
              </option>
            ))}
          </select>

          {/* Week Filter */}
          <select
            id="weeklyPlanWeekFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] w-full sm:w-auto"
            value={timelineWeek}
            onChange={(e) => setTimelineWeek(e.target.value)}
          >
            <option value="all">All Weeks</option>
            {availableWeeks.map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-5">
        {projectsLoading ? (
          <p className="text-center text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-red-500">
            No projects available to display timeline.
          </p>
        ) : filteredTimelineItems.length === 0 ? (
          <p className="text-center text-gray-500">
            No tasks found for the selected project.
          </p>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-1/2 -top-12 md:top-0 -translate-x-1/2 h-full w-1 bg-[#E07A5F]"></div>

            <div className="relative flex flex-col gap-20 z-10">
              {filteredTimelineItems.map((item, index) => {
                const isEven = index % 2 === 0;

                const projectCards = (projects) =>
                  projects.map((project, projIndex) => (
                    <div
                      key={projIndex}
                      className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTaskClick(project.taskId)}
                    >
                      <h4
                        className={`${studioTailwindStyles.heading_3} text-gray-800 flex justify-between items-center`}
                      >
                        {project.name}
                        <i className="ri-arrow-right-s-line text-[#E07A5F] text-xl"></i>
                      </h4>
                    </div>
                  ));

                const leftSideContent = isEven ? (
                  <>
                    <div
                      className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-4`}
                    >
                      {item.week}
                    </div>
                    <div className="flex flex-col gap-4">
                      {projectCards(item.projects)}
                    </div>
                  </>
                ) : (
                  <div
                    className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1`}
                  >
                    {item.week}
                  </div>
                );

                const rightSideContent = isEven ? (
                  <div
                    className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1`}
                  >
                    {item.week}
                  </div>
                ) : (
                  <>
                    <div
                      className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-4`}
                    >
                      {item.week}
                    </div>
                    <div className="flex flex-col gap-4">
                      {projectCards(item.projects)}
                    </div>
                  </>
                );

                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center md:items-stretch relative"
                  >
                    {/* Timeline dots */}
                    <div className="absolute hidden md:block left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#E07A5F] rounded-full z-10 md:top-1/2 md:-translate-y-1/2"></div>
                    <div className="absolute flex md:hidden left-1/2 -top-12 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#E07A5F] rounded-full z-10"></div>

                    {/* Left Side */}
                    <div className="md:w-1/2 flex justify-end md:pr-6 mb-10 md:mb-0 w-full">
                      <div className="w-full md:max-w-sm">
                        <div className="hidden md:block bg-white p-6 rounded-[16px] shadow transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-lg cursor-pointer">
                          {leftSideContent}
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden bg-white p-6 rounded-[16px] shadow mb-4">
                          <div
                            className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-4`}
                          >
                            {item.week}
                          </div>
                          <div className="flex flex-col gap-4">
                            {projectCards(item.projects)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="md:w-1/2 flex justify-start md:pl-6 mt-6 md:mt-0 w-full">
                      <div className="w-full md:max-w-sm">
                        <div className="hidden md:block bg-white p-6 rounded-[16px] shadow transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-lg cursor-pointer">
                          {rightSideContent}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;