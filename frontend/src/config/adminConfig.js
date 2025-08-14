


import axios from "axios";
import { buildApiUrl } from "../utils/apiHelper";

// Dashboard API's -----------------------------------------------

export const fetchDashboardDataApi = async () => {
  try {
    const response = await axios.get(buildApiUrl("/admindashboard", "admin"));
    return response;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Property Listings API's ---------------------------------------

export const getRecords = async (tableName, fieldNames, whereCondition = "") => {
  try {
    if (!tableName || !fieldNames) {
      throw new Error("Missing required parameters: tableName or fieldNames.");
    }

    const params = { tableName, fieldNames, whereCondition };
    const response = await axios.get(buildApiUrl("/getRecords", "crud"), { params });
    return response;
  } catch (error) {
    console.error("Error fetching records:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchPropertiesApi = async (filters) => {
  const whereConditions = [];

  if (filters.property_id) {
    whereConditions.push(`property_id=${filters.property_id}`);
  } else {
    if (filters.status) {
      whereConditions.push(`current_status=${filters.status}`);
    }
    if (filters.city && filters.city !== "All City") {
      whereConditions.push(`city_name='${filters.city}'`);
    }
    if (filters.community && filters.community !== "All Community") {
      whereConditions.push(`community=${filters.community}`);
    }
    if (filters.searchQuery) {
      whereConditions.push(
        `(community_name LIKE '%${filters.searchQuery}%' OR city_name LIKE '%${filters.searchQuery}%')`
      );
    }

    // Ensure `page` and `limit` are included only for list requests
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    whereConditions.push(`page=${page}`);
    whereConditions.push(`limit=${limit}`);
  }

  const whereClause = whereConditions.join("&");
  const url = buildApiUrl(`/adminPropListings?${whereClause}`, "admin");

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

// Update property status
export const updatePropertyStatusApi = async (propertyId, newStatus) => {
  const url = buildApiUrl("/updateRecord", "crud");
  const payload = {
    tableName: "dy_property",
    fieldValuePairs: { current_status: newStatus },
    whereCondition: `id=${propertyId}`,
  };
  try {
    const response = await axios.put(url, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating property status:", error);
    throw error;
  }
};

// Requests API's -----------------------------------------------------

export const fetchAllRequest = async () => {
  try {
    const response = await axios.get(buildApiUrl("/rmdata", "rm"));
    return response;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return error;
  }
};

export const fetchAllRmsFms = async () => {
  try {
    const response = await axios.get(buildApiUrl("/getFmList", "fm"));
    return response;
  } catch (error) {
    console.error("Error fetching FMs:", error);
    return error;
  }
};

export const updateRecordInDB = async (recordId, updateRecords) => {
  try {
    const response = await axios.put(buildApiUrl("/updateTask", "rm"), {
      id: recordId,
      cur_stat_code: parseInt(updateRecords.currentStatus),
      schedule_date: updateRecords.updatedScheduleDate,
      schedule_time: updateRecords.updatedScheduleTime,
      fm_id: parseInt(updateRecords.updatedFm),
      rm_id: parseInt(updateRecords.updatedRm),
    });

    if (response.status === 200) {
      alert("Record updated successfully!");
    } else {
      alert("Failed to update record!");
    }
  } catch (error) {
    console.error("Error updating record:", error);
  }
};
