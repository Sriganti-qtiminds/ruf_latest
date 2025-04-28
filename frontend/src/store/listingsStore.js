// listingsStore.js
import { create } from "zustand";
import apiStatusConstants from "../utils/apiStatusConstants";
import { fetchAllProperties } from "../services/newapiservices";

const useListingStore = create((set, get) => ({
  apiResponse: {
    status: apiStatusConstants.initial,
    data: [],
    count: [],
    errorMsg: null,
  },
  pagination: {
    totalPages: 0,
    totalRecords: 0,
  },
  currentPage: 1,
  pageLimit: 6,
  filterData: {},
  allListings: [], // Store all accumulated listings in memory only

  setCurrentPage: (page) => set({ currentPage: page }),

  fetchListings: async (filterData, page = 1, pageLimit = 6) => {
    // Reset listings if it's a new filter set or page 1
    const isNewFilterSet =
      page === 1 ||
      JSON.stringify(get().filterData) !== JSON.stringify(filterData);
    const initialData = isNewFilterSet ? [] : get().allListings;

    set({
      apiResponse: {
        status: apiStatusConstants.inProgress,
        data: initialData, // Clear data only on new filter or page 1
        errorMsg: null,
      },
      filterData,
      currentPage: page,
    });

    try {
      const updatedFilterData = {
        ...filterData,
        hometype: Array.isArray(filterData.hometype)
          ? filterData.hometype.join(",")
          : filterData.hometype || "",
        propertydescription: Array.isArray(filterData.propertydescription)
          ? filterData.propertydescription.join(",")
          : filterData.propertydescription || "",
        availability: Array.isArray(filterData.availability)
          ? filterData.availability.join(",")
          : filterData.availability || "",
        tenanttype: Array.isArray(filterData.tenanttype)
          ? filterData.tenanttype.join(",")
          : filterData.tenanttype || "",
      };

      const result = await fetchAllProperties(updatedFilterData, {
        page,
        limit: pageLimit,
      });

      if (result.status) {
        const newListings = result.data.results || [];
        const currentListings = isNewFilterSet ? [] : get().allListings;
        const countData = result.data.count;
        // Append new listings, avoiding duplicates
        const updatedListings = [
          ...currentListings,
          ...newListings.filter(
            (nl) => !currentListings.some((cl) => cl.id === nl.id)
          ),
        ];

        set({
          allListings: updatedListings,
          apiResponse: {
            status: apiStatusConstants.success,
            data: updatedListings,
            count: countData,
            errorMsg: null,
          },
          pagination: {
            totalPages: result.data.pagination.totalPages || 0,
            totalRecords: result.data.pagination.totalRecords || 0,
          },
        });
      } else {
        console.error("API returned failure:", result);
        set({
          apiResponse: {
            status: apiStatusConstants.failure,
            data: initialData,
            count: countData,
            errorMsg: result.message || "Failed to fetch properties",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      set({
        apiResponse: {
          status: apiStatusConstants.failure,
          data: initialData,
          count: countData,
          errorMsg: error.message || "Failed to fetch properties",
        },
      });
    }
  },

  clearListings: () => {
    set({
      allListings: [],
      apiResponse: {
        status: apiStatusConstants.initial,
        data: [],
        count: [],
        errorMsg: null,
      },
      pagination: {
        totalPages: 0,
        totalRecords: 0,
      },
      currentPage: 1,
      filterData: {},
    });
  },
}));

export default useListingStore;
