import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fetchCities,
  fetchCommunities,
  fetchStatusOptions,
  fetchBuilders,} from "../../../services/adminapiservices"

export function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "All Status",
    city: "All City",
    builder: "All Builder",
    community: "All Community",
  });

  // {Updated api calling code using axios}
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCitiesAndStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const [citiesData, statusData] = await Promise.all([
          (await fetchCities()).data,
          (await fetchStatusOptions()).data,
        ]);

        setCities(citiesData.result || []);
        setStatusOptions(statusData.result || []);
        setFilters({ ...filters, status: 1 });
        onFilterChange({ ...filters, status: 1 });
      } catch (err) {
        console.error("Error loading cities and status options:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCitiesAndStatus();
  }, []);



  useEffect(() => {
    const loadBuilders = async () => {
      if (filters.city === "All City") return; // ✅ Prevent API call if city is not selected
  
      try {
        setLoading(true);
        setError(null);
        const buildersData = await fetchBuilders(filters.city);
       
        setBuilders(buildersData.data.result || []);
      } catch (e) {
        console.error("Error while loading builders", e.message);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadBuilders();
  }, [filters.city]);
  

  useEffect(() => {
    const loadCommunities = async () => {
      if (filters.builder === "All Builder") return;
      try {
        setLoading(true);
        setError(null);

        const communityData = await fetchCommunities(filters.builder);
       
        setCommunities(communityData.data.result || []);
      } catch (err) {
        console.error("Error loading communities:", err.message);
         setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, [filters.builder]);

  const handleFilterChange = (key, value) => {
    let newFilters = { ...filters, [key]: value }
    if (key === 'city') {
      newFilters.builder = 'All Builder';
      newFilters.community = 'All Community';
  } 
  if (key === 'builder') {
      newFilters.community = 'All Community';  
  }
    setFilters(newFilters)
    onFilterChange(newFilters)
  };

  return (
    <div className="flex items-center gap-4 py-6 justify-between overflow-auto">
      <h2 className="text-lg font-semibold w-auto whitespace-nowrap">
        Property Listings
      </h2>
      {/* Loading Indicator */}
      {loading && <p className="text-blue-500">Loading, please wait...</p>}

      {/* Error Message */}
    {/* {error && <p className="text-red-500">{error}</p>} */}
      <div className="flex gap-4">
        <select
          className="border rounded px-3 py-2"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          {/* <option value="All Status">All Status</option> */}
          {statusOptions &&
            statusOptions.map((status) => (
              <option key={status.id} value={status.id}>
                {status.status_code}
              </option>
            ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
        >
          <option value="All City">All Cities</option>
          {cities &&
            cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.builder}
          onChange={(e) => handleFilterChange('builder', e.target.value)}
        >
          <option value="All Builders">Select Builder</option>
          {builders && builders.map((builder) => (
            <option key={builder.id} value={builder.id}>{builder.name}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filters.community}
          onChange={(e) => {
            e.preventDefault();
            handleFilterChange("community", e.target.value);
          }}
          disabled={filters.city === "All City"}
        >
          <option value="All Community">All Communities</option>
          {communities &&
            communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};
