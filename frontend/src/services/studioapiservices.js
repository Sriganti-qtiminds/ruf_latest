


import axios from "axios";
import { buildApiUrl } from "../utils/apiHelper";

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
