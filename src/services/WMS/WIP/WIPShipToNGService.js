import { axios } from '@utils';
const API = 'api/wip-shiptong';

export const get = async (params) => {
  try {
    return await axios.get(`${API}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const receivingLot = async (params) => {
  try {
    return await axios.put(`${API}/receiving-lot`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const handleDelete = async (params) => {
  try {
    return await axios.put(`${API}/delete-lot`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterial = async () => {
  try {
    return await axios.get(`${API}/get-select-material`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
