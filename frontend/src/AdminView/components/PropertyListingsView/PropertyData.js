import { useState, useEffect } from "react";

import { fetchProperties, updatePropertyStatus, deleteProperty } from "../../../services/adminapiservices";

export function PropertyData() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "All Status",
    city: "All City",
    builder:"All Builder",
    community: "All Community"
  });

  const fetchData = async (filters = {}) => {
    try {
        setLoading(true);
        setError(null);

        const pageToFetch = filters.page || currentPage;  // ✅ Ensure correct page is used
         
        const finalFilters = { ...appliedFilters, ...filters };
        const response = await fetchProperties({ 
            page: pageToFetch,   // ✅ Pass correct page number
            limit: 6,  
            ...finalFilters,
        });
        if (response) {
            setProperties(response.results || []);
            setCurrentPage(response.pagination?.currentPage || pageToFetch);  // ✅ Update currentPage
            setTotalPages(response.pagination?.totalPages || 1);
            setAppliedFilters(finalFilters);
        }
    } catch (err) {
        console.error("Error fetching properties:", err);
        setProperties([]);
        setError("Failed to fetch properties.");
    } finally {
        setLoading(false);
    }
};


// ✅ Fetch data whenever `currentPage` changes
useEffect(() => {
  fetchData({ page: currentPage });
}, [currentPage]); 

  const updateStatus = async (propertyId, newStatusCode) => {
    try {
      await updatePropertyStatus(propertyId, newStatusCode);
      fetchData({ page: currentPage }); 
    } catch (err) {
      console.error("Error updating property status:", err);
      setError("Failed to update property status.");
    }
  };
  const deletePropertyData = async (propertyId) => {
    try {
      await deleteProperty(propertyId);
      // alert("Property successfully deleted!");
      setTimeout(() => {
        fetchData({ ...appliedFilters, page: currentPage });
    }, 1500);
    } catch (error) {
      console.error("Failed to delete property:", error);
      setError(`Failed to delete property: ${error.message}`);
    }
  };

  return {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    fetchData,
    setCurrentPage, 
    updateStatus,
    deletePropertyData,
    appliedFilters
  };
}
