import { axios } from '@utils';
const API = 'api/lot-information';

export const getLot = async (params) => {
  try {
    return await axios.get(`${API}/get-lot`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
