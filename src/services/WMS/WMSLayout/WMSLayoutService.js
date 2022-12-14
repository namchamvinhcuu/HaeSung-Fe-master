import { axios } from '@utils';

const API = '/api/wms-layout';

export const getAisles = async (commonDetailId) => {
  try {
    return await axios.get(`${API}/get-aisles?commonDetailId=${commonDetailId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const createShelf = async (params) => {
  try {
    return await axios.post(`${API}/create-shelf`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getShelves = async (locationId, shelfCode) => {
  try {
    return await axios.get(`${API}/get-shelves?locationId=${locationId}&shelfCode=${shelfCode}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getBins = async (shelfId) => {
  try {
    return await axios.get(`${API}/get-bins?shelfId=${shelfId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const editShelf = async (params) => {
  try {
    return await axios.put(`${API}/edit-shelf`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getLotByBinId = async (params) => {
  try {
    return await axios.get(`${API}/get-lot-by-bin`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modifyQty = async (params) => {
  try {
    return await axios.put(`${API}/modify-qty`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const scanESLCode = async (params) => {
  try {
    return await axios.put(`${API}/scan-esl-code`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getBinById = async (params) => {
  try {
    return await axios.get(`${API}/get-bin-by-id`, { params: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getBinByCode = async (params) => {
  try {
    return await axios.get(`${API}/get-bin-by-code`, { params: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const unLinkESL = async (params) => {
  try {
    const res = await axios.put(`${API}/unlink-esl`, {
      ...params,
    });
    return res;
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getBinsMapping = async (params) => {
  try {
    return await axios.get(`${API}/get-bins-mapping`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
