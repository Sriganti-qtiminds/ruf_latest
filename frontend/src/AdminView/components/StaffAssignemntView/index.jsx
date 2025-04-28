import React, { useState, useEffect } from "react";
import St from "./St";
import { fetchRmFms } from "./newApiServices";

function  StaffAssignment() {
  const [rmfm, setRmfm] = useState([]);

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
      <St rmfm={rmfm} setRmfm={setRmfm} />
  );
}
export default  StaffAssignment;

