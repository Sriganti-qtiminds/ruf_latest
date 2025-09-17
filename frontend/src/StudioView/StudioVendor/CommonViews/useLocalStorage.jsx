import { useState } from "react";

const defaultData = {
  projects: [
    { id: 1, name: "P003092025", userId: 2, siteManagerId: 3, nweeks: 4, total_cost: 5000.0, status: "active" },
    { id: 2, name: "P004092025", userId: 4, siteManagerId: 5, nweeks: 6, total_cost: 8000.0, status: "active" },
    { id: 3, name: "P005092025", userId: 6, siteManagerId: 7, nweeks: 3, total_cost: 3000.0, status: "completed" },
  ],
  tasks: [
    { id: 1, projectId: 1, name: "Painting Walls", vendorId: 1, category: "painter", week_id: 1, completed_percent: 100, images_before: "https://example.com/paint_before.jpg", images_after: "https://example.com/paint_after.jpg", notes: "Completed with matte finish.", status: "completed" },
    { id: 2, projectId: 1, name: "Furniture Installation", vendorId: 1, category: "carpenter", week_id: 1, completed_percent: 50, images_before: "", images_after: "", notes: "", status: "active" },
    { id: 3, projectId: 1, name: "Wiring Setup", vendorId: 1, category: "electrician", week_id: 2, completed_percent: 20, images_before: "", images_after: "", notes: "", status: "active" },
    { id: 4, projectId: 2, name: "Cabinet Installation", vendorId: 1, category: "carpenter", week_id: 1, completed_percent: 70, images_before: "", images_after: "", notes: "In progress.", status: "active" },
    { id: 5, projectId: 2, name: "Plumbing Setup", vendorId: 1, category: "plumber", week_id: 2, completed_percent: 100, images_before: "https://example.com/plumb_before.jpg", images_after: "https://example.com/plumb_after.jpg", notes: "Pipes installed.", status: "completed" },
    { id: 6, projectId: 3, name: "Flooring", vendorId: 1, category: "flooring", week_id: 1, completed_percent: 100, images_before: "https://example.com/floor_before.jpg", images_after: "https://example.com/floor_after.jpg", notes: "Hardwood flooring completed.", status: "completed" },
  ],
  payments: [
    { id: 1, projectId: 1, taskId: 3, vendorId: 1, status: "pending", requestDate: "2025-06-20" },
    { id: 2, projectId: 2, taskId: 5, vendorId: 1, status: "approved", requestDate: "2025-06-15" },
    { id: 3, projectId: 3, taskId: 6, vendorId: 1, status: "paid", requestDate: "2025-06-10" },
  ],
  vendorId: 1,
};

export const useLocalStorage = () => {
  const [data, setData] = useState(() => {
    try {
      const storedData = localStorage.getItem("vendorData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return {
          projects: Array.isArray(parsedData.projects) ? parsedData.projects : defaultData.projects,
          tasks: Array.isArray(parsedData.tasks) ? parsedData.tasks : defaultData.tasks,
          payments: Array.isArray(parsedData.payments) ? parsedData.payments : defaultData.payments,
          vendorId: parsedData.vendorId || defaultData.vendorId,
        };
      }
      localStorage.setItem("vendorData", JSON.stringify(defaultData));
      return defaultData;
    } catch (e) {
      console.error("Failed to parse localStorage data:", e);
      localStorage.setItem("vendorData", JSON.stringify(defaultData));
      return defaultData;
    }
  });

  const saveData = (newData) => {
    try {
      localStorage.setItem("vendorData", JSON.stringify(newData));
      setData(newData);
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
      // Note: showToast is called within components, so we rely on the component to handle toast notifications
    }
  };

  return [data, saveData];
};