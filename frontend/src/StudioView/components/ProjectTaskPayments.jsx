

import React, { useState } from "react";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";

const ProjectTaskPayments = ({ weeklyTasks }) => {
  const [weeklyPaymentsProject, setWeeklyPaymentsProject] = useState("all");
  const [week, setWeek] = useState("all");

  // Check if weeklyTasks is defined
  if (!weeklyTasks || typeof weeklyTasks !== "object") {
    return (
      <div className="bg-white rounded shadow mb-6">
         <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <h2 className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}>
                     Project Payments
                   </h2>
        </div>
        <div className="p-5">
          <p className="text-gray-600">No tasks available</p>
        </div>
      </div>
    );
  }

  // Derive project data from weeklyTasks
  const projectData = Object.keys(weeklyTasks).reduce((acc, weekKey) => {
    weeklyTasks[weekKey].forEach((task) => {
      if (!acc[task.project]) {
        acc[task.project] = {
          projectId: task.project,
          name: task.project, // Placeholder; replace with actual project name if available
          weeks: new Set(),
          totalAmount: 0,
        };
      }
      acc[task.project].weeks.add(weekKey);
      acc[task.project].totalAmount += task.rupees;
      acc[task.project].name = task.project; // Update name if mapping available
    });
    return acc;
  }, {});

  // Map project names for display (since weeklyTasks uses project IDs)
  const projectNameMap = {
    project1: "Modern Kitchen Renovation",
    project2: "Master Bathroom Remodel",
    project3: "Office Electrical Upgrade",
    project4: "Residential Plumbing System",
  };

  // Update project names in projectData
  Object.values(projectData).forEach((project) => {
    project.name = projectNameMap[project.projectId] || project.projectId;
  });

  // Convert projectData to array
  const projectStatusData = Object.values(projectData).map((project) => ({
    ...project,
    weeks: Array.from(project.weeks),
  }));

  // Flatten tasks from weeklyTasks
  const allTasks = Object.keys(weeklyTasks).flatMap((weekKey) =>
    weeklyTasks[weekKey].map((task) => ({
      name: task.name,
      status: task.status,
      project: task.project,
      paid: task.paid,
      rupees: task.rupees,
      week: weekKey,
    }))
  );

  // Filter tasks by project and week
  const filteredTasks = allTasks.filter(
    (task) =>
      (weeklyPaymentsProject === "all" || task.project === weeklyPaymentsProject) &&
      (week === "all" || task.week === week)
  );

  // Compute weekly payment metrics
  const weeklyPayments = projectStatusData
    .filter(
      (project) =>
        (weeklyPaymentsProject === "all" || project.projectId === weeklyPaymentsProject) &&
        (week === "all" || project.weeks.includes(week))
    )
    .flatMap((project) => {
      return project.weeks.map((weekKey) => {
        const tasksInWeek = allTasks.filter(
          (task) => task.project === project.projectId && task.week === weekKey
        );
        const amountPaid = tasksInWeek.reduce((sum, task) => sum + task.paid, 0);
        const weeklyAmount = tasksInWeek.reduce((sum, task) => sum + task.rupees, 0);
        const amountDue = weeklyAmount - amountPaid;
        return {
          projectId: project.projectId,
          projectName: project.name,
          week: weekKey,
          totalAmount: project.totalAmount, // Total across all weeks for the project
          amountPaid,
          amountDue: amountDue < 0 ? 0 : amountDue, // Prevent negative due amounts
        };
      });
    })
    .filter((payment) => week === "all" || payment.week === week);

  // Format rupees
  const formatRupees = (amount) => {
    return "₹" + amount.toLocaleString("en-IN");
  };

  // Payment, Invoice, and Receipt actions
  const makeWeeklyPayment = (projectId, weekKey) => {
    const payment = weeklyPayments.find(
      (p) => p.projectId === projectId && p.week === weekKey
    );
    console.log(
      `Initiating payment for project: ${projectId}, week: ${weekKey}, amount: ${formatRupees(payment.amountDue)}`
    );
  };

  const generateInvoice = (projectId, weekKey) => {
    console.log(`Generating invoice for project: ${projectId}, week: ${weekKey}`);
  };

  const generateReceipt = (projectId, weekKey) => {
    console.log(`Generating receipt for project: ${projectId}, week: ${weekKey}`);
  };

  return (
    <div className="bg-white rounded shadow mb-6">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <h2 className={`${studioTailwindStyles.heading_2} text-[#1A1F3D] mb-4`}>
                  Project Payments
                </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            id="weeklyPaymentsProjectFilter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={weeklyPaymentsProject}
            onChange={(e) => setWeeklyPaymentsProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projectStatusData.map((project) => (
              <option key={project.projectId} value={project.projectId}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            id="weekSelector"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          >
            <option value="all">All Weeks</option>
            <option value="week1">Week 1 - June 2-8, 2025</option>
            <option value="week2">Week 2 - June 9-15, 2025</option>
            <option value="week3">Week 3 - June 16-22, 2025</option>
            <option value="week4">Week 4 - June 23-29, 2025</option>
          </select>
        </div>
      </div>
      <div className="p-5">
        <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weeklyPayments.map((payment, index) => (
            <div key={index} className="col-span-1 sm:col-span-2">
              <h3 className="text-sm font-medium text-gray-900">
                {payment.projectName} - {payment.week.charAt(0).toUpperCase() + payment.week.slice(1)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <p className="font-bold text-gray-900">{formatRupees(payment.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <p className="font-bold text-gray-900">{formatRupees(payment.amountPaid)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Amount Due</span>
                  <p className="font-bold text-gray-900">{formatRupees(payment.amountDue)}</p>
                  <div className="flex gap-2 mt-2">
                    {payment.amountDue > 0 && (
                      <button
                        className="px-4 py-1 bg-[#E07A5F] text-white rounded-lg text-xs font-medium hover:bg-[#d16a4f]"
                        onClick={() => makeWeeklyPayment(payment.projectId, payment.week)}
                      >
                        Pay
                      </button>
                    )}
                    <button
                      className="px-4 py-1 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700"
                      onClick={() => generateInvoice(payment.projectId, payment.week)}
                    >
                      Invoice
                    </button>
                    {payment.amountPaid > 0 && (
                      <button
                        className="px-4 py-1 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700"
                        onClick={() => generateReceipt(payment.projectId, payment.week)}
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskPayments;