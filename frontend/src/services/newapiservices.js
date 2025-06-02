import axios from "axios";
import { getRecords, addNewRecord, addProperty } from "../config/apiRoute";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

// User Profile
export const fetchUserProfileDetails = async (userId) => {
  try {
    const url = `${apiUrl}/userProfile?user_id=${userId}`;
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return error;
  }
};

// User Landing View Listings Api [1]
export const fetchAllProperties = async (
  filters = {},
  pagination = { page: 1, limit: 6 }
) => {
  try {
    const { page, limit } = pagination;
    const params = {
      ...filters,
      page,
      limit,
      current_status: 3,
    };

    const url = `${apiUrl}/showPropDetails`;
    const response = await axios.get(url, { params });
    return response;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return error;
  }
};

export const fetchUserActions = async (userId) => {
  try {
    const url = `${apiUrl}/actions?user_id=${userId}`;
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return error;
  }
};

export const fetchPostPropertiesData = async () => {
  try {
    const response = await axios.get(`${apiUrl}/getPostData`);
    return response;
  } catch (error) {
    console.error("Error fetching records:", error);
    console.log(`PostProperty Data Fetching Failed...`, error);
    return error;
  }
};

export const fetchFiltersData = async () => {
  try {
    const response = await axios.get(`${apiUrl}/filterdata`);
    return response;
  } catch (error) {
    console.log("Filter Data Fetching Failed", error);
    return error;
  }
};

export const uploadProperty = async (fieldValues) => {
  const images = fieldValues.images;
  console.log("images..", images);
  delete fieldValues.images;
  return addProperty(fieldValues, images);
};

// My Listings View Api's [1]
export const fetchUserListings = async (userId, page, limit) => {
  try {
    const url = `${apiUrl}/usermylistings?user_id=${userId}&page=${page}&limit=${limit}`;
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching Listings:", error);
    return error || "Fetch Failed";
  }
};

export const fetchTransactionsData = async (userId) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getUserTransactions?tenant_id=${userId}`
    );
    return response;
  } catch (error) {
    console.log("Filter Data Fetching Failed", error);
    return error;
  }
};

// RM ------------

export const postRMTask = async (userId, propertyId, statusId) => {
  try {
    const response = await axios.post(`${apiUrl}/addRmTask`, {
      user_id: userId,
      property_id: propertyId,
      cur_stat_code: statusId,
    });
    return response;
  } catch (error) {
    console.log("Error At Connect To RM:", error.message);
    return error;
  }
};

export const updateRMTask = async (userId, propertyId, statusId) => {
  try {
    const response = await axios.put(`${apiUrl}/updateRmTask`, {
      user_id: userId,
      property_id: propertyId,
      cur_stat_code: statusId,
    });
    return response;
  } catch (error) {
    console.log("Error At Connect To RM:", error.message);
    return error;
  }
};

export const deleteRMTask = async (trId) => {
  try {
    console.log("del_new", trId);
    const response = await axios.delete(`${apiUrl}/deleteRecord`, {
      data: {
        tableName: "dy_transactions",
        whereCondition: `id = ${trId}`,
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


// testimonial related

export const addNewTestimonial = async (testimonialData, imageFile) => {
  try {
    console.log('Adding new testimonial:', testimonialData, imageFile);

    // Create FormData object for multipart/form-data request
    const formData = new FormData();
    formData.append('user_id', testimonialData.user_id);
    formData.append('display_name', testimonialData.display_name);
    formData.append('rating', testimonialData.rating);
    formData.append('description', testimonialData.description);
    formData.append('current_status', testimonialData.current_status);
    formData.append('city_id', testimonialData.city_id); // Add city_id
  formData.append('builder_id', testimonialData.builder_id); // Add builder_id
  formData.append('community_id', testimonialData.community_id);
    
    // Append image file if provided
    if (imageFile) {
      formData.append('images', imageFile);
    }

    const response = await axios.post(
      `${apiUrl}/addNewTestimonialRecord`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error adding testimonial:', error.message || error);
    throw new Error(
      error.response?.data?.message || 'Failed to add testimonial'
    );
  }
};

export const getTestimonials = async (id = null) => {
  try {
    const response = await axios.get(`${apiUrl}/getNewTestimonialRecord`, {
      params: id ? { id } : {},
    });
    return response.data.result;
  } catch (error) {
    console.error('API Error:', error.response?.data, error.message);
    if (error.response?.status === 404) {
      throw new Error('No approved testimonials found.');
    } else {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch testimonials.'
      );
    }
  }
};


