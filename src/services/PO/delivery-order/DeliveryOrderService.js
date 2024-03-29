import { axios } from '@utils';

const API = '/api/delivery-order';

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
    return await axios.get(`${API}/get-forecastPO-master`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterialArr = async (params) => {
  try {
    return await axios.get(`${API}/get-products-by-poMaster`, {
      params: {
        FPoMasterId: params.FPoMasterId,
        Year: params.Year,
        Week: params.Week,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const create = async (params) => {
  try {
    return await axios.post(`${API}/create-do`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modify = async (params) => {
  try {
    return await axios.put(`${API}/modify-do`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const handleDelete = async (params) => {
  try {
    return await axios.put(`${API}/delete-reuse-do`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const toggleWorking = async (doId, row_version) => {
  try {
    const abc = await axios.put(`${API}/toggle-do`,
    {
      doId : doId,
      rowVersion : row_version
    });
    console.log('🚀 ~ file: DeliveryOrderService.js:72 ~ toggleWorking ~ abc:', abc);
    return abc;
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createByExcel = async (params) => {
  try {
    return await axios.post(`${API}/create-by-excel`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
