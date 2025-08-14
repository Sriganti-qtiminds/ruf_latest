import React from "react";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";
import { STUDIO_BASE } from "../../routes/routesPath";

const TimelineData = ({ timelineData, timelineProject, setTimelineProject, navigate }) => {
  const filteredTimelineItems = timelineData
    .map((week) => ({
      ...week,
      projects: week.projects.filter(
        (project) => timelineProject === "all" || project.projectId === timelineProject
      ),
    }))
    .filter((week) => week.projects.length > 0);

  const handleTaskClick = (projectId) => {
    navigate(`${STUDIO_BASE}/projectStatus?projectId=${projectId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <h2 className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}>
            Project Plan
          </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select
            id="weeklyPlanProjectFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={timelineProject}
            onChange={(e) => setTimelineProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            <option value="project1">P1</option>
            <option value="project2">P2</option>
            <option value="project3">P3</option>
            <option value="project4">P4</option>
          </select>
        </div>
      </div>
      <div className="p-5">
        <div className="text-center mb-16">
        
          <p className={`${studioTailwindStyles.paragraph_2} text-gray-600 max-w-2xl mx-auto`}>
            Stay on track with our detailed weekly task schedule for your ongoing projects.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 -top-12 md:top-0 -translate-x-1/2 h-full w-1 bg-[#E07A5F]"></div>
          <div className="relative flex flex-col gap-20 z-10">
            {filteredTimelineItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const leftSideContent = isEven ? (
                <>
                  <div className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-4`}>
                    {item.week}
                  </div>
                  <div className="flex flex-col gap-4">
                    {item.projects.map((project, projIndex) => (
                      <div
                        key={projIndex}
                        className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleTaskClick(project.projectId)}
                      >
                        <h4 className={`${studioTailwindStyles.heading_3} text-gray-800 flex justify-between items-center`}>
                          {project.name}
                          <i className="ri-arrow-right-s-line text-[#E07A5F] text-xl"></i>
                        </h4>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1`}>
                  {item.week}
                </div>
              );
              const rightSideContent = isEven ? (
                <div className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-1`}>
                  {item.week}
                </div>
              ) : (
                <>
                  <div className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-4`}>
                    {item.week}
                  </div>
                  <div className="flex flex-col gap-4">
                    {item.projects.map((project, projIndex) => (
                      <div
                        key={projIndex}
                        className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleTaskClick(project.projectId)}
                      >
                        <h4 className={`${studioTailwindStyles.heading_3} text-gray-800 flex justify-between items-center`}>
                          {project.name}
                          <i className="ri-arrow-right-s-line text-[#E07A5F] text-xl"></i>
                        </h4>
                      </div>
                    ))}
                  </div>
                </>
              );

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center md:items-stretch relative"
                >
                  <div className="absolute hidden md:block left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#E07A5F] rounded-full z-10 md:top-1/2 md:-translate-y-1/2"></div>
                  <div className="absolute flex md:hidden left-1/2 -top-12 -translate-x-1/2 w-5 h-5 bg-white border-4 border-[#E07A5F] rounded-full z-10"></div>
                  {/* Left Side (Desktop) */}
                  <div className="md:w-1/2 flex justify-end md:pr-6 mb-10 md:mb-0 w-full">
                    <div className="w-full md:max-w-sm">
                      <div
                        className={`hidden md:block bg-white p-6 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-right transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] cursor-pointer`}
                      >
                        {leftSideContent}
                      </div>
                      {/* Mobile View */}
                      <div
                        className={`md:hidden bg-white p-6 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-left transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] mb-4`}
                      >
                        <div className={`${studioTailwindStyles.heading_3} text-[#E07A5F] font-bold mb-4`}>
                          {item.week}
                        </div>
                        <div className="flex flex-col gap-4">
                          {item.projects.map((project, projIndex) => (
                            <div
                              key={projIndex}
                              className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleTaskClick(project.projectId)}
                            >
                              <h4 className={`${studioTailwindStyles.heading_3} text-gray-800 flex justify-between items-center`}>
                                {project.name}
                                <i className="ri-arrow-right-s-line text-[#E07A5F] text-xl"></i>
                              </h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right Side (Desktop) */}
                  <div className="md:w-1/2 flex justify-start md:pl-6 mt-6 md:mt-0 w-full">
                    <div className="w-full md:max-w-sm">
                      <div
                        className={`hidden md:block bg-white p-6 rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-left transition-transform duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] cursor-pointer`}
                      >
                        {rightSideContent}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineData;