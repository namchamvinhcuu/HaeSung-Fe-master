import { axios } from '@utils';

const apiName = '/api/fg-stock';

export const getFGStock = async (params) => {
  try {
    return await axios.get(`${apiName}/get-fg-stock`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getLotStock = async (params) => {
  try {
    return await axios.get(`${apiName}/get-lot-stock`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
