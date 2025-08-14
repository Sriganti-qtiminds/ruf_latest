

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Timeline from "../ProjectTimeline";
import ProjectTaskPayments from "../ProjectTaskPayments";
import { fetchStudioProjects } from "../../../services/studioapiservices";
import SearchableDropdown from "../../../UserView/components/PostPropertyView/SearchDropdownView";
import ProjectCards from "../StdDasshboard/ProjectCards/ProjectCard";

// Dummy project data
const dummyProjects = [
  {
    id: "project1",
    name: "Electrical Work",
    ownerName: "John Doe",
    vendorName: "ABC Contractors",
    communityName: "Sunset Community",
    document: "https://example.com/project1.pdf",
    status: "In Progress",
    startDate: "June 2, 2025",
  },
  {
    id: "project2",
    name: "Carpentry Work",
    ownerName: "Jane Smith",
    vendorName: "XYZ Builders",
    communityName: "Moonlight Estates",
    document: "https://example.com/project2.pdf",
    status: "Completed",
    startDate: "June 16, 2025",
  },
  {
    id: "project3",
    name: "Plumbing Work",
    ownerName: "Alice Johnson",
    vendorName: "PlumbPerfect",
    communityName: "Starlight Village",
    document: null,
    status: "Pending",
    startDate: "June 9, 2025",
  },
   {
    id: "project4",
    name: "Electrical Work",
    ownerName: "John Doe",
    vendorName: "ABC Contractors",
    communityName: "Sunset Community",
    document: "https://example.com/project1.pdf",
    status: "In Progress",
    startDate: "June 2, 2025",
  },
 
];


const timelineData = {
  project1: [
    {
      week: "Week 1",
      weekFilter: "week1",
      projects: [{ name: "Electrical Work", projectId: "project1" }],
    },
    {
      week: "Week 3",
      weekFilter: "week3",
      projects: [],
    },
  ],
  project2: [
    {
      week: "Week 3",
      weekFilter: "week3",
      projects: [{ name: "Carpentry Work", projectId: "project2" }],
    },
  ],
  project3: [
    {
      week: "Week 2",
      weekFilter: "week2",
      projects: [{ name: "Plumbing Work", projectId: "project3" }],
    },
  ],
  project4: [
    {
      week: "Week 1",
      weekFilter: "week1",
      projects: [{ name: "False Ceiling", projectId: "project4" }],
    },
    {
      week: "Week 3",
      weekFilter: "week3",
      projects: [{ name: "False Ceiling", projectId: "project4" }],
    },
  ],
};

const weeklyTasks = {
  project1: {
    week1: [
      {
        name: "Cabinet Installation",
        status: "Completed",
        rupees: 150000,
        project: "project1",
        paid: 150000,
        mainTask: "Electrical Installation",
      },
      {
        name: "Countertop Fitting",
        status: "In Progress",
        rupees: 100000,
        project: "project1",
        paid: 0,
        mainTask: "Electrical Installation",
      },
      {
        name: "Under-Cabinet Lighting",
        status: "Pending",
        rupees: 36350,
        project: "project1",
        paid: 0,
        mainTask: "Lighting Setup",
      },
    ],
  },
  project2: {
    week3: [
      {
        name: "Bathroom Fixture Installation",
        status: "Pending",
        rupees: 86950,
        project: "project2",
        paid: 0,
        mainTask: "Bathroom Setup",
      },
      {
        name: "Carpentry Finishing",
        status: "Completed",
        rupees: 30295,
        project: "project2",
        paid: 30295,
        mainTask: "Carpentry Work",
      },
    ],
  },
  project3: {
    week2: [
      {
        name: "Recessed LED Lighting",
        status: "Completed",
        rupees: 120740,
        project: "project3",
        paid: 120740,
        mainTask: "Lighting Installation",
      },
      {
        name: "Wiring Upgrade",
        status: "In Progress",
        rupees: 110000,
        project: "project3",
        paid: 0,
        mainTask: "Wiring Work",
      },
    ],
  },
  project4: {
    week3: [
      {
        name: "Water Heater Replacement",
        status: "In Progress",
        rupees: 50000,
        project: "project4",
        paid: 0,
        mainTask: "Plumbing Setup",
      },
    ],
  },
};

const StudioDashboard = () => {
  const [selectedProject, setSelectedProject] = useState("project1");
  const [overviewProject, setOverviewProject] = useState("project1");
  const [overviewWeek, setOverviewWeek] = useState("all");
  const [overviewStatus, setOverviewStatus] = useState("all");
  const [overviewMainTask, setOverviewMainTask] = useState("all");
  const [timelineProject, setTimelineProject] = useState("project1");
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // Hardcoded cust_id for testing
  const cust_id = "0GHgLmDr06QhaHBbtKe6tSMLOKZ2";

  // Fetch projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log("Fetching projects for cust_id:", cust_id);
        const projectData = await fetchStudioProjects(null, cust_id);
        console.log("Fetched projects:", projectData);
        // Use dummyProjects if projectData is empty or null
        const finalProjects = projectData && projectData.length > 0 ? projectData : dummyProjects;
        setProjects(finalProjects);
        if (finalProjects.length > 0 && !finalProjects.some((p) => p.id === "project1")) {
          console.log("Default project1 not found, setting first project:", finalProjects[0].id);
          setSelectedProject(finalProjects[0].id);
          setOverviewProject(finalProjects[0].id);
          setTimelineProject(finalProjects[0].id);
        }
      } catch (error) {
        console.error("Failed to load projects, using dummy data:", error);
        setProjects(dummyProjects);
        if (!dummyProjects.some((p) => p.id === "project1")) {
          console.log("Default project1 not found in dummy data, setting first project:", dummyProjects[0].id);
          setSelectedProject(dummyProjects[0].id);
          setOverviewProject(dummyProjects[0].id);
          setTimelineProject(dummyProjects[0].id);
        }
      }
    };
    loadProjects();
  }, []);

  // Debug projects state
  useEffect(() => {
    console.log("Current projects state:", projects);
  }, [projects]);

  // Prepare options for dropdowns
  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
  }));

  const weekOptions = [
    { id: "all", name: "All Weeks" },
    { id: "week1", name: "Week 1 - June 2-8, 2025" },
    { id: "week2", name: "Week 2 - June 9-15, 2025" },
    { id: "week3", name: "Week 3 - June 16-22, 2025" },
  ];

  const statusOptions = [
    { id: "all", name: "All Statuses" },
    { id: "Completed", name: "Completed" },
    { id: "Pending", name: "Pending" },
    { id: "Not Started", name: "Not Started" },
  ];

  const mainTaskOptions = [
    { id: "all", name: "All Main Tasks" },
    ...Array.from(
      new Set(
        overviewProject && weeklyTasks[overviewProject]
          ? Object.values(weeklyTasks[overviewProject])
              .flat()
              .map((task) => task.mainTask)
          : []
      )
    ).map((task) => ({ id: task, name: task })),
  ];

  // Ensure overviewMainTask is valid for the selected project
  useEffect(() => {
    if (overviewProject && !mainTaskOptions.some((opt) => opt.id === overviewMainTask)) {
      setOverviewMainTask(mainTaskOptions[1]?.id || "all");
    }
  }, [overviewProject, mainTaskOptions]);

  // Flatten tasks for overview filtering
  const allTasks = overviewProject
    ? Object.values(weeklyTasks[overviewProject] || {}).flatMap((weekTasks) =>
        weekTasks.map((task) => ({
          title: task.name,
          projectId: task.project,
          weekFilter: Object.keys(weeklyTasks[overviewProject]).find((week) =>
            weeklyTasks[overviewProject][week].includes(task)
          ),
          status: task.status.toLowerCase(),
          mainTask: task.mainTask,
        }))
      )
    : [];

  // Filter for overview task counts
  const filteredTaskCounts = allTasks.filter(
    (task) =>
      (overviewWeek === "all" || task.weekFilter === overviewWeek) &&
      (overviewStatus === "all" || task.status === overviewStatus.toLowerCase()) &&
      (overviewMainTask === "all" || task.mainTask === overviewMainTask)
  );

  const taskCounts = {
    total: filteredTaskCounts.length,
    completed: filteredTaskCounts.filter((task) => task.status === "completed").length,
    pending: filteredTaskCounts.filter(
      (task) => task.status === "pending" || task.status === "not started"
    ).length,
  };

  return (
    <section id="dashboard" className="py-10 px-4 lg:px-6 bg-gray-50 w-full min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1280px]">
        {/* Projects Cards Section */}
        <ProjectCards
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={(id) => {
            setSelectedProject(id);
            setTimelineProject(id);
          }}
        />

        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Dashboard Overview - {projects.find((p) => p.id === overviewProject)?.id}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <SearchableDropdown
                options={projectOptions}
                value={overviewProject}
                onChange={(e) => setOverviewProject(e.target.value)}
                placeholder="Select Project"
                displayKey="id"
                valueKey="id"
                name="dashboardProjectFilter"
                className="w-full sm:w-48"
              />
              <SearchableDropdown
                options={weekOptions}
                value={overviewWeek}
                onChange={(e) => setOverviewWeek(e.target.value)}
                placeholder="Select Week"
                displayKey="name"
                valueKey="id"
                name="dashboardWeekFilter"
                className="w-full sm:w-48"
              />
              <SearchableDropdown
                options={statusOptions}
                value={overviewStatus}
                onChange={(e) => setOverviewStatus(e.target.value)}
                placeholder="Select Status"
                displayKey="name"
                valueKey="id"
                name="dashboardStatusFilter"
                className="w-full sm:w-48"
              />
              <SearchableDropdown
                options={mainTaskOptions}
                value={overviewMainTask}
                onChange={(e) => setOverviewMainTask(e.target.value)}
                placeholder="Select Main Task"
                displayKey="name"
                valueKey="id"
                name="dashboardMainTaskFilter"
                className="w-full sm:w-48"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <p id="totalTasks" className="text-2xl font-bold text-gray-900">
                {taskCounts.total}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <h3 className="text-sm font-medium text-gray-500">Tasks Completed</h3>
              <p id="completedTasks" className="text-2xl font-bold text-gray-900">
                {taskCounts.completed}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <h3 className="text-sm font-medium text-gray-500">Tasks Pending</h3>
              <p id="pendingTasks" className="text-2xl font-bold text-gray-900">
                {taskCounts.pending}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <Timeline
          timelineData={timelineData[timelineProject] || []}
          timelineProject={timelineProject}
          setTimelineProject={setTimelineProject}
          navigate={navigate}
          projects={projects}
        />

        {/* Project Task Payments Section */}
        <ProjectTaskPayments weeklyTasks={weeklyTasks[timelineProject] || {}} />
      </div>
    </section>
  );
};

export default StudioDashboard;