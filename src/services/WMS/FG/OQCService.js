import { axios } from '@utils';
const API = 'api/oqc';

export const scanOQC = async (lotId) => {
  try {
    return await axios.get(`${API}/scan-oqc/${lotId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const checkOQC = async (params) => {
  try {
    return await axios.post(`${API}/check-oqc`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getSelectQC = async (lotId) => {
  try {
    return await axios.get(`${API}/get-select-qc/${lotId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
