import { axios } from '@utils'

const apiName = '/api/BomDetail';

const getBomDetailList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createBomDetail = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const modifyBomDetail = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteBomDetail = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getMaterial = async () => {
  try {
    return await axios.get(`${apiName}/get-material`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getBomDetailList,
  createBomDetail,
  modifyBomDetail,
  deleteBomDetail,
  getMaterial
}
