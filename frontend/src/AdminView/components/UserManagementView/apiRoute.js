// Importing the axios library to handle HTTP requests
import axios from "axios";

export const apiUrl = `${import.meta.env.VITE_API_URL}`;
/**
 * Fetch records from the database using query parameters.
 *
 * @param {string} tableName - Name of the database table.
 * @param {string} fieldNames - Comma-separated field names to retrieve.
 * @param {string} [whereCondition] - Optional filtering condition (SQL-like).
 * @returns {Promise<Object>} - API response data.
 */
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

    // Construct query parameters
    const params = {
      tableName, // Use exact parameter name from the backend
      fieldNames,
      whereCondition,
    };

    // Make the GET request to the API
    const response = await axios.get(`${apiUrl}/getRecords`, { params });

    // Return the response data
    return response.data;
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
  if (filters.status && filters.status !== "All Status") {
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

  const whereClause =
    whereConditions.length > 0 ? whereConditions.join("&") : "";
  const url = `${apiUrl}/showPropDetails?${whereClause}`;

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

// Update user record (role and rstatus)
export const updateUserRecordApi = async (userId, roleId, rstatus) => {
  const url = `${apiUrl}/updateRecord`;
  const payload = {
    tableName: "dy_user",
    fieldValuePairs: {
      ...(roleId && { role_id: roleId }),
      ...(rstatus !== undefined && { rstatus }),
    },
    whereCondition: `id="${userId}"`,
  };

  try {
    const response = await axios.put(url, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating user record:", error);
    throw error;
  }
};
