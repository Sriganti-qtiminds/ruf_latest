
import axios from "axios";
export const apiUrl = `${import.meta.env.VITE_API_URL}`;

export const fetchCities=async ()=>{
    try {
        const response = await axios.get(
          `${apiUrl}/getRecords?tableName=st_city&fieldNames=id,name,state_id&whereCondition=rstatus=1`
        );
        return response
      } catch (error) {
        return error
      }
 };
 export const fetchBuilders=async (selectedCity)=>{
  try {
      const response = await axios.get(
        `${apiUrl}/getRecords?tableName=st_builder&fieldNames=id,name,city_id&whereCondition=city_id=${selectedCity} AND rstatus=1`
      );
      return response
    } catch (error) {
      return error
    }
};


export const fetchCommunities=async (selectedBuilder)=>{
  console.log("sel builder",selectedBuilder)
    try {
        const response = await axios.get(
          `${apiUrl}/getRecords?tableName=st_community&fieldNames=id,name,builder_id&whereCondition=builder_id=${selectedBuilder} AND rstatus=1`
        );
        return response
      } catch (error) {
        return error
      }
 };


// export const fetchRecords=async ()=>{
//   try {
//       const response = await axios.get(
//         `${apiUrl}/adminRequests`
//       );
//       return response
//     } catch (error) {
//       return error
//     }
// };

// export const fetchRecords = async (page = 1, perPage = 20) => {
//   try {
//     const response = await axios.get(
//       `${apiUrl}/adminRequests?page=${page}&perPage=${perPage}`
//     );
//     return response.data; // Return only the data portion
//   } catch (error) {
//     console.error("Error fetching records:", error);
//     throw error; // Throw error to handle in component
//   }
// };

export const fetchRecords = async (page = 1, perPage = 10, filters = {}) => {
  try {
    const {current_status, rm_id,builder_id, community_id } = filters;

    const params = new URLSearchParams({
      page,
      perPage,
      ...(current_status && {current_status}),
      ...(rm_id && { rm_id }),
      ...(builder_id && {builder_id}),
      ...(community_id && { community_id }),
    });
    const response = await axios.get(`${apiUrl}/adminRequests?${params}`);
    return response;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

export const fetchRmFms=async ()=>{
  try {
      const response = await axios.get(
        `${apiUrl}/staffDetails`
      );
      return response
    } catch (error) {
      return error
    }
};


export const fetchComMapDetails = async (communityId) => {
  try {
    const response = await axios.get(
      `${apiUrl}/communityMapDetails`,
      {
        params: communityId ? { community_id: communityId } : {}, 
      }
    );
    return response; 
  } catch (error) {
    return error; 
  }
};



  

