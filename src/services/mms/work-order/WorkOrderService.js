import { axios } from "@utils";

const API = "/api/work-order";

export const get = async (params) => {
  try {
    return await axios.get(`${API}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getPoMasterArr = async () => {
  try {
    return await axios.get(`${API}/get-forecast-po-master`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterialArr = async (fPoMasterId) => {
  try {
    return await axios.get(`${API}/get-products-by-po-master`, {
      params: { fPoMasterId: fPoMasterId },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getLineArr = async () => {
  try {
    return await axios.get(`${API}/get-lines`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const create = async (params) => {
  try {
    return await axios.post(`${API}/create-wo`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modify = async (params) => {
  try {
    return await axios.put(`${API}/modify-wo`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const handleDelete = async (params) => {
  try {
    return await axios.put(`${API}/delete-reuse-wo`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
