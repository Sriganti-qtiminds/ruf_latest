


import axios from "axios";
import apiStatusConstants from "../utils/apiStatusConstants";
import { buildApiUrl } from "../utils/apiHelper";

export const addNewRecord = async (tableName, fieldNames, fieldValues) => {
  try {
    const response = await axios.post(buildApiUrl("/addNewRecord", null, true), {
      tableName,
      fieldNames,
      fieldValues,
    });
    return response;
  } catch (error) {
    console.error("Error adding new record:", error);
    throw error;
  }
};

export const addProperty = async (propertyData, images) => {
  try {
    const formData = new FormData();
    formData.append("propertyData", JSON.stringify(propertyData));
    images.forEach((image) => {
      formData.append("images", image);
    });
    console.log(formData);

    const response = await axios.post(buildApiUrl("/AddProperty", "user"), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("Error adding new record:", error);
    throw error;
  }
};

export const addRequest = async (requestData) => {
  try {
    const response = await axios.post(buildApiUrl("/addRequest", null, true), requestData);
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error adding request:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const fetchFilteredProperties = async (filters) => {
  try {
    let url = buildApiUrl("/filterProperties", null, true);
    const queryParams = new URLSearchParams(filters).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }

    // Sending a GET request to fetch filtered properties
    const response = await axios.get(url);

    // Returning success status and data
    return {
      status: apiStatusConstants.success,
      data: response.data.results, // Extracting results from the response
      errorMsg: null,
    };
  } catch (error) {
    console.error("Error fetching filtered properties:", error);

    // Returning failure status and error message
    return {
      status: apiStatusConstants.failure,
      data: null,
      errorMsg: error.response?.data?.error || "Fetch Failed",
    };
  }
};

// Function to fetch all transactions based on the user ID
//getTasks
export const getAllTransactionBasedOnId = async (rmId) => {
  try {
    const response = await axios.get(buildApiUrl("/requests", null, true), {
      params: { rm_id: rmId },
    });

    // Returning the entire response data
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error fetching request details:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

// Function to fetch a list of Field Managers (FM) based on a community ID
//getFmList
export const listOfFmBasedOnCommunityId = async (communityId) => {
  try {
    const response = await axios.get(buildApiUrl("/FmList", null, true), {
      params: { communityId },
    });
    // Returning the response data (the list of Field Managers)
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error fetching FM list:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const getRecords = async (tableName, fieldNames, additionalParams = {}) => {
  try {
    // Construct the where_condition if additionalParams include filtering conditions
    const whereCondition = Object.keys(additionalParams)
      .map((key) => `${key}=${additionalParams[key]}`)
      .join(" AND ");

    const response = await axios.get(buildApiUrl("/getRecords", null, true), {
      params: {
        tableName,
        fieldNames,
        whereCondition: whereCondition || null, // Add constructed condition
      },
    });

    return response.data.result;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

// Function to update the status of a transaction
//updateTask
export const updateTransaction = async (transactionId, status) => {
  try {
    const response = await axios.put(buildApiUrl("/updatetranscationsstatus", "user"), {
      transactionId,
      status,
    });
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error updating transaction:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const deleteRecord = async (tableName, whereCondition) => {
  try {
    const response = await axios.delete(buildApiUrl("/deleteRecord", null, true), {
      data: {
        tableName,
        whereCondition,
      },
    });
    return response;
  } catch (error) {
    console.error("Error deleting records:", error.message || error);
    throw new Error(error.response?.data?.message || "Failed to delete records");
  }
};

export const getTasks = async ({ rmId, fmId }) => {
  try {
    // Construct query parameters dynamically
    const queryParams = {};
    if (rmId) queryParams.rm_id = rmId;
    if (fmId) queryParams.fm_id = fmId;

    const response = await axios.get(buildApiUrl("/rmdata", "rm"), {
      params: queryParams,
    });

    // Returning the entire response data
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error fetching task details:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const getFmList = async (communityId) => {
  try {
    const response = await axios.get(buildApiUrl("/getFmList", "fm"), {
      params: { communityId },
    });
    // Returning the response data (the list of Field Managers)
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error fetching FM list:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const getFmTasks = async ({ rmId, fmId }) => {
  try {
    // Construct query parameters dynamically
    const queryParams = {};
    if (rmId) queryParams.rm_id = rmId;
    if (fmId) queryParams.fm_id = fmId;

    const response = await axios.get(buildApiUrl("/fmdata", "fm"), {
      params: queryParams,
    });

    // Returning the entire response data
    return response.data;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error fetching task details:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const updateTask = async (payload) => {
  try {
    const response = await axios.put(buildApiUrl("/updateTask", "rm"), payload);
    return response.data;
  } catch (error) {
    console.error("Error updating transaction:", error.response?.data || error.message);
    throw error;
  }
};

export const updateProperty = async (propertyId, propertyData, newImages = [], removedImages = []) => {
  const url = buildApiUrl("/updateProperty", "user");

  const propertyDataPayload = {
    property_id: propertyId,
    removedImages: removedImages,
    ...propertyData,
  };

  const formData = new FormData();
  formData.append('propertyData', JSON.stringify(propertyDataPayload));

  newImages.forEach((file, index) => {
    formData.append('images', file);
    console.log(`File ${index}:`, file.name, file.type, file.size);
  });

  console.log("Sending propertyData:", propertyDataPayload);
  console.log("Sending images count:", newImages.length);

  try {
    const response = await axios.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating property:", error);
    if (error.response) {
      console.error("Backend error response:", error.response.data);
    }
    throw error;
  }
};
