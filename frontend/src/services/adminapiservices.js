import axios from "axios";

import {
  fetchDashboardDataApi,
  getRecords,
  fetchPropertiesApi,
  updatePropertyStatusApi,
  fetchAllRequest,
  fetchAllRmsFms,
  updateRecordInDB,
} from "../config/adminConfig";
const apiUrl = `${import.meta.env.VITE_API_URL}`;
import { deleteRecord } from "../config/apiRoute";
// Dashboard

// Top Containers
export const fetchDashboardData = async () => {
  return fetchDashboardDataApi();
};

// -----------------------------------------------------------------------------------

// Property Listings

// Fetch cities
export const fetchCities = async () => {
  return await getRecords("st_city", "id,name", "rstatus=1");
};

// Fetch status options
export const fetchStatusOptions = async () => {
  return await getRecords(
    "st_current_status",
    "id,status_code",
    'status_category="ADM"'
  );
};

export const fetchBuilders = async (cityName) => {
  if (cityName === "All Cities") {
    return { result: [] };
  }
  return await getRecords("st_builder", "id,name,city_id", `rstatus=1`);
};
// Fetch communities
export const fetchCommunities = async (cityName) => {
  if (cityName === "All City") {
    return { result: [] };
  }
  return await getRecords("st_community", "id,name", `rstatus=1`);
};

// Fetch properties
export const fetchProperties = async (filters) => {
  try {
    const data = await fetchPropertiesApi(filters);
    if (!data || !data.results || !data.pagination) {
      throw new Error("Invalid response structure from API");
    }
    return data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { error: error.message };
  }
};

// Update property status
export const updatePropertyStatus = async (propertyId, newStatus) => {
  try {
    const response = await updatePropertyStatusApi(propertyId, newStatus);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating property status:", error);
    return { error: error.message };
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    const response = await deleteRecord("dy_property", `id=${propertyId}`);
    return { message: response.message };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: error.message };
  }
};
// -----------------------------------------------------------------------------------------

// Requests

export const fetchRecords = async () => {
  return fetchAllRequest();
};

export const fetchRmFms = async () => {
  return fetchAllRmsFms();
};

export const updateRequest = async (recordId, updateRecords) => {
  updateRecordInDB(recordId, updateRecords);
};


//Reviews
export const getAllTestimonials = async () => {
  const url = `${apiUrl}/getAllTestimonialRecords`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No testimonials found.');
  }
  return response.json().then(data => {
    if (!data.result || data.result.length === 0) {
      return [];
    }
    return data.result.map(item => ({
      id: item.id,
      user_name: item.user_name || 'Anonymous',
      display_name: item.display_name || item.user_name || 'Anonymous',
      rating: item.rating,
      description: item.description,
      image_data: item.image_data || null,
      current_status: item.current_status,
      testimonial_date: item.testimonial_date,
      city_id: item.city_id || null,
      city_name: item.city_name || null,
      builder_id: item.builder_id || null,
      builder_name: item.builder_name || null,
      community_id: item.community_id || null,
      community_name: item.community_name || null,
    }));
  });
};


export const updateTestimonial = async (id, updateData) => {
  const response = await fetch(`${apiUrl}/updateNewTestimonialRecord`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...updateData }),
  });

  if (!response.ok) {
    throw new Error('Failed to update testimonial');
  }

  return response.json();
};

export const deleteTestimonial = async (id) => {
  const response = await fetch(`${apiUrl}/deleteNewTestimonialRecord?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete testimonial');
  }

  return response.json();
};