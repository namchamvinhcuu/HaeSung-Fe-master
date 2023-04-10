import { axios } from '@utils';

const apiName = 'api/stock-adjustment';

export const getSA = async (params) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createSA = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const updateSA = async (params) => {
  try {
    return await axios.put(`${apiName}/modify`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const finishSA = async (params) => {
  try {
    return await axios.put(`${apiName}/finish`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const deleteSA = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getSADetail = async (params) => {
  try {
    return await axios.get(`${apiName}/get-detail`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createSADetail = async (params) => {
  try {
    return await axios.post(`${apiName}/create-detail`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modifySADetail = async (params) => {
  try {
    return await axios.post(`${apiName}/modify-detail`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const confirmSADetail = async (params) => {
  try {
    return await axios.post(`${apiName}/confirm-detail`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const deleteSADetail = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete-detail`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getArea = async () => {
  try {
    return await axios.get(`${apiName}/get-area`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getShelf = async (StockAdjustmentId) => {
  try {
    return await axios.get(`${apiName}/get-shelf/${StockAdjustmentId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterial = async (params) => {
  try {
    return await axios.get(`${apiName}/get-material`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
export const createSADetailByMaterial = async (params) => {
  try {
    return await axios.post(`${apiName}/create-detail-by-material`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
