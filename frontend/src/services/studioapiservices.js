import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

export const postCallbackDetails = async (name, mobileNo) => {
  try {
    const response = await axios.post(`${apiUrl}/addNewEnquiryRecord`, {
      name: name,
      mobile_no: mobileNo,
      usercat: 3,
    });
    return response;
  } catch (error) {
    console.log("Error At Posting:", error.message);
    return error;
  }
};

export const fetchAllAreasData = async () => {
  try {
    const url = `${apiUrl}/getStudioRoomsInfo`;
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return error;
  }
};
