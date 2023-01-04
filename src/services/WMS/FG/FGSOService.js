import { axios } from '@utils';
const API = 'api/fg-shipping-order';

export const getFGSOMasters = async (params) => {
  try {
    return await axios.get(`${API}/get-fgso-masters`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createFGSOMaster = async (params) => {
  try {
    return await axios.post(`${API}/create-fgso-masters`, { ...params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modifyFGSOMaster = async (params) => {
  try {
    return await axios.put(`${API}/modify-fgso-masters`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const deleteFGSOMaster = async (params) => {
  try {
    return await axios.delete(`${API}/delete-fgso-masters`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createFGSODetail = async (params) => {
  try {
    return await axios.post(`${API}/create-fgso-details`, { ...params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getFGSODetails = async (params) => {
  try {
    return await axios.get(`${API}/get-fgso-details`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modifyFGSODetail = async (params) => {
  try {
    return await axios.put(`${API}/modify-fgso-details`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const handleDeleteSODetail = async (params) => {
  try {
    return await axios.delete(`${API}/delete-fgso-details`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getLots = async (materialId) => {
  try {
    return await axios.get(`${API}/get-lots?materialId=${materialId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const pickingFGSODetail = async (params) => {
  try {
    return await axios.put(`${API}/picking-fgso-details`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getESLDataByBinCode = async (binCode) => {
  try {
    return await axios.get(`${API}/get-els-data-by-binCode?BinCode=${binCode}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getDataPrint = async (params) => {
  try {
    return await axios.get(`${API}/get-data-print`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterialModelFinish = async () => {
  try {
    return await axios.get(`${API}/get-select-material-type-finish`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
