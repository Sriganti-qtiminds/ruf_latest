


import React, { useState, useEffect } from 'react';
import AdminPanel from './AdminPanel';
import { fetchCities, fetchBuilders, fetchRecords, fetchCommunities, fetchRmFms, fetchComMapDetails } from './newApiServices';
import axios from 'axios';
const apiUrl = `${import.meta.env.VITE_API_URL}`;

function Requests() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [builders, setBuilders] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState("");
  const [communities, setCommunities] = useState([]);
  const [records, setRecords] = useState([]);
  console.log("rec", records)
  const [status, setStatus] = useState([]);
  const [rmfm, setRmfm] = useState([]); // Reintroduced for RM/FM filter data
  const [comMapDetails, setComMapDetails] = useState([]); // For community mapping
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });
  const [selectedStatus, setSelectedStatus] = useState(""); // For status filter
  const [selectedRm, setSelectedRm] = useState(""); // For RM filter
  const [selectedCommunity, setSelectedCommunity] = useState(""); // For community filter

  // Fetch cities
  useEffect(() => {
    const fetchCitie = async () => {
      try {
        const res = await fetchCities();
        setCities(res.data.result);
      } catch (error) {
        console.error("Error fetching cities", error);
      }
    };
    fetchCitie();
  }, []);

  // Fetch builders based on city
  useEffect(() => {
    const fetchBuilder = async () => {
      if (!selectedCity) {
        setBuilders([]);
        return;
      }
      try {
        const res = await fetchBuilders(selectedCity);
        setBuilders(res.data.result);
      } catch (error) {
        console.error("Error fetching builders:", error);
      }
    };
    fetchBuilder();
  }, [selectedCity]);

  // Fetch communities based on builder
  useEffect(() => {
    const fetchCommunitie = async () => {
      if (!selectedBuilder) {
        setCommunities([]);
        return;
      }
      try {
        const res = await fetchCommunities(selectedBuilder);
        setCommunities(res.data.result);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };
    fetchCommunitie();
  }, [selectedBuilder]);

  // Fetch RM/FM data for filters
  useEffect(() => {
    const fetchRmFmData = async () => {
      try {
        const response = await fetchRmFms();
        setRmfm(response.data.result);
      } catch (error) {
        console.error('Error fetching RM/FM:', error);
      }
    };
    fetchRmFmData();
  }, []);

  // Fetch community mapping details
  useEffect(() => {
    const fetchComMap = async () => {
      try {
        const response = await fetchComMapDetails();
        setComMapDetails(response.data.result);
      } catch (error) {
        console.error('Error fetching community mapping details:', error);
      }
    };
    fetchComMap();
  }, []);

  // Fetch records with pagination and filters
  const fetchRecordData = async (page = 1) => {
    setRequestsLoading(true);
    try {
      const filters = {
        current_status: selectedStatus,
        rm_id: selectedRm,
        builder_id: selectedBuilder,
        community_id: selectedCommunity,
      };
      const response = await fetchRecords(page, pagination.limit, filters);
     
      setRecords(response.data.result);
      setStatus(response.data.status);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalRecords: response.data.pagination.totalRecords,
        limit: response.data.pagination.limit,
      });
    } catch (error) {
      console.error('Error fetching Records:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordData(pagination.currentPage);
  }, [pagination.currentPage,selectedStatus, selectedRm, selectedBuilder, selectedCommunity]);

  // Update record
  const onUpdateRecord = async (recordId, updateRecords) => {
    try {
      const payload = {
        id: recordId,
        cur_stat_code: parseInt(updateRecords.currentStatus),
        schedule_date: updateRecords.updatedScheduleDate,
        schedule_time: updateRecords.updatedScheduleTime,
      };

      if (updateRecords.currentStatus === 18 && updateRecords.Inv_Amount) {
        payload.Inv_Amount = parseFloat(updateRecords.Inv_Amount);
      }

      const response = await axios.put(`${apiUrl}/updateTask`, payload);
     

      if (response.data.message === "Invoice already exists for this Tenant and Property.") {
        alert(`Invoice already exists for Tenant_ID: ${response.data.existingInvoice.Tenant_ID} and Property_ID: ${response.data.existingInvoice.Property_ID}`);
      } else if (response.status === 200) {
        alert('Record updated successfully!');
        fetchRecordData(pagination.currentPage); // Refresh data after update
      } else {
        alert('Failed to update record!');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Error updating record. Please try again.');
      }
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="bg-white h-[calc(100vh-110px)] rounded-lg shadow m-5">
      <AdminPanel
        cities={cities}
        builders={builders}
        communities={communities}
        onCityChange={setSelectedCity}
        onBuilderChange={setSelectedBuilder}
        records={records}
        status={status}
        rmfm={rmfm} // Pass RM/FM data for filters
        comMapDetails={comMapDetails} // Pass community mapping data
        onUpdateRecord={onUpdateRecord}
        requestsLoading={requestsLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        setSelectedRm={setSelectedRm}
        setSelectedCommunity={setSelectedCommunity}
        setSelectedStatus={setSelectedStatus}
      />
    </div>
  );
}

export default Requests;
