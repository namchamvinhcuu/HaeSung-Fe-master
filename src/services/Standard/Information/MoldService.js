import { axios } from '@utils'

const apiName = '/api/Mold';

const getMoldList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createMold = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const modifyMold = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteMold = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getProductModel = async () => {
  try {
    return await axios.get(`${apiName}/get-product-model`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getProductType = async () => {
  try {
    return await axios.get(`${apiName}/get-product-type`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getMachineType = async () => {
  try {
    return await axios.get(`${apiName}/get-machine-type`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getMoldList,
  createMold,
  modifyMold,
  deleteMold,
  getProductModel,
  getProductType,
  getMachineType
}
