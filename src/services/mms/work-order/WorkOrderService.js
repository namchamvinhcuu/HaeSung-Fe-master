import { axios } from '@utils';

const API = '/api/work-order';

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

export const getSearchMaterialArr = async (BomLv, BomId) => {
  try {
    return await axios.get(`${API}/get-search-material`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterialArrByForecastPOMaster = async (params) => {
  try {
    return await axios.get(`${API}/get-material-by-forecastPOMaster`, {
      params: {
        FPoMasterId: params.FPoMasterId,
        Week: params.Week,
        Year: params.Year,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getBom = async (params) => {
  try {
    return await axios.get(`${API}/get-bom`, {
      params: {
        FPOId: params.FPOId,
        MaterialId: params.MaterialId,
      },
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

export const getMoldArr = async (MaterialId) => {
  try {
    return await axios.get(`${API}/get-mold/${MaterialId}`);
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

export const createByExcel = async (params) => {
  try {
    return await axios.post(`${API}/create-by-excel`, params);
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
