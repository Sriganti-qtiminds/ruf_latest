import axios from "axios";
import apiStatusConstants from "../utils/apiStatusConstants";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

export const addNewRecord = async (tableName, fieldNames, fieldValues) => {
  try {
    // Sending a POST request to the server with the data (table name, field names, and values)
    const response = await axios.post(`${apiUrl}/addNewRecord`, {
      tableName, // The name of the table where the record is to be added
      fieldNames, // The names of the fields to be inserted
      fieldValues, // The values for each field in the record
    });
    // Returning the response data from the server
    return response;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error adding new record:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const addProperty = async (propertyData, images) => {
  try {
    // Create a FormData object
    const formData = new FormData();

    // Append property data as a JSON string
    formData.append("propertyData", JSON.stringify(propertyData));

    // Append images
    images.forEach((image) => {
      formData.append("images", image);
    });

    // Sending a POST request to the server with the FormData
    const response = await axios.post(`${apiUrl}/AddProperty`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data
      },
    });

    // Returning the response data from the server
    console.log("res..con", response);
    return response;
  } catch (error) {
    // Logging any errors encountered during the process
    console.error("Error adding new record:", error);
    // Throwing the error to be handled by the calling function
    throw error;
  }
};

export const addRequest = async (requestData) => {
  // rmrequests property id, userid
  try {
    // Sending a POST request with the request data to add the request
    const response = await axios.post(`${apiUrl}/addRequest`, requestData);
    // Returning the response data from the server
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
    // Construct the API URL dynamically based on filters
    let url = `${apiUrl}/filterProperties`;
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
    // Sending a GET request with the RM ID as a parameter to fetch request details
    const response = await axios.get(`${apiUrl}/requests`, {
      params: { rm_id: rmId }, // Passing the RM ID as a query parameter
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
    // Sending a GET request with the community ID as a parameter to fetch FM list for the community
    const response = await axios.get(`${apiUrl}/FmList`, {
      params: { communityId }, // Passing the community ID as a query parameter
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

// Function to fetch all records from the database
// Function to fetch records from different tables dynamically
export const getRecords = async (
  tableName,
  fieldNames,
  additionalParams = {}
) => {
  try {
    // Construct the where_condition if additionalParams include filtering conditions
    const whereCondition = Object.keys(additionalParams)
      .map((key) => `${key}=${additionalParams[key]}`)
      .join(" AND ");

    const response = await axios.get(`${apiUrl}/getRecords`, {
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
    // Sending a PUT request to update the status of a transaction
    const response = await axios.put(`${apiUrl}/updatetranscationsstatus`, {
      transactionId, // The ID of the transaction being updated
      status, // The new status for the transaction
    });
    // Returning the response data (the updated transaction details)
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
    const response = await axios.delete(`${apiUrl}/deleteRecord`, {
      data: {
        tableName: tableName,
        whereCondition: whereCondition,
      },
    });
    return response;
  } catch (error) {
    console.error("Error deleting records:", error.message || error);
    throw new Error(
      error.response?.data?.message || "Failed to delete records"
    );
  }
};

export const getTasks = async ({ rmId, fmId }) => {
  try {
    // Construct query parameters dynamically
    const queryParams = {};
    if (rmId) queryParams.rm_id = rmId;
    if (fmId) queryParams.fm_id = fmId;

    // Sending a GET request with query parameters to fetch task details
    const response = await axios.get(`${apiUrl}/rmdata`, {
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
    // Sending a GET request with the community ID as a parameter to fetch FM list for the community
    const response = await axios.get(`${apiUrl}/getFmList`, {
      params: { communityId }, // Passing the community ID as a query parameter
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

    // Sending a GET request with query parameters to fetch task details
    const response = await axios.get(`${apiUrl}/fmdata`, {
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
    const response = await axios.put(`${apiUrl}/updateTask`, payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating transaction:",
      error.response?.data || error.message
    );
    throw error;
  }
};


//For Editing property 



export const updateProperty = async (propertyId, propertyData, newImages = [], removedImages = []) => {
  const url = `${apiUrl}/updateProperty`;

  const propertyDataPayload = {
    property_id: propertyId,
    removedImages: removedImages,
    ...propertyData,
  };

  const formData = new FormData();
  formData.append('propertyData', JSON.stringify(propertyDataPayload));

  newImages.forEach((file, index) => {
    formData.append('images', file); // Changed from 'files' to 'images'
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
