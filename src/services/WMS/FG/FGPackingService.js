import { axios } from '@utils';

const apiName = 'api/fg-packing';

export const getPA = async (params) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createPA = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const updatePA = async (params) => {
  try {
    return await axios.put(`${apiName}/modify`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const deletePA = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getPADetail = async (params) => {
  try {
    return await axios.get(`${apiName}/get-detail`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getPADetailPrint = async (params) => {
  try {
    return await axios.get(`${apiName}/get-detail-print`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createPADetail = async (params) => {
  try {
    return await axios.post(`${apiName}/create-detail`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const deletePADetail = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete-detail`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterial = async () => {
  try {
    return await axios.get(`${apiName}/get-material`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
