


import axios from "axios";
import { buildApiUrl } from "../utils/apiHelper";
import { formatProjects } from "../utils/projectFormatter";

// POST: Add new enquiry
export const postCallbackDetails = async (name, mobileNo) => {
  try {
    const response = await axios.post(
      buildApiUrl("/addNewEnquiryRecord", null, true),
      {
        name: name,
        mobile_no: mobileNo,
        usercat: 3,
      }
    );
    return response;
  } catch (error) {
    console.log("Error At Posting:", error.message);
    return error;
  }
};

// GET: All Studio Room Info
export const fetchAllAreasData = async () => {
  try {
    const url = buildApiUrl("/getregionInfo", "regions");
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching studio areas:", error);
    return error;
  }
};

// Fetch all studio projects
export const fetchAllStudioProjects = async (params = {}) => {
  try {
    const url = buildApiUrl("/getAllStudioProjects", "project");

    // Call API with optional params like cust_id, project_id, etc.
    const response = await axios.get(url, { params });
    console.log("responsefromsttd", response)
    // Format projects
    const formattedProjects = formatProjects(response.data);

    return {
      projects: formattedProjects,
      counts: response.data.counts || { pending: 0, completed: 0, total: 0 },
    };
  } catch (error) {
    console.error("Error fetching studio projects:", error);
    throw error;
  }
};


// Fetch studio main tasks for a project
export const fetchAllStudioTasks = async (project_id) => {
  try {
    const url = buildApiUrl("/getAllStudioMainTasks", "maintask");
    const res = await axios.get(url, { params: { project_id } });
    
    return res.data; 
  } catch (err) {
    console.error("Error fetching studio tasks:", err);
    throw err;
  }
};



// Fetch studio sub-tasks with optional filters
export const fetchStudioSubTasks = async ({ id, project_id, main_task, cust_id } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (id) queryParams.append("id", id);
    if (project_id) queryParams.append("project_id", project_id);
    if (main_task) queryParams.append("main_task", main_task);
    if (cust_id) queryParams.append("cust_id", cust_id); // Added support for cust_id

    const url = buildApiUrl("/getAllStudioSubTasks", "subtask");
    const fullUrl = `${url}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    console.log("Fetching sub-tasks from:", fullUrl);

    const response = await axios.get(fullUrl);
    console.log("Sub-tasks response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching studio sub-tasks:", error);
    throw error;
  }
};

// Fetch studio user payments
export const fetchStudioUserPayments = async ({ id, project_id, cust_id } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (id) queryParams.append("id", id);
    if (project_id) queryParams.append("project_id", project_id);
    if (cust_id) queryParams.append("cust_id", cust_id);

    const url = buildApiUrl("/getAllStudioUserPaymentsweek", "payment");
    const response = await axios.get(
      `${url}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );

    console.log("Payments API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching studio user payments:", error);
    throw error;
  }
};
export const fetchInvoiceRecords = async ({ id, status, cust_id } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (id) queryParams.append("id", id);
    if (status) queryParams.append("status", status);
    if (cust_id) queryParams.append("cust_id", cust_id);

    const url = buildApiUrl("/getinvoiceInfo", "invoice");

    const response = await axios.get(
      `${url}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );

    console.log("Invoice Records API Response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice records:", error);
    throw error;
  }
  
};


// GET: Studio Projects
export const fetchStudioProjects = async (id = null, cust_id = null) => {
  try {
    const params = {};
    if (id) params.id = id;
    if (cust_id) params.cust_id = cust_id;

    const response = await axios.get(
      buildApiUrl("/getAllStudioProjects", "studio"),
      { params }
    );

    console.log("API Response:", response.data);

    if (!response.data.result) {
      throw new Error("No projects found in response");
    }

    return response.data.result.map((project) => ({
      id: `project${project.id}`,
      name: project.project_name,
    }));
  } catch (error) {
    console.error("Error fetching studio projects:", error);
    throw error;
  }
};

// GET: Region Info for Invoice
export const fetchRegionInfo = async (proj_id) => {
  try {
    const url = buildApiUrl(`/getregionInfo?proj_id=${proj_id}`, "regions");
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching region info:", error);
    return error;
  }
};

// GET: Media Files for Subtask
export const fetchSubtaskMediaFiles = async (sub_task_id) => {
  try {
    const url = buildApiUrl(`/getFilteredMediaFilePaths?sub_task_id=${sub_task_id}`, "subtask");
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching subtask media files:", error);
    return error;
  }
};

// GET: Invoice Info for Project
export const fetchInvoiceInfo = async (proj_id) => {
  try {
    const url = buildApiUrl(`/getinvoiceInfo?proj_id=${proj_id}`, "invoice");
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching invoice info:", error);
    return error;
  }
};

// POST: Add Invoice Info
export const addInvoiceInfo = async (invoiceData) => {
  try {
    const url = buildApiUrl(`/addinvoiceInfo`, "invoice");
    const response = await axios.post(url, { invoiceData });
    return response;
  } catch (error) {
    console.error("Error adding invoice info:", error);
    return error;
  }
};

// PUT: Update User Payment Plan
export const updateUserPaymentPlan = async (paymentPlanData) => {
  try {
    const url = buildApiUrl(`/updateUserPaymentPlan`, "userpayment");
    const response = await axios.put(url, paymentPlanData);
    return response;
  } catch (error) {
    console.error("Error updating payment plan:", error);
    return error;
  }
};

// POST: Add New User Payment
export const addNewUserPayment = async (paymentData) => {
  try {
    const url = buildApiUrl(`/addNewUserPayment`, "userpayment");
    const response = await axios.post(url, { paymentData });
    return response;
  } catch (error) {
    console.error("Error adding new user payment:", error);
    return error;
  }
};




// Fetch project documents
export const fetchProjectDocuments = async ({ project_id } = {}) => {
  try {
    // Build query params dynamically
    const queryParams = new URLSearchParams();
    if (project_id) queryParams.append("project_id", project_id);

    // Build API URL (ensure buildApiUrl is defined correctly)
    const url = buildApiUrl("/getProjectDocuments", "project");

    // Make the API request
    const response = await axios.get(
      `${url}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );

    console.log("Raw API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching project documents:", error);
    throw error;
  }
};

export const fetchStudioMedia = async (filters = {}) => {
  try {
    const url = buildApiUrl("/getFilteredMediaFilePaths", "subtask");
    const response = await axios.get(url, { params: filters });

    if (response.data.success && Array.isArray(response.data.data)) {
      // Process the nested data structure
      const mediaData = response.data.data
        .filter((item) => {
          // Ensure item has mediaPath and it's an object
          const isValidItem = item && item.mediaPath && typeof item.mediaPath === "object";
          if (!isValidItem) {
            console.warn(`Invalid or missing mediaPath in item:`, item);
            return false;
          }
          return true;
        })
        .flatMap((item) => {
          const { images = {}, videos = {} } = item.mediaPath;

          // Process images and videos into { url, type, category } format
          const processMediaItems = (items, type) =>
            Object.entries(items)
              .filter(([category, urls]) => {
                const hasValidUrls = Array.isArray(urls) && urls.length > 0;
                if (!hasValidUrls) {
                  console.log(`Skipping empty ${type} ${category}`);
                }
                return hasValidUrls;
              })
              .flatMap(([category, urls]) =>
                urls
                  .filter((url) => {
                    const isValidUrl =
                      typeof url === "string" &&
                      url.match(/\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i) &&
                      url.startsWith("https://") &&
                      !url.endsWith("/");
                    if (!isValidUrl) {
                      console.warn(`Invalid or unsupported media URL in ${type} ${category}: ${url}`);
                    }
                    return isValidUrl;
                  })
                  .map((url) => ({
                    url,
                    type: type === "images" ? "image" : "video",
                    category,
                  }))
              );

          return [
            ...processMediaItems(images, "images"),
            ...processMediaItems(videos, "videos"),
          ];
        });

      console.log("fetchStudioMedia: Processed media data:", mediaData);
      return mediaData;
    } else {
      console.warn("No media found:", response.data.message || "No data returned");
      return [];
    }
  } catch (error) {
    console.error("Error fetching media files:", error);
    return [];
  }
};

// Fetch studio tasks count summary for a given project
export const fetchAllStudioTasksCount = async (project_id) => {
  try {
    const url = buildApiUrl('/getAllStudioMainTaskscount', 'maintask');
    const res = await axios.get(url, { params: { project_id } });
    
    // Process the response to extract only completed and pending counts
    const tasks = res.data.result || [];
    const counts = {
      completed_count: tasks.reduce((sum, task) => sum + task.completed_count, 0),
      pending_count: tasks.reduce((sum, task) => sum + task.pending_count, 0),
    };
    
    return { tasks, counts };
  } catch (err) {
    console.error('Error fetching studio tasks:', err);
    throw err;
  }
};
