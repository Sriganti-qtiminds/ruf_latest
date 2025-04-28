import React, { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";
import {
  fetchCities,
  fetchCommunities,
  fetchRecords,
  fetchRmFms,
} from "../../../services/adminapiservices";

function Requests() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [communities, setCommunities] = useState([]);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState([]);
  const [rmfm, setRmfm] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

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

  useEffect(() => {
    const fetchCommunitie = async () => {
      if (!selectedCity) {
        setCommunities([]);
        return;
      }
      try {
        const res = await fetchCommunities(selectedCity);
        setCommunities(res.data.result);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };
    fetchCommunitie();
  }, [selectedCity]);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetchRecords();
        setRecords(response.data.result);
        setStatus(response.data.status);
        setRequestsLoading(false);
      } catch (error) {
        console.error("Error fetching Records:", error);
      }
    };
    fetchRecord();
  }, []);

  useEffect(() => {
    const fetchrmfm = async () => {
      try {
        const response = await fetchRmFms();
        setRmfm(response.data.result);
      } catch (error) {
        console.error("Error fetching RM/FM:", error);
      }
    };
    fetchrmfm();
  }, []);

  return (
    <div className="bg-white h-[calc (100vh-110px)] rounded-lg shadow m-5">
      <AdminPanel
        cities={cities}
        communities={communities}
        onCityChange={setSelectedCity}
        records={records}
        status={status}
        rmfm={rmfm}
        requestsLoading={requestsLoading}
      />
    </div>
  );
}

export default Requests;
