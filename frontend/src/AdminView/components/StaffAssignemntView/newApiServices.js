import axios from "axios";
const apiUrl = `${import.meta.env.VITE_API_URL}`;


//To display data in  UI 
export const fetchRmFms = async () => {
  try {
    const response = await axios.get(`${apiUrl}/communityMapDetails`);
    return response;
  } catch (error) {
    return error;
  }
};

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
       `${apiUrl}/getRecords?tableName=st_builder&fieldNames=id,name,city_id&whereCondition=rstatus=1&city_id=${selectedCity}`
      );
      return response
    } catch (error) {
      return error
    }
};


 export const fetchCommunities = async () => {
   try {
     const response = await axios.get(
       `${apiUrl}/getRecords?tableName=st_community&fieldNames=id,name,builder_id&whereCondition=rstatus=1`
     );
     return response.data.result;
   } catch (error) {
     return error;
   }
 };

 
export const fetchid = async () => {
  try {
    const response = await axios.get(
      `${apiUrl}/getRecords?tableName=dy_rm_fm_com_map&fieldNames=id`
    );
  
    return response.data.result;
   
  } catch (error) {
    return error;
  }
};

//To display Rm, Fm,community names in dropdown 
export const fetchRMs = async () => {
  try {
    const response = await axios.get(`${apiUrl}/staffDetails`);
    return response.data.result;
  } catch (error) {
    return error;
  }
};




