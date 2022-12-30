import { axios } from '@utils';

const apiName = '/api/ng-stock';

const getMaterialListNG = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getLotStockNG = async (params) => {
  try {
    return await axios.get(`${apiName}/get-lot-stock`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMaterialType = async () => {
  try {
    return await axios.get(`${apiName}/get-material-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export { getMaterialListNG, getMaterialType, getLotStockNG };
