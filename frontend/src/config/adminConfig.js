import axios from "axios";

export const apiUrl = `${import.meta.env.VITE_API_URL}`;

// Dashboard API's  -----------------------------------------------

export const fetchDashboardDataApi = async () => {
  try {
    const response = await axios.get(`${apiUrl}/admindashboard`);
    return response; // Return the result directly
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

// Property Listings API's -----------------------------------------

export const getRecords = async (
  tableName,
  fieldNames,
  whereCondition = ""
) => {
  try {
    // Validate required parameters
    if (!tableName || !fieldNames) {
      throw new Error("Missing required parameters: tableName or fieldNames.");
    }

    const params = {
      tableName,
      fieldNames,
      whereCondition,
    };
    const response = await axios.get(`${apiUrl}/getRecords`, { params });
    return response;
  } catch (error) {
    console.error(
      "Error fetching records:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Fetch properties based on filters
export const fetchPropertiesApi = async (filters) => {
  const whereConditions = [];

  // Handle single property fetch by property_id
  if (filters.property_id) {
    whereConditions.push(`property_id=${filters.property_id}`);
  } else {
    // Only add pagination and other filters if property_id is not provided
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

  const whereClause =
    whereConditions.length > 0 ? whereConditions.join("&") : "";
  const url = `${apiUrl}/adminPropListings?${whereClause}`;

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
  const url = `${apiUrl}/updateRecord`;
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
    const response = await axios.get(`${apiUrl}/rmdata`);
    return response;
  } catch (error) {
    return error;
  }
};

export const fetchAllRmsFms = async () => {
  try {
    const response = await axios.get(`${apiUrl}/getFmList`);
    return response;
  } catch (error) {
    return error;
  }
};

export const updateRecordInDB = async (recordId, updateRecords) => {
  try {
    const response = await axios.put(`${apiUrl}/updateTask`, {
      id: recordId,
      cur_stat_code: parseInt(updateRecords.currentStatus),
      schedule_date: updateRecords.updatedScheduleDate,
      schedule_time: updateRecords.updatedScheduleTime,
      fm_id: parseInt(updateRecords.updatedFm),
      rm_id: parseInt(updateRecords.updatedRm),
    });
    console.log("response", response);
    if (response.status) {
      alert("Record updated successfully!");
    } else {
      alert("Failed to update record!");
    }
  } catch (error) {
    console.error("Error updating record:", error);
  }
};
