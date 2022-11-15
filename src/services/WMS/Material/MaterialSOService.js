import { axios } from "@utils";
const API = "api/material-shipping-order";

export const getMsoMasters = async (params) => {
    try {
        return await axios.get(`${API}/get-mso-masters`, {
            params: { ...params },
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export const createMsoMaster = async (params) => {
    try {
        return await axios.post(`${API}/create-mso-masters`, { ...params });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export const modifyMsoMaster = async (params) => {
    try {
      return await axios.put(`${API}/modify-mso-masters`, params);
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };
export const deleteMsoMaster = async (params) => {
    try {
      return await axios.delete(`${API}/delete-mso-masters`, { data: params });
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
  
  export const createMsoDetail = async (params) => {
    try {
        return await axios.post(`${API}/create-mso-details`, { ...params });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};
export const getMsoDetails = async (params) => {
    try {
        console.log('params', params)
      return await axios.get(`${API}/get-mso-details`, { params: { ...params } });
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };
 
  export const modifyMsoDetail = async (params) => {
    try {
      return await axios.put(`${API}/modify-mso-details`, params);
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };
  export const handleDeleteSODetail = async (params) => {
    try {
      return await axios.delete(`${API}/delete-mso-details`, { data: params });
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
  