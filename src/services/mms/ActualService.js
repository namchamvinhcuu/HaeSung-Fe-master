import { axios } from '@utils';

const API = '/api/Actual';

export const get = async (params) => {
  try {
    return await axios.get(`${API}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getByWo = async (params) => {
  try {
    return await axios.get(`${API}/get-by-wo`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getWoInfo = async (params) => {
  try {
    return await axios.get(`${API}/get-wo-info`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getQcDetail = async (params) => {
  try {
    return await axios.get(`${API}/get-qc-detail`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createByWo = async (params) => {
  try {
    return await axios.post(`${API}/create-lot`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
