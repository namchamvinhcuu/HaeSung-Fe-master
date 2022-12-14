import { axios } from '@utils';

const apiName = '/api/wip-stock';

const getMaterialList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
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

const getUnit = async () => {
  try {
    return await axios.get(`${apiName}/get-unit`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getSupplier = async () => {
  try {
    return await axios.get(`${apiName}/get-supplier`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getLotStock = async (params) => {
  try {
    return await axios.get(`${apiName}/get-lot-stock`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export { getMaterialList, getMaterialType, getUnit, getSupplier, getLotStock };
