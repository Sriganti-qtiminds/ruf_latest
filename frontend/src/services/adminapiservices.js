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
